import React, { useEffect, useRef, useState } from "react";
// import Logo from "../../../assets/logo.png"
import soneriLogo from "../../../assets/logo.png";
import "./login.css";
import { Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginInApi } from "../../../store/actions/authAction";

const shouldIsManagement =
  import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true";
const shouldIsDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";
const shouldIsTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const SubmitRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  const handleLogin = (e) => {
    e.preventDefault();
    console.log("login clicked");
    let newErrors = { email: "", password: "" };

    // if (!emailPattern.test(email)) {
    //   newErrors.email = "Enter a valid email address";
    // }

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      let Data = {
        UserName: email,
        Password: password,
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
      console.log("Login successful!");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    let newErrors = { email: "", password: "" };

    // if (e.target.name === "Email") {
    //   if (!email || !emailPattern.test(email)) {
    //     newErrors.email = "Enter a valid email address";
    //     setErrors((prev) => ({ ...prev, ...newErrors }));
    //   } else {
    //     passwordRef.current?.focus();
    //   }
    // }

    if (e.target.name === "Password") {
      if (!password) {
        newErrors.password = "Enter password";
        setErrors((prev) => ({ ...prev, ...newErrors }));
      } else {
        SubmitRef.current?.focus();
      }
    }
  };

  return (
    <div className="login-screen" style={{ display: "block" }}>
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
          <div className="form-horizontal d-flex align-items-top flex-wrap">
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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className={`form-control ${errors.password ? "error" : ""}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                />
                <span
                  className="view-pass input-group-text"
                  onClick={togglePasswordVisibility}
                  style={{ cursor: "pointer" }}
                >
                  <i className={`icon-eye${showPassword ? "-slash" : ""}`}></i>
                </span>
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
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>

              {/* <a className="d-block text-center color-black mt-2 text-decoration-underline" href="forgotpassword.html">
                Forgot Password?
              </a> */}
            </div>
          </div>
        </div>
      </div>
      {/* Body Content wrapper End /// */}
    </div>
  );
};

export default Login;
