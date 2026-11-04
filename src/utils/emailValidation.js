// Email validation used by Login and Forgot Password.
// 1) Format  -> local@domain, no spaces, valid local part
// 2) Domain  -> valid hostname (labels, TLD) and, when configured, one of the
//               allowed domain (VITE_ALLOWED_EMAIL_DOMAIN="soneribank.com")

const LOCAL_PART = /^[A-Za-z0-9._%+-]+$/;
const DOMAIN_LABEL = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TLD = /^[A-Za-z]{2,}$/;

// Single allowed domain; leave unset to accept any valid domain
const allowedDomain = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || "")
  .trim()
  .toLowerCase();

export const isValidEmailFormat = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  return (
    local.length > 0 &&
    local.length <= 64 &&
    LOCAL_PART.test(local) &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..") &&
    domain.length > 0
  );
};

export const isValidEmailDomain = (domain) => {
  const lower = domain.toLowerCase();
  const labels = lower.split(".");
  if (lower.length > 253 || labels.length < 2) return false;
  if (!labels.every((label) => DOMAIN_LABEL.test(label))) return false;
  if (!TLD.test(labels[labels.length - 1])) return false;
  return !allowedDomain || lower === allowedDomain;
};

// Returns "" when valid, otherwise a message for the user
export const validateEmail = (value) => {
  const email = (value || "").trim();
  if (!email) return "Enter your email ID";
  if (!isValidEmailFormat(email)) return "Enter a valid email address";
  if (!isValidEmailDomain(email.split("@")[1])) {
    return "Enter a valid email domain";
  }
  return "";
};
