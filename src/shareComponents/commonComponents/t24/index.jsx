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

import { Tooltip } from "antd";
import { Col, Row } from "react-bootstrap";

import AgGridTable from "../elements/globalAgGridTable";

import { useDispatch, useSelector } from "react-redux";
import { GetT24RatesApi } from "../../../store/actions/WatchlistAction";

import { useMqttTopics } from "../../../hook/useMqttTopics";

const dashIfEmpty = ({ value }) =>
  value === 0 || value === null || value === undefined || value === ""
    ? "-"
    : value;

const T24 = () => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);

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
    if (!getT24RatesMQtt) return;

    const { rateSheetRow } = getT24RatesMQtt;

    if (!rateSheetRow) return;

    const gridApi = gridApiRef.current;

    if (!gridApi || gridApi.isDestroyed?.()) return;

    const currencyID = rateSheetRow.currencyID;

    if (currencyID === null || currencyID === undefined) return;

    const rowNode = gridApi.getRowNode(String(currencyID));

    if (!rowNode) return;

    rowNode.updateData({
      ...rowNode.data,
      ...rateSheetRow,
    });
  }, [getT24RatesMQtt]);

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
        width: 140,
      },
      {
        headerName: "SELL RATE CM.2",
        field: "sellRateCM2",
        valueFormatter: dashIfEmpty,
        width: 140,
      },
      {
        headerName: "BUY RATE CM.1",
        field: "buyRateCM1",
        valueFormatter: dashIfEmpty,
        width: 140,
      },
      {
        headerName: "SELL RATE CM.1",
        field: "sellRateCM1",
        valueFormatter: dashIfEmpty,
        width: 140,
      },
      {
        headerName: "Seperator",
        field: "separator",
        valueFormatter: () => "::",
        width: 100,
      },
      {
        headerName: "BUY.RATE",
        field: "buyRate",
        valueFormatter: dashIfEmpty,
        width: 140,
      },
      {
        headerName: "SELL.RATE",
        field: "sellRate",
        valueFormatter: dashIfEmpty,
        width: 140,
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
    return 32 + Math.max(processedData.length, 1) * 32;
  }, [processedData.length]);

  return (
    <section className={styles.t24Container}>
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
            />
          </Tooltip>

          <Tooltip title='Export PDF'>
            <img
              className='cursor-pointer'
              src={ExportPdf}
              width={25}
              alt='Export PDF'
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
      />
    </section>
  );
};

export default T24;
