import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./style.css";

import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import { IndexCell } from "../../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { clearTreasurySpotRatesFeed } from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

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

  const crossInstruments = useSelector(selectCrossInstruments, shallowEqual);
  const fullFeed = useSelector(selectFeed);
  const worldCrosses = useSelector(selectWorldCrosses, shallowEqual);
  const worldCurrencies = useSelector(selectWorldCurrencies, shallowEqual);

  const [rowData, setRowData] = useState([]);

  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  // ─────────────────────────────
  // Initial enrichment
  const enrichedData = useMemo(() => {
    if (!crossInstruments || !worldCrosses || !worldCurrencies) return [];

    return crossInstruments.map((inst) => {
      const cross = worldCrosses.find(
        (wc) =>
          wc.instrumentID === inst.instrumentID &&
          wc.secondaryInstrumentID === inst.secondaryInstrumentID
      );

      const currency = worldCurrencies.find(
        (wc) => wc.instrumentID === inst.instrumentID
      );

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

        version: 0,
      };
    });
  }, [crossInstruments, worldCrosses, worldCurrencies]);

  useEffect(() => {
    if (enrichedData.length) {
      setRowData(enrichedData);
    }
  }, [enrichedData]);

  // ─────────────────────────────
  // RAF processor (same logic)
  const processQueue = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending.length) {
      rafRef.current = null;
      return;
    }

    const crossMap = new Map();
    const parityMap = new Map();

    for (const feed of pending) {
      const cross = feed?.instrumentCrossRate;
      const parity = feed?.instrumentParitySpot;

      if (cross) {
        const key = `${cross.instrumentID}_${cross.secondaryInstrumentID}`;
        crossMap.set(key, cross);
      }

      if (parity) {
        parityMap.set(parity.instrumentID, parity);
      }
    }

    pendingRef.current = [];

    setRowData((prev) => {
      let changed = false;

      const updated = prev.map((row) => {
        let newRow = { ...row };
        let rowChanged = false;

        const crossKey = `${row.instrumentID}_${row.secondaryInstrumentID}`;
        const cross = crossMap.get(crossKey);

        if (cross) {
          if (
            row.worldCrossBid !== cross.bid ||
            row.worldCrossOffer !== cross.ask ||
            row.time !== cross.updateDateTime
          ) {
            newRow.worldCrossBid = cross.bid;
            newRow.worldCrossOffer = cross.ask;
            newRow.time = cross.updateDateTime;
            rowChanged = true;
          }

          if (row.instrumentID === 21) {
            newRow.worldCurBid = cross.bid;
            newRow.worldCurOffer = cross.ask;
            rowChanged = true;
          }
        }

        const parity = parityMap.get(row.instrumentID);

        if (parity && row.instrumentID !== 21) {
          if (
            row.worldCurBid !== parity.bid ||
            row.worldCurOffer !== parity.ask
          ) {
            newRow.worldCurBid = parity.bid;
            newRow.worldCurOffer = parity.ask;
            rowChanged = true;
          }
        }

        if (rowChanged) {
          newRow.version = row.version + 1;
          changed = true;
          return newRow;
        }

        return row;
      });

      return changed ? updated : prev;
    });

    rafRef.current = null;
  }, []);

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

  useEffect(() => {
    if (!fullFeed?.length) return;

    fullFeed.forEach(queueUpdate);
    dispatch(clearTreasurySpotRatesFeed());
  }, [fullFeed, queueUpdate, dispatch]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const getColumnStyle = (
    params,
    darkColor,
    lightColor,
    textColor = "black",
    value = false,
    center = true
  ) => {
    const isEven = params.node.rowIndex % 2 === 0;
    return {
      backgroundColor: isEven ? darkColor : lightColor,
      color: textColor,
      display: "flex",
      justifyContent: center ? "center" : "flex-start",
      alignItems: "center",
      fontSize: "14px",
      fontFamily: value ? "Helvetica" : "Helvetica-Bold",
      fontWeight: value ? "normal" : "bold",
      textAlign: center ? "center" : "left",
      // This is the padding you requested
      padding: "5px 10px",
    };
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Bank Spot",
        headerClass: "header-group-white",

        children: [
          {
            headerName: "Instrument",
            headerClass: "header-cell-black",
            valueGetter: (p) =>
              `${p.data.instrumentName} / ${p.data.secondaryInstrumentName}`,
            cellStyle: (p) => getColumnStyle(p, "#e9e2dc", "#e9e2dc", "black"),
          },
          {
            headerName: "Bid",
            field: "worldCrossBid",
            headerClass: "header-cell-black",
            cellStyle: (p) =>
              getColumnStyle(p, "#ffd567", "#ffd567", "black", true), // Gold tones
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value).toFixed(4)} />
            ),
          },
          {
            headerName: "Offer",
            field: "worldCrossOffer",
            headerClass: "header-cell-black",
            cellStyle: (p) =>
              getColumnStyle(p, "#ceccc8", "#ceccc8", "black", true),

            cellRenderer: (p) => (
              <IndexCell value={Number(p.value).toFixed(4)} />
            ),
          },
          {
            headerName: "Time",
            field: "time",
            headerClass: "header-cell-black",
            cellStyle: (p) =>
              getColumnStyle(p, "#ffffff", "#fffff", "black", true), // White tones
            valueFormatter: (p) =>
              p.value
                ? formatDateUTCToGMT(p.value).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
      {
        headerName: "USD Parity",
        headerClass: "header-group-white",
        children: [
          {
            headerName: "Instrument",
            headerClass: "header-cell-black",
            valueGetter: (p) => p.data.instrumentName,
            cellStyle: (p) =>
              getColumnStyle(p, "#e9e2dc", "#e9e2dc", "black", false),
          },
          {
            headerName: "Bid",
            field: "worldCurBid",
            headerClass: "header-cell-black",
            cellStyle: (p) =>
              getColumnStyle(p, "#ffd567", "#ffd567", "black", true), // Gold tones
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value).toFixed(4)} />
            ),
          },
          {
            headerName: "Offer",
            field: "worldCurOffer",
            headerClass: "header-cell-black",
            cellStyle: (p) =>
              getColumnStyle(p, "#ceccc8", "#ceccc8", "black", true),
            cellRenderer: (p) => (
              <IndexCell value={Number(p.value).toFixed(4)} />
            ),
          },
          {
            headerName: "Time",
            field: "time",
            headerClass: "header-cell-black ",
            cellStyle: (p) =>
              getColumnStyle(p, "#ffffff", "#fffff", "black", true), // White tones,
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

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: false,
      suppressMovable: true,
      flex: 1,
      minWidth: 120,
    }),
    []
  );

  const getRowId = useCallback(
    (params) =>
      `${params.data.instrumentID}-${params.data.secondaryInstrumentID}-${params.data.version}`,
    []
  );

  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={getRowId}
        groupHeaderHeight={35} // This controls "Bank Spot" & "USD Parity"
        headerHeight={35} // This controls "Instrument", "Bid", etc.
        rowHeight={35} // Adjust this number (in pixels) to fit your 5px 10px padding comfortably
        animateRows={false}
        suppressRowTransform={true}
        allowDragFromColumnsToolPanel={false}
        allowContextMenuWithControlKey={false}
        allowShowChangeAfterFilter={false}
      />
    </div>
  );
});

export default BankSpotAndUSDParity;
