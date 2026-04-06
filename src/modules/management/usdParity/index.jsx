import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { shallowEqual, useSelector } from "react-redux";
import { store } from "../../../store/store"; // ✅ import your redux store
import styles from "../management.module.css";

// Selectors
const selectUSDParity = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];

const selectSpotInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;

const selectUSDParityFeed = (state) =>
  state.RealtimeActionsSlice.usdParityForManagmentFeed;

const USDParity = memo(() => {
  // ✅ normalized state (object instead of array)
  const [processedData, setProcessedData] = useState({});

  const animationFrameRef = useRef(null);
  const pendingFeedRef = useRef(null);

  const crossInstruments = useSelector(selectSpotInstruments, shallowEqual);
  const worldCrosses = useSelector(selectUSDParity, shallowEqual);

  // ✅ Columns (unchanged but stable)
  const columns = useMemo(
    () => [
      { title: "Instrument", dataIndex: "instrumentName" },
      {
        title: "Bid",
        dataIndex: "bid",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={text} />,
      },
      {
        title: "Ask",
        dataIndex: "ask",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={text} />,
      },
      {
        title: "High",
        dataIndex: "high",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={text} />,
      },
      {
        title: "Low",
        dataIndex: "low",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={text} />,
      },
      {
        title: "% Change",
        dataIndex: "percentageChange",
        width: 120,
        render: (text) => {
          if (text === "-") return null;
          const value = Number(text);
          const cellClassName =
            value < 0 ? "color-red" : value > 0 ? "color-green" : "color-blue";
          return <IndexCell value={value} CellClassName={cellClassName} />;
        },
      },
      {
        title: "Time",
        dataIndex: "time",
        width: 90,
        render: (text) => (text ? convertUTCTimeToLocalTime(text) : "--:--:--"),
      },
    ],
    []
  );

  // ✅ Build initial normalized data
  useEffect(() => {
    if (!crossInstruments?.length || !worldCrosses?.length) return;

    const mappedData = {};

    crossInstruments.forEach((instrument) => {
      const matchedCross = worldCrosses.find(
        (wc) => Number(wc.instrumentID) === instrument.instrumentID
      );

      mappedData[instrument.instrumentID] = {
        instrumentID: Number(instrument.instrumentID),
        instrumentName: instrument.instrumentName,
        time: matchedCross?.time ?? "",
        bid: Number(matchedCross?.bid ?? 0),
        ask: Number(matchedCross?.ask ?? 0),
        high: Number(matchedCross?.high ?? 0),
        low: Number(matchedCross?.low ?? 0),
        percentageChange: Number(matchedCross?.percentageChange ?? 0),
      };
    });

    setProcessedData(mappedData);
  }, [crossInstruments, worldCrosses]);

  // ✅ Apply updates (O(1))
  const flushUpdate = useCallback(() => {
    animationFrameRef.current = null;

    const feed = pendingFeedRef.current;
    pendingFeedRef.current = null;

    if (!feed?.instrumentParitySpot) return;

    const update = feed.instrumentParitySpot;
    const id = update.instrumentID;

    setProcessedData((prev) => {
      const existing = prev[id];
      if (!existing) return prev;

      const changed =
        Number(existing.bid) !== Number(update.bid) ||
        Number(existing.ask) !== Number(update.ask) ||
        Number(existing.high) !== Number(update.high) ||
        Number(existing.low) !== Number(update.low) ||
        Number(existing.percentageChange) !== Number(update.percentageChange) ||
        existing.time !== update.time;

      if (!changed) return prev;

      return {
        ...prev,
        [id]: {
          ...existing,
          bid: update.bid,
          ask: update.ask,
          high: update.high,
          low: update.low,
          percentageChange: update.percentageChange,
          time: update.time,
        },
      };
    });
  }, []);

  // ✅ Subscribe to store manually (NO re-render on every tick)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const feed = selectUSDParityFeed(store.getState());

      if (!feed) return;

      pendingFeedRef.current = feed;

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(flushUpdate);
      }
    });

    return unsubscribe;
  }, [flushUpdate]);

  // ✅ Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // ✅ Convert to array only when needed
  const tableData = useMemo(
    () => Object.values(processedData),
    [processedData]
  );

  return (
    <>
      <span className={styles.tableheaderbar}>USD Parity</span>

      <GlobalTable
        columns={columns}
        dataSource={tableData}
        rowKey={(record) => record.key}
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
        prefixCls={
          tableData.length > 0 ? "managementTables" : "managementTables_Empty"
        }
      />
    </>
  );
});

export default USDParity;
