import React, { lazy, Suspense, useEffect, useRef } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./RateSheet.module.css";
import CustomButton from "../elements/globalButton/button";
import { useDispatch } from "react-redux";
import {
  GetAllOtherInstrumentsApi,
  getAllTreasuryInstrumentsApi,
  GetIndicativeFBPRatesApi,
  GetKiborDataForRateSheetApi,
  GetRatesForCurrencyNotesForRateSheetApi,
  GetSBPConversionRatesForRateSheetApi,
  GetSOFRDataForRateSheetApi,
  GetSpotTTRatesForRateSheetApi,
} from "../../../store/actions/WatchlistAction";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/img/logo.png";
const SpotTTRates = lazy(() => import("./spotTTRates/index"));
const RatesForCurrencyNotes = lazy(() =>
  import("./ratesForCurrencyNotes/index")
);
const SbpConversionRates = lazy(() => import("./sbpConversionRates/index"));
const IndicativeFBPRates = lazy(() => import("./indicativeFBPRates/index"));
const Sofr = lazy(() => import("./sofr/index"));
const Kibor = lazy(() => import("./kibor/index"));
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatTodayForRateSheet } from "../../../utils/timeFunction";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";
import { useMqttTopics } from "../../../hook/useMqttTopics";

const RateSheet = () => {
  useMqttTopics(["SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY"]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const screenRef = useRef(null);
  useEffect(() => {
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(GetAllOtherInstrumentsApi({ navigate }));
    dispatch(GetSpotTTRatesForRateSheetApi({ navigate }));
    dispatch(GetRatesForCurrencyNotesForRateSheetApi({ navigate }));
    dispatch(GetKiborDataForRateSheetApi({ navigate }));
    dispatch(GetSOFRDataForRateSheetApi({ navigate }));
    dispatch(GetIndicativeFBPRatesApi({ navigate }));
    dispatch(GetSBPConversionRatesForRateSheetApi({ navigate }));
  }, []);
  const todayDate = formatTodayForRateSheet();
  const getBase64Image = (imgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.src = imgUrl;
    });
  };
  const handleExportPDF = async () => {
    const element = screenRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.9); // better quality

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const logoBase64 = await getBase64Image(logo);

    /* -------- CENTER LOGO -------- */

    const headerWidth = 60;
    const headerHeight = 15;

    const xPosition = (pageWidth - headerWidth) / 2;

    pdf.addImage(logoBase64, "PNG", xPosition, 8, headerWidth, headerHeight);

    /* -------- HEADER TEXT -------- */
    pdf.setFontSize(10);
    pdf.text("Roshan Har Qadam", pageWidth / 2, 28, { align: "center" });

    pdf.setFontSize(11);
    pdf.text("FOREIGN EXCHANGE RATE SHEET", 10, 35);

    pdf.text("TREASURY & CAPITAL MARKETS GROUP", pageWidth - 10, 35, {
      align: "right",
    });

    pdf.text(todayDate, 10, 42);

    /* -------- ADD SCREENSHOT -------- */

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "JPEG",
      10,
      48,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );
    pdf.save("RateSheet.pdf");
  };
  return (
    <div className={styles.mainRateSheetContianer}>
      <Row className="d-flex justify-space-between">
        <Col sm={12} md={6} lg={6} className={styles.dateDay}>
          {todayDate}
        </Col>
        <Col
          sm={12}
          md={6}
          lg={6}
          className={"mt-1 d-flex justify-content-end align-items-bottom"}
        >
          <CustomButton
            value={"Export to PDF"}
            applyClass="exportToPDF"
            onClick={handleExportPDF}
            // loading={clearRatesLoading}
          />
        </Col>
      </Row>
      <div ref={screenRef}>
        <Row className="mt-3">
          <Col sm={12} md={8} lg={8}>
            <Suspense fallback={<SectionLoader />}>
              <SpotTTRates />
            </Suspense>
          </Col>
          <Col sm={12} md={4} lg={4}>
            <div>
              <Suspense fallback={<SectionLoader />}>
                <RatesForCurrencyNotes />
              </Suspense>
            </div>

            <div className="mt-3">
              <Suspense fallback={<SectionLoader />}>
                <SbpConversionRates />
              </Suspense>
            </div>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={12} md={12} lg={12}>
            <IndicativeFBPRates />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={12} md={6} lg={6}>
            <Sofr />
          </Col>
          <Col sm={12} md={6} lg={6}>
            <Kibor />
          </Col>
        </Row>
        <Row className="mt-3 mb-3">
          <Col sm={12} md={12} lg={12} className={styles.importantNote}>
            <div className="fw-bold text-decoration-underline">
              IMPORTANT NOTE:
            </div>
            <ul className="color-red">
              <li>
                THE ABOVE RATES ARE ONLY INDICATIVE AND SUBJECT TO CHANGE
                WITHOUT PRIOR NOTICE.
              </li>
              <li>
                FX TRANSACTIONS CUT OFF TIME FOR REPORTING IS 15:30 HOURS
                (MON-THU) AND 14:30 HOURS (FRIDAY).
              </li>
              <li>
                PLEASE CALL DEALING ROOM FOR AMOUNT EQUIVALENT OR MORE THAN
                USD.5,000/=
              </li>
              <li>
                SONERI CAPTURES ABOVE FOREIGN EXCHANGE RATES FROM SOURCES
                BELIEVED TO BE RELIABLE AND DOES NOT ACCEPT ANY LIABILITY FOR
                CONSEQUENCES THAT MAY ARISE USING THESE RATES.
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RateSheet;
