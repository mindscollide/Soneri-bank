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
const GetUSDParityForTreasury = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];
const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;
const usdParityForManagmentFeed = (state) =>
  state.RealtimeActionsSlice.usdParityForManagmentFeed;

const USDParity = memo(() => {
  const [processedData, setProcessedData] = useState([]);
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);

  const fullFeed = useSelector(usdParityForManagmentFeed);
  const crossInstruments = useSelector(GetAllOtherInstruments, shallowEqual);
  const worldCrosses = useSelector(GetUSDParityForTreasury, shallowEqual);

  // // ✅ Memoized essential feed values
  // const feedEssentials = useMemo(() => {
  //   if (!fullFeed) return null;
  //   const { instrumentParitySpot } = fullFeed;
  //   if (instrumentParitySpot === null) return;

  //   return {
  //     bid: instrumentParitySpot.bid,
  //     ask: instrumentParitySpot.ask,
  //     dealer: instrumentParitySpot.dealer,
  //     instrumentID: instrumentParitySpot.instrumentID,
  //     secondaryInstrumentID: instrumentParitySpot.secondaryInstrumentID,
  //     updateDateTime: instrumentParitySpot.updateDateTime,
  //     updateDateTimePrimaryCurrency:
  //       instrumentParitySpot.updateDateTimePrimaryCurrency,
  //   };
  // }, [fullFeed]);

  // console.log(feedEssentials, "feedEssentialsfeedEssentials");
  const columns = useMemo(
    () => [
      { title: "Instrument", dataIndex: "instrumentName" },
      {
        title: "Bid",
        dataIndex: "bid",
        className: "bidCol",
        // width: "14%",
        width: 90,
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Ask",
        dataIndex: "ask",
        className: "offerCol",
        width: 90,

        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "High",
        dataIndex: "high",
        width: 90,

        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Low",
        dataIndex: "low",
        className: "offerCol",
        width: 90,

        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "% Change",
        dataIndex: "percentageChange",
        className: "offerCol",
        width: 120,

        render: (text) => {
          if (text === "-") return null;

          const value = Number(text);

          let cellClassName =
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

  // ✅ Enriched base data
  const enrichedData = useMemo(() => {
    if (!crossInstruments || !worldCrosses) return [];
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

  // Initialize processed data when enriched data changes
  useEffect(() => {
    if (enrichedData.length > 0) {
      dataRef.current = enrichedData;
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

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
      let hasChanges = false;
      const updatedData = prevData.map((item) => {
        let updatedItem = { ...item };
        let changed = false;
        updates.forEach((update) => {
          const { instrumentParitySpot } = update;
          // if (
          //   instrumentCrossRate &&
          //   item.instrumentID === instrumentCrossRate.instrumentID &&
          //   item.secondaryInstrumentID ===
          //     instrumentCrossRate.secondaryInstrumentID
          // ) {
          //   if (item.worldCrossBid !== instrumentCrossRate.bid) {
          //     updatedItem = {
          //       ...updatedItem,
          //       worldCrossBid: instrumentCrossRate.bid,
          //       worldCrossOffer: instrumentCrossRate.ask,
          //       time: instrumentCrossRate.updateDateTime,
          //       version: updatedItem.version + 1,
          //     };
          //     changed = true;
          //   }

          //   if (item.instrumentID === 21) {
          //     updatedItem = {
          //       ...updatedItem,
          //       worldCurBid: instrumentCrossRate.bid,
          //       worldCurOffer: instrumentCrossRate.ask,
          //       version: updatedItem.version + 1,
          //     };
          //     changed = true;
          //   }
          // }

          if (
            instrumentParitySpot &&
            item.instrumentID === instrumentParitySpot.instrumentID
          ) {
            if (
              Number(updatedItem.bid) !== Number(instrumentParitySpot.bid) ||
              Number(updatedItem.ask) !== Number(instrumentParitySpot.ask) ||
              Number(updatedItem.high) !== Number(instrumentParitySpot.high) ||
              Number(updatedItem.low) !== Number(instrumentParitySpot.low) ||
              Number(updatedItem.percentageChange) !==
                Number(instrumentParitySpot.percentageChange) ||
              Number(updatedItem.time) !== Number(instrumentParitySpot.time)
            ) {
              updatedItem = {
                ...updatedItem,
                bid: instrumentParitySpot.bid,
                ask: instrumentParitySpot.ask,
                high: instrumentParitySpot.high,
                low: instrumentParitySpot.low,
                percentageChange: instrumentParitySpot.percentageChange,
                time: instrumentParitySpot.time,
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
      <span className={styles.tableheaderbar}>USD Parity</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables"
            : "managementTables_Empty"
        }
        rowKey={(record) =>
          `${record.instrumentID}-${record.secondaryInstrumentID}`
        }
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default USDParity;
