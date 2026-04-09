import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";

// selectors
const stockIndicesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.stockIndicesForManagementFeed;

const GetIndicesForTreasury = (state) =>
  state.WatchListReducer.GetIndicesForTreasury?.stockIndexList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.stockIndices;

const StockIndices = memo(() => {
  const [processedData, setProcessedData] = useState([]);

  const dataRef = useRef([]);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const otherInstruments = useSelector(GetAllOtherInstruments);
  const stockIndexList = useSelector(GetIndicesForTreasury);
  const fullFeed = useSelector(stockIndicesForManagementFeed);

  // =========================
  // COLUMNS
  // =========================
  const columns = useMemo(
    () => [
      {
        title: "",
        dataIndex: "instrumentName",
        ellipsis: true,
        width: 90,
      },
      {
        title: "Current",
        dataIndex: "current",
        className: "bidCol",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={Number(text)} />,
      },
      {
        title: "Change",
        dataIndex: "change",
        className: "offerCol",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={Number(text)} />,
      },
      {
        title: "% Change",
        dataIndex: "percentageChange",
        className: "offerCol",
        render: (text) => {
          if (text === "-") return null;

          const value = Number(text);
          const className =
            value < 0 ? "color-red" : value > 0 ? "color-green" : "color-blue";

          return <IndexCell value={value} CellClassName={className} />;
        },
      },
      {
        title: "High",
        dataIndex: "high",
        render: (text) => text !== "-" && <IndexCell value={Number(text)} />,
      },
      {
        title: "Low",
        dataIndex: "low",
        render: (text) => text !== "-" && <IndexCell value={Number(text)} />,
      },
      {
        title: "Volume",
        dataIndex: "volume",
        render: (text) => text !== "-" && <IndexCell value={Number(text)} />,
      },
      {
        title: "Time",
        dataIndex: "time",
        render: (text) => (text ? convertUTCTimeToLocalTime(text) : "--:--:--"),
      },
    ],
    []
  );

  // =========================
  // INITIAL DATA BUILD (OPTIMIZED)
  // =========================
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !stockIndexList) return [];

    const map = new Map(
      stockIndexList.map((item) => [Number(item.instrumentId), item])
    );

    return otherInstruments.map((instrument) => {
      const matched = map.get(Number(instrument.instrumentId));

      return {
        instrumentID: Number(instrument.instrumentId),
        instrumentName: instrument.name,

        current: Number(matched?.current ?? 0),
        change: Number(matched?.change ?? 0),
        percentageChange: Number(matched?.percentChange ?? 0),

        high: Number(matched?.high ?? 0),
        low: Number(matched?.low ?? 0),
        volume: Number(matched?.volume ?? 0),

        time: matched?.time ?? "",
        version: 0,
      };
    });
  }, [otherInstruments, stockIndexList]);

  useEffect(() => {
    if (!enrichedData.length) return;

    dataRef.current = enrichedData;
    setProcessedData(enrichedData);
  }, [enrichedData]);

  // =========================
  // REALTIME UPDATE ENGINE (FIXED)
  // =========================
  const processQueue = useCallback(() => {
    const updates = updateQueueRef.current;

    if (!updates.length) {
      animationFrameRef.current = null;
      return;
    }

    updateQueueRef.current = [];

    const flatUpdates = updates.map((u) => u?.stocK_INDICES).filter(Boolean);

    if (!flatUpdates.length) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
      return;
    }

    const updateMap = new Map(
      flatUpdates.map((u) => [Number(u.instrumentId), u])
    );

    const updated = dataRef.current.map((item) => {
      const u = updateMap.get(item.instrumentID);
      if (!u) return item;

      const hasChange =
        Number(item.current) !== Number(u.current) ||
        Number(item.change) !== Number(u.change) ||
        Number(item.high) !== Number(u.high) ||
        Number(item.low) !== Number(u.low) ||
        Number(item.percentageChange) !== Number(u.percentChange) ||
        Number(item.volume) !== Number(u.volume) ||
        item.time !== u.time;

      if (!hasChange) return item;

      return {
        ...item,
        current: u.current,
        change: u.change,
        percentageChange: u.percentChange,
        high: u.high,
        low: u.low,
        volume: u.volume,
        time: u.time,
        version: (item.version || 0) + 1,
      };
    });

    dataRef.current = updated;
    setProcessedData(updated);

    animationFrameRef.current = requestAnimationFrame(processQueue);
  }, []);

  // =========================
  // QUEUE FEED (60fps throttle)
  // =========================
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return;

      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  useEffect(() => {
    if (!fullFeed) return;
    queueUpdate(fullFeed);
  }, [fullFeed, queueUpdate]);

  // cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <span className={styles.tableheaderbar}>Stock Indices</span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables"
            : "managementTables_Empty"
        }
        pagination={false}
        scroll={{ y: 235, x: "max-content" }}
      />
    </>
  );
});

export default StockIndices;
