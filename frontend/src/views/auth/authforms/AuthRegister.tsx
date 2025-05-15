import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth } from "src/firebase-config";
import { Icon } from "@iconify/react";

const AuthRegister = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) return "Geslo mora imeti vsaj 6 znakov.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Geslo mora vsebovati simbol.";
    if (!/\d/.test(pwd)) return "Geslo mora vsebovati številko.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);

    if (!name.trim()) {
      setError("Vnesite svoje ime.");
      return;
    }

    if (!email.trim()) {
      setError("Vnesite email naslov.");
      return;
    }

    if (!email.includes("@")) {
      setError("Email mora vsebovati znak '@'.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Gesli se ne ujemata.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      auth.languageCode = 'sl';

      await sendEmailVerification(user, {
        url: "https://omreznina.netlify.app/auth/verify-info",
        handleCodeInApp: false,
      });

      setInfo("Registracija uspešna! Potrditveni email je bil poslan.");
      setShowResend(true);

      await auth.signOut();
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("Email je že v uporabi.");
      } else {
        setError("Napaka pri registraciji");
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;

      if (user && !user.emailVerified) {
        auth.languageCode = 'sl';

        await sendEmailVerification(user, {
          url: "https://omreznina.netlify.app/auth/verify-info",
          handleCodeInApp: false,
        });
        setInfo("Potrditveni email je bil ponovno poslan.");
      } else {
        setError("Uporabnik ni prijavljen ali je že verificiran.");
      }
    } catch (err) {
      setError("Napaka pri ponovnem pošiljanju emaila.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="name" value="Ime" />
        <TextInput
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control form-rounded-xl"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="email" value="Email naslov" />
        <TextInput
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-control form-rounded-xl"
        />
      </div>

      <div className="mb-4 relative">
        <Label htmlFor="password" value="Geslo" />
        <TextInput
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control form-rounded-xl pr-10"
        />
        <span
          className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
          onClick={() => setShowPassword(!showPassword)}
        >
          <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} height={20} />
        </span>
      </div>

      <div className="mb-6">
        <Label htmlFor="confirm-password" value="Potrdi geslo" />
        <TextInput
          id="confirm-password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-control form-rounded-xl"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {info && <p className="text-green-600 text-sm mb-4">{info}</p>}

      {showResend && (
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Niste prejeli potrditvenega emaila?
          </p>
          <Button
            onClick={handleResendVerification}
            size="xs"
            className="mt-2"
          >
            Pošlji ponovno potrditveni email
          </Button>
        </div>
      )}

      <Button color="primary" type="submit" className="w-full">
        Registracija
      </Button>
    </form>
  );
};

export default AuthRegister;
