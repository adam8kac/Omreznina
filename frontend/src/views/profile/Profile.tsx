import { useState, useEffect } from 'react';
import { auth } from 'src/firebase-config';
import {updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword, deleteUser} from 'firebase/auth';
import zxcvbn from 'zxcvbn';
import {
  deleteToplotna,
  getAgreedPowers,
  getCurrentTariff,
  getToplotnPower,
  removeEtFromDb,
  saveAgreedPowers,
  saveEt,
  saveToplotna,
} from 'src/index';
import MfaSettingsPanel from './MfaSettingsPanel';
import { avatars } from 'src/components/shared/avatars';

const ProfilePage = () => {
  const user = auth.currentUser!;
  const [selectedIndex, setSelectedIndex] = useState(avatars.findIndex((a) => a === (user.photoURL || avatars[0])));
  const [section, setSection] = useState<'profile' | 'password' | 'mfa' | 'moci' | 'toplotna'>('profile');
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });

  const [agreedPowers, setAgreedPowers] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [agreedPowersInput, setAgreedPowersInput] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEt, setIsEt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [toplotnaTemp, setToplotnaTemp] = useState('');
  const [toplotnaPower, setToplotnaPower] = useState('');
  const [showDeleteToplotnaModal, setShowDeleteToplotnaModal] = useState(false);

  useEffect(() => {
    if (status.message) {
      const timeout = setTimeout(() => setStatus({ message: '', type: '' }), 4000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  useEffect(() => {
    if (!user.uid) return;
    (async () => {
      const ap = await getAgreedPowers(user.uid);
      setAgreedPowers(ap);
      setAgreedPowersInput({
        1: ap[1] ? (ap[1] / 1000).toString() : '',
        2: ap[2] ? (ap[2] / 1000).toString() : '',
        3: ap[3] ? (ap[3] / 1000).toString() : '',
        4: ap[4] ? (ap[4] / 1000).toString() : '',
        5: ap[5] ? (ap[5] / 1000).toString() : '',
      });
    })();
  }, []);

  useEffect(() => {
    if (!user.uid) return;
    (async () => {
      try {
        const userChoice = await getCurrentTariff(user.uid);
        if (userChoice && userChoice['type'] === 'ET') {
          setIsEt(true);
        } else {
          setIsEt(false);
        }
      } catch (err) {}
    })();
  }, [user.uid]);

  useEffect(() => {
    if (!user.uid) return;
    (async () => {
      const ap = await getAgreedPowers(user.uid);
      setAgreedPowers(ap);
      setAgreedPowersInput({
        1: ap[1] ? (ap[1] / 1000).toString() : '',
        2: ap[2] ? (ap[2] / 1000).toString() : '',
        3: ap[3] ? (ap[3] / 1000).toString() : '',
        4: ap[4] ? (ap[4] / 1000).toString() : '',
        5: ap[5] ? (ap[5] / 1000).toString() : '',
      });
    })();
  }, []);

  useEffect(() => {
    if (!user.uid) return;
    (async () => {
      try {
        const toplotnaData = (await getToplotnPower(user.uid)) as any;
        const temp = Object.values(toplotnaData)[1];
        if (toplotnaData) {
          setToplotnaPower(toplotnaData?.power.toString());
          setToplotnaTemp(String(temp));
        }
      } catch (err) {}
    })();
  }, [user.uid]);
 
  useEffect(() => {
    if (newPassword.length > 0) {
      const res = zxcvbn(newPassword);
      setPasswordStrength(res.score);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  const handleEt = async () => {
    try {
      if (isEt) {
        await removeEtFromDb(user.uid);
        setIsEt(false);
      } else {
        await saveEt(user.uid);
        setIsEt(true);
      }
    } catch (err) {
      setStatus({ message: 'Napaka pri shranjevanju tarife.', type: 'error' });
    }
  };

  const handleProfileUpdate = async () => {
    setNameLoading(true);
    setStatus({ message: '', type: '' });
    try {
      await updateProfile(user, { displayName });
      setEditing(false);
      setStatus({ message: 'Ime uspešno posodobljeno.', type: 'success' });
    } catch (err) {
      setStatus({ message: 'Napaka pri posodobitvi profila.', type: 'error' });
    }
    setNameLoading(false);
  };

  const handleSaveAgreedPowers = async () => {
    if (!validateDecreasing()) return;

    const dataToSave: Record<number, number> = {};
    [1, 2, 3, 4, 5].forEach((block) => {
      const val = parseFloat(agreedPowersInput[block]?.replace(',', '.') || '0');
      dataToSave[block] = isNaN(val) ? 0 : val;
    });
    try {
      if (!isEt) await saveEt(user.uid);
      await saveAgreedPowers(user.uid, dataToSave);
      setStatus({ message: 'Dogovorjene moči uspešno shranjene.', type: 'success' });
    } catch (err) {
      setStatus({ message: 'Napaka pri shranjevanju moči.', type: 'error' });
    }
  };

  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    setStatus({ message: '', type: '' });
    if (newPassword !== confirmPassword) {
      setStatus({ message: 'Novo geslo in potrditev se ne ujemata.', type: 'error' });
      setPasswordLoading(false);
      return;
    }
    if (!validatePassword(newPassword)) {
      setStatus({ message: 'Geslo mora imeti vsaj 6 znakov, vsebovati številko in simbol.', type: 'error' });
      setPasswordLoading(false);
      return;
    }
    try {
      const cred = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setStatus({ message: 'Geslo uspešno posodobljeno.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ message: 'Napaka: napačno trenutno geslo ali drug problem.', type: 'error' });
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    setDeleteLoading(true);
    setStatus({ message: '', type: '' });
    try {
      await deleteUser(user);
      window.location.href = '/auth/register';
    } catch (err) {
      setStatus({ message: 'Napaka pri brisanju računa. Prijavite se ponovno.', type: 'error' });
    }
    setDeleteLoading(false);
    setShowDeleteModal(false);
  };

  function validatePassword(password: string) {
    return password.length >= 6 && /\d/.test(password) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  }

  const validateDecreasing = () => {
    const vals = [1, 2, 3, 4, 5].map((i) => parseFloat(agreedPowersInput[i]?.replace(',', '.') || '0'));
    for (let i = 0; i < vals.length - 1; i++) {
      if (vals[i] < vals[i + 1]) {
        setValidationError(`Blok ${i + 2} ne sme biti večji od blok ${i + 1}.`);
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const pwColors = ['bg-gray-300', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  const pwLabels = ['Zelo šibko', 'Šibko', 'Srednje', 'Dobro', 'Odlično'];

  useEffect(() => {
    const saveAvatar = async () => {
      try {
        await updateProfile(user, { photoURL: avatars[selectedIndex] });
        await user.reload();
        setStatus({ message: 'Avatar posodobljen.', type: 'success' });
      } catch {
        setStatus({ message: 'Napaka pri posodabljanju avatarja.', type: 'error' });
      }
    };
    if (user.photoURL !== avatars[selectedIndex]) {
      saveAvatar();
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (!user.photoURL) {
      updateProfile(user, { photoURL: avatars[0] });
    }
  }, []);

  const handleSaveToplotna = async () => {
    if (!user.uid) return;
    try {
      await saveToplotna(
        user.uid,
        parseFloat(toplotnaPower),
        parseFloat(toplotnaTemp)
      );
      setStatus({ message: 'Podatki toplotne črpalke so uspešno shranjeni.', type: 'success' });
      setTimeout(() => setStatus({ message: '', type: '' }), 3000);
    } catch (err) {
      setStatus({ message: 'Napaka pri shranjevanju moči.', type: 'error' });
      setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    }
  };

  const handleDeleteToplotna = () => {
    setShowDeleteToplotnaModal(true);
  };

  const confirmDeleteToplotna = async () => {
    if (!user.uid) return;
    setDeleteLoading(true);
    setStatus({ message: '', type: '' });
    try {
      await deleteToplotna(user.uid);
      setToplotnaPower('');
      setToplotnaTemp('');
      setStatus({ message: 'Toplotna črpalka izbrisana.', type: 'success' });
    } catch (err) {
      setStatus({ message: 'Napaka pri brisanju toplotne črpalke.', type: 'error' });
    }
    setDeleteLoading(false);
    setShowDeleteToplotnaModal(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start py-10 px-4 sm:px-6 md:px-10 bg-white border border-gray-200 rounded-3xl shadow-none sm:shadow-xl sm:rounded-[24px]">
      <div className="w-full max-w-3xl bg-white p-6 sm:p-10 rounded-2xl">
        <h1 className="text-3xl font-bold text-center mb-7">Moj profil</h1>
        <div className="flex gap-3 justify-center mb-10 flex-wrap">
          <button
            onClick={() => setSection('profile')}
            className={`px-5 py-2 rounded-full font-semibold ${
              section === 'profile' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Uredi profil
          </button>
          <button
            onClick={() => setSection('moci')}
            className={`px-5 py-2 rounded-full font-semibold ${
              section === 'moci' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Dogovorjene moči
          </button>

          <button
            onClick={() => setSection('toplotna')}
            className={`px-5 py-2 rounded-full font-semibold ${
              section === 'toplotna' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Dodaj toplotno črpalko
          </button>

          <button
            onClick={() => setSection('password')}
            className={`px-5 py-2 rounded-full font-semibold ${
              section === 'password' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Spremeni geslo
          </button>
          <button
            onClick={() => setSection('mfa')}
            className={`px-5 py-2 rounded-full font-semibold ${
              section === 'mfa' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            Dvofaktorska avtentikacija
          </button>
        </div>

        {section === 'profile' && (
          <>
            <div className="mt-6 flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-6 text-center">Izberite avatar</h3>
              <div className="flex items-center justify-center gap-6">
                <button
                  aria-label="Prejšnji avatar"
                  className="text-3xl px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => setSelectedIndex((prev) => (prev - 1 + avatars.length) % avatars.length)}
                >
                  &#8592;
                </button>
                <img
                  src={avatars[selectedIndex]}
                  alt="Izbran avatar"
                  className="rounded-full w-40 h-40 object-cover border-4 border-primary shadow-lg transition"
                />
                <button
                  aria-label="Naslednji avatar"
                  className="text-3xl px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => setSelectedIndex((prev) => (prev + 1) % avatars.length)}
                >
                  &#8594;
                </button>
              </div>
            </div>

            <div className="max-w-xl mx-auto flex flex-col items-center gap-5 mt-10">
              <div className="w-full">
                <div className="mb-3">
                  <div className="text-gray-500 text-xs font-medium">Email</div>
                  <input
                    type="text"
                    value={user.email ?? ''}
                    disabled
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-gray-100 border-none text-gray-700"
                  />
                </div>
                <div className="mb-3">
                  <div className="text-gray-500 text-xs font-medium">Prikazno ime</div>
                  {!editing ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={displayName}
                        disabled
                        className="w-full px-4 py-2 rounded-lg bg-gray-100 border-none"
                      />
                      <button
                        className="px-4 py-2 bg-primary text-white rounded font-medium"
                        onClick={() => setEditing(true)}
                      >
                        Uredi
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-primary"
                      />
                      <button
                        className="px-4 py-2 bg-primary text-white rounded font-medium"
                        disabled={nameLoading}
                        onClick={handleProfileUpdate}
                      >
                        Shrani
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-medium"
                        onClick={() => setEditing(false)}
                      >
                        Prekliči
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-xl mx-auto flex flex-col gap-6 items-center mt-10">
              <div className="text-center text-red-700 font-medium">
                Izbris računa je nepovraten. Vsi vaši podatki bodo trajno odstranjeni.
              </div>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-3 transition"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                Izbriši račun
              </button>
            </div>
          </>
        )}

        {section === 'moci' && (
          <div className="mt-8 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-3 text-center">Dogovorjene moči (v kW)</h3>
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((block) => (
                <div 
                  key={block} 
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-gray-50 rounded-lg px-4 py-3 shadow-sm"
                >
                  <label className="text-sm font-medium w-full sm:w-28 shrink-0 mb-1 sm:mb-0">
                    Blok {block}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full sm:flex-1 px-4 py-2 border border-primary/40 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white"
                    placeholder={`${agreedPowers[block] / 1000} kW`}
                    value={agreedPowersInput[block] || ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setAgreedPowersInput((prev) => ({ ...prev, [block]: raw }));
                      const parsed = parseFloat(raw.replace(',', '.'));
                      setAgreedPowers((prev) => ({
                        ...prev,
                        [block]: isNaN(parsed) ? 0 : parsed,
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
            {validationError && <div className="mb-3 text-red-600 text-center text-sm">{validationError}</div>}
            <div className="flex items-center gap-4 mt-6 mb-2">
              <label className="text-sm font-medium">Tip tarife ki jo imate</label>
              <div className="flex bg-gray-100 rounded-full p-1 shadow-sm w-fit ml-6">
                <button
                  type="button"
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 ${isEt ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    if (!isEt) {
                      setIsEt(true);
                      handleEt();
                      setStatus({ message: 'Tarifa spremenjena na ET.', type: 'success' });
                    }
                  }}
                >
                  ET
                </button>
                <button
                  type="button"
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-150 ${!isEt ? 'bg-primary text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
                  onClick={() => {
                    if (isEt) {
                      setIsEt(false);
                      handleEt();
                      setStatus({ message: 'Tarifa spremenjena na VT/MT.', type: 'success' });
                    }
                  }}
                >
                  VT/MT
                </button>
              </div>
              {status.message && status.message.includes('Tarifa spremenjena') && (
                <span className="ml-4 text-primary font-medium animate-fade-in">{status.message}</span>
              )}
            </div>

            <button
              className="mt-4 w-full bg-primary text-white rounded-lg py-3 font-medium shadow-sm hover:bg-primary/90 transition"
              onClick={handleSaveAgreedPowers}
            >
              Shrani dogovorjene moči
            </button>
          </div>
        )}
        {section === 'toplotna' && (
          <div className="mt-8 max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-3 text-center">Dodajte toplotno črpalko</h3>
            <div className="flex flex-col gap-4">
              <div
                key={'toplotna-input'}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-gray-50 rounded-lg px-4 py-3 shadow-sm"
              >
                <label className="text-sm font-medium w-full sm:w-28 shrink-0 mb-1 sm:mb-0">
                  Moč toplotne črpalke (kW)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full sm:flex-1 px-4 py-2 border border-primary/40 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white"
                  placeholder="npr. 5.5 kW"
                  value={toplotnaPower}
                  onChange={(e) => {
                    let val = e.target.value.replace(',', '.');
                    setToplotnaPower(val);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div
                key={'toplotna-input'}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-gray-50 rounded-lg px-4 py-3 shadow-sm"
              >
                <label className="text-sm font-medium w-28 shrink-0">Temperatura pri kateri se vklopi (°C)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="flex-1 px-4 py-2 border border-primary/40 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base bg-white"
                  placeholder="npr. 15 °C"
                  value={toplotnaTemp}
                  onChange={(e) => {
                    let val = e.target.value.replace(',', '.');
                    setToplotnaTemp(val);
                  }}
                />
              </div>
            </div>
          <div>
            <button
              className="mt-4 w-full bg-primary hover:bg-violet-500 text-white rounded-lg py-3 font-medium shadow-sm hover:bg-primary/90 transition"
              onClick={handleSaveToplotna}
            >
              Shrani podatke toplotne črpalke
            </button>
             {status && (
                <p
                  className={`mt-2 text-sm font-medium ${
                    status.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {status.message}
                </p>
              )}
            </div>
            <button
              className="mt-4 w-full bg-violet-900 hover:bg-violet-700 text-white rounded-lg py-3 font-medium shadow-sm transition"
              onClick={handleDeleteToplotna}
              disabled={deleteLoading}
            >
              Izbriši toplotno črpalko
            </button>
            {showDeleteToplotnaModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                  <div className="text-lg font-semibold mb-4 text-red-700">
                    Ste prepričani, da želite izbrisati toplotno črpalko?
                  </div>
                  <div className="mb-6 text-gray-600 text-sm">Podatki o toplotni črpalki bodo odstranjeni!</div>
                  <div className="flex gap-4 justify-center">
                    <button
                      className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-medium"
                      onClick={() => setShowDeleteToplotnaModal(false)}
                      disabled={deleteLoading}
                    >
                      Prekliči
                    </button>
                    <button
                      className="px-5 py-2 rounded bg-red-600 text-white font-medium"
                      onClick={confirmDeleteToplotna}
                      disabled={deleteLoading}
                    >
                      Izbriši
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* do tule */}

        {section === 'password' && (
          <div className="max-w-xl mx-auto flex flex-col gap-3">
            <div className="text-gray-600 text-sm mb-4">Geslo mora imeti vsaj 6 znakov, številko in simbol.</div>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Trenutno geslo"
              className="w-full px-4 py-3 rounded-lg border mb-1"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Novo geslo"
              className="w-full px-4 py-3 rounded-lg border mb-1"
            />
            <div className="flex items-center gap-3 mb-1">
              <div className={`h-2 rounded w-1/3 ${pwColors[passwordStrength]}`}></div>
              <div className="text-xs text-gray-500">{newPassword.length > 0 && pwLabels[passwordStrength]}</div>
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Potrdite novo geslo"
              className="w-full px-4 py-3 rounded-lg border mb-4"
            />
            <button
              className={`w-full bg-primary text-white hover:bg-primary/80 font-semibold rounded-lg py-3 transition`}
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              type="button"
            >
              Spremeni geslo
            </button>
          </div>
        )}

        {section === 'mfa' && (
          <div className="max-w-xl mx-auto">
            <MfaSettingsPanel uid={user.uid} />
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
              <div className="text-lg font-semibold mb-4 text-red-700">
                Ste prepričani, da želite izbrisati svoj račun?
              </div>
              <div className="mb-6 text-gray-600 text-sm">
                To je nepovratno! Vsi vaši podatki bodo trajno odstranjeni.
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  className="px-5 py-2 rounded bg-gray-200 text-gray-700 font-medium"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                >
                  Prekliči
                </button>
                <button
                  className="px-5 py-2 rounded bg-red-600 text-white font-medium"
                  onClick={confirmDeleteAccount}
                  disabled={deleteLoading}
                >
                  Izbriši račun
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
