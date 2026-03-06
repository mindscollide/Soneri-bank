import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetRatesForCurrencyNotesForRateSheet = (state) =>
  state.WatchListReducer.GetRatesForCurrencyNotesForRateSheet?.currencyNotes;
const GetAllInstrumentForTreasury = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;
const RatesForCurrencyNotes = () => {
  const [processedData, setProcessedData] = useState("");
  const dataRef = useRef([]);

  const currencyNotes = useSelector(GetRatesForCurrencyNotesForRateSheet);
  const instrumnets = useSelector(GetAllInstrumentForTreasury);
  console.log(
    { currencyNotes, instrumnets },
    "GetRatesForCurrencyNotesForRateSheet"
  );

  const columns = useMemo(
    () => [
      {
        title: "Currency",
        dataIndex: "instrumentName",
        width: 150,
        align: "left",
      },
      {
        title: "Buying",
        dataIndex: "buying",
        className: "bidCol",
        width: 120,
      },
      {
        title: "Selling",
        dataIndex: "selling",
        className: "offerCol",
        width: 120,
      },
    ],
    []
  );
  // ✅ Initialize base data
  useEffect(() => {
    if (
      currencyNotes &&
      currencyNotes.length > 0 &&
      instrumnets &&
      instrumnets.length > 0
    ) {
      const enriched = currencyNotes.map((item) => {
        const matchedInstrument = instrumnets.find(
          (inst) => inst.instrumentID === item.instrumentID
        );

        return {
          instrumentName: matchedInstrument?.instrumentName || "",
          buying: Number(item.bid ?? 0),
          selling: Number(item.ask ?? 0),
          version: 0,
        };
      });

      dataRef.current = enriched;
      setProcessedData(enriched);
    }
  }, [currencyNotes, instrumnets]);
  console.log({ processedData, columns }, "setProcessedData");
  return (
    <>
      <span className={styles.tableheaderbar}>Rates For Currency Notes</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0 ? "rateSheetTable" : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
};

export default RatesForCurrencyNotes;
