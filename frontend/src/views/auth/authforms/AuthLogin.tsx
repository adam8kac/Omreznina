import { Button, Checkbox, Label, Modal, TextInput } from "flowbite-react";
import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { useNavigate } from "react-router";
import { auth } from "src/firebase-config";
import { Icon } from "@iconify/react";

const AuthLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // MODAL
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetStatus, setResetStatus] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setInfo("");

    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setError("Uporabnik ne obstaja.");
      } else if (error.code === "auth/wrong-password") {
        setError("Napačno geslo.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Preveč poskusov prijave. Počakajte nekaj časa.");
      } else {
        setError("Napačno uporabniško ime ali geslo.");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetStatus("Vnesite email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus("Povezava za ponastavitev gesla je bila poslana.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setResetStatus("Uporabnik s tem emailom ne obstaja.");
      } else {
        setResetStatus("Napaka pri pošiljanju povezave za ponastavitev.");
      }
    }
  };

  return (
    <>
      {/* Password Reset Modal */}
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
            <Label htmlFor="resetEmail" value="Vnesi email naslov" />
            <TextInput
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="ime@primer.si"
              required
            />
            {resetStatus && (
              <p
                className={`text-sm ${
                  resetStatus.includes("poslana") ? "text-green-600" : "text-red-600"
                }`}
              >
                {resetStatus}
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handlePasswordReset}>Pošlji povezavo</Button>
          <Button color="gray" onClick={() => setOpenModal(false)}>
            Zapri
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Login Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="email" value="Email" className="mb-2 block" />
          <TextInput
            id="email"
            type="email"
            sizing="md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control form-rounded-xl"
          />
        </div>

        <div className="mb-4 relative">
          <Label htmlFor="password" value="Geslo" className="mb-2 block" />
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            sizing="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control form-rounded-xl pr-10"
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

        <Button
          type="submit"
          color="primary"
          className="w-full bg-primary text-white rounded-xl"
        >
          Prijava
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
