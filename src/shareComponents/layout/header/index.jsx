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
const MainHeader = () => {
  const location = useLocation();
  console.log(location, "locationlocation");
  return (
    <Row>
      <Col sm={12} md={12} lg={12}>
        <>
          <Navbar className={styles.mainNavbar} expand="lg">
            <Navbar.Brand>
              <img src={SoneriLogo} width="195" alt="" sizes="" srcset="" />
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
                <>
                  <Row>
                    <Col>
                      <div className="fs-sm fw-bold color-secondary">
                        Bid Spread
                      </div>
                      <NumericFormat
                        min={1}
                        // disabled={true}
                        // value={lastPublishRates.bidValue}
                        name="bidValue"
                        customInput={InputFIeld}
                        decimalScale={2}
                        type="text"
                        allowNegative={false}
                        placeholder={"0.00"}
                        applyClass={"bidAskInput"}
                      />
                    </Col>
                    <Col>
                      <div className="fs-sm fw-bold color-secondary">
                        Ask Spread
                      </div>
                      <NumericFormat
                        min={1}
                        type="text"
                        // value={lastPublishRates.askValue}
                        decimalScale={2}
                        // onChange={handleChangeCurrentRate}
                        customInput={InputFIeld}
                        name="askValue"
                        placeholder={"0.00"}
                        allowNegative={false}
                        applyClass={"bidAskInput"}
                      />
                    </Col>
                    <Col>
                      <CustomButton
                        value={"Publish"}
                        applyClass="publishBtnDealerHeader"
                        // disabled={isMarketOn === true ? false : true}
                        // onClick={handlePublishRates}
                        // loading={publishNewRatesLoading}
                      />
                    </Col>
                  </Row>
                </>
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
