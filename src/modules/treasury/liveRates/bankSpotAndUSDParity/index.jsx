import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";
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

  const [processedData, setProcessedData] = useState([]);

  const pendingRef = useRef([]);
  const rafRef = useRef(null);

  // ─────────────────────────────────────────────
  // Initial Data
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
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);

  // ─────────────────────────────────────────────
  // 🚀 FAST RAF PROCESSOR
  const processQueue = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending.length) {
      rafRef.current = null;
      return;
    }

    // Build maps
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
        let rowChanged = false;
        let newRow = { ...row };

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
            console.log(row, cross, "crosscrosscrosscrosscross");
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
  // Consume Redux feed
  useEffect(() => {
    if (!fullFeed?.length) return;

    fullFeed.forEach((f) => queueUpdate(f));

    dispatch(clearTreasurySpotRatesFeed());
  }, [fullFeed, queueUpdate]);

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
      prefixCls="LiveRatesTable"
      rowKey={(r) =>
        `${r.instrumentID}-${r.secondaryInstrumentID}-${r.version}`
      }
      pagination={false}
      scroll={{ x: "max-content", y: 500 }}
    />
  );
});

export default BankSpotAndUSDParity;
