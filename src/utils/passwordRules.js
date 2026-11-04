// Password policy shown on Create / Reset / Change password screens.
// Adjust here if the bank's policy changes.
const COMMON_WORDS = [
  "password",
  "passw0rd",
  "qwerty",
  "letmein",
  "welcome",
  "admin",
  "login",
  "soneri",
  "bank",
  "abc123",
  "iloveyou",
  "monkey",
  "dragon",
  "master",
  "123456",
  "12345678",
];

const hasDictionaryOrPersonal = (password, personalInfo = []) => {
  const lower = password.toLowerCase();
  if (COMMON_WORDS.some((w) => lower.includes(w))) return true;
  return personalInfo
    .flatMap((info) =>
      String(info || "")
        .toLowerCase()
        .split(/[\s@._-]+/),
    )
    .filter((part) => part.length >= 3)
    .some((part) => lower.includes(part));
};

// Each rule: { id, label, test(password, confirm, personalInfo) }
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "Length of at least 8 characters",
    test: (p) => p.length >= 8,
  },
  {
    id: "uppercase",
    label: "Contains at least one capital letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    id: "number",
    label: "Contains numbers (1-9)",
    test: (p) => /[1-9]/.test(p),
  },
  {
    id: "special",
    label: "Contains special characters (!@#$%^&*)",
    test: (p) => /[!@#$%^&*]/.test(p),
  },
  {
    id: "repeat",
    label: "No character repeated more than 2 times",
    test: (p) => p.length > 0 && !/(.)\1\1/.test(p),
  },
  {
    id: "dictionary",
    label: "Does not contain dictionary or personal information",
    test: (p, _c, info) => p.length > 0 && !hasDictionaryOrPersonal(p, info),
  },
  {
    id: "match",
    label: "Password match",
    test: (p, c) => p.length > 0 && p === c,
  },
];

export const getRuleResults = (password = "", confirm = "", info = []) =>
  PASSWORD_RULES.map((rule) => ({
    ...rule,
    ok: rule.test(password, confirm, info),
  }));
