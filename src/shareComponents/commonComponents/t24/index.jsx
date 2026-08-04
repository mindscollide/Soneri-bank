import React, { useEffect, useMemo, useState } from "react";
import styles from "./t24.module.css";
import { formatTodayForRateSheet } from "../../../utils/timeFunction";
import ExportPdf from "@/assets/img/export-pdf.svg";
import ExportExl from "@/assets/img/export-excel.svg";
import { Tooltip } from "antd";
import { Col, Row } from "react-bootstrap";
import AgGridTable from "../elements/globalAgGridTable";
import "./t24AgGrid.css";

const dashIfEmpty = ({ value }) =>
  value === 0 || value === null || value === undefined || value === ""
    ? "-"
    : value;

const T24 = () => {
  const [processedData, setProcessedData] = useState([]);

  const todayDate = formatTodayForRateSheet();

  useEffect(() => {
    const tableData = [
      {
        id: 1,
        uploadCompany: "PK0010001",
        currencyCode: "AED",
        currencyMarket: "1::10",
        buyRateCM2: 75.4858,
        sellRateCM2: 75.5719,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 2,
        uploadCompany: "PK0010001",
        currencyCode: "AUD",
        currencyMarket: "1::10",
        buyRateCM2: 191.4646,
        sellRateCM2: 191.809,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 3,
        uploadCompany: "PK0010001",
        currencyCode: "CAD",
        currencyMarket: "1::10",
        buyRateCM2: 195.1598,
        sellRateCM2: 195.5121,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 4,
        uploadCompany: "PK0010001",
        currencyCode: "CHF",
        currencyMarket: "1::10",
        buyRateCM2: 343.2102,
        sellRateCM2: 343.8276,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 5,
        uploadCompany: "PK0010001",
        currencyCode: "CNY",
        currencyMarket: "1::10",
        buyRateCM2: 40.8914,
        sellRateCM2: 40.9208,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 6,
        uploadCompany: "PK0010001",
        currencyCode: "EUR",
        currencyMarket: "1::10",
        buyRateCM2: 316.3985,
        sellRateCM2: 316.9677,
        buyRateCM1: 313.2346,
        sellRateCM1: 320.1374,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 7,
        uploadCompany: "PK0010001",
        currencyCode: "GBP",
        currencyMarket: "1::10",
        buyRateCM2: 366.826,
        sellRateCM2: 367.4859,
        buyRateCM1: 363.1578,
        sellRateCM1: 371.1608,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 8,
        uploadCompany: "PK0010001",
        currencyCode: "JPY",
        currencyMarket: "1::10",
        buyRateCM2: 1.7179,
        sellRateCM2: 1.721,
        buyRateCM1: 1.7008,
        sellRateCM1: 1.7382,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 9,
        uploadCompany: "PK0010001",
        currencyCode: "SGD",
        currencyMarket: "1::10",
        buyRateCM2: 214.7601,
        sellRateCM2: 215.1464,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 10,
        uploadCompany: "PK0010001",
        currencyCode: "SAR",
        currencyMarket: "1::10",
        buyRateCM2: 74.014,
        sellRateCM2: 74.1471,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 11,
        uploadCompany: "PK0010001",
        currencyCode: "THB",
        currencyMarket: "1::10",
        buyRateCM2: 8.3369,
        sellRateCM2: 8.3519,
        buyRateCM1: null,
        sellRateCM1: null,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
      {
        id: 12,
        uploadCompany: "PK0010001",
        currencyCode: "USD",
        currencyMarket: "1::10",
        buyRateCM2: 277.9522,
        sellRateCM2: 278.4522,
        buyRateCM1: 275.1727,
        sellRateCM1: 281.2367,
        separator: "::",
        buyRate: null,
        sellRate: null,
      },
    ];

    setProcessedData(tableData);
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "UPLOAD.COMPANY",
        field: "uploadCompany",
        minWidth: 160,
        cellClass: "rs-first-col",
      },
      {
        headerName: "ID/CURRENCY.CODE",
        field: "currencyCode",
        minWidth: 175,
      },
      {
        headerName: "CURRENCY.MARKET",
        field: "currencyMarket",
        minWidth: 170,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "BUY RATE CM.2",
        field: "buyRateCM2",
        minWidth: 160,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "SELL RATE CM.2",
        field: "sellRateCM2",
        minWidth: 160,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "BUY RATE CM.1",
        field: "buyRateCM1",
        minWidth: 160,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "SELL RATE CM.1",
        field: "sellRateCM1",
        minWidth: 160,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "Seperator",
        field: "separator",
        minWidth: 120,
        valueFormatter: ({ value }) => value || "::",
      },
      {
        headerName: "BUY.RATE",
        field: "buyRate",
        minWidth: 130,
        valueFormatter: dashIfEmpty,
      },
      {
        headerName: "SELL.RATE",
        field: "sellRate",
        minWidth: 130,
        valueFormatter: dashIfEmpty,
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      cellClass: "t24-cell",
      headerClass: "t24-header",
    }),
    [],
  );

  return (
    <section className="px-2 py-2">
      <Row className="d-flex justify-content-between">
        <Col sm={12} md={6} lg={6} className={styles.dateDay}>
          {todayDate}
        </Col>

        <Col
          sm={12}
          md={6}
          lg={6}
          className="mt-2 d-flex justify-content-end align-items-center gap-3"
        >
          <Tooltip title="Export Excel" arrow={false} placement="top">
            <img
              className="cursor-pointer"
              src={ExportExl}
              width={25}
              alt="Export Excel"
            />
          </Tooltip>

          <Tooltip title="Export PDF" arrow={false} placement="top">
            <img
              className="cursor-pointer"
              src={ExportPdf}
              width={25}
              alt="Export PDF"
            />
          </Tooltip>
        </Col>
      </Row>

      <Row>
        <Col sm={12} md={12} lg={12} className="mt-2">
          <AgGridTable
            className="t24AgGrid"
            style={{
              height: 34 + Math.max(processedData.length, 1) * 32,
              width: "100%",
            }}
            rowData={processedData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={({ data }) => String(data.id)}
            suppressColumnVirtualisation
            animateRows={false}
          />
        </Col>
      </Row>
    </section>
  );
};

export default T24;