import { memo, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { formatDateUTCToGMT } from "../../../utils/timeFunction";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";

// // ✅ Pure selectors (no object creation here)

// const selectTreasurySpotRatesFeed = (state) =>
//   state.RealtimeActionsSlice.TreasurySpotRatesFeed;

const currencyCrossesRatesFeed = (state) =>
  state.RealtimeActionsSlice.CurrencyCrossesRatesFeed;
const SelectGetCurrencyCrosses = (state) =>
  state.WatchListReducer.GetCurrencyCrosses?.currencyCrossList;
const selectMarketStatus = (state) => state.WatchListReducer.getMarketStatus;

const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllOtherInstruments?.currencyCrosses;

const CurrencyCrosses = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const otherInstruments = useSelector(GetAllOtherInstruments);
  const currencyCrosses = useSelector(SelectGetCurrencyCrosses);

  const fullFeed = useSelector(currencyCrossesRatesFeed);
  const marketStatus = useSelector(selectMarketStatus);
  const GetCurrencyCrosses = useSelector(
    SelectGetCurrencyCrosses,
    shallowEqual
  );

  // ✅ Memoized essential feed values
  const feedEssentials = useMemo(() => {
    if (!fullFeed) return null;

    return {
      crossBid: fullFeed.instrumentCrossRate?.bid,
      crossAsk: fullFeed.instrumentCrossRate?.ask,
      crossUpdateTime: fullFeed.instrumentCrossRate?.updateDateTime,
      crossInstrumentID: fullFeed.instrumentCrossRate?.instrumentID,
      crossSecondaryID: fullFeed.instrumentCrossRate?.secondaryInstrumentID,
      spotBid: fullFeed.instrumentParitySpot?.bid,
      spotAsk: fullFeed.instrumentParitySpot?.ask,
      spotInstrumentID: fullFeed.instrumentParitySpot?.instrumentID,
    };
  }, [
    fullFeed?.instrumentCrossRate?.bid,
    fullFeed?.instrumentCrossRate?.ask,
    fullFeed?.instrumentCrossRate?.updateDateTime,
    fullFeed?.instrumentCrossRate?.instrumentID,
    fullFeed?.instrumentCrossRate?.secondaryInstrumentID,
    fullFeed?.instrumentParitySpot?.bid,
    fullFeed?.instrumentParitySpot?.ask,
    fullFeed?.instrumentParitySpot?.instrumentID,
  ]);

  // // Local state for processed data
  const [processedData, setProcessedData] = useState([]);

  // // Refs for batching updates
  // const dataRef = useRef([]);
  // const lastUpdateRef = useRef(0);
  // const updateQueueRef = useRef([]);
  // const animationFrameRef = useRef(null);

  // // ✅ Enriched base data
  //   const enrichedData = useMemo(() => {
  //     if (!crossInstruments || !worldCrosses || !worldCurrencies) return [];

  //     try {
  //       return crossInstruments.map((instrument) => {
  //         const matchedCross = worldCrosses.find(
  //           (wc) =>
  //             wc.instrumentID === instrument.instrumentID &&
  //             wc.secondaryInstrumentID === instrument.secondaryInstrumentID
  //         );

  //         const matchedCurrency = worldCurrencies.find(
  //           (wc) => wc.instrumentID === instrument.instrumentID
  //         );

  //         return {
  //           instrumentID: instrument.instrumentID,
  //           secondaryInstrumentID: instrument.secondaryInstrumentID,
  //           instrumentName: instrument.instrumentName,
  //           secondaryInstrumentName: instrument.secondaryInstrumentName,
  //           time: matchedCross?.time ?? "",

  //           worldCrossBid: matchedCross?.bid ?? 0,
  //           worldCrossOffer: matchedCross?.offer ?? 0,
  //           worldCurBid:
  //             instrument.instrumentID === 21
  //               ? matchedCross?.bid ?? 0
  //               : matchedCurrency?.bid ?? 0,
  //           worldCurOffer:
  //             instrument.instrumentID === 21
  //               ? matchedCross?.offer ?? 0
  //               : matchedCurrency?.offer ?? 0,

  //           version: 0,
  //         };
  //       });
  //     } catch (error) {
  //       console.error("Error enriching data:", error);
  //       return [];
  //     }
  //   }, [crossInstruments, worldCrosses, worldCurrencies]);

  // // Initialize processed data when enriched data changes
  // useEffect(() => {
  //   if (enrichedData.length > 0) {
  //     dataRef.current = enrichedData;
  //     setProcessedData(enrichedData);
  //   }
  // }, [enrichedData]);

  // // ✅ Batch update function
  // const processUpdateQueue = useCallback(() => {
  //   if (updateQueueRef.current.length === 0) {
  //     animationFrameRef.current = null;
  //     return;
  //   }

  //   const updates = updateQueueRef.current;
  //   updateQueueRef.current = [];

  //   setProcessedData((prevData) => {
  //     let hasChanges = false;
  //     const updatedData = prevData.map((item) => {
  //       let updatedItem = { ...item };
  //       let changed = false;

  //       updates.forEach((update) => {
  //         const { instrumentCrossRate, instrumentParitySpot } = update;

  //         if (
  //           instrumentCrossRate &&
  //           item.instrumentID === instrumentCrossRate.instrumentID &&
  //           item.secondaryInstrumentID ===
  //             instrumentCrossRate.secondaryInstrumentID
  //         ) {
  //           if (item.worldCrossBid !== instrumentCrossRate.bid) {
  //             updatedItem = {
  //               ...updatedItem,
  //               worldCrossBid: instrumentCrossRate.bid,
  //               worldCrossOffer: instrumentCrossRate.ask,
  //               time: instrumentCrossRate.updateDateTime,
  //               version: updatedItem.version + 1,
  //             };
  //             changed = true;
  //           }

  //           if (item.instrumentID === 21) {
  //             updatedItem = {
  //               ...updatedItem,
  //               worldCurBid: instrumentCrossRate.bid,
  //               worldCurOffer: instrumentCrossRate.ask,
  //               version: updatedItem.version + 1,
  //             };
  //             changed = true;
  //           }
  //         }

  //         if (
  //           instrumentParitySpot &&
  //           item.instrumentID === instrumentParitySpot.instrumentID &&
  //           item.instrumentID !== 21
  //         ) {
  //           if (
  //             Number(updatedItem.worldCurBid) !==
  //               Number(instrumentParitySpot.bid) ||
  //             Number(updatedItem.worldCurOffer) !==
  //               Number(instrumentParitySpot.ask)
  //           ) {
  //             updatedItem = {
  //               ...updatedItem,
  //               worldCurBid: instrumentParitySpot.bid,
  //               worldCurOffer: instrumentParitySpot.ask,
  //               version: updatedItem.version + 1,
  //             };
  //             changed = true;
  //           }
  //         }
  //       });

  //       return changed ? updatedItem : item;
  //     });

  //     hasChanges = updatedData.some(
  //       (newItem, index) => newItem !== prevData[index]
  //     );

  //     return hasChanges ? updatedData : prevData;
  //   });
  // }, []);

  // // ✅ Queue update
  // const queueUpdate = useCallback(
  //   (feed) => {
  //     if (!feed) return;

  //     const now = Date.now();
  //     if (now - lastUpdateRef.current < 16) return; // ~60fps
  //     lastUpdateRef.current = now;

  //     updateQueueRef.current.push(feed);

  //     if (!animationFrameRef.current) {
  //       animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
  //     }
  //   },
  //   [processUpdateQueue]
  // );

  // // ✅ Feed update effect
  // useEffect(() => {
  //   if (!feedEssentials || !fullFeed) return;
  //   queueUpdate(fullFeed);
  // }, [feedEssentials, fullFeed, queueUpdate]);

  // // Cleanup
  // useEffect(() => {
  //   return () => {
  //     if (animationFrameRef.current) {
  //       cancelAnimationFrame(animationFrameRef.current);
  //     }
  //   };
  // }, []);
  //   useEffect(() => {
  //     if (GetCurrencyCrosses && otherInstruments) {
  //       const updatedCurrencyCrosses = GetCurrencyCrosses.map((cross) => {
  //         const matchedInstrument = otherInstruments.find(
  //           (instrument) => instrument.instrumentId === cross.instrumentId
  //         );

  //         console.log(updatedCurrencyCrosses, "CurrencmatchedInstrumentyCrosses");

  //         return {
  //           ...cross,
  //           instrument: matchedInstrument ? matchedInstrument.name : null,
  //         };
  //       });

  //       setProcessedData(updatedCurrencyCrosses);
  //     }
  //   }, [GetCurrencyCrosses, otherInstruments]);

  // Columns
  const columns = useMemo(
    () => [
      {
        title: "Currency Crosses",
        children: [
          { title: "Instrument", dataIndex: "instrumentName" },
          {
            title: "Bid",
            dataIndex: "bid",
            className: "bidCol",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Ask",
            dataIndex: "ask",
            className: "offerCol",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "High",
            dataIndex: "high",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Low",
            dataIndex: "low",
            className: "offerCol",
            width: 90,

            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "% Change",
            dataIndex: "percentageChange",
            className: "offerCol",
            width: 120,

            render: (text) => {
              if (text === "-") return null;

              const value = Number(text);

              let cellClassName =
                value < 0
                  ? "color-red"
                  : value > 0
                  ? "color-green"
                  : "color-blue";

              return <IndexCell value={value} CellClassName={cellClassName} />;
            },
          },
          {
            title: "Time",
            dataIndex: "time",
            width: 90,

            render: (text) =>
              text
                ? formatDateUTCToGMT(text).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
    ],
    []
  );
  // ✅ Enriched base data
  const enrichedData = useMemo(() => {
    if (!otherInstruments || !currencyCrosses) return [];

    try {
      return otherInstruments.map((instrument) => {
        const matchedCross = currencyCrosses.find(
          (wc) => Number(wc.instrumentId) === instrument.instrumentId
        );
        return {
          instrumentID: Number(instrument.instrumentId),
          instrumentName: instrument.name,
          time: matchedCross?.time ?? "",

          bid: Number(matchedCross?.bid ?? 0),
          ask: Number(matchedCross?.ask ?? 0),
          high: Number(matchedCross?.high ?? 0),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentChange ?? 0),

          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [otherInstruments, currencyCrosses]);

  // Initialize processed data when enriched data changes
  useEffect(() => {
    if (enrichedData.length > 0) {
      dataRef.current = enrichedData;
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);
  return (
    <GlobalTable
      columns={columns}
      dataSource={processedData}
      prefixCls={
        processedData.length > 0 ? "managementTables" : "managementTables_Empty"
      }
      pagination={false}
      scroll={{ y: 265 }}
    />
  );
});

export default CurrencyCrosses;
