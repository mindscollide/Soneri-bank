import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useDispatch, useSelector } from "react-redux";
import { clearTreasuryRateSheetCurrencyNotes } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const GetRatesForCurrencyNotesForRateSheet = (state) =>
  state.WatchListReducer.GetRatesForCurrencyNotesForRateSheet?.currencyNotes;

const GetAllInstrumentForTreasury = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;

const treasuryRateSheetCurrencyNotes = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetCurrencyNotes;

const RatesForCurrencyNotes = () => {
  const dispatch = useDispatch();

  // State
  const [processedData, setProcessedData] = useState([]);

  // Refs
  const dataRef = useRef([]);
  const pendingUpdatesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);

  const fullFeed = useSelector(treasuryRateSheetCurrencyNotes);
  const currencyNotes = useSelector(GetRatesForCurrencyNotesForRateSheet);
  const instruments = useSelector(GetAllInstrumentForTreasury);

  // ✅ Sync helper
  const applyRows = useCallback((rows) => {
    dataRef.current = rows;
    setProcessedData(rows);
  }, []);

  // ✅ Initialize base data
  useEffect(() => {
    if (!currencyNotes?.length || !instruments?.length) return;

    const enriched = currencyNotes.map((item) => {
      const matchedInstrument = instruments.find(
        (inst) => inst.instrumentID === item.instrumentID
      );

      return {
        instrumentID: item.instrumentID,
        instrumentName: matchedInstrument?.instrumentName || "",
        buying: Number(item.bid ?? 0),
        selling: Number(item.offer ?? 0),
        version: 0,
      };
    });

    applyRows(enriched);
    isInitializedRef.current = true;
  }, [currencyNotes, instruments, applyRows]);

  // ✅ RAF batch processor
  const processQueue = useCallback(() => {
    const updates = pendingUpdatesRef.current;

    if (!updates.length) {
      animationFrameRef.current = null;
      return;
    }

    pendingUpdatesRef.current = [];

    // 🔥 Flatten updates
    const flatUpdates = updates.map((u) => u?.currencyNotes).filter(Boolean);

    if (!flatUpdates.length) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
      return;
    }

    // 🔥 O(1) lookup map
    const updateMap = new Map(flatUpdates.map((u) => [u.instrumentID, u]));

    const updated = dataRef.current.map((row) => {
      const update = updateMap.get(row.instrumentID);
      if (!update) return row;

      if (
        Number(row.buying) === Number(update.bid) &&
        Number(row.selling) === Number(update.offer)
      ) {
        return row;
      }

      return {
        ...row,
        buying: update.bid,
        selling: update.offer,
        version: (row.version || 0) + 1,
      };
    });

    applyRows(updated);

    // ✅ Clear redux queue
    dispatch(clearTreasuryRateSheetCurrencyNotes());

    animationFrameRef.current = requestAnimationFrame(processQueue);
  }, [applyRows, dispatch]);

  // ✅ Enqueue updates
  useEffect(() => {
    if (!fullFeed?.length) return;

    pendingUpdatesRef.current = fullFeed;

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
    }
  }, [fullFeed, processQueue]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Currency",
        dataIndex: "instrumentName",
        width: 150,
        align: "center",
      },
      {
        title: "Buying",
        dataIndex: "buying",
        className: "bidCol",
        width: 120,
        render: (val) => (val ? Number(val).toFixed(2) : "-"),
      },
      {
        title: "Selling",
        dataIndex: "selling",
        className: "offerCol",
        width: 120,
        render: (val) => (val ? Number(val).toFixed(2) : "-"),
      },
    ],
    []
  );

  return (
    <>
      <span className={styles.tableheaderbar}>Rates For Currency Notes</span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        rowKey={(record) => `${record.instrumentID}-${record.version}`}
        prefixCls={
          processedData.length > 0 ? "rateSheetTable" : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
};

export default RatesForCurrencyNotes;
