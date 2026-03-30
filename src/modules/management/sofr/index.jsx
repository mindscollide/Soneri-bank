import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";
import { formatCompactDate } from "../../../utils/timeFunction";

const GetSOFRDataForTreasury = (state) =>
  state.WatchListReducer.GetSOFRDataForTreasury?.sofrList;

const SOFRForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sofrForManagementFeed;

const SOFR = memo(() => {
  const animationFrameRef = useRef(null);
  const pendingFeedRef = useRef(null); // ✅ Always keep latest feed only (no queue, no throttle)

  const sofrList = useSelector(GetSOFRDataForTreasury);
  const fullFeed = useSelector(SOFRForManagementFeed);
  const [processedData, setProcessedData] = useState([]);
  const [latestDate, setLatestDate] = useState("");

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

  // ✅ Initialize base data from REST API
  useEffect(() => {
    if (sofrList && sofrList.length > 0) {
      setLatestDate(sofrList[0].lastModifiedDate);
      const enriched = sofrList.map((item) => ({
        ...item,
        rate: Number(item.rate ?? 0),
        change: Number(item.change ?? 0),
        version: 0,
      }));
      setProcessedData(enriched);
    }
  }, [sofrList]);

  // ✅ Flush the latest pending MQTT update via rAF (no throttle, no queue)
  const flushUpdate = useCallback(() => {
    animationFrameRef.current = null;
    const feed = pendingFeedRef.current;
    pendingFeedRef.current = null;

    if (!feed) return;

    const { sofr } = feed;
    if (!sofr) return;

    const sofrArray = Array.isArray(sofr) ? sofr : [sofr];

    setProcessedData((prevData) => {
      let hasChanges = false;

      const updatedData = prevData.map((item) => {
        const feedItem = sofrArray.find((f) => f.tenor === item.tenor);

        if (!feedItem) return item;

        const changed =
          Number(item.rate) !== Number(feedItem.rate) ||
          Number(item.change) !== Number(feedItem.change);

        if (!changed) return item;

        hasChanges = true;
        return {
          ...item,
          rate: Number(feedItem.rate),
          change: Number(feedItem.change),
          version: item.version + 1,
        };
      });

      return hasChanges ? updatedData : prevData;
    });

    // ✅ Also update the date header if the feed carries a date
    if (sofrArray[0]?.lastModifiedDate) {
      setLatestDate(sofrArray[0].lastModifiedDate);
    }
  }, []);

  // ✅ On new MQTT feed: store latest and schedule ONE rAF flush
  // No throttle — SOFR updates are infrequent so every update must be applied
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
