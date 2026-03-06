import React, { useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";

const SBPConversionRates = () => {
  const [processedData, setProcessedData] = useState("");
  return (
    <>
      <span className={styles.tableheaderbar}>
        SBP Conversion Rates for FCY Deposits
      </span>
      <GlobalTable
        // columns={columns}
        // dataSource={processedData}
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
