import React, { useEffect, useMemo, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetSBPConversionRatesForRateSheet = (state) =>
  state.WatchListReducer.GetSBPConversionRatesForRateSheet;

const SBPConversionRates = () => {
  const [processedData, setProcessedData] = useState("");

  const SBPConversionRates = useSelector(GetSBPConversionRatesForRateSheet);

  useEffect(() => {
    if (SBPConversionRates && SBPConversionRates !== null) {
      const { conversionRates } = SBPConversionRates;
      if (conversionRates) {
        setProcessedData(conversionRates);
      }
    }
  }, [SBPConversionRates]);

  const columns = useMemo(
    () => [
      {
        title: "Currency",
        dataIndex: "currencyCode",
        width: 150,
        align: "center",
      },
      {
        title: "Rate",
        dataIndex: "rate",
        className: "bidCol",
        width: 120,
        align: "center",
      },
    ],
    []
  );
  return (
    <>
      <span className={styles.tableheaderbar}>
        SBP Conversion Rates for FCY Deposits
      </span>
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

export default SBPConversionRates;
