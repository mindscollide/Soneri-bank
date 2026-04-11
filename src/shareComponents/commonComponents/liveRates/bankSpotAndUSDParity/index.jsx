import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";

import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import { IndexCell } from "../../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { clearTreasurySpotRatesFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../../shareComponents/commonComponents/elements/globalAgGridTable";

// Selectors
const selectCrossInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;


const selectFeed = (state) => state.RealtimeActionsSlice.DealerSpotRatesFeed;

const selectWorldCrosses = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCrosses || [];

const selectWorldCurrencies = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCurrencies || [];

const BankSpotAndUSDParity = memo(() => {
  const dispatch = useDispatch();

  const gridApiRef = useRef(null);
  const pendingUpdates = useRef(new Map()); // ✅ Use Map for deduplication
  const rafRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const crossInstruments = useSelector(selectCrossInstruments, shallowEqual);
  const fullFeed = useSelector(selectFeed, shallowEqual); // ✅ Add shallowEqual
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
  // GRID INIT
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;
      
      gridApiRef.current = params.api;

      const rowData = crossInstruments?.map((inst) => {
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
      }) || [];

      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
      }
    },
    [crossInstruments, crossMap, currencyMap]
  );

  // ─────────────────────────────
  // Capture rowNodes
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;
    
    rowNodeMap.current.clear();

    params.api.forEachNode((node) => {
      const key = `${node.data.instrumentID}_${node.data.secondaryInstrumentID}`;
      rowNodeMap.current.set(key, node);
    });
  }, []);

  // ─────────────────────────────
  // ✅ THROTTLED HIGH PERFORMANCE UPDATE ENGINE
  const processQueue = useCallback(() => {
    if (!isMountedRef.current || isProcessingRef.current || !gridApiRef.current) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTime.current;
    
    // ✅ Throttle: minimum 50ms between updates (20fps max)
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
      // ✅ Process in batches
      let batchCount = 0;
      const MAX_BATCH_SIZE = 15; // Process max 15 items per frame

      // Process cross updates
      for (const [key, update] of pendingUpdates.current.entries()) {
        if (batchCount >= MAX_BATCH_SIZE) break;

        if (update.type === 'cross') {
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
        } 
        else if (update.type === 'parity') {
          const parity = update.data;
          const instrumentID = update.instrumentID;

          // Update all matching rows
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

      // ✅ If there are still pending updates, schedule next frame
      if (pendingUpdates.current.size > 0) {
        rafRef.current = requestAnimationFrame(processQueue);
      } else {
        rafRef.current = null;
      }

    } catch (error) {
      console.error('Error processing queue:', error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ─────────────────────────────
  // ✅ Queue updates with deduplication
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed || !isMountedRef.current) return;

      const cross = feed?.instrumentCrossRate;
      const parity = feed?.instrumentParitySpot;

      if (cross) {
        const key = `${cross.instrumentID}_${cross.secondaryInstrumentID}`;
        pendingUpdates.current.set(key, {
          type: 'cross',
          data: cross
        });
      }

      if (parity) {
        const key = `parity_${parity.instrumentID}`;
        pendingUpdates.current.set(key, {
          type: 'parity',
          instrumentID: parity.instrumentID,
          data: parity
        });
      }

      // ✅ Schedule processing if not already scheduled
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────
  // ✅ Debounced feed processing
  useEffect(() => {
    if (!fullFeed || !Array.isArray(fullFeed) || fullFeed.length === 0) {
      return;
    }

    // Process all feeds
    fullFeed.forEach(queueUpdate);

    // Clear Redux state after a delay
    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearTreasurySpotRatesFeed());
      }
    }, 200); // Increased delay

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
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value)} />
            ),
          },
          {
            headerName: "Offer",
            field: "worldCrossOffer",
            flex: 1,
            cellClass: "offer-cell",
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value)} />
            ),
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
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value)} />
            ),
          },
          {
            headerName: "Offer",
            field: "worldCurOffer",
            flex: 1,
            cellClass: "offer-cell",
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value)} />
            ),
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

  const defaultColDef = useMemo(() => ({
    resizable: false,
    sortable: false,
    suppressMovable: true,
    editable: false,
  }), []);

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <AgGridTable
        ref={gridApiRef}
        columnDefs={columnDefs}
        className='liveRates-grid'
        getRowId={getRowId}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        domLayout='normal'
        theme='legacy'
        defaultColDef={defaultColDef}
        suppressScrollOnNewData={true}
        suppressAnimationFrame={false}
        suppressCellSelection={true}
        
      />
    </div>
  );
});

BankSpotAndUSDParity.displayName = 'BankSpotAndUSDParity';

export default BankSpotAndUSDParity;