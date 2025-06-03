import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "src/firebase-config";
import { Icon } from "@iconify/react";
import VerifyMfa from "src/views/mfa/VerifyMfa";
import { getMfaSettings } from "src/index";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [uid, setUid] = useState("");
  const [showMfa, setShowMfa] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");
  const [showResendVerify, setShowResendVerify] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setShowResendVerify(false);

    if (!email.trim()) {
      setError("Vnesite svoj email naslov.");
      return;
    }

    if (!email.includes("@")) {
      setError("Email mora vsebovati znak '@'.");
      return;
    }

    if (!password.trim()) {
      setError("Vnesite svoje geslo.");
      return;
    }

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Email naslov še ni potrjen.");
        setShowResendVerify(true);
        return;
      }

      const mfa = await getMfaSettings(user.uid);
      if (mfa?.enabled) {
        setUid(user.uid);
        setShowMfa(true);
      } else {
        navigate("/");
      }

    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("Uporabnik s tem emailom ne obstaja.");
      } else if (error.code === "auth/wrong-password") {
        setError("Geslo ni pravilno.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Preveč neuspešnih poskusov. Počakajte nekaj časa.");
      } else {
        setError("Napaka pri prijavi. Preverite podatke.");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetStatus("Vnesite email naslov za ponastavitev.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus("Povezava za ponastavitev gesla je bila poslana.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setResetStatus("Uporabnik s tem emailom ne obstaja.");
      } else {
        setResetStatus("Napaka pri pošiljanju povezave.");
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await sendEmailVerification(currentUser);
        setInfo("Verifikacijski email je bil ponovno poslan.");
        setShowResendVerify(false);
      } else {
        setError("Ni prijavljenega uporabnika za pošiljanje potrditve.");
      }
    } catch (error) {
      setError("Napaka pri pošiljanju verifikacijskega emaila.");
    }
  };

  if (showMfa) {
    return (
      <VerifyMfa uid={uid} onVerified={() => navigate("/")} />
    );
  }

  return (
    <>
      <Modal
        show={openModal}
        onClose={() => {
          setOpenModal(false);
          setResetEmail("");
          setResetStatus("");
        }}
      >
        <Modal.Header>Pozabljeno geslo</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <Label htmlFor="resetEmail" value="Email naslov" />
            <TextInput
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="email@primer.com"
            />
            {resetStatus && (
              <p className={`text-sm ${resetStatus.includes("poslana") ? "text-green-600" : "text-red-600"}`}>
                {resetStatus}
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePasswordReset}>Pošlji povezavo</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>Zapri</Button>
        </Modal.Footer>
      </Modal>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="email" value="Email" className="mb-2 block" />
          <TextInput
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4 relative">
          <Label htmlFor="password" value="Geslo" className="mb-2 block" />
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <span
            className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} height={20} />
          </span>
        </div>

        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Label htmlFor="remember" className="font-normal cursor-pointer">
              Zapomni si napravo
            </Label>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="text-primary text-sm font-medium"
          >
            Pozabljeno geslo?
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {info && <p className="text-green-600 text-sm mb-4">{info}</p>}

        {showResendVerify && (
          <div className="mb-4">
            <p className="text-sm text-gray-700">Niste prejeli potrditvenega emaila?</p>
            <Button onClick={handleResendVerification} size="xs" className="mt-2">
              Pošlji ponovno potrditveni email
            </Button>
          </div>
        )}

        <Button type="submit" color="primary" className="w-full bg-primary text-white rounded-xl">
          Prijava
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;