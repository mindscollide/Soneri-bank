import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetSBPConversionRatesForRateSheet = (state) =>
  state.WatchListReducer.GetSBPConversionRatesForRateSheet;

const treasuryRateSheetConversionRate = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetConversionRate;

const SBPConversionRates = () => {
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetConversionRate);

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
  // MQTT Work
  // ✅ Batch update function
  const processUpdateQueue = useCallback(() => {
    if (updateQueueRef.current.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const updates = updateQueueRef.current;
    updateQueueRef.current = [];

    setProcessedData((prevData) => {
      if (!Array.isArray(prevData)) return prevData;

      let hasChanges = false;
      const updatedData = prevData.map((item) => {
        let updatedItem = { ...item };
        let changed = false;

        updates.forEach((update) => {
          const { sbpConversionrate } = update;

          if (
            sbpConversionrate &&
            item.currencyCode === sbpConversionrate.currencyCode
          ) {
            updatedItem = {
              ...updatedItem,
              rate: sbpConversionrate.rate,
              version: updatedItem.version + 1,
            };
            changed = true;
          }
        });

        return changed ? updatedItem : item;
      });

      hasChanges = updatedData.some(
        (newItem, index) => newItem !== prevData[index]
      );

      return hasChanges ? updatedData : prevData;
    });

    animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
  }, []);

  // ✅ Queue update
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // ~60fps
      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
      }
    },
    [processUpdateQueue]
  );
  // ✅ Feed update effect
  useEffect(() => {
    if (!fullFeed) return;
    queueUpdate(fullFeed);
  }, [fullFeed, queueUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
