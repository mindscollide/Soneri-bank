import React, { useTransition } from "react";
import SoneriLogo from "../../../assets/logo.png";
import { Col, Nav, Navbar, Row } from "react-bootstrap";
import styles from "./header.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileDropdown from "../../commonComponents/elements/profileDropdown/ProfileDropdown";
import PublshDealerSpreads from "../../../modules/dealer/publishDealerSpreads";
import Management from "../../../modules/management";
import { useMqtt } from "../../../context/MqttContext";
import { setMainLoader } from "../../../store/slicers/authSlicer/authSlicer";
import { useDispatch } from "react-redux";
const MainHeader = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { unsubscribeAll } = useMqtt();
  const [isPending, startTransition] = useTransition();
  const handleNavigate = (to) => {
    unsubscribeAll();

    startTransition(() => {
      dispatch(setMainLoader(true));
      navigate(to);
    });
  };

  return (
    <Row>
      <Col sm={12} md={12} lg={12}>
        <>
          <Navbar className={styles.mainNavbar} expand="lg">
            <Navbar.Brand>
              <img src={SoneriLogo} width="195" alt="" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Nav className="ms-auto align-items-center justify-content-end">
              {!location.pathname.toLowerCase().includes("allnews") &&
                (import.meta.env.VITE_APP_INCLUDE_TREASURY === "true" ? (
                  <>
                    <Nav.Link
                      className={
                        location.pathname.toLowerCase().includes("interbank")
                          ? styles.navItemAcitve
                          : styles.navItem
                      }
                      // to="interbank"
                      onClick={() => handleNavigate("interbank")}
                    >
                      Interbank
                    </Nav.Link>

                    <Nav.Link
                      className={
                        location.pathname.toLowerCase().includes("dealer")
                          ? styles.navItemAcitve
                          : styles.navItem
                      }
                      onClick={() => handleNavigate("dealer")}
                    >
                      Dealer
                    </Nav.Link>

                    <Nav.Link
                      className={
                        location.pathname.toLowerCase().includes("management")
                          ? styles.navItemAcitve
                          : styles.navItem
                      }
                      onClick={() => handleNavigate("Management")}
                    >
                      Management
                    </Nav.Link>

                    <Nav.Link
                      className={
                        location.pathname.toLowerCase().includes("treasury")
                          ? styles.navItemAcitve
                          : styles.navItem
                      }
                      onClick={() => handleNavigate("treasury")}
                    >
                      Treasury
                    </Nav.Link>
                  </>
                ) : import.meta.env.VITE_APP_INCLUDE_DEALER === "true" ? (
                  <PublshDealerSpreads />
                ) : import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true" ? (
                  <Management />
                ) : null)}

              <ProfileDropdown />
            </Nav>
          </Navbar>
        </>
      </Col>
    </Row>
  );
};

export default MainHeader;
