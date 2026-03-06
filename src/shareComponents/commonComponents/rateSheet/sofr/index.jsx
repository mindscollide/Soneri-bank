import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetSOFRDataForRateSheet = (state) =>
  state.WatchListReducer.GetSOFRDataForRateSheet?.sofrList;
const SOFR = () => {
  const [processedData, setProcessedData] = useState("");
  const dataRef = useRef([]);

  const sofrList = useSelector(GetSOFRDataForRateSheet);
  console.log({ sofrList }, "GetRatesForCurrencsofrListsofrList");

  const columns = useMemo(() => {
    if (!sofrList || sofrList.length === 0) return [];

    return sofrList.map((item) => ({
      title: item.tenor,
      dataIndex: item.tenor,
      key: item.tenor,
      align: "center",
    }));
  }, [sofrList]);

  useEffect(() => {
    if (sofrList && sofrList.length > 0) {
      const row = {};

      sofrList.forEach((item) => {
        row[item.tenor] = Number(item.rate).toFixed(4);
      });

      const tableData = [{ key: "sofr", ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [sofrList]);
  return (
    <>
      <span className={styles.tableheaderbar_SOFR}>SOFR</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "RateSheetSoftAndKIBOR"
            : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
};

export default SOFR;
