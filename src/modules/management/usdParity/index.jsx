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
import styles from "../management.module.css";

// Selectors — defined outside component to keep references stable
const selectUSDParity = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];
const selectSpotInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;
const selectUSDParityFeed = (state) =>
  state.RealtimeActionsSlice.usdParityForManagmentFeed;

const USDParity = memo(() => {
  const [processedData, setProcessedData] = useState([]);

  // Refs
  const animationFrameRef = useRef(null);
  const pendingFeedRef = useRef(null); // ✅ Only keep latest feed, no queue needed

  const fullFeed = useSelector(selectUSDParityFeed);
  const crossInstruments = useSelector(selectSpotInstruments, shallowEqual);
  const worldCrosses = useSelector(selectUSDParity, shallowEqual);

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
        className: "offerCol",
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
        className: "offerCol",
        width: 90,
        render: (text) => text !== "-" && <IndexCell value={text} />,
      },
      {
        title: "% Change",
        dataIndex: "percentageChange",
        className: "offerCol",
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

  // ✅ Build base data from REST API response
  const enrichedData = useMemo(() => {
    if (!crossInstruments?.length || !worldCrosses?.length) return [];
    try {
      return crossInstruments.map((instrument) => {
        const matchedCross = worldCrosses.find(
          (wc) => Number(wc.instrumentID) === instrument.instrumentID
        );
        return {
          instrumentID: Number(instrument.instrumentID),
          instrumentName: instrument.instrumentName,
          time: matchedCross?.time ?? "",
          bid: Number(matchedCross?.bid ?? 0),
          ask: Number(matchedCross?.ask ?? 0),
          high: Number(matchedCross?.high ?? 0),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentageChange ?? 0),
          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [crossInstruments, worldCrosses]);

  // ✅ Sync base data into state only when REST data changes
  useEffect(() => {
    if (enrichedData.length > 0) {
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

  // ✅ Apply a single pending MQTT update via rAF (no infinite loop)
  const flushUpdate = useCallback(() => {
    animationFrameRef.current = null;
    const feed = pendingFeedRef.current;
    pendingFeedRef.current = null;

    if (!feed) return;

    const { instrumentParitySpot } = feed;
    if (!instrumentParitySpot) return;

    setProcessedData((prevData) => {
      let hasChanges = false;

      const updatedData = prevData.map((item) => {
        if (item.instrumentID !== instrumentParitySpot.instrumentID)
          return item;

        const changed =
          Number(item.bid) !== Number(instrumentParitySpot.bid) ||
          Number(item.ask) !== Number(instrumentParitySpot.ask) ||
          Number(item.high) !== Number(instrumentParitySpot.high) ||
          Number(item.low) !== Number(instrumentParitySpot.low) ||
          Number(item.percentageChange) !==
            Number(instrumentParitySpot.percentageChange) ||
          item.time !== instrumentParitySpot.time;

        if (!changed) return item;

        hasChanges = true;
        return {
          ...item,
          bid: instrumentParitySpot.bid,
          ask: instrumentParitySpot.ask,
          high: instrumentParitySpot.high,
          low: instrumentParitySpot.low,
          percentageChange: instrumentParitySpot.percentageChange,
          time: instrumentParitySpot.time,
          version: item.version + 1,
        };
      });

      return hasChanges ? updatedData : prevData;
    });
  }, []);

  // ✅ On new MQTT feed: store latest and schedule ONE rAF flush
  useEffect(() => {
    if (!fullFeed) return;

    pendingFeedRef.current = fullFeed; // always overwrite with latest

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
      <span className={styles.tableheaderbar}>USD Parity</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables"
            : "managementTables_Empty"
        }
        rowKey={(record) => `${record.instrumentID}`} // ✅ Stable key
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default USDParity;
