import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { convertUTCTimeToLocalTime } from "../../../../utils/timeFunction";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../elements/inputField/IndexCell";

const currencyCrossesRatesFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;
const SelectGetCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;
const CurrencyCrosses = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const otherInstruments = useSelector(GetAllOtherInstruments);
  const fullFeed = useSelector(currencyCrossesRatesFeed);
  const currencyCrosses = useSelector(SelectGetCurrencyCrosses);

  // // Local state for processed data
  const [processedData, setProcessedData] = useState([]);

  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Currency Crosses",
        children: [
          {
            title: "Instrument",
            dataIndex: "instrumentName",
            ellipsis: true,
            width: 90,
            align: "left",
          },
          {
            title: "Bid",
            dataIndex: "bid",
            className: "bidCol",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Ask",
            dataIndex: "ask",
            className: "offerCol",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },

          {
            title: "Time",
            dataIndex: "time",
            width: 90,

            render: (text) =>
              text ? convertUTCTimeToLocalTime(text) : "--:--:--",
          },
        ],
      },
    ],
    []
  );

  // ✅ Enriched base data
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !currencyCrosses) return [];

    try {
      return otherInstruments.map((instrument) => {
        const matchedCross = currencyCrosses.find(
          (wc) => Number(wc.instrumentId) === instrument.instrumentId
        );
        return {
          instrumentID: Number(instrument.instrumentId),
          instrumentName: instrument.name,
          time: matchedCross?.time ?? "",

          bid: Number(matchedCross?.bid ?? 0),
          ask: Number(matchedCross?.ask ?? 0),
          high: Number(matchedCross?.high ?? 0),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentChange ?? 0),

          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [otherInstruments, currencyCrosses]);

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
          const { currencyCrosses } = update;

          if (
            currencyCrosses &&
            item.instrumentID === currencyCrosses.instrumentId
          ) {
            if (
              Number(updatedItem.bid) !== Number(currencyCrosses.bid) ||
              Number(updatedItem.ask) !== Number(currencyCrosses.ask) ||
              Number(updatedItem.time) !== Number(currencyCrosses.time)
            ) {
              updatedItem = {
                ...updatedItem,
                bid: currencyCrosses.bid,
                ask: currencyCrosses.ask,
                time: currencyCrosses.time,
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
    <GlobalTable
      columns={columns}
      dataSource={processedData}
      prefixCls={
        processedData.length > 0 ? "LiveRatesTable" : "LiveRatesTable_Empty"
      }
      pagination={false}
      scroll={{ x: "max-content", y: 500 }}
    />
  );
});

export default CurrencyCrosses;
