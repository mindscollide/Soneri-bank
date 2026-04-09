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
import { clearTreasuryRateSheetSpotTTRates } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// Selectors
const GetSpotTTRatesForRateSheet = (state) =>
  state.WatchListReducer.GetSpotTTRatesForRateSheet;

const treasuryRateSheetSpotTTRatesFeed = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetSpotTTRates;

const SpotTTRates = () => {
  const dispatch = useDispatch();

  // State
  const [processedData, setProcessedData] = useState([]);

  // Refs (same pattern as forwards)
  const dataRef = useRef([]);
  const pendingUpdatesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);

  const spotTTRatesData = useSelector(GetSpotTTRatesForRateSheet);
  const fullFeed = useSelector(treasuryRateSheetSpotTTRatesFeed);

  // ✅ Sync helper
  const applyRows = useCallback((rows) => {
    dataRef.current = rows;
    setProcessedData(rows);
  }, []);

  // ✅ Initialize base data
  useEffect(() => {
    if (!spotTTRatesData?.spotTTRates) return;

    const base = spotTTRatesData.spotTTRates.map((item) => ({
      ...item,
      version: 0,
    }));

    applyRows(base);
    isInitializedRef.current = true;
  }, [spotTTRatesData, applyRows]);

  // ✅ RAF batch processor
  const processQueue = useCallback(() => {
    const updates = pendingUpdatesRef.current;
    if (!updates.length) {
      animationFrameRef.current = null;
      return;
    }

    pendingUpdatesRef.current = [];

    // 🔥 Flatten updates
    const flatUpdates = updates.map((u) => u?.spotTTRates).filter(Boolean);

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
        Number(row.bid) === Number(update.bid) &&
        Number(row.offer) === Number(update.offer) &&
        row.currencyName === update.currencyName &&
        row.currencyCode === update.currencyCode
      ) {
        return row;
      }

      return {
        ...row,
        currencyName: update.currencyName,
        currencyCode: update.currencyCode,
        bid: update.bid,
        offer: update.offer,
        version: (row.version || 0) + 1,
      };
    });

    applyRows(updated);

    // ✅ clear redux queue (IMPORTANT)
    dispatch(clearTreasuryRateSheetSpotTTRates());

    animationFrameRef.current = requestAnimationFrame(processQueue);
  }, [applyRows, dispatch]);

  // ✅ enqueue updates
  useEffect(() => {
    if (!fullFeed?.length) return;

    pendingUpdatesRef.current = fullFeed;

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(processQueue);
    }
  }, [fullFeed, processQueue]);

  // cleanup
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
        dataIndex: "currencyName",
        width: 150,
        align: "center",
      },
      {
        title: "Symbol",
        dataIndex: "currencyCode",
        width: 70,
        align: "center",
      },
      {
        title: "Buying",
        dataIndex: "bid",
        className: "bidCol",
        width: 70,
      },
      {
        title: "Selling",
        dataIndex: "offer",
        className: "offerCol",
        width: 70,
      },
    ],
    []
  );

  return (
    <>
      <span className={styles.tableheaderbar}>Spot TT Rates</span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        rowKey={(record) => `${record.instrumentID}-${record.version}`}
        prefixCls={
          processedData.length > 0 ? "rateSheetTable" : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 450, x: "max-content" }}
      />
    </>
  );
};

export default SpotTTRates;
