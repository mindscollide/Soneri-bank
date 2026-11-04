import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

// Heading (20px / 600) and text (14px) come from the shared login layout
const EmailSent = () => (
    <AuthLayout
        title="Email Sent"
        subtitle="Please check your email and click on the Password Reset Link."
    >
        <div className="action col-12 text-center mt-3">
            <Link to="/" className="btn btn-secondary btn-lg px-4">
                Back to Login
            </Link>
        </div>
    </AuthLayout>
);

export default EmailSent;
