import EmailRequestForm from "../components/EmailRequestForm";

const ForgotPassword = () => (
  <EmailRequestForm
    title="Forgot Password?"
    subtitle="Please type your full email"
    submitLabel="Send change password link"
    showBackLink
  />
);

export default ForgotPassword;
