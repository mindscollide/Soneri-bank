import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import {
  clearDealerSpotClearRates,
  clearDealerSpotRatesFeed,
} from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { UpdatetDealerSpotRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";

// ─── Selectors ───────────────────────────────
const selectCrossInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;

const selectFeed = (state) => state.RealtimeActionsSlice.DealerSpotRatesFeed;

const selectWorldCrosses = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCrosses || [];

const selectWorldCurrencies = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCurrencies || [];

const selectMarketStatus = (state) => state.WatchListReducer.getMarketStatus;

const BankSpotAndUSDParity = memo(() => {
  const dispatch = useDispatch();

  const gridRef = useRef();
  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  const crossInstruments = useSelector(selectCrossInstruments, shallowEqual);
  const fullFeed = useSelector(selectFeed);
  const worldCrosses = useSelector(selectWorldCrosses, shallowEqual);
  const worldCurrencies = useSelector(selectWorldCurrencies, shallowEqual);
  const marketStatus = useSelector(selectMarketStatus);

  const GetBankSpotForDealer = useSelector(
    (state) => state.WatchListReducer.GetBankSpotForDealer
  );

  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerSpotClearRates
  );

  const [rowData, setRowData] = useState([]);

  // ─────────────────────────────────────────────
  // Columns (AG Grid)
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Bank Spot",
        children: [
          {
            headerName: "Instrument",
            valueGetter: (p) =>
              `${p.data.instrumentName} / ${p.data.secondaryInstrumentName}`,
            width: 180,
          },
          {
            headerName: "Bid",
            field: "worldCrossBid",
            valueFormatter: (p) => Number(p.value).toFixed(4),
          },
          {
            headerName: "Offer",
            field: "worldCrossOffer",
            valueFormatter: (p) => Number(p.value).toFixed(4),
          },
          {
            headerName: "Time",
            field: "time",
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
          { headerName: "Instrument", field: "instrumentName" },
          {
            headerName: "Bid",
            field: "worldCurBid",
            valueFormatter: (p) => Number(p.value).toFixed(4),
          },
          {
            headerName: "Offer",
            field: "worldCurOffer",
            valueFormatter: (p) => Number(p.value).toFixed(4),
          },
          {
            headerName: "Time",
            field: "time",
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

  // ─────────────────────────────────────────────
  // Initial Data
  const enrichedData = useMemo(() => {
    if (!crossInstruments) return [];

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
      };
    });
  }, [crossInstruments, worldCrosses, worldCurrencies]);

  useEffect(() => {
    setRowData(enrichedData);
  }, [enrichedData]);

  // ─────────────────────────────────────────────
  // 🚀 REAL-TIME UPDATE (AG GRID)
  const processQueue = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending.length) {
      rafRef.current = null;
      return;
    }

    if (!gridRef.current?.api) return;

    pending.forEach((feed) => {
      const cross = feed?.instrumentCrossRate;
      const parity = feed?.instrumentParitySpot;

      if (cross) {
        const id = `${cross.instrumentID}_${cross.secondaryInstrumentID}`;
        const rowNode = gridRef.current.api.getRowNode(id);

        if (rowNode) {
          const updated = {
            ...rowNode.data,
            worldCrossBid: cross.bid,
            worldCrossOffer: cross.ask,
            time: cross.updateDateTime,
          };

          if (cross.instrumentID === 21) {
            updated.worldCurBid = cross.bid;
            updated.worldCurOffer = cross.ask;
          }

          gridRef.current.api.applyTransaction({ update: [updated] });
        }
      }

      if (parity) {
        const nodes = gridRef.current.api.getRenderedNodes();

        nodes.forEach((node) => {
          if (node.data.instrumentID === parity.instrumentID) {
            const updated = {
              ...node.data,
              worldCurBid: parity.bid,
              worldCurOffer: parity.ask,
            };

            gridRef.current.api.applyTransaction({ update: [updated] });
          }
        });
      }
    });

    pendingRef.current = [];
    rafRef.current = null;
  }, []);

  // ─────────────────────────────────────────────
  const queueUpdate = useCallback(
    (feed) => {
      pendingRef.current.push(feed);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // Feed consumer
  useEffect(() => {
    if (!fullFeed?.length) return;

    fullFeed.forEach(queueUpdate);
    dispatch(clearDealerSpotRatesFeed());
  }, [fullFeed, queueUpdate, dispatch]);

  // Market close
  useEffect(() => {
    if (marketStatus === false && gridRef.current?.api) {
      const nodes = gridRef.current.api.getRenderedNodes();

      const updates = nodes.map((n) => ({
        ...n.data,
        worldCrossBid: 0,
        worldCrossOffer: 0,
        worldCurBid: 0,
        worldCurOffer: 0,
      }));

      gridRef.current.api.applyTransaction({ update: updates });
    }
  }, [marketStatus]);

  // Clear rates (same logic)
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear || !GetBankSpotForDealer) return;

    const clearedData = {
      ...GetBankSpotForDealer,
      worldCurrencies:
        GetBankSpotForDealer.worldCurrencies?.map((i) => ({
          ...i,
          bid: 0,
          offer: 0,
        })) || [],
      worldCrosses:
        GetBankSpotForDealer.worldCrosses?.map((i) => ({
          ...i,
          bid: 0,
          offer: 0,
        })) || [],
    };

    dispatch(UpdatetDealerSpotRates(clearedData));
    dispatch(clearDealerSpotClearRates());
  }, [ClearRatesData, GetBankSpotForDealer, dispatch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────
  return (
    <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        // 🔥 CRITICAL
        getRowId={(params) =>
          `${params.data.instrumentID}_${params.data.secondaryInstrumentID}`
        }
        deltaRowDataMode={true}
        animateRows={false}
      />
    </div>
  );
});

export default BankSpotAndUSDParity;
