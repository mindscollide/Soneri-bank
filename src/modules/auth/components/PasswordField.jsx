import { useState } from "react";

const PasswordField = ({ name, value, onChange, placeholder, autoFocus }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="col-12 px-1 pass-input-wrapper input-wrapper mb-3">
      <div className="input-group">
        <label className="input-group-text">
          <i className="icon-lock"></i>
        </label>
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          autoComplete="new-password"
        />
        <span
          className="view-pass input-group-text"
          onClick={() => setShow((s) => !s)}
          style={{ cursor: "pointer" }}
        >
          <i className={`icon-eye${show ? "-slash" : ""}`}></i>
        </span>
      </div>
    </div>
  );
};

export default PasswordField;
