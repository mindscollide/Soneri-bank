import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const MESSAGES = {
  reset: {
    title: "Password Reset Successfully",
    text: "Your password has been reset. You can now log in with your new password.",
  },
  create: {
    title: "Password Created Successfully",
    text: "Your password has been created. Please log in to continue.",
  },
};

const PasswordSuccess = () => {
  const [params] = useSearchParams();
  const { title, text } = MESSAGES[params.get("type")] || MESSAGES.reset;

  return (
    <AuthLayout title={title} subtitle={text}>
      <div className="col-12 text-center my-3">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="11" fill="#198754" />
          <path
            d="M7 12.5l3.2 3.2L17 9"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="action col-12 text-center">
        <Link to="/" className="btn btn-secondary btn-lg px-4">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default PasswordSuccess;
