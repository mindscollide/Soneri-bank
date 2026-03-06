import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";
import {
  formatCompactDate,
  formatDateUTCToGMT,
} from "../../../utils/timeFunction";
const GetSOFRDataForTreasury = (state) =>
  state.WatchListReducer.GetSOFRDataForTreasury?.sofrList;

const SOFRForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sofrForManagementFeed;

const SOFR = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);

  const sofrList = useSelector(GetSOFRDataForTreasury);
  const fullFeed = useSelector(SOFRForManagementFeed);
  console.log(fullFeed, "fullFeedSOFR");
  const [processedData, setProcessedData] = useState([]);
  const [latestDate, setLatestDate] = useState("");
  console.log(latestDate, "latestDatelatestDate");

  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Tenor",
        dataIndex: "tenor",
        width: 150,
        align: "left",
      },
      {
        title: "Rate",
        dataIndex: "rate",
        className: "bidCol",
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
      },
      {
        title: "Change",
        dataIndex: "change",
        className: "offerCol",
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
      },
    ],
    []
  );

  // ✅ Initialize base data
  useEffect(() => {
    if (sofrList && sofrList.length > 0) {
      setLatestDate(sofrList[0].lastModifiedDate);
      const enriched = sofrList.map((item) => ({
        ...item,
        rate: Number(item.rate ?? 0),
        change: Number(item.change ?? 0),
        version: 0,
      }));

      dataRef.current = enriched;
      setProcessedData(enriched);
    }
  }, [sofrList]);
  // MQTT Work
  // ✅ Process queued updates
  const processUpdateQueue = useCallback(() => {
    try {
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
            const { sofr } = update;
            if (!sofr) return;
            const sofrArray = Array.isArray(sofr) ? sofr : [sofr];
            sofrArray.forEach((feedItem) => {
              if (item.tenor === feedItem.tenor) {
                if (
                  Number(item.rate) !== Number(feedItem.rate) ||
                  Number(item.change) !== Number(feedItem.change)
                ) {
                  updatedItem = {
                    ...updatedItem,
                    rate: Number(feedItem.rate),
                    change: Number(feedItem.change),
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
    } catch (error) {
      console.log(error, "error");
    }
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

  // ✅ Feed listener
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
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SOFR</span>
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
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
});

export default SOFR;
