import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import NewPasswordForm from "../components/NewPasswordForm";
import { resetPasswordApi } from "../../../store/actions/authAction";
import { decryptField } from "../../../utils/encryption";

// Decrypt a value from the backend; fall back to the raw value if it is plain
const tryDecrypt = async (value) => {
  if (!value) return "";
  try {
    return await decryptField(value);
  } catch {
    return value;
  }
};

// Two entry points:
//  1. /redirected (email link) verified the link and passes { token, email, firstName }
//  2. Login with isPasswordReset=false -> first-time reset using the login session
const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();

  const token = state?.token || "";
  const isFirstTime =
    localStorage.getItem("mustResetPassword") === "true";

  // Email as returned by the backend (still encrypted) — sent back as-is
  const encEmail = token ? state.email : localStorage.getItem("email") || "";
  const encName = token ? state.firstName : localStorage.getItem("name") || "";
  const [personalInfo, setPersonalInfo] = useState([]);

  useEffect(() => {
    if (!token && !isFirstTime) return;
    let cancelled = false;
    Promise.all([tryDecrypt(encEmail), tryDecrypt(encName)]).then((info) => {
      if (!cancelled) setPersonalInfo(info.filter(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [token, isFirstTime, encEmail, encName]);

  // Needs either a verified link (token + email in router state) or a complete
  // first-login session (token + email in localStorage); otherwise back to login
  const hasLinkData = !!token && !!encEmail;
  const hasSession =
    isFirstTime && !!localStorage.getItem("token") && !!encEmail;
  if (!hasLinkData && !hasSession) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (password) => {
    await dispatch(
      resetPasswordApi({
        Data: { Email: encEmail, Password: password, EncryptedString: token },
        navigate,
      }),
    );
  };

  return (
    <AuthLayout title="Reset Password">
      <NewPasswordForm
        submitLabel="Reset Password"
        passwordPlaceholder="New Password"
        confirmPlaceholder="New Confirm Password"
        personalInfo={personalInfo}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
};

export default ResetPassword;
