import { useState, useEffect } from 'react';
import { auth } from 'src/firebase-config';
import {
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import zxcvbn from 'zxcvbn';
import { getAgreedPowers, getCurrentTariff, removeEtFromDb, saveAgreedPowers, saveEt } from 'src/index';
import MfaSettingsPanel from './MfaSettingsPanel';

const ProfilePage = () => {
  const user = auth.currentUser!;
  const [section, setSection] = useState<'profile' | 'password' | 'delete' | 'mfa'>('profile');
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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Ste prepričani, da želite izbrisati svoj račun? To je nepovratno!')) return;
    setDeleteLoading(true);
    setStatus({ message: '', type: '' });
    try {
      await deleteUser(user);
      window.location.href = '/auth/register';
    } catch (err) {
      setStatus({ message: 'Napaka pri brisanju računa. Prijavite se ponovno.', type: 'error' });
    }
    setDeleteLoading(false);
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

  return (
    <div className="w-full min-h-screen flex justify-center items-start py-16 bg-white rounded-2xl shadow-xl">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-7">Moj profil</h1>

        {status.message && (
          <div
            className={`mb-4 text-center text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {status.message}
          </div>
        )}

        <div className="flex gap-3 justify-center mb-10 flex-wrap">
          <button
            onClick={() => setSection('profile')}
            className={`px-5 py-2 rounded-full font-semibold ${section === 'profile' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Uredi profil
          </button>
          <button
            onClick={() => setSection('password')}
            className={`px-5 py-2 rounded-full font-semibold ${section === 'password' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Spremeni geslo
          </button>
          <button
            onClick={() => setSection('mfa')}
            className={`px-5 py-2 rounded-full font-semibold ${section === 'mfa' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            Dvofaktorska avtentikacija
          </button>
          <button
            onClick={() => setSection('delete')}
            className={`px-5 py-2 rounded-full font-semibold ${section === 'delete' ? 'bg-red-500 text-white' : 'bg-gray-100 text-red-700'}`}
          >
            Izbriši profil
          </button>
        </div>

        {section === 'profile' && (
          <div className="max-w-xl mx-auto flex flex-col items-center gap-5">
            <div className="w-full">
              <div className="mb-3">
                <div className="text-gray-500 text-xs font-medium">Email</div>
                <input
                  type="text"
                  value={user.email ?? ''}
                  disabled
                  className="w-full mt-1 px-4 py-2 rounded bg-gray-100 border-none text-gray-700"
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
                      className="w-full px-4 py-2 rounded bg-gray-100 border-none"
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
                      className="w-full px-4 py-2 rounded border border-primary"
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
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-center">Dogovorjene moči (v kW)</h3>
                {[1, 2, 3, 4, 5].map((block) => (
                  <div key={block} className="mb-3 flex items-center gap-3">
                    <label className="text-sm font-medium w-1/2">Blok {block}</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full px-4 py-2 border rounded"
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

                {validationError && <div className="mb-3 text-red-600 text-center text-sm">{validationError}</div>}
                <div className="flex items-center">
                  <label className="text-sm font-medium ">Tip tarife ki jo imate</label>
                  <button className="px-5 py-2 text-white bg-primary rounded ml-20" onClick={() => handleEt()}>
                    {isEt ? 'ET' : 'VT/MT'}
                  </button>
                </div>

                <button
                  className="mt-4 w-full bg-primary text-white rounded py-2 font-medium"
                  onClick={handleSaveAgreedPowers}
                >
                  Shrani dogovorjene moči
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'password' && (
          <div className="max-w-xl mx-auto flex flex-col gap-3">
            <div className="text-gray-600 text-sm mb-4">Geslo mora imeti vsaj 6 znakov, številko in simbol.</div>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Trenutno geslo"
              className="w-full px-4 py-3 rounded border mb-1"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Novo geslo"
              className="w-full px-4 py-3 rounded border mb-1"
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
              className="w-full px-4 py-3 rounded border mb-4"
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

        {section === 'delete' && (
          <div className="max-w-xl mx-auto flex flex-col gap-6 items-center">
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
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
