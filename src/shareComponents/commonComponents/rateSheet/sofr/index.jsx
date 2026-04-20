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

const GetSOFRDataForRateSheet = (state) =>
  state.WatchListReducer.GetSOFRDataForRateSheet?.sofrList;

const treasuryRateSheetSofr = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetSofr;

const SOFR = () => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetSofr);

  const sofrList = useSelector(GetSOFRDataForRateSheet);

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
        row[item.tenor] = Number(item.rate).toFixed(2);
      });

      const tableData = [{ key: sofrList[sofrList.length + 1], ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [sofrList]);

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
          const { sofr } = update;

          if (sofr && item.tenor === sofr.tenor) {
            if (Number(updatedItem.rate) !== Number(sofr.rate)) {
              updatedItem = {
                ...updatedItem,
                rate: sofr.rate,
                version: updatedItem.version + 1,
              };
              changed = true;
            }
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
