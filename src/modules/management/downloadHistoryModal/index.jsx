import React, { useState } from "react";
import { Modal } from "react-bootstrap";

import "./downloadHistoryModal.css";
import { useDispatch, useSelector } from "react-redux";
import { setDownloadHistoryModal } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";
import DatePickerModule from "react-multi-date-picker";
import { GetWorldCurrencyHistoricalDataApi } from "../../../store/actions/WatchlistAction";

const DatePicker = DatePickerModule.default || DatePickerModule;

const DownloadHistoryModal = () => {
  const dispatch = useDispatch();

  const downloadHistoryModal = useSelector(
    (state) => state.WatchListReducer.showDownloadHistoryModal,
  );
  const downloadHistoryData = useSelector(
    (state) => state.WatchListReducer.DownloadHistoryData,
  );

  console.log("downloadHistoryData", downloadHistoryData);
  // "all" = Select All (no dates needed), "range" = Date Range (both dates required)
  const [exportMode, setExportMode] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const resetLocalState = () => {
    setExportMode("all");
    setFromDate(null);
    setToDate(null);
  };

  const handleClose = () => {
    dispatch(setDownloadHistoryModal(false));
    resetLocalState();
  };

  // Select All never needs dates. Date Range needs BOTH dates picked —
  // no date, or only one of the two, blocks export.
  const isExportDisabled = exportMode === "range" && (!fromDate || !toDate);

  const handleExport = () => {
    if (isExportDisabled) return;
    const { routePath, data } = downloadHistoryData;
    switch (routePath) {
      case "USDParity":
        const Data = {
          CurrencyID: data.instrumentID,
          DateFrom: "",
          DateTo: "",
        };

        dispatch(GetWorldCurrencyHistoricalDataApi({ Data }));
        break;
      case "CurrencyCrosses":
        const DataCurrencyCrosses = {
          CurrencyCrossesID: data.instrumentID,
          DateFrom: "",
          DateTo: "",
        };
        break;
      case "Commodities":
        const DataCommodities = {
          CommodityID: data.instrumentID,
          DateFrom: "",
          DateTo: "",
        };
        break;
      case "StockIndices":
        const DataStockIndices = {
          WorldIndicesID: data.instrumentID,
          DateFrom: "",
          DateTo: "",
        };
        break;
      case "KIBOR":
        const DataKIBOR = { DateFrom: "", DateTo: "" };
        break;
      case "SOFR":
        const DataSOFR = { DateFrom: "", DateTo: "" };
        break;
      case "SwapsInUSD":
        const DataSwapsInUSD = {
          SwapCurrencyPair: "",
          TenureID: 0,
          DateFrom: "",
          DateTo: "",
        };
        break;
      case "SBPFXRevalRates":
        const DataSBPFXRevalRates = {
          CurrencyCode: data.currencyName,
          DateFrom: "",
          DateTo: "",
        };
        break;
      default:
        break;
    }
    // TODO: wire to the actual export API once available — payload shape
    // for now: { instrument: downloadHistoryData, exportMode, fromDate, toDate }
    console.log("Export download history:", {
      instrument: downloadHistoryData,
      exportMode,
      fromDate,
      toDate,
    });

    handleClose();
  };

  return (
    <Modal
      show={downloadHistoryModal}
      onHide={handleClose}
      size='md'
      centered
      backdrop={true}
      backdropClassName={"downloadHistoryModal_backdrop"}>
      <Modal.Header closeButton>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='downloadHistoryModal-optionsCol'>
          <label className='downloadHistoryModal-radioLabel'>
            <input
              type='radio'
              name='downloadHistoryExportMode'
              checked={exportMode === "all"}
              onChange={() => setExportMode("all")}
            />
            Select All
          </label>

          <div className='downloadHistoryModal-rangeRow'>
            <label className='downloadHistoryModal-radioLabel'>
              <input
                type='radio'
                name='downloadHistoryExportMode'
                checked={exportMode === "range"}
                onChange={() => setExportMode("range")}
              />
              Date Range
            </label>

            <div className='downloadHistoryModal-dateRange'>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                format='DD-MM-YYYY'
                placeholder='From Date'
                disabled={exportMode !== "range"}
                calendarPosition='bottom-left'
                portal
                fixRelativePosition
                fixMainPosition
                zIndex={9999}
              />

              <span className='downloadHistoryModal-toLabel'>To</span>

              <DatePicker
                value={toDate}
                onChange={setToDate}
                format='DD-MM-YYYY'
                placeholder='To Date'
                disabled={exportMode !== "range"}
                calendarPosition='bottom-left'
                portal
                fixRelativePosition
                fixMainPosition
                zIndex={9999}
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-center gap-2'>
        <CustomButton
          value={"Export"}
          onClick={handleExport}
          disabled={isExportDisabled}
          applyClass={"DownloadHistoryExport_btn"}
        />
        <CustomButton
          value={"Cancel"}
          applyClass={"DownloadHistoryCancel_btn"}
          onClick={handleClose}
          type={"danger"}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadHistoryModal;
