import { Button, Label, TextInput } from "flowbite-react";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "src/firebase-config";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router";

const AuthRegister = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = (pwd: string): boolean => {
    const minLength = pwd.length >= 6;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return minLength && hasSymbol && hasNumber;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError("Geslo mora imeti vsaj 6 znakov, en simbol in eno številko.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Gesli se ne ujemata.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="name" value="Ime" />
        <TextInput
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-control form-rounded-xl"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="email" value="Email naslov" />
        <TextInput
          id="email"
          type="email"
          required
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
          required
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
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-control form-rounded-xl"
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4">
          {error}
        </p>
      )}

      <Button color="primary" type="submit" className="w-full">
        Registracija
      </Button>
    </form>
  );
};

export default AuthRegister;
