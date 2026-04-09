import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import GlobalTable from "../../elements/table/GlobalTable";
import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import { IndexCell } from "../../elements/inputField/IndexCell";
import {
  clearDealerSpotClearRates,
  clearDealerSpotRatesFeed,
} from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { UpdatetDealerSpotRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";

// Selectors
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

  const [processedData, setProcessedData] = useState([]);

  const pendingRef = useRef([]);
  const rafRef = useRef(null);

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

        version: 0,
      };
    });
  }, [crossInstruments, worldCrosses, worldCurrencies]);

  useEffect(() => {
    if (enrichedData.length) {
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

  // ─────────────────────────────────────────────
  // 🚀 RAF BATCH PROCESSOR
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

    setProcessedData((prev) => {
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

  // ─────────────────────────────────────────────
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

    fullFeed.forEach((f) => queueUpdate(f));

    dispatch(clearDealerSpotRatesFeed());
  }, [fullFeed, queueUpdate, dispatch]);

  // ─────────────────────────────────────────────
  // Market close
  useEffect(() => {
    if (marketStatus === false) {
      setProcessedData((prev) =>
        prev.map((row) => ({
          ...row,
          worldCrossBid: 0,
          worldCrossOffer: 0,
          worldCurBid: 0,
          worldCurOffer: 0,
        }))
      );
    }
  }, [marketStatus]);

  // ─────────────────────────────────────────────
  // Clear rates
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
  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Bank Spot",
        children: [
          {
            title: "Instrument",
            render: (_, r) =>
              `${r.instrumentName} / ${r.secondaryInstrumentName}`,
          },
          {
            title: "Bid",
            dataIndex: "worldCrossBid",
            render: (v) => <IndexCell value={Number(v).toFixed(4)} />,
          },
          {
            title: "Offer",
            dataIndex: "worldCrossOffer",
            render: (v) => <IndexCell value={Number(v).toFixed(4)} />,
          },
          {
            title: "Time",
            dataIndex: "time",
            render: (t) =>
              t
                ? formatDateUTCToGMT(t).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
      {
        title: "USD Parity",
        children: [
          { title: "Instrument", dataIndex: "instrumentName" },
          {
            title: "Bid",
            dataIndex: "worldCurBid",
            render: (v) => <IndexCell value={Number(v).toFixed(4)} />,
          },
          {
            title: "Offer",
            dataIndex: "worldCurOffer",
            render: (v) => <IndexCell value={Number(v).toFixed(4)} />,
          },
          {
            title: "Time",
            dataIndex: "time",
            render: (t) =>
              t
                ? formatDateUTCToGMT(t).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
    ],
    []
  );

  return (
    <GlobalTable
      columns={columns}
      dataSource={processedData}
      rowKey={(r) =>
        `${r.instrumentID}-${r.secondaryInstrumentID}-${r.version}`
      }
      prefixCls="LiveRatesTable"
      pagination={false}
      scroll={{ x: "max-content", y: 500 }}
    />
  );
});

export default BankSpotAndUSDParity;
