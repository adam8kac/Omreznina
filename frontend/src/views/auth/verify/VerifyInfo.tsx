import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { applyActionCode } from "firebase/auth";
import { auth } from "src/firebase-config";

const VerifyInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verificiram...");

  useEffect(() => {
    const mode = searchParams.get("mode");
    const oobCode = searchParams.get("oobCode");

    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("Email uspešno verificiran. Preusmerjam...");
          setTimeout(() => navigate("/"), 2000);
        })
        .catch(() => {
          setStatus("Neuspešna verifikacija.");
        });
    } else {
      setStatus("Napaka pri preverjanju parametrov.");
    }
  }, []);

  return (
    <div className="text-center mt-10 text-lg font-medium text-gray-800">
      {status}
    </div>
  );
};

export default VerifyInfo;
