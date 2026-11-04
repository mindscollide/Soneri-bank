// Live checklist: red cross while a rule fails, green tick once it passes
const Icon = ({ ok }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="9" r="9" fill={ok ? "#198754" : "#eb1100"} />
    <path
      d={ok ? "M5 9.5l2.6 2.6L13 6.8" : "M6 6l6 6M12 6l-6 6"}
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const PasswordRules = ({ results }) => (
  <ul className="col-12 px-1 mb-2 list-unstyled">
    {results.map((rule) => (
      <li key={rule.id} className="d-flex align-items-center gap-2 mb-2 fs-sm">
        <Icon ok={rule.ok} />
        <span>{rule.label}</span>
      </li>
    ))}
  </ul>
);

export default PasswordRules;
