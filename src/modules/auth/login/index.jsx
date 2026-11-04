import React, { useEffect, useRef, useState } from "react";
// import Logo from "../../../assets/logo.png"
import soneriLogo from "../../../assets/logo.png";
import "./login.css";
import { Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginInApi } from "../../../store/actions/authAction";
import { validateEmail } from "../../../utils/emailValidation";
import { encryptField } from "../../../utils/encryption";

const shouldIsManagement =
  import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true";
const shouldIsDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";
const shouldIsTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const SubmitRef = useRef(null);

  useEffect(() => {
    // Reaching the sign-in page always starts from a clean session
    localStorage.clear();
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {
      email: validateEmail(email),
      password: password ? "" : "Enter password",
    };

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      try {
        let encryptedEmail = await encryptField(email.trim());
        let encryptedPassword = await encryptField(password);

        let Data = {
          Email: encryptedEmail,
          Password: encryptedPassword,
          DeviceID: "1",
          Device: "Browser",
          RoleID: shouldIsManagement
            ? 10
            : shouldIsDealer
              ? 7
              : shouldIsTreasury
                ? 8
                : 0,
        };
        dispatch(loginInApi({ Data, navigate }));

        return;
      } catch {

      }
    }
  };

  // Enter on the email field: validate, then move to the password field
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
    } else {
      passwordRef.current?.focus();
    }
  };

  return (
    <div className="login-screen fade-in" style={{ display: "block" }}>
      {/* Side header begin */}
      <div className="site-header p-0 bg-transparent p-relative">
        <div className="container-fluid page-gutter">
          <div className="header-inner d-flex align-items-center justify-content-center">
            <div className="site-logo pt-5">
              <img
                src={soneriLogo}
                width="300"
                className="img-fluid"
                alt="Soneri Bank Logo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Body Content wrapper Begin */}
      <div className="body-content-wrapper d-flex align-items-center justify-content-center">
        <div className="form-wrapper">
          <form onSubmit={handleLogin} className="form-horizontal d-flex align-items-top flex-wrap">
            <div className="col-12 form-heading-wrap">
              <div className="form-heading text-center">Login</div>
            </div>

            <div className="col-12 px-1 user-input-wrapper input-wrapper mb-3">
              <div className="input-group">
                <label className="input-group-text">
                  <i className="icon-user"></i>
                </label>
                <input
                  ref={emailRef}
                  type="text"
                  name="Email"
                  autoComplete="off"
                  inputMode="email"
                  placeholder="Email ID"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              {errors.email && (
                <span className="fs-sm color-red error-mess">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="col-12 px-1 pass-input-wrapper input-wrapper mb-3">
              <div className="input-group">
                <label className="input-group-text">
                  <i className="icon-lock"></i>
                </label>
                <input
                  ref={passwordRef}
                  // Plain text input masked with CSS (no type="password"), so the
                  // browser does not show its "save password" prompt
                  type="text"
                  name="password"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="Password"
                  className={`form-control password-masked ${errors.password ? "error" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
              </div>
              {errors.password && (
                <span className="fs-sm color-red error-mess">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="action col-12 text-center">
              <div className="action col-12 text-center">
                <button
                  type="submit"
                  className="btn btn-secondary btn-lg px-4"
                >
                  Login
                </button>
              </div>

              <Link
                className="d-block text-center color-black mt-2 text-decoration-underline"
                to="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </div>
      {/* Body Content wrapper End /// */}
    </div>
  );
};

export default Login;
