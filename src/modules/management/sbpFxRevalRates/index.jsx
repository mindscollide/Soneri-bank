import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";
import { formatCompactDate } from "../../../utils/timeFunction";

const GetRevalRatesForTreasury = (state) =>
  state.WatchListReducer.GetRevalRatesForTreasury;

const sbpFXRevalRatesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sbpFXRevalRatesForManagementFeed;

const SBPFXRevalRates = memo(() => {
  const animationFrameRef = useRef(null);
  const pendingFeedRef = useRef(null); // ✅ Always keep latest feed only (no queue, no throttle)
  const revalRatesList = useSelector(GetRevalRatesForTreasury);
  const fullFeed = useSelector(sbpFXRevalRatesForManagementFeed);
  const [processedData, setProcessedData] = useState([]);
  const [latestDate, setLatestDate] = useState("");

  const getUniqueTenors = (data) => {
    const tenorMap = new Map();
    data.forEach((item) => {
      if (!tenorMap.has(item.tenorId)) {
        tenorMap.set(item.tenorId, {
          tenorId: item.tenorId,
          tenorName: item.tenorName,
          displayOrderPriority: item.displayOrderPriority,
        });
      }
    });
    return Array.from(tenorMap.values()).sort(
      (a, b) => a.displayOrderPriority - b.displayOrderPriority
    );
  };

  const generateColumns = (tenors) => {
    const baseColumn = [
      {
        title: "Currency",
        dataIndex: "currencyName",
        key: "currencyName",
        fixed: "left",
        align: "left",
        width: 120,
      },
    ];
    const tenorColumns = tenors.map((tenor) => ({
      title: tenor.tenorName,
      dataIndex: `tenorId_${tenor.tenorId}_value`,
      key: `tenor_${tenor.tenorId}`,
      align: "center",
      width: 110,
      render: (value) => value ?? "-",
    }));
    return [...baseColumn, ...tenorColumns];
  };

  const tenors = useMemo(() => {
    if (!revalRatesList?.revalRatesList) return [];
    return getUniqueTenors(revalRatesList.revalRatesList);
  }, [revalRatesList]);

  const columns = useMemo(() => generateColumns(tenors), [tenors]);

  // ✅ Initialize base data from REST API
  useEffect(() => {
    if (!revalRatesList?.revalRatesList) return;
    try {
      const { revalRatesList: revalRatesListData } = revalRatesList;

      if (revalRatesListData.length > 0) {
        const apiDate = revalRatesListData[0]?.lastModifiedDate;
        if (apiDate) setLatestDate(apiDate);
      }

      const grouped = Object.values(
        revalRatesListData.reduce((acc, item) => {
          const { currency, tenorId, value } = item;
          if (!acc[currency]) {
            acc[currency] = { currencyName: currency };
          }
          acc[currency][`tenorId_${tenorId}_value`] = value;
          return acc;
        }, {})
      );

      setProcessedData(grouped);
    } catch (error) {
      console.error(error);
    }
  }, [revalRatesList]);

  // ✅ Flush the latest pending MQTT update via rAF (no throttle)
  const flushUpdate = useCallback(() => {
    animationFrameRef.current = null;
    const feed = pendingFeedRef.current;
    pendingFeedRef.current = null;

    if (!feed?.revalRates) return;

    const { currency, tenorId, value, lastModifiedDate } = feed.revalRates;

    setProcessedData((prev) => {
      const rowIndex = prev.findIndex((row) => row.currencyName === currency);
      if (rowIndex === -1) return prev; // no match, skip

      const key = `tenorId_${tenorId}_value`;
      const existingRow = prev[rowIndex];

      // Skip if value hasn't changed
      if (existingRow[key] === Number(value)) return prev;

      const updatedRow = { ...existingRow, [key]: Number(value) };
      const updatedData = [...prev];
      updatedData[rowIndex] = updatedRow;
      return updatedData;
    });

    // ✅ Update the date header if the feed carries one
    if (lastModifiedDate) {
      setLatestDate(lastModifiedDate);
    }
  }, []);

  // ✅ On new MQTT feed: store latest and schedule ONE rAF flush
  // No throttle — RevalRates updates are infrequent so every update must be applied
  useEffect(() => {
    if (!fullFeed) return;

    pendingFeedRef.current = fullFeed; // overwrite with latest

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(flushUpdate);
    }
  }, [fullFeed, flushUpdate]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SBP FX Reval Rates</span>
        <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span>
      </span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables_sofr"
            : "managementTables_Empty"
        }
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default SBPFXRevalRates;
