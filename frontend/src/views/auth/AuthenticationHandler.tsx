import { useSearchParams } from "react-router";
import ResetPassword from "./reset/ResetPassword";
import VerifyInfo from "./verify/VerifyInfo";

const AuthenticationHandler = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "verifyEmail") {
    return <VerifyInfo />;
  }

  if (mode === "resetPassword") {
    return <ResetPassword />;
  }

  return (
    <div className="text-center mt-10 text-lg font-medium text-red-600">
      Neveljavna ali potekla povezava.
    </div>
  );
};

export default AuthenticationHandler;
