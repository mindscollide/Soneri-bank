import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetRatesForCurrencyNotesForRateSheet = (state) =>
  state.WatchListReducer.GetRatesForCurrencyNotesForRateSheet?.currencyNotes;
const GetAllInstrumentForTreasury = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;

const treasuryRateSheetCurrencyNotes = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetCurrencyNotes;

const RatesForCurrencyNotes = () => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetCurrencyNotes);

  const currencyNotes = useSelector(GetRatesForCurrencyNotesForRateSheet);
  const instrumnets = useSelector(GetAllInstrumentForTreasury);

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
  // ✅ Initialize base data
  useEffect(() => {
    if (
      currencyNotes &&
      currencyNotes.length > 0 &&
      instrumnets &&
      instrumnets.length > 0
    ) {
      const enriched = currencyNotes.map((item) => {
        const matchedInstrument = instrumnets.find(
          (inst) => inst.instrumentID === item.instrumentID
        );

        return {
          instrumentID: item.instrumentID,
          instrumentName: matchedInstrument?.instrumentName || "",
          buying: Number(item.bid ?? 0),
          selling: Number(item.ask ?? 0),
          version: 0,
        };
      });

      dataRef.current = enriched;
      setProcessedData(enriched);
    }
  }, [currencyNotes, instrumnets]);

  // console.log({ processedData, fullFeed }, "TotalData");
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
      if (!Array.isArray(prevData)) return prevData;

      let hasChanges = false;
      const updatedData = prevData.map((item) => {
        let updatedItem = { ...item };
        let changed = false;

        updates.forEach((update) => {
          const { currencyNotes } = update;

          if (
            currencyNotes &&
            item.instrumentID === currencyNotes.instrumentID
          ) {
            if (
              Number(updatedItem.buying) !== Number(currencyNotes.bid) ||
              Number(updatedItem.selling) !== Number(currencyNotes.offer)
            ) {
              updatedItem = {
                ...updatedItem,
                buying: currencyNotes.bid,
                selling: currencyNotes.offer,
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
      <span className={styles.tableheaderbar}>Rates For Currency Notes</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
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
