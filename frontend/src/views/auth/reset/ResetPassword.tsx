import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "src/firebase-config";
import { TextInput, Button, Label } from "flowbite-react";
import { Icon } from "@iconify/react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      setStatus("Povezava ni veljavna za ponastavitev gesla.");
    }
  }, [mode, oobCode]);

  const validatePassword = (password: string) => {
    if (password.length < 6) return "Geslo mora imeti vsaj 6 znakov.";
    if (!/\d/.test(password)) return "Geslo mora vsebovati številko.";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return "Geslo mora vsebovati simbol.";
    return null;
  };

  const handleReset = async () => {
    setStatus("");

    if (!newPassword || !confirm) {
      setStatus("Prosimo, izpolnite vsa polja.");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setStatus(validationError);
      return;
    }

    if (newPassword !== confirm) {
      setStatus("Gesli se ne ujemata.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode || "", newPassword);
      setStatus("Geslo je bilo uspešno ponastavljeno!");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error: any) {
      setStatus("Napaka pri ponastavitvi gesla.");
    }
  };

  const backgroundStyle = {
    background:
      "linear-gradient(45deg, rgba(238,119,82,0.2), rgba(231,60,126,0.2), rgba(35,166,213,0.2), rgba(35,213,171,0.2))",
    backgroundSize: "400% 400%",
    animation: "gradient 15s ease infinite",
    height: "100vh",
  };

  return (
    <div style={backgroundStyle} className="relative overflow-hidden h-screen">
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full md:w-96 border-none">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Ponastavitev gesla
          </h2>

          {mode !== "resetPassword" ? (
            <p className="text-red-600 text-center">
              Povezava za ponastavitev gesla ni veljavna.
            </p>
          ) : (
            <>
              <div className="mb-4 relative">
                <Label htmlFor="new-password" value="Novo geslo" />
                <TextInput
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control form-rounded-xl pr-10"
                />
                <span
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} height={20} />
                </span>
              </div>

              <div className="mb-4 relative">
                <Label htmlFor="confirm-password" value="Potrdi geslo" />
                <TextInput
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="form-control form-rounded-xl pr-10"
                />
                <span
                  className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  <Icon icon={showConfirm ? "mdi:eye-off" : "mdi:eye"} height={20} />
                </span>
              </div>

              {status && (
                <p
                  className={`text-sm mb-4 ${
                    status.includes("uspešno") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status}
                </p>
              )}

              <Button onClick={handleReset} className="w-full">
                Ponastavi geslo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
