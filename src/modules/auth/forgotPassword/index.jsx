import EmailRequestForm from "../components/EmailRequestForm";

const ForgotPassword = () => (
  <EmailRequestForm
    title="Recover Password?"
    subtitle="Please type your full email"
    submitLabel="Send change password link"
    showBackLink
  />
);

export default ForgotPassword;
