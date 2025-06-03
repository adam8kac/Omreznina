import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { verifyTotpCode } from "src/index";

type Props = {
  uid: string;
  onVerified: () => void;
};

const VerifyMfa = ({ uid, onVerified }: Props) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    const valid = await verifyTotpCode(uid, code);
    if (valid) {
      onVerified();
    } else {
      setError("Neveljavna koda. Poskusi znova.");
    }
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto mt-10">
      <h2 className="text-xl font-semibold text-center">Dvofaktorska avtentikacija</h2>
      <Label htmlFor="code" value="Vnesi kodo iz Google Authenticator" />
      <TextInput
        id="code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="123 456"
        autoFocus
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button onClick={handleVerify} className="w-full bg-primary text-white">
        Potrdi
      </Button>
    </div>
  );
};

export default VerifyMfa;