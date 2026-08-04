import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
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
import SoneriLogo from "../../../assets/newSoneriLogo.jpg";
const SpotTTRates = lazy(() => import("./spotTTRates/index"));
const RatesForCurrencyNotes = lazy(
  () => import("./ratesForCurrencyNotes/index"),
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
import { setMainLoader } from "../../../store/slicers/authSlicer/authSlicer";
import Loader from "../../elements/soneriLoader/Loader";

const RateSheet = () => {
  useMqttTopics(["SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY"]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);
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

  const waitForRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

  const getBase64Image = (imgUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");

          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to create canvas context."));
            return;
          }

          context.drawImage(img, 0, 0);

          resolve(canvas.toDataURL("image/png"));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Soneri logo failed to load."));
      };

      img.src = imgUrl;
    });
  };

  const withTimeout = (
    promise,
    timeout = 30000,
    message = "Operation timed out",
  ) => {
    let timeoutId;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(message));
      }, timeout);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  };

  const waitForBrowserPaint = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

  const handleExportPDF = async () => {
    const element = screenRef.current;

    if (!element) {
      console.error("Rate sheet element was not found.");
      return;
    }

    setShowLoader(true);

    try {
      // Let React display the loader before heavy processing starts.
      await waitForBrowserPaint();

      const canvasPromise = withTimeout(
        html2canvas(element, {
          scale: 1,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          ignoreElements: (node) => node.classList?.contains("pdf-ignore"),
        }),
        45000,
        "Rate sheet capture timed out.",
      );

      const logoPromise = withTimeout(
        getBase64Image(SoneriLogo),
        10000,
        "Logo loading timed out.",
      );

      const [canvas, logoBase64] = await Promise.all([
        canvasPromise,
        logoPromise,
      ]);

      const imgData = canvas.toDataURL("image/jpeg", 0.75);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(logoBase64, "PNG", 0, 0, pageWidth, 20, undefined, "FAST");

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);

      pdf.text("FOREIGN EXCHANGE RATE SHEET", 10, 35);

      pdf.text("TREASURY & CAPITAL MARKETS GROUP", pageWidth - 10, 35, {
        align: "right",
      });

      // Date & Time
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);

      pdf.text(todayDate, pageWidth - 10, 42, {
        align: "right",
      });
      const imageX = 10;
      const imageY = 48;
      const imageWidth = pageWidth - 20;
      const footerSpace = 15;

      const availableImageHeight = pageHeight - imageY - footerSpace - 10;

      const calculatedImageHeight = (canvas.height * imageWidth) / canvas.width;

      const imageHeight = Math.min(calculatedImageHeight, availableImageHeight);

      pdf.addImage(
        imgData,
        "JPEG",
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        "FAST",
      );

      const footerY = imageY + imageHeight + 7;

      pdf.setFontSize(8);

      pdf.text(
        "THIS IS A COMPUTER GENERATED RATE SHEET AND DOES NOT REQUIRE ANY SIGNATURE",
        pageWidth / 2,
        footerY,
        {
          align: "center",
          maxWidth: pageWidth - 20,
        },
      );

      pdf.save("RateSheet.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <>
      {showLoader && <Loader />}
      <div className={styles.mainRateSheetContianer}>
        <Row className='d-flex justify-space-between'>
          <Col sm={12} md={6} lg={6} className={styles.dateDay}>
            {todayDate}
          </Col>
          <Col
            sm={12}
            md={6}
            lg={6}
            className={"mt-1 d-flex justify-content-end align-items-bottom"}>
            <CustomButton
              value={"Export to PDF"}
              applyClass='exportToPDF'
              onClick={handleExportPDF}
              // loading={clearRatesLoading}
            />
          </Col>
        </Row>
        <div ref={screenRef}>
          <Row className='mt-3'>
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

              <div className='mt-3'>
                <Suspense fallback={<SectionLoader />}>
                  <SbpConversionRates />
                </Suspense>
              </div>
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col sm={12} md={12} lg={12}>
              <IndicativeFBPRates />
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col sm={12} md={6} lg={6}>
              <Sofr />
            </Col>
            <Col sm={12} md={6} lg={6}>
              <Kibor />
            </Col>
          </Row>
          <Row className='mt-3 mb-2'>
            <Col sm={12} md={12} lg={12} className={styles.importantNote}>
              <div className='fw-bold text-decoration-underline'>
                IMPORTANT NOTE:
              </div>
              <ul className='color-red'>
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
              </ul>
            </Col>
          </Row>
          <Row className='mb-2'>
            <Col sm={12} md={12} lg={12}>
              <p>
                {" "}
                Treasury Sales Desk - Central Office PNSC Building, M.T. Khan
                Road, Karachi Direct Lines: 021-38900145. Email:
                treasury.sales@soneribank.com PABX +92 21 32444401-05, Exts:
                2301, 2514, 2184, 2186 & 2144
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default RateSheet;
