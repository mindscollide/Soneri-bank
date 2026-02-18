import React from "react";
import SoneriLogo from "../../../assets/logo.png";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Col, Dropdown, Nav, Navbar, Row } from "react-bootstrap";
import styles from "./header.module.css";
import { Link, useLocation } from "react-router-dom";
import ProfileDropdown from "../../commonComponents/elements/profileDropdown/ProfileDropdown";
import CustomButton from "../../commonComponents/elements/globalButton/button";
import InputFIeld from "../../commonComponents/elements/inputField/InputField";
import { NumericFormat } from "react-number-format";
import PublshDealerSpreads from "../../../modules/dealer/publishDealerSpreads";
const MainHeader = () => {
  const location = useLocation();
  console.log(location, "locationlocation");

  return (
    <Row>
      <Col sm={12} md={12} lg={12}>
        <>
          <Navbar className={styles.mainNavbar} expand="lg">
            <Navbar.Brand>
              <img src={SoneriLogo} width="195" alt="" sizes="" srcSet="" />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Nav className="ms-auto align-items-center justify-content-end">
              {import.meta.env.VITE_APP_INCLUDE_TREASURY === "true" ? (
                <>
                  <Nav.Link
                    as={Link}
                    className={
                      location.pathname
                        .toLowerCase()
                        .includes("interbank".toLowerCase())
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to={"interbank"}
                  >
                    Interbank
                  </Nav.Link>

                  <Nav.Link
                    as={Link}
                    className={
                      location.pathname
                        .toLowerCase()
                        .includes("dealer".toLowerCase())
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to={"dealer"}
                  >
                    Dealer
                  </Nav.Link>
                  <Nav.Link
                    // as={Link}
                    className={
                      location.pathname
                        .toLowerCase()
                        .includes("Management".toLowerCase())
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to={"Management"}
                  >
                    Management
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    className={
                      location.pathname
                        .toLowerCase()
                        .includes("treasury".toLowerCase())
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to={"treasury"}
                  >
                    Treasury
                  </Nav.Link>
                </>
              ) : import.meta.env.VITE_APP_INCLUDE_DEALER === "true" ? (
                <PublshDealerSpreads />
              ) : null}
              <ProfileDropdown />
            </Nav>
          </Navbar>
        </>
      </Col>
    </Row>
  );
};

export default MainHeader;
