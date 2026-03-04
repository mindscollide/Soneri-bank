import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";

const GetKiborDataForTreasury = (state) =>
  state.WatchListReducer.GetKiborDataForTreasury?.kiborList;
const KIBORForManagementFeed = (state) =>
  state.RealtimeActionsSlice.kiborForManagementFeed;

const KIBOR = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);

  const kiborList = useSelector(GetKiborDataForTreasury);
  const fullFeed = useSelector(KIBORForManagementFeed);

  const [processedData, setProcessedData] = useState([]);

  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Tenor",
        dataIndex: "displayName",
        width: 150,
      },
      {
        title: "Bid",
        dataIndex: "bid",
        className: "bidCol",
        width: 120,
      },
      {
        title: "Ask",
        dataIndex: "ask",
        className: "offerCol",
        width: 120,
      },
      {
        title: "Applicable Date",
        dataIndex: "modifiedDateTime",
        width: 245,
      },
    ],
    []
  );

  // ✅ Initialize base data
  useEffect(() => {
    if (kiborList && kiborList.length > 0) {
      const enriched = kiborList.map((item) => ({
        ...item,
        bid: Number(item.bid ?? 0),
        ask: Number(item.ask ?? 0),
        version: 0,
      }));

      dataRef.current = enriched;
      setProcessedData(enriched);
    }
  }, [kiborList]);

  // ✅ Process queued MQTT updates
  const processUpdateQueue = useCallback(() => {
    if (updateQueueRef.current.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const updates = updateQueueRef.current;
    updateQueueRef.current = [];

    setProcessedData((prevData) => {
      let hasChanges = false;

      const updatedData = prevData.map((item) => {
        let updatedItem = { ...item };
        let changed = false;

        updates.forEach((update) => {
          const { kibor } = update;

          if (!kibor) return;

          kibor.forEach((feedItem) => {
            if (item.displayName === feedItem.displayName) {
              if (
                Number(item.bid) !== Number(feedItem.bid) ||
                Number(item.ask) !== Number(feedItem.ask) ||
                item.modifiedDateTime !== feedItem.modifiedDateTime
              ) {
                updatedItem = {
                  ...updatedItem,
                  bid: Number(feedItem.bid),
                  ask: Number(feedItem.ask),
                  modifiedDateTime: feedItem.modifiedDateTime,
                  version: item.version + 1,
                };
                changed = true;
              }
            }
          });
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

  // ✅ Queue update (60fps throttle)
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return;
      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
      }
    },
    [processUpdateQueue]
  );

  // ✅ MQTT Feed effect
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
      <span className={styles.tableheaderbar}>KIBOR</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables"
            : "managementTables_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
});

export default KIBOR;
