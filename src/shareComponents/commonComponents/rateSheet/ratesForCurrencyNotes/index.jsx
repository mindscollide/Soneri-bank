import React, { useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";

const RatesForCurrencyNotes = () => {
  const [processedData, setProcessedData] = useState("");
  return (
    <>
      <span className={styles.tableheaderbar}>Rates For Currency Notes</span>
      <GlobalTable
        // columns={columns}
        // dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables_sofr"
            : "managementTables_sofr_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
};

export default RatesForCurrencyNotes;
