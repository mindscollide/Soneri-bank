import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import "./style.css";

import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import { IndexCell } from "../../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { clearTreasurySpotRatesFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../../shareComponents/commonComponents/elements/globalAgGridTable";
import SectionLoader from "../../../../shareComponents/elements/soneriLoader/SectionLoader";

// Selectors
const selectCrossInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;

const selectFeed = (state) => state.RealtimeActionsSlice.TreasurySpotRatesFeed;

const selectWorldCrosses = (state) =>
  state.WatchListReducer.GetBankSpotForTreasury?.worldCrosses || [];

const selectWorldCurrencies = (state) =>
  state.WatchListReducer.GetBankSpotForTreasury?.worldCurrencies || [];

const BankSpotAndUSDParity = memo(() => {
  const dispatch = useDispatch();

  const agGridComponentRef = useRef(null); // ✅ for ref={} prop on AgGridTable
  const gridApiRef = useRef(null); // ✅ for params.api in onGridReady
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const crossInstruments = useSelector(selectCrossInstruments, shallowEqual);
  const fullFeed = useSelector(selectFeed, shallowEqual);
  const worldCrosses = useSelector(selectWorldCrosses, shallowEqual);
  const worldCurrencies = useSelector(selectWorldCurrencies, shallowEqual);

  // ─────────────────────────────
  // Fast lookup maps
  const { crossMap, currencyMap } = useMemo(() => {
    const crossMap = new Map();
    const currencyMap = new Map();

    worldCrosses.forEach((c) => {
      crossMap.set(`${c.instrumentID}_${c.secondaryInstrumentID}`, c);
    });

    worldCurrencies.forEach((c) => {
      currencyMap.set(c.instrumentID, c);
    });

    return { crossMap, currencyMap };
  }, [worldCrosses, worldCurrencies]);

  // ─────────────────────────────
  // Build row data
  const buildRowData = useCallback(() => {
    if (!crossInstruments?.length) return [];

    return crossInstruments.map((inst) => {
      const cross = crossMap.get(
        `${inst.instrumentID}_${inst.secondaryInstrumentID}`
      );
      const currency = currencyMap.get(inst.instrumentID);

      return {
        instrumentID: inst.instrumentID,
        secondaryInstrumentID: inst.secondaryInstrumentID,
        instrumentName: inst.instrumentName,
        secondaryInstrumentName: inst.secondaryInstrumentName,
        time: cross?.time ?? "",
        worldCrossBid: cross?.bid ?? 0,
        worldCrossOffer: cross?.offer ?? 0,
        worldCurBid:
          inst.instrumentID === 21 ? cross?.bid ?? 0 : currency?.bid ?? 0,
        worldCurOffer:
          inst.instrumentID === 21 ? cross?.offer ?? 0 : currency?.offer ?? 0,
      };
    });
  }, [crossInstruments, crossMap, currencyMap]);

  // ─────────────────────────────
  // ✅ FIX: Sync data into grid whenever API data arrives (handles race condition)
  useEffect(() => {
    if (!gridApiRef.current || !crossInstruments?.length) return;

    const rowData = buildRowData();
    if (rowData.length === 0) return;

    gridApiRef.current.setGridOption("rowData", rowData);

    // Rebuild rowNodeMap so live MQTT updates can target the correct nodes
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      const key = `${node.data.instrumentID}_${node.data.secondaryInstrumentID}`;
      rowNodeMap.current.set(key, node);
    });
  }, [crossInstruments, worldCrosses, worldCurrencies]);

  // ─────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api; // ✅ store actual AG Grid API

      // Attempt immediate load (works if API already resolved before grid init)
      const rowData = buildRowData();
      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
      }
      // If data isn't ready yet, the useEffect above will handle it when it arrives
    },
    [buildRowData]
  );

  // ─────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      const key = `${node.data.instrumentID}_${node.data.secondaryInstrumentID}`;
      rowNodeMap.current.set(key, node);
    });
  }, []);

  // ─────────────────────────────
  const processQueue = useCallback(() => {
    if (
      !isMountedRef.current ||
      isProcessingRef.current ||
      !gridApiRef.current
    ) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTime.current;

    if (timeSinceLastProcess < 50) {
      rafRef.current = requestAnimationFrame(processQueue);
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessTime.current = now;

    try {
      let batchCount = 0;
      const MAX_BATCH_SIZE = 15;

      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH_SIZE) break;

        if (update.type === "cross") {
          const node = rowNodeMap.current.get(key);
          if (!node) {
            pendingUpdates.current.delete(key);
            continue;
          }

          const data = node.data;
          const cross = update.data;

          if (
            data.worldCrossBid !== cross.bid ||
            data.worldCrossOffer !== cross.ask ||
            data.time !== cross.updateDateTime
          ) {
            node.setDataValue("worldCrossBid", cross.bid);
            node.setDataValue("worldCrossOffer", cross.ask);
            node.setDataValue("time", cross.updateDateTime);
          }

          if (data.instrumentID === 21) {
            node.setDataValue("worldCurBid", cross.bid);
            node.setDataValue("worldCurOffer", cross.ask);
          }

          pendingUpdates.current.delete(key);
          batchCount++;
        } else if (update.type === "parity") {
          const parity = update.data;
          const instrumentID = update.instrumentID;

          for (const node of rowNodeMap.current.values()) {
            const data = node.data;

            if (data.instrumentID === instrumentID && instrumentID !== 21) {
              node.setDataValue("worldCurBid", parity.bid);
              node.setDataValue("worldCurOffer", parity.ask);
            }
          }

          pendingUpdates.current.delete(key);
          batchCount++;
        }
      }

      if (pendingUpdates.current.size > 0) {
        rafRef.current = requestAnimationFrame(processQueue);
      } else {
        rafRef.current = null;
      }
    } catch (error) {
      console.error("Error processing queue:", error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ─────────────────────────────
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed || !isMountedRef.current) return;

      const cross = feed?.instrumentCrossRate;
      const parity = feed?.instrumentParitySpot;

      if (cross) {
        const key = `${cross.instrumentID}_${cross.secondaryInstrumentID}`;
        pendingUpdates.current.set(key, {
          type: "cross",
          data: cross,
        });
      }

      if (parity) {
        const key = `parity_${parity.instrumentID}`;
        pendingUpdates.current.set(key, {
          type: "parity",
          instrumentID: parity.instrumentID,
          data: parity,
        });
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────
  useEffect(() => {
    if (!fullFeed || !Array.isArray(fullFeed) || fullFeed.length === 0) {
      return;
    }

    fullFeed.forEach(queueUpdate);

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearTreasurySpotRatesFeed());
      }
    }, 200);

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, queueUpdate, dispatch]);

  // ─────────────────────────────
  // ✅ Cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      pendingUpdates.current.clear();
      rowNodeMap.current.clear();
      isProcessingRef.current = false;
    };
  }, []);

  // ─────────────────────────────
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Bank Spot",
        children: [
          {
            headerName: "Instrument",
            flex: 1,
            cellClass: "instrument-cell",
            valueGetter: (p) =>
              `${p.data.instrumentName} / ${p.data.secondaryInstrumentName}`,
          },
          {
            headerName: "Bid",
            field: "worldCrossBid",
            flex: 1,
            cellClass: "bid-cell",
            cellRenderer: (p) => <IndexCell value={Number(p.value)} />,
          },
          {
            headerName: "Offer",
            field: "worldCrossOffer",
            flex: 1,
            cellClass: "offer-cell",
            cellRenderer: (p) => <IndexCell value={Number(p.value)} />,
          },
          {
            headerName: "Time",
            field: "time",
            flex: 1,
            cellClass: "section-divider",
            valueFormatter: (p) =>
              p.value
                ? formatDateUTCToGMT(p.value).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
      {
        headerName: "USD Parity",
        children: [
          {
            headerName: "Instrument",
            flex: 1,
            cellClass: "instrument-cell",
            valueGetter: (p) => p.data.instrumentName,
          },
          {
            headerName: "Bid",
            field: "worldCurBid",
            flex: 1,
            cellClass: "bid-cell",
            cellRenderer: (p) => <IndexCell value={Number(p.value)} />,
          },
          {
            headerName: "Offer",
            field: "worldCurOffer",
            flex: 1,
            cellClass: "offer-cell",
            cellRenderer: (p) => <IndexCell value={Number(p.value)} />,
          },
          {
            headerName: "Time",
            field: "time",
            flex: 1,
            cellClass: "section-divider",
            valueFormatter: (p) =>
              p.value
                ? formatDateUTCToGMT(p.value).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
    ],
    []
  );

  const getRowId = useCallback(
    (params) =>
      `${params.data.instrumentID}-${params.data.secondaryInstrumentID}`,
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      editable: false,
    }),
    []
  );

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <AgGridTable
        ref={agGridComponentRef}
        columnDefs={columnDefs}
        className="liveRates-grid"
        getRowId={getRowId}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        domLayout="normal"
        theme="legacy"
        defaultColDef={defaultColDef}
        suppressScrollOnNewData={true}
        suppressAnimationFrame={false}
        suppressCellFocus={true}
        loadingOverlayComponent={SectionLoader}
      />
    </div>
  );
});

BankSpotAndUSDParity.displayName = "BankSpotAndUSDParity";

export default BankSpotAndUSDParity;
