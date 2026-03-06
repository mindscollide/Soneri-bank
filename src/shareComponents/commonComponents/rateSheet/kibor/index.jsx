import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetKiborDataForRateSheet = (state) =>
  state.WatchListReducer.GetKiborDataForRateSheet?.kiborList;
const KIBOR = () => {
  const [processedData, setProcessedData] = useState("");
  const dataRef = useRef([]);

  const kiborList = useSelector(GetKiborDataForRateSheet);
  console.log({ kiborList }, "GetRatesForCurrencsofKibor");

  const columns = useMemo(() => {
    if (!kiborList || kiborList.length === 0) return [];

    return kiborList.map((item) => ({
      title: item.tenor,
      dataIndex: item.tenor,
      key: item.tenor,
      align: "center",
    }));
  }, [kiborList]);

  useEffect(() => {
    if (kiborList && kiborList.length > 0) {
      const row = {};

      kiborList.forEach((item) => {
        row[item.tenor] = Number(item.rate).toFixed(4);
      });

      const tableData = [{ key: "kibor", ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [kiborList]);
  return (
    <>
      <span className={styles.tableheaderbar_SOFR}>KIBOR</span>
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

export default KIBOR;
