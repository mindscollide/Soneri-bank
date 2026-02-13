import React from "react";
import SoneriLogo from "../../../assets/logo.png";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Col, Dropdown, Nav, Navbar, Row } from "react-bootstrap";
import styles from "./header.module.css";
import { Link, useLocation } from "react-router-dom";
import ProfileDropdown from "../../commonComponents/elements/profileDropdown/ProfileDropdown";
const MainHeader = () => {
  const location = useLocation();
  console.log(location, "locationlocation");
  return (
    <Row>
      <Col sm={12} md={12} lg={12}>
        {import.meta.env.VITE_APP_INCLUDE_TREASURY === "true" ? (
          <>
            <Navbar className={styles.mainNavbar} expand="lg">
              <Navbar.Brand>
                <img src={SoneriLogo} width="195" alt="" sizes="" srcset="" />
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />

              <Nav className="ms-auto align-items-center">
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
                  // as={Link}
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
                  // as={Link}
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

                <ProfileDropdown />
              </Nav>
            </Navbar>
          </>
        ) : null}
      </Col>
    </Row>
  );
};

export default MainHeader;
