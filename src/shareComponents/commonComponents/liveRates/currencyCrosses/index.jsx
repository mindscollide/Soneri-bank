import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { convertUTCTimeToLocalTime } from "../../../../utils/timeFunction";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { IndexCell } from "../../elements/inputField/IndexCell";
import { clearCurrencyCrossesForManagmentFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────
const currencyCrossesRatesFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;

const SelectGetCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

// ─────────────────────────────────────────────
const CurrencyCrosses = memo(() => {
  const dispatch = useDispatch();

  // Refs (no re-render)
  const dataRef = useRef([]);
  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  // Redux
  const otherInstruments = useSelector(GetAllOtherInstruments);
  const fullFeed = useSelector(currencyCrossesRatesFeed);
  const currencyCrosses = useSelector(SelectGetCurrencyCrosses);

  // State
  const [processedData, setProcessedData] = useState([]);

  // ─────────────────────────────────────────────
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
            render: (text) =>
              text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
          },
          {
            title: "Ask",
            dataIndex: "ask",
            className: "offerCol",
            width: 90,
            render: (text) =>
              text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
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

  // ─────────────────────────────────────────────
  // Initial Data
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !currencyCrosses) return [];

    try {
      return otherInstruments.map((instrument) => {
        const match = currencyCrosses.find(
          (wc) => Number(wc.instrumentId) === instrument.instrumentId
        );

        return {
          instrumentID: Number(instrument.instrumentId),
          instrumentName: instrument.name,
          time: match?.time ?? "",
          bid: Number(match?.bid ?? 0),
          ask: Number(match?.ask ?? 0),
          high: Number(match?.high ?? 0),
          low: Number(match?.low ?? 0),
          percentageChange: Number(match?.percentChange ?? 0),
          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [otherInstruments, currencyCrosses]);

  // Initialize table
  useEffect(() => {
    if (enrichedData.length > 0) {
      dataRef.current = enrichedData;
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

  // ─────────────────────────────────────────────
  // 🚀 RAF Batch Processor
  const processQueue = useCallback(() => {
    const pending = pendingRef.current;

    if (!pending.length) {
      rafRef.current = null;
      return;
    }

    // Latest update per instrument
    const latestMap = new Map();

    for (const p of pending) {
      const data = p?.currencyCrosses;
      if (!data) continue;
      latestMap.set(data.instrumentId, data);
    }

    // Clear queue
    pendingRef.current = [];

    setProcessedData((prev) => {
      let hasChanges = false;

      const updated = prev.map((row) => {
        const update = latestMap.get(row.instrumentID);
        if (!update) return row;

        if (
          row.bid !== update.bid ||
          row.ask !== update.ask ||
          row.time !== update.time
        ) {
          hasChanges = true;

          return {
            ...row,
            bid: update.bid,
            ask: update.ask,
            time: update.time,
            version: row.version + 1,
          };
        }

        return row;
      });

      return hasChanges ? updated : prev;
    });

    rafRef.current = null;
  }, []);

  // ─────────────────────────────────────────────
  // Queue updates
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      pendingRef.current.push(feed);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────────────────────
  // Consume Redux buffer safely
  useEffect(() => {
    if (!fullFeed?.length) return;

    // push each payload individually
    fullFeed.forEach((feed) => {
      queueUpdate(feed);
    });

    // ✅ clear Redux buffer after consuming
    dispatch(clearCurrencyCrossesForManagmentFeed());
  }, [fullFeed, queueUpdate, dispatch]);

  // ─────────────────────────────────────────────
  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────
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
