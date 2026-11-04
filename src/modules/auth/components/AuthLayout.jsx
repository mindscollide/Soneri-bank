import soneriLogo from "../../../assets/logo.png";
import "../login/login.css";

// Same shell as the Login screen, shared by all password screens
const AuthLayout = ({ title, subtitle, children }) => (
  <div className="login-screen fade-in" style={{ display: "block" }}>
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

    <div className="body-content-wrapper d-flex align-items-center justify-content-center">
      <div className="form-wrapper">
        <div className="form-horizontal d-flex align-items-top flex-wrap">
          {(title || subtitle) && (
            <div className="col-12 form-heading-wrap">
              <div className="form-heading text-center">{title}</div>
              {subtitle && (
                <div className="sub-heading text-center fw-normal mt-1">
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
