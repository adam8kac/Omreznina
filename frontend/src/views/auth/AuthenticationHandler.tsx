import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { applyActionCode } from "firebase/auth";
import { auth } from "src/firebase-config";
import ResetPassword from "./reset/ResetPassword";

const AuthenticationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Obdelujem povezavo...");

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          localStorage.setItem("emailVerified", "true");
          navigate("/auth/login");
        })
        .catch(() => {
          setStatus("Napaka: povezava ni veljavna ali je potekla.");
        });
    }
  }, [mode, oobCode, navigate]);

  if (mode === "resetPassword") {
    return <ResetPassword />;
  }

  if (mode === "verifyEmail") {
    return (
      <div className="text-center mt-10 text-lg font-medium text-gray-800">
        {status}
      </div>
    );
  }

  return (
    <div className="text-center mt-10 text-lg font-medium text-red-600">
      Neveljavna ali potekla povezava.
    </div>
  );
};

export default AuthenticationHandler;