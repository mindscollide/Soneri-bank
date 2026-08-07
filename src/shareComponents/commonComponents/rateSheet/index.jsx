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
  GetRateSheetExcelExportReportApi,
  GetSBPConversionRatesForRateSheetApi,
  GetSOFRDataForRateSheetApi,
  GetSpotTTRatesForRateSheetApi,
} from "../../../store/actions/WatchlistAction";
import { useNavigate } from "react-router-dom";
import ExportPdf from "@/assets/img/export-pdf.svg";
import ExportExl from "@/assets/img/export-excel.svg";

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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatTodayForRateSheet } from "../../../utils/timeFunction";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";
import { useMqttTopics } from "../../../hook/useMqttTopics";
import Loader from "../../elements/soneriLoader/Loader";
import { Tooltip } from "antd";
import {
  clearTreasuryRateSheetSpotTTRates,
  clearTreasuryRateSheetCurrencyNotes,
  clearTreasuryRateSheetConversionRate,
  clearTreasuryRateSheetKibor,
  clearTreasuryRateSheetSofr,
  clearTreasuryRateSheetIndicativeFBPRates,
  clearCurrentRateSheetRatesPublished,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

const RateSheet = () => {
  useMqttTopics(["SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY"]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(false);

  const spotTTRatesRef = useRef(null);
  const ratesForCurrencyNotesRef = useRef(null);
  const sbpConversionRatesRef = useRef(null);
  const indicativeFBPRatesRef = useRef(null);
  const sofrRef = useRef(null);
  const kiborRef = useRef(null);

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

  // Reset the rate sheet's real-time slice on unmount so stale data
  // doesn't linger in the store (or briefly flash) next time this
  // screen mounts.
  useEffect(() => {
    return () => {
      dispatch(clearTreasuryRateSheetSpotTTRates());
      dispatch(clearTreasuryRateSheetCurrencyNotes());
      dispatch(clearTreasuryRateSheetConversionRate());
      dispatch(clearTreasuryRateSheetKibor());
      dispatch(clearTreasuryRateSheetSofr());
      dispatch(clearTreasuryRateSheetIndicativeFBPRates());
      dispatch(clearCurrentRateSheetRatesPublished());
    };
  }, [dispatch]);

  const todayDate = formatTodayForRateSheet();

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

  // Draws a section heading + a data table (via autoTable) at an explicit
  // x position and width, so tables can be placed side-by-side to mirror
  // the on-screen layout. Returns the Y position just below this table.
  // Rate sheet tables are small, bounded lists (currencies/tenors), so
  // they reliably fit within a single page — that's what makes side-by-
  // side placement safe here (autoTable can't keep two independent tables
  // aligned once either one spans multiple pages).
  const drawTable = (pdf, title, tableRef, x, y, width) => {
    const exportData = tableRef.current?.getExportData?.();

    if (!exportData || !exportData.rows.length) return y;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(title, x, y);

    autoTable(pdf, {
      head: [exportData.headers],
      body: exportData.rows,
      startY: y + 2,
      theme: "grid",
      styles: { fontSize: 8, halign: "center", cellPadding: 1.5 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { halign: "left", fillColor: [232, 225, 219] } },
      margin: { left: x },
      tableWidth: width,
    });

    return pdf.lastAutoTable.finalY;
  };

  const handleExportPDF = async () => {
    setShowLoader(true);

    try {
      const logoBase64 = await withTimeout(
        getBase64Image(SoneriLogo),
        10000,
        "Logo loading timed out.",
      );

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(logoBase64, "PNG", 0, 0, pageWidth, 25, undefined, "FAST");

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);

      pdf.text("FOREIGN EXCHANGE RATE SHEET", 10, 35);

      pdf.text("TREASURY & CAPITAL MARKETS GROUP", pageWidth - 10, 35, {
        align: "right",
      });

      // Date & Time
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);

      pdf.text(todayDate, pageWidth - 10, 42, {
        align: "right",
      });

      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const gap = 5;

      // Mirrors the on-screen Bootstrap grid: Spot TT (md=8) beside
      // Currency Notes + SBP stacked (md=4).
      const leftColWidth = (contentWidth - gap) * (8 / 12);
      const rightColWidth = contentWidth - gap - leftColWidth;
      const rightColX = margin + leftColWidth + gap;

      // Sofr (md=6) beside Kibor (md=6).
      const halfWidth = (contentWidth - gap) / 2;
      const rightHalfX = margin + halfWidth + gap;

      let cursorY = 50;

      const leftBottomY = drawTable(
        pdf,
        "SPOT TT RATES",
        spotTTRatesRef,
        margin,
        cursorY,
        leftColWidth,
      );

      let rightY = drawTable(
        pdf,
        "RATES FOR CURRENCY NOTES",
        ratesForCurrencyNotesRef,
        rightColX,
        cursorY,
        rightColWidth,
      );
      rightY = drawTable(
        pdf,
        "SBP CONVERSION RATES FOR FCY DEPOSITS",
        sbpConversionRatesRef,
        rightColX,
        rightY + 8,
        rightColWidth,
      );

      cursorY = Math.max(leftBottomY, rightY) + 8;

      cursorY =
        drawTable(
          pdf,
          "INDICATIVE FBP RATES",
          indicativeFBPRatesRef,
          margin,
          cursorY,
          contentWidth,
        ) + 8;

      const sofrBottomY = drawTable(
        pdf,
        "SOFR",
        sofrRef,
        margin,
        cursorY,
        halfWidth,
      );
      const kiborBottomY = drawTable(
        pdf,
        "KIBOR",
        kiborRef,
        rightHalfX,
        cursorY,
        halfWidth,
      );

      cursorY = Math.max(sofrBottomY, kiborBottomY) + 8;

      if (cursorY > pageHeight - 40) {
        pdf.addPage();
        cursorY = 15;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text("IMPORTANT NOTE:", 10, cursorY);
      cursorY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(200, 0, 0);

      const notes = [
        "THE ABOVE RATES ARE ONLY INDICATIVE AND SUBJECT TO CHANGE WITHOUT PRIOR NOTICE.",
        "FX TRANSACTIONS CUT OFF TIME FOR REPORTING IS 15:30 HOURS (MON-THU) AND 14:30 HOURS (FRIDAY).",
        "PLEASE CALL DEALING ROOM FOR AMOUNT EQUIVALENT OR MORE THAN USD.5,000/=",
      ];

      notes.forEach((note) => {
        const lines = pdf.splitTextToSize(`• ${note}`, pageWidth - 20);
        pdf.text(lines, 10, cursorY);
        cursorY += lines.length * 4 + 1;
      });

      pdf.setTextColor(0, 0, 0);
      cursorY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(
        "Treasury Sales Desk - Central Office PNSC Building, M.T. Khan Road, Karachi",
        pageWidth / 2,
        cursorY,
        { align: "center" },
      );
      cursorY += 4;
      pdf.text(
        "Direct Lines: 021-38900145. Email: treasury.sales@soneribank.com PABX +92 21 32444401-05, Exts: 2301, 2514, 2184, 2186 & 2144",
        pageWidth / 2,
        cursorY,
        { align: "center", maxWidth: pageWidth - 20 },
      );

      pdf.save("RateSheet.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setShowLoader(false);
    }
  };
  const handleClickExcel = () => {
    dispatch(GetRateSheetExcelExportReportApi({ navigate }));
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
            className={
              "mt-2 d-flex justify-content-end align-items-center gap-3 "
            }>
            <Tooltip title='Export Excel' arrow={false} placement='top'>
              <img
                className='cursor-pointer'
                src={ExportExl}
                onClick={handleClickExcel}
                width={25}
              />
            </Tooltip>
            <Tooltip title='Export PDF' arrow={false} placement='top'>
              <img
                className='cursor-pointer'
                src={ExportPdf}
                width={25}
                onClick={handleExportPDF}
              />
            </Tooltip>
          </Col>
        </Row>
        <div>
          <Row className='mt-3'>
            <Col sm={12} md={8} lg={8}>
              <Suspense fallback={<SectionLoader />}>
                <SpotTTRates ref={spotTTRatesRef} />
              </Suspense>
            </Col>
            <Col sm={12} md={4} lg={4}>
              <div>
                <Suspense fallback={<SectionLoader />}>
                  <RatesForCurrencyNotes ref={ratesForCurrencyNotesRef} />
                </Suspense>
              </div>

              <div className='mt-3'>
                <Suspense fallback={<SectionLoader />}>
                  <SbpConversionRates ref={sbpConversionRatesRef} />
                </Suspense>
              </div>
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col sm={12} md={12} lg={12}>
              <IndicativeFBPRates ref={indicativeFBPRatesRef} />
            </Col>
          </Row>
          <Row className='mt-3'>
            <Col sm={12} md={6} lg={6}>
              <Sofr ref={sofrRef} />
            </Col>
            <Col sm={12} md={6} lg={6}>
              <Kibor ref={kiborRef} />
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
            <Col sm={12} md={12} lg={12} className='text-center fs-6'>
              <p className='m-0'>
                {" "}
                Treasury Sales Desk - Central Office PNSC Building, M.T. Khan
                Road, Karachi
              </p>
              <p className='m-0'>
                Direct Lines: 021-38900145. Email: treasury.sales@soneribank.com
                PABX +92 21 32444401-05, Exts: 2301, 2514, 2184, 2186 & 2144
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default RateSheet;
