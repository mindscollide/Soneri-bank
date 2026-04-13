import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";

const GetKiborDataForTreasury = (state) =>
  state.WatchListReducer.GetKiborDataForTreasury?.kiborList;
const KIBORForManagementFeed = (state) =>
  state.RealtimeActionsSlice.kiborForManagementFeed;

const KIBOR = memo(() => {
  const animationFrameRef = useRef(null);
  const pendingFeedRef = useRef(null); // ✅ Always keep latest feed only (no queue, no throttle)

  const kiborList = useSelector(GetKiborDataForTreasury);
  const fullFeed = useSelector(KIBORForManagementFeed);

  const [processedData, setProcessedData] = useState([]);

  const columns = useMemo(
    () => [
      {
        title: "Tenor",
        dataIndex: "displayName",
        width: 150,
        align: "left",
      },
      {
        title: "Bid",
        dataIndex: "bid",
        className: "bidCol",
        width: 120,
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Ask",
        dataIndex: "ask",
        className: "offerCol",
        width: 120,
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Applicable Date",
        dataIndex: "modifiedDateTime",
        width: 245,
      },
    ],
    []
  );

  // ✅ Initialize base data from REST API
  useEffect(() => {
    if (kiborList && kiborList.length > 0) {
      const enriched = kiborList.map((item) => ({
        ...item,
        bid: Number(item.bid ?? 0),
        ask: Number(item.ask ?? 0),
        version: 0,
      }));
      setProcessedData(enriched);
    }
  }, [kiborList]);

  // ✅ Flush the latest pending MQTT update via rAF (no throttle, no queue)
  // const flushUpdate = useCallback(() => {
  //   animationFrameRef.current = null;
  //   const feed = pendingFeedRef.current;
  //   pendingFeedRef.current = null;

  //   if (!feed) return;

  //   const { kibor } = feed;
  //   if (!kibor) return;

  //   const kiborArray = Array.isArray(kibor) ? kibor : [kibor];

  //   setProcessedData((prevData) => {
  //     let hasChanges = false;

  //     const updatedData = prevData.map((item) => {
  //       const feedItem = kiborArray.find(
  //         (f) => f.displayName === item.displayName
  //       );

  //       if (!feedItem) return item;

  //       return {
  //         ...item,
  //         bid: Number(feedItem.bid),
  //         ask: Number(feedItem.ask),
  //         modifiedDateTime: feedItem.modifiedDateTime,
  //         version: item.version + 1,
  //       };
  //     });

  //     return hasChanges ? updatedData : prevData;
  //   });
  // }, []);

  // const flushUpdate = useCallback(() => {
  //   animationFrameRef.current = null;

  //   const feeds = pendingFeedsRef.current;
  //   pendingFeedsRef.current = [];

  //   if (!feeds.length) return;

  //   setProcessedData((prevData) => {
  //     let updatedData = [...prevData];

  //     feeds.forEach((feed) => {
  //       const { kibor } = feed;
  //       if (!kibor) return;

  //       const kiborArray = Array.isArray(kibor) ? kibor : [kibor];

  //       updatedData = updatedData.map((item) => {
  //         const feedItem = kiborArray.find(
  //           (f) => f.displayName === item.displayName
  //         );

  //         if (!feedItem) return item;

  //         return {
  //           ...item,
  //           bid: Number(feedItem.bid),
  //           ask: Number(feedItem.ask),
  //           modifiedDateTime: feedItem.modifiedDateTime,
  //           version: (item.version || 0) + 1,
  //         };
  //       });
  //     });

  //     return updatedData;
  //   });
  // }, []);

  // ✅ On new MQTT feed: store latest and schedule ONE rAF flush
  // No throttle — KIBOR updates are infrequent so every update must be applied
  // useEffect(() => {
  //   if (!fullFeed) return;

  //   pendingFeedRef.current = fullFeed; // overwrite with latest

  //   if (!animationFrameRef.current) {
  //     animationFrameRef.current = requestAnimationFrame(flushUpdate);
  //   }
  // }, [fullFeed, flushUpdate]);

  useEffect(() => {
    if (!fullFeed) return;

    const { kibor } = fullFeed;
    if (!kibor) return;

    const kiborArray = Array.isArray(kibor) ? kibor : [kibor];

    setProcessedData((prevData) =>
      prevData.map((item) => {
        const feedItem = kiborArray.find(
          (f) => f.displayName === item.displayName
        );

        if (!feedItem) return item;

        return {
          ...item,
          bid: Number(feedItem.bid),
          ask: Number(feedItem.ask),
          modifiedDateTime: feedItem.modifiedDateTime,
        };
      })
    );
  }, [fullFeed]);

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
