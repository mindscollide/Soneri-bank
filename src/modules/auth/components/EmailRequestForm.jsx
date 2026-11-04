import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { forgotPasswordApi } from "../../../store/actions/authAction";
import { validateEmail } from "../../../utils/emailValidation";
import { encryptField } from "../../../utils/encryption";
const shouldIsManagement =
  import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true";
const shouldIsDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";
const shouldIsTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
// Email entry used by both "Forgot Password?" and the resend-link screen
const EmailRequestForm = ({ title, subtitle, submitLabel, showBackLink }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      let encryptedEmail = await encryptField(email.trim());
      // Failure message is shown by the global response toast
      await dispatch(
        forgotPasswordApi({
          Data: {
            Email: encryptedEmail,
            RoleID: shouldIsManagement
              ? 10
              : shouldIsDealer
                ? 7
                : shouldIsTreasury
                  ? 8
                  : 0,
          },
          navigate,
        }),
      );
    } catch (error) {
      console.log("", error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`If an account exists for ${email.trim()}, a password reset link has been sent.`}
      >
        <div className="action col-12 text-center mt-3">
          <Link to="/" className="btn btn-secondary btn-lg px-4">
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="col-12">
        <div className="col-12 px-1 user-input-wrapper input-wrapper mb-3 mt-3">
          <div className="input-group">
            <label className="input-group-text">
              <i className="icon-user"></i>
            </label>
            <input
              type="text"
              name="Email"
              autoComplete="off"
              inputMode="email"
              placeholder="Email ID"
              className={`form-control ${error ? "error" : ""}`}
              value={email}
              autoFocus
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
          {error && <span className="fs-sm color-red error-mess">{error}</span>}
        </div>

        <div className="action col-12 text-center">
          <button
            type="submit"
            className="btn btn-secondary btn-lg px-4"
            disabled={loading}
          >
            {loading ? "Sending..." : submitLabel}
          </button>
          {showBackLink && (
            <Link
              to="/"
              className="d-block text-center color-black mt-2 text-decoration-underline"
            >
              Back to Login
            </Link>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};

export default EmailRequestForm;
