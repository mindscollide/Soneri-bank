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

const GetKiborDataForRateSheet = (state) =>
  state.WatchListReducer.GetKiborDataForRateSheet?.kiborList;

const treasuryRateSheetKibor = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetKibor;

const KIBOR = () => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetKibor);

  const kiborList = useSelector(GetKiborDataForRateSheet);

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
        row[item.tenor] = Number(item.rate).toFixed(2);
      });

      const tableData = [{ key: "kibor", ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [kiborList]);

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
          const { kibor } = update;

          if (kibor && item.tenor === kibor.tenor) {
            if (Number(updatedItem.rate) !== Number(kibor.rate)) {
              updatedItem = {
                ...updatedItem,
                rate: kibor.rate,
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
