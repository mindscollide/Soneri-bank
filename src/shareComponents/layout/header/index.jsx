import React from "react";
import SoneriLogo from "../../../assets/logo.png";
import { Col, Nav, Navbar, Row } from "react-bootstrap";
import styles from "./header.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileDropdown from "../../commonComponents/elements/profileDropdown/ProfileDropdown";
import PublshDealerSpreads from "../../../modules/dealer/publishDealerSpreads";
import Management from "../../../modules/management";
import { setMainLoader } from "../../../store/slicers/authSlicer/authSlicer";
import { useDispatch } from "react-redux";
import {
  clearGetCommoditiesForTreasury,
  clearGetCurrencyCrosses,
  clearGetIndicesForTreasury,
  clearGetKiborDataForTreasury,
  clearGetRevalRatesForTreasury,
  clearGetSOFRDataForTreasury,
  clearGetSwapsInUSDForTreasury,
  clearGetUSDParityForTreasury,
} from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import CustomButton from "../../commonComponents/elements/globalButton/button";
const MainHeader = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const { unsubscribeAll } = useMqtt();
  const handleNavigate = (e, to) => {
    e.preventDefault(); // Stop the default Link behavior
    navigate(to);
  };

  const handleClickCalculator = (e) => {
    e.preventDefault();
    window.open("/SONERI/calculator", "_blank");
  }

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
              {location.pathname
                .toLowerCase()
                .includes("allnews") ? null : import.meta.env
                  .VITE_APP_INCLUDE_TREASURY === "true" ? (
                <>
                <CustomButton value={"Calculator"} onClick={handleClickCalculator} className={styles.CalculatorBtn} />
                  <Nav.Link
                    className={
                      location.pathname.toLowerCase().includes("interbank")
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to="interbank"
                    as={Link}
                    onClick={(e) => handleNavigate(e, "interbank")}
                    // onClick={handleClickInterbank}
                  >
                    Interbank
                  </Nav.Link>

                  <Nav.Link
                    className={
                      location.pathname.toLowerCase().includes("dealer")
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to="dealer"
                    as={Link}
                    onClick={(e) => handleNavigate(e, "dealer")}
                  >
                    Dealer
                  </Nav.Link>

                  <Nav.Link
                    className={
                      location.pathname.toLowerCase().includes("management")
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to="Management"
                    as={Link}
                    onClick={(e) => handleNavigate(e, "Management")}
                  >
                    Management
                  </Nav.Link>

                  <Nav.Link
                    className={
                      location.pathname.toLowerCase().includes("treasury")
                        ? styles.navItemAcitve
                        : styles.navItem
                    }
                    to="treasury"
                    as={Link}
                    onClick={(e) => handleNavigate(e, "treasury")}
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
