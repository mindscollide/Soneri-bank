import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { emailTokenVerifyApi } from "../../../store/actions/authAction";

// Open route the emailed link lands on: /redirected?resetPass_action=<EncryptedString>
// The link is checked with EmailTokenVerify first; only a valid link reaches
// the Reset Password screen, an expired/invalid one goes to "resend link"
// (the navigation itself happens inside the thunk).
const Redirected = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const resetToken = params.get("resetPass_action");

  // Token already sent for verification (StrictMode runs effects twice in dev,
  // and the link may be single-use, so the second call could report "expired")
  const verifiedToken = useRef(null);

  useEffect(() => {
    if (!resetToken || verifiedToken.current === resetToken) return;
    verifiedToken.current = resetToken;
    try {
      dispatch(
        emailTokenVerifyApi({ Data: { EncryptedString: resetToken }, navigate }),
      );
    } catch (error) {
      console.log("", error);
    }
  }, [dispatch, navigate, resetToken]);

  if (!resetToken) return <Navigate to="/" replace />;

  return (
    <AuthLayout title="Verifying link...">
      <div className="col-12 text-center mt-3">Please wait</div>
    </AuthLayout>
  );
};

export default Redirected;
