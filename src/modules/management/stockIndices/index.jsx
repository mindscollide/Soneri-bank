import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";

const stockIndicesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.stockIndicesForManagementFeed;

const GetIndicesForTreasury = (state) =>
  state.WatchListReducer.GetIndicesForTreasury?.stockIndexList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.stockIndices;

const StockIndices = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const otherInstruments = useSelector(GetAllOtherInstruments);
  const stockIndexList = useSelector(GetIndicesForTreasury);

  const fullFeed = useSelector(stockIndicesForManagementFeed);

  // // Local state for processed data
  const [processedData, setProcessedData] = useState([]);

  // Columns
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
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Change",
        dataIndex: "change",
        className: "offerCol",
        ellipsis: true,
        width: 90,
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "% Change",
        dataIndex: "percentageChange",
        className: "offerCol",
        ellipsis: true,
        render: (text) => {
          if (text === "-") return null;
          const value = Number(text);

          let cellClassName =
            value < 0 ? "color-red" : value > 0 ? "color-green" : "color-blue";

          return <IndexCell value={value} CellClassName={cellClassName} />;
        },
      },
      {
        title: "High",
        dataIndex: "high",
        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Low",
        dataIndex: "low",
        className: "offerCol",

        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Volume",
        dataIndex: "volume",
        className: "offerCol",

        render: (text) => {
          return text !== "-" && <IndexCell value={text} />;
        },
      },
      {
        title: "Time",
        dataIndex: "time",

        render: (text) => (text ? convertUTCTimeToLocalTime(text) : "--:--:--"),
      },
    ],
    []
  );
  // ✅ Enriched base data
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !stockIndexList) return [];
    try {
      return otherInstruments.map((instrument) => {
        const matchedCross = stockIndexList.find(
          (wc) => Number(wc.instrumentId) === instrument.instrumentId
        );

        return {
          instrumentName: instrument.name,
          change: Number(matchedCross?.change ?? 0),
          current: Number(matchedCross?.current ?? 0),
          high: Number(matchedCross?.high ?? 0),
          instrumentID: Number(instrument.instrumentId),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentChange ?? 0),
          time: matchedCross?.time ?? "",
          volume: Number(matchedCross?.change ?? 0),
          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [otherInstruments, stockIndexList]);

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
          const { stocK_INDICES } = update;

          if (
            stocK_INDICES &&
            item.instrumentID === stocK_INDICES.instrumentId
          ) {
            if (
              Number(updatedItem.current) !== Number(stocK_INDICES.current) ||
              Number(updatedItem.ask) !== Number(stocK_INDICES.ask) ||
              Number(updatedItem.high) !== Number(stocK_INDICES.high) ||
              Number(updatedItem.low) !== Number(stocK_INDICES.low) ||
              Number(updatedItem.percentageChange) !==
                Number(stocK_INDICES.percentChange) ||
              Number(updatedItem.time) !== Number(stocK_INDICES.time)
            ) {
              updatedItem = {
                ...updatedItem,
                current: stocK_INDICES.current,
                change: stocK_INDICES.change,
                percentageChange: stocK_INDICES.percentChange,
                high: stocK_INDICES.high,
                low: stocK_INDICES.low,
                ask: stocK_INDICES.ask,
                volume: stocK_INDICES.volume,
                time: stocK_INDICES.time,
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
