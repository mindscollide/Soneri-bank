import React, { useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetSpotTTRatesForRateSheet = (state) =>
  state.WatchListReducer.GetSpotTTRatesForRateSheet?.spotTTRates;

const SpotTTRates = () => {
  const [processedData, setProcessedData] = useState("");

  const spotTTRates = useSelector(GetSpotTTRatesForRateSheet);

  console.log(spotTTRates, "spotTTRatesGetSpotTTRatesForRateSheet");
  return (
    <>
      <span className={styles.tableheaderbar}>Spot TT Rates</span>
      <GlobalTable
        // columns={columns}
        // dataSource={processedData}
        prefixCls={
          processedData.length > 0 ? "rateSheetTable" : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 450, x: "max-content" }}
      />
    </>
  );
};

export default SpotTTRates;
