import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./t24.module.css";
import "./t24AgGrid.css";

import { formatTodayForRateSheet } from "../../../utils/timeFunction";

import ExportPdf from "@/assets/img/export-pdf.svg";
import ExportExl from "@/assets/img/export-excel.svg";
import SoneriLogo from "@/assets/newSoneriLogo.jpg";

import { Tooltip } from "antd";
import { Col, Row } from "react-bootstrap";

import AgGridTable from "../elements/globalAgGridTable";
import Loader from "@/shareComponents/elements/soneriLoader/Loader";
import SectionLoader from "@/shareComponents/elements/soneriLoader/SectionLoader";
import NoDataOverlay from "@/shareComponents/elements/soneriLoader/NoDataOverlay";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useDispatch, useSelector } from "react-redux";
import {
  GetT24RatesApi,
  GetT24RatesExcelReportApi,
} from "../../../store/actions/WatchlistAction";
import { clearTreasuryT24Rates } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

import { useMqttTopics } from "../../../hook/useMqttTopics";
import { getCurrentDate } from "../../../utils/formatters";

const dashIfEmpty = ({ value }) =>
  value === 0 || value === null || value === undefined || value === ""
    ? "-"
    : value;

const T24 = () => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);
  const [showLoader, setShowLoader] = useState(false);

  const [processedData, setProcessedData] = useState([]);

  useMqttTopics(["SBL_REAL_TIME_T24_SHEET_FEED_TREASURY"]);

  const getT24Rates = useSelector(
    (state) => state.WatchListReducer.GetT24RatesData,
  );

  const getT24RatesMQtt = useSelector(
    (state) => state.RealtimeActionsSlice.t24TreasuryRates,
  );

  const todayDate = useMemo(() => {
    return formatTodayForRateSheet();
  }, []);

  // ----------------------------------------
  // Initial API
  // ----------------------------------------

  useEffect(() => {
    dispatch(GetT24RatesApi({}));
  }, [dispatch]);

  // ----------------------------------------
  // Initial AG Grid data
  // ----------------------------------------

  useEffect(() => {
    const rateSheetRows = getT24Rates?.rateSheetRows;

    if (!Array.isArray(rateSheetRows)) return;

    setProcessedData(rateSheetRows);
  }, [getT24Rates]);

  // ----------------------------------------
  // AG Grid Ready
  // ----------------------------------------

  const handleGridReady = useCallback((params) => {
    gridApiRef.current = params.api;
  }, []);

  // ----------------------------------------
  // MQTT realtime row update
  // ----------------------------------------

  useEffect(() => {
    if (!getT24RatesMQtt?.length) return;

    const gridApi = gridApiRef.current;

    if (!gridApi || gridApi.isDestroyed?.()) return;

    // Process every buffered message, not just the latest — batched MQTT
    // dispatches can land several updates (different currencies) in one
    // render, and each one is a distinct row update that must be applied.
    getT24RatesMQtt.forEach((message) => {
      const rateSheetRow = message?.rateSheetRow;
      if (!rateSheetRow) return;

      const currencyID = rateSheetRow.currencyID;
      if (currencyID === null || currencyID === undefined) return;

      const rowNode = gridApi.getRowNode(String(currencyID));
      if (!rowNode) return;

      rowNode.updateData({
        ...rowNode.data,
        ...rateSheetRow,
      });
    });

    dispatch(clearTreasuryT24Rates());
  }, [getT24RatesMQtt, dispatch]);

  // ----------------------------------------
  // Cleanup
  // ----------------------------------------

  useEffect(() => {
    return () => {
      gridApiRef.current = null;
    };
  }, []);

  // ----------------------------------------
  // Columns
  // ----------------------------------------

  const columnDefs = useMemo(
    () => [
      {
        headerName: "UPLOAD.COMPANY",
        field: "uploadCompany",
        cellClass: "rs-first-col",
        width: 150,
      },
      {
        headerName: "ID/CURRENCY.CODE",
        field: "currencyCode",
        width: 170,
      },
      {
        headerName: "CURRENCY.MARKET",
        field: "currencyMarket",
        valueFormatter: dashIfEmpty,
        width: 170,
      },
      {
        headerName: "BUY RATE CM.2",
        field: "buyRateCM2",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
      {
        headerName: "SELL RATE CM.2",
        field: "sellRateCM2",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
      {
        headerName: "BUY RATE CM.1",
        field: "buyRateCM1",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
      {
        headerName: "SELL RATE CM.1",
        field: "sellRateCM1",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
      {
        headerName: "Seperator",
        field: "separator",
        valueFormatter: () => "::",
        flex: 1,
      },
      {
        headerName: "BUY.RATE",
        field: "buyRate",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
      {
        headerName: "SELL.RATE",
        field: "sellRate",
        valueFormatter: dashIfEmpty,
        flex: 1,
      },
    ],
    [],
  );

  // ----------------------------------------
  // Default Column Settings
  // ----------------------------------------

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      minWidth: 50,
    }),
    [],
  );

  // ----------------------------------------
  // Grid height
  // ----------------------------------------

  const gridHeight = useMemo(() => {
    // Reserve room for the "No Data Found" overlay ONLY when truly empty —
    // Math.max(len, N) would also force that extra height when there ARE
    // 1..N-1 real rows, reintroducing dead space below them.
    return 32 + (processedData.length === 0 ? 4 : processedData.length) * 32;
  }, [processedData.length]);

  const handleClickExcelExport = () => {
    dispatch(GetT24RatesExcelReportApi({}));
  };

  // ----------------------------------------
  // Export PDF — built as a real text table (jspdf-autotable) straight from
  // the same columnDefs/processedData the grid renders, rather than a
  // DOM screenshot. T24 has 10 wide columns that don't all fit on screen —
  // the grid scrolls horizontally to show the rest, but html2canvas can
  // only ever capture what's actually laid out inside that scroll
  // container, so a screenshot silently cut off every column past the
  // visible width. autoTable draws the full column set directly and wraps
  // onto additional pages automatically, so nothing is ever missing.
  // ----------------------------------------

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

      img.onerror = () => reject(new Error("Soneri logo failed to load."));
      img.src = imgUrl;
    });
  };

  const withTimeout = (promise, timeout, message) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(message)), timeout);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  };

  const handleExportPDF = async () => {
    if (!processedData.length) {
      console.error("No T24 data to export.");
      return;
    }

    setShowLoader(true);

    try {
      const logoBase64 = await withTimeout(
        getBase64Image(SoneriLogo),
        10000,
        "Logo loading timed out.",
      );

      const pdf = new jsPDF({
        orientation: "l",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.addImage(logoBase64, "PNG", 0, 0, pageWidth, 20, undefined, "FAST");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("T24 RATES", 10, 28);
      pdf.text(todayDate, pageWidth - 10, 28, { align: "right" });

      const head = [columnDefs.map((col) => col.headerName)];
      const body = processedData.map((row) =>
        columnDefs.map((col) => {
          const value = row[col.field];
          return col.valueFormatter
            ? col.valueFormatter({ value })
            : (value ?? "-");
        }),
      );

      autoTable(pdf, {
        head,
        body,
        startY: 34,
        theme: "grid",
        styles: { fontSize: 8, halign: "center", cellPadding: 2 },
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: "bold" },
        columnStyles: { 0: { halign: "left", fillColor: [232, 225, 219] } },
      });

      pdf.save(`SBL Rates T24 ${getCurrentDate()}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <section className={styles.t24Container}>
      {showLoader && <Loader />}
      <Row className='mb-2'>
        <Col sm={12} md={6} lg={6} className='d-flex align-items-center'>
          {todayDate}
        </Col>

        <Col
          sm={12}
          md={6}
          lg={6}
          className='mt-2 d-flex justify-content-end align-items-center gap-3'>
          <Tooltip title='Export Excel'>
            <img
              className='cursor-pointer'
              src={ExportExl}
              width={25}
              alt='Export Excel'
              onClick={handleClickExcelExport}
            />
          </Tooltip>

          <Tooltip title='Export PDF'>
            <img
              className='cursor-pointer'
              src={ExportPdf}
              width={25}
              alt='Export PDF'
              onClick={handleExportPDF}
            />
          </Tooltip>
        </Col>
      </Row>

      <AgGridTable
        className='t24AgGrid'
        style={{
          height: gridHeight,
        }}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => String(params.data.currencyID)}
        onGridReady={handleGridReady}
        suppressColumnVirtualisation={true}
        animateRows={false}
        loadingOverlayComponent={SectionLoader}
        noRowsOverlayComponent={NoDataOverlay}
      />
    </section>
  );
};

export default T24;
