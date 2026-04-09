import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { convertUTCTimeToLocalTime } from "../../../../utils/timeFunction";
import { clearCurrencyCrossesForManagmentFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

// ─── Selectors ───────────────────────────────
const selectFeed = (state) =>
  state.RealtimeActionsSlice.currencyCrossesForManagmentFeed;

const selectCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;

const selectOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

// ─── Component ───────────────────────────────
const CurrencyCrosses = memo(() => {
  const dispatch = useDispatch();

  const rafRef = useRef(null);
  const pendingRef = useRef([]);
  const gridRef = useRef();

  const otherInstruments = useSelector(selectOtherInstruments);
  const fullFeed = useSelector(selectFeed);
  const currencyCrosses = useSelector(selectCurrencyCrosses);

  const [rowData, setRowData] = useState([]);

  // ─── Columns ───────────────────────────────
  const columnDefs = useMemo(
    () => [
      { headerName: "Instrument", field: "instrumentName", width: 120 },
      {
        headerName: "Bid",
        field: "bid",
        width: 100,
        valueFormatter: (p) => (p.value ? Number(p.value).toFixed(4) : "-"),
      },
      {
        headerName: "Ask",
        field: "ask",
        width: 100,
        valueFormatter: (p) => (p.value ? Number(p.value).toFixed(4) : "-"),
      },
      {
        headerName: "Time",
        field: "time",
        width: 120,
        valueFormatter: (p) =>
          p.value ? convertUTCTimeToLocalTime(p.value) : "--:--:--",
      },
    ],
    []
  );

  // ─── Initial Data ───────────────────────────
  const enrichedData = useMemo(() => {
    if (!otherInstruments?.length || !currencyCrosses?.length) return [];

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
      };
    });
  }, [otherInstruments, currencyCrosses]);

  useEffect(() => {
    setRowData(enrichedData);
  }, [enrichedData]);

  // ─── REAL-TIME UPDATE (AG GRID MAGIC) ───────
  const processQueue = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending.length) {
      rafRef.current = null;
      return;
    }

    const updates = [];

    if (gridRef.current?.api) {
      pending.forEach((item) => {
        if (item?.instrumentId != null) {
          const rowNode = gridRef.current.api.getRowNode(
            String(item.instrumentId)
          );

          if (rowNode) {
            // ✅ Merge existing + new data
            updates.push({
              ...rowNode.data,
              bid: item.bid,
              ask: item.ask,
              time: item.time,
            });
          }
        }
      });

      gridRef.current.api.applyTransaction({
        update: updates,
      });
    }

    pendingRef.current = [];
    rafRef.current = null;
  }, []);

  // ─── Consume MQTT Feed ──────────────────────
  useEffect(() => {
    if (!fullFeed?.length) return;

    for (const feed of fullFeed) {
      if (feed?.currencyCrosses) {
        pendingRef.current.push(feed.currencyCrosses);
      }
    }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(processQueue);
    }

    dispatch(clearCurrencyCrossesForManagmentFeed());
  }, [fullFeed, processQueue, dispatch]);

  // ─── Cleanup ───────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─── Render ────────────────────────────────
  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        // 🔥 CRITICAL FOR REALTIME
        getRowId={(params) => params.data.instrumentID}
        deltaRowDataMode={true}
        // Performance
        animateRows={false}
        rowBuffer={10}
      />
    </div>
  );
});

export default CurrencyCrosses;
