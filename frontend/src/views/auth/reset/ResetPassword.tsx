import { useSearchParams, useNavigate } from "react-router";
import { useState } from "react";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "src/firebase-config";
import { TextInput, Button, Label } from "flowbite-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");

  const handleReset = async () => {
    if (newPassword !== confirm) {
      setStatus("Gesli se ne ujemata.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode || "", newPassword);
      setStatus("Geslo je bilo uspešno ponastavljeno!");
      setTimeout(() => navigate("/auth/login"), 2000);
    } catch (error: any) {
      setStatus("Napaka pri ponastavitvi gesla: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Ponastavitev gesla</h2>

      <div className="mb-4">
        <Label htmlFor="new-password" value="Novo geslo" />
        <TextInput
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="confirm-password" value="Potrdi geslo" />
        <TextInput
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
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

      <Button onClick={handleReset}>Ponastavi geslo</Button>
    </div>
  );
};

export default ResetPassword;
