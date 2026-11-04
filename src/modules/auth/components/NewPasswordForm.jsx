import { useMemo, useState } from "react";
import { getRuleResults } from "../../../utils/passwordRules";
import PasswordField from "./PasswordField";
import PasswordRules from "./PasswordRules";

// Password + confirm with the live policy checklist. Submit stays disabled
// until every rule passes. `onSubmit(password)` may reject with a message.
const NewPasswordForm = ({
  submitLabel,
  passwordPlaceholder = "Password",
  confirmPlaceholder = "Confirm Password",
  personalInfo = [],
  onSubmit,
}) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const results = useMemo(
    () => getRuleResults(password, confirm, personalInfo),
    [password, confirm, personalInfo],
  );
  const allValid = results.every((r) => r.ok);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid || loading) return;
    setError("");
    setLoading(true);
    // onSubmit reports failures through the global response toast
    await onSubmit(password);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="col-12 mt-2">
      <PasswordField
        name="newPassword"
        placeholder={passwordPlaceholder}
        value={password}
        autoFocus
        onChange={(v) => {
          setPassword(v);
          if (error) setError("");
        }}
      />
      <PasswordField
        name="confirmPassword"
        placeholder={confirmPlaceholder}
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          if (error) setError("");
        }}
      />
      <PasswordRules results={results} />
      {error && (
        <div className="col-12 px-1 mb-2">
          <span className="fs-sm color-red error-mess">{error}</span>
        </div>
      )}
      <div className="action col-12 text-center">
        <button
          type="submit"
          className="btn btn-secondary btn-lg px-4"
          disabled={!allValid || loading}
        >
          {loading ? "Please wait..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default NewPasswordForm;
