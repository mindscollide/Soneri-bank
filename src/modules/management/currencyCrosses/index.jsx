import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { convertUTCTimeToLocalTime } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import styles from "../management.module.css";
import { clearCurrencyCrossesForManagmentFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const currencyCrossesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;

const SelectGetCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

const CurrencyCrosses = memo(() => {
  const dispatch = useDispatch();

  const dataRef = useRef([]);
  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  const otherInstruments = useSelector(GetAllOtherInstruments);
  const currencyCrosses = useSelector(SelectGetCurrencyCrosses);
  const fullFeed = useSelector(currencyCrossesForManagementFeed);

  const [processedData, setProcessedData] = useState([]);

  // ─────────────────────────────────────────────
  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Instrument",
        dataIndex: "instrumentName",
        ellipsis: true,
        width: 90,
      },
      {
        title: "Bid",
        dataIndex: "bid",
        width: 90,
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
      },
      {
        title: "Ask",
        dataIndex: "ask",
        width: 90,
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
      },
      {
        title: "High",
        dataIndex: "high",
        width: 90,
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
      },
      {
        title: "Low",
        dataIndex: "low",
        width: 90,
        render: (text) =>
          text !== "-" && <IndexCell value={Number(text).toFixed(4)} />,
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

  // ─────────────────────────────────────────────
  // Initial Data
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !currencyCrosses) return [];

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
  }, [otherInstruments, currencyCrosses]);

  useEffect(() => {
    if (enrichedData.length) {
      dataRef.current = enrichedData;
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

  // ─────────────────────────────────────────────
  // 🚀 Optimized RAF Processor
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

    pendingRef.current = [];

    setProcessedData((prev) => {
      let hasChanges = false;

      const updated = prev.map((row) => {
        const update = latestMap.get(row.instrumentID);
        if (!update) return row;

        if (
          row.bid !== update.bid ||
          row.ask !== update.ask ||
          row.high !== update.high ||
          row.low !== update.low ||
          row.percentageChange !== update.percentChange ||
          row.time !== update.time
        ) {
          hasChanges = true;

          return {
            ...row,
            bid: update.bid,
            ask: update.ask,
            high: update.high,
            low: update.low,
            percentageChange: update.percentChange,
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
  // Consume Redux buffer
  useEffect(() => {
    if (!fullFeed?.length) return;

    fullFeed.forEach((feed) => {
      queueUpdate(feed);
    });

    // ✅ VERY IMPORTANT
    dispatch(clearCurrencyCrossesForManagmentFeed());
  }, [fullFeed, queueUpdate, dispatch]);

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
    <>
      <span className={styles.tableheaderbar}>Currency Crosses</span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables"
            : "managementTables_Empty"
        }
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default CurrencyCrosses;
