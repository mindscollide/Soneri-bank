import EmailRequestForm from "../components/EmailRequestForm";

// Reached when a reset link is missing or expired
const ResendReset = () => (
  <EmailRequestForm
    title="Reset Password?"
    subtitle="Request for resend reset password email. Please type your full email"
    submitLabel="Send"
  />
);

export default ResendReset;
