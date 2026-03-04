import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";
const GetRevalRatesForTreasury = (state) =>
  state.WatchListReducer.GetRevalRatesForTreasury;

const SBPFXRevalRates = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const revalRatesList = useSelector(GetRevalRatesForTreasury);

  console.log(revalRatesList, "revalRatesListrevalRatesList");

  const getUniqueTenors = (data) => {
    const tenorMap = new Map();

    data.forEach((item) => {
      if (!tenorMap.has(item.tenorId)) {
        tenorMap.set(item.tenorId, {
          tenorId: item.tenorId,
          tenorName: item.tenorName,
          displayOrderPriority: item.displayOrderPriority,
        });
      }
    });

    return Array.from(tenorMap.values()).sort(
      (a, b) => a.displayOrderPriority - b.displayOrderPriority
    );
  };

  const generateColumns = (tenors) => {
    const baseColumn = [
      {
        title: "Currency",
        dataIndex: "currencyName",
        key: "currencyName",
        fixed: "left",
        width: 120,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      title: tenor.tenorName,
      dataIndex: `tenorId_${tenor.tenorId}_value`,
      key: `tenor_${tenor.tenorId}`,
      align: "center",
      width: 110,
      render: (value) => value ?? "-",
    }));
    return [...baseColumn, ...tenorColumns];
  };

  const tenors = useMemo(() => {
    if (!revalRatesList?.revalRatesList) return [];
    return getUniqueTenors(revalRatesList.revalRatesList);
  }, [revalRatesList]);

  const columns = useMemo(() => {
    return generateColumns(tenors);
  }, [tenors]);

  useEffect(() => {
    if (revalRatesList?.revalRatesList) {
      try {
        const { revalRatesList: revalRatesListData } = revalRatesList;

        const uniqueTenors = Array.from(
          new Map(
            revalRatesListData.map((item) => [
              item.tenorId,
              {
                tenorId: item.tenorId,
                tenorName: item.tenorName,
              },
            ])
          ).values()
        );
        const grouped = Object.values(
          revalRatesListData.reduce((acc, item) => {
            const { currency, tenorId, value } = item;

            if (!acc[currency]) {
              acc[currency] = {
                currencyName: currency,
              };
            }

            // Create dynamic key
            acc[currency][`tenorId_${tenorId}_value`] = value;

            return acc;
          }, {})
        );
        setProcessedData(grouped);
        console.log(grouped, "grouped");
        console.log(uniqueTenors, "uniqueTenors");
      } catch (error) {
        console.error(error);
      }
    }
  }, [revalRatesList]);
  // const fullFeed = useSelector(currencyCrossesRatesFeed);
  // const GetCurrencyCrosses = useSelector(
  //   SelectGetCurrencyCrosses,
  //   shallowEqual
  // );

  // ✅ Memoized essential feed values
  // const feedEssentials = useMemo(() => {
  //   if (!fullFeed) return null;

  //   return {
  //     crossBid: fullFeed.instrumentCrossRate?.bid,
  //     crossAsk: fullFeed.instrumentCrossRate?.ask,
  //     crossUpdateTime: fullFeed.instrumentCrossRate?.updateDateTime,
  //     crossInstrumentID: fullFeed.instrumentCrossRate?.instrumentID,
  //     crossSecondaryID: fullFeed.instrumentCrossRate?.secondaryInstrumentID,
  //     spotBid: fullFeed.instrumentParitySpot?.bid,
  //     spotAsk: fullFeed.instrumentParitySpot?.ask,
  //     spotInstrumentID: fullFeed.instrumentParitySpot?.instrumentID,
  //   };
  // }, [
  //   fullFeed?.instrumentCrossRate?.bid,
  //   fullFeed?.instrumentCrossRate?.ask,
  //   fullFeed?.instrumentCrossRate?.updateDateTime,
  //   fullFeed?.instrumentCrossRate?.instrumentID,
  //   fullFeed?.instrumentCrossRate?.secondaryInstrumentID,
  //   fullFeed?.instrumentParitySpot?.bid,
  //   fullFeed?.instrumentParitySpot?.ask,
  //   fullFeed?.instrumentParitySpot?.instrumentID,
  // ]);

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
  // const columns = useMemo(
  //   () => [
  //     {
  //       title: "",
  //       dataIndex: "instrumentName",
  //       ellipsis: true,
  //       width: 90,
  //     },
  //     {
  //       title: "Current",
  //       dataIndex: "current",
  //       className: "bidCol",
  //       width: 90,
  //       render: (text) => {
  //         return text !== "-" && <IndexCell value={text} />;
  //       },
  //     },
  //     {
  //       title: "Change",
  //       dataIndex: "change",
  //       className: "offerCol",
  //       ellipsis: true,
  //       width: 90,

  //       render: (text) => {
  //         return text !== "-" && <IndexCell value={text} />;
  //       },
  //     },
  //     {
  //       title: "% Change",
  //       dataIndex: "percentageChange",
  //       className: "offerCol",
  //       ellipsis: true,
  //       render: (text) => {
  //         if (text === "-") return null;

  //         const value = Number(text);

  //         let cellClassName =
  //           value < 0 ? "color-red" : value > 0 ? "color-green" : "color-blue";

  //         return <IndexCell value={value} CellClassName={cellClassName} />;
  //       },
  //     },
  //     {
  //       title: "High",
  //       dataIndex: "high",
  //       // width: 90,
  //       render: (text) => {
  //         return text !== "-" && <IndexCell value={text} />;
  //       },
  //     },
  //     {
  //       title: "Low",
  //       dataIndex: "low",
  //       className: "offerCol",
  //       // width: 90,

  //       render: (text) => {
  //         return text !== "-" && <IndexCell value={text} />;
  //       },
  //     },
  //     {
  //       title: "Volume",
  //       dataIndex: "volume",
  //       className: "offerCol",
  //       // width: 90,

  //       render: (text) => {
  //         return text !== "-" && <IndexCell value={text} />;
  //       },
  //     },
  //     {
  //       title: "Time",
  //       dataIndex: "time",
  //       // width: 90,

  //       render: (text) =>
  //         text
  //           ? formatDateUTCToGMT(text).toTimeString().substring(0, 8)
  //           : "--:--:--",
  //     },
  //   ],
  //   []
  // );
  // // ✅ Enriched base data
  // const enrichedData = useMemo(() => {
  //   if (!otherInstruments || !stockIndexList) return [];
  //   console.log(
  //     { otherInstruments, stockIndexList },
  //     "stockIndexListstockIndexList"
  //   );
  //   try {
  //     return otherInstruments.map((instrument) => {
  //       const matchedCross = stockIndexList.find(
  //         (wc) => Number(wc.instrumentId) === instrument.instrumentId
  //       );

  //       console.log(matchedCross, "matchedCrossmatchedCross");
  //       return {
  //         instrumentName: instrument.name,
  //         change: Number(matchedCross?.change ?? 0),
  //         current: Number(matchedCross?.current ?? 0),
  //         high: Number(matchedCross?.high ?? 0),
  //         instrumentID: Number(instrument.instrumentId),
  //         low: Number(matchedCross?.low ?? 0),
  //         percentageChange: Number(matchedCross?.percentChange ?? 0),
  //         time: matchedCross?.time ?? "",
  //         volume: Number(matchedCross?.change ?? 0),
  //         version: 0,
  //       };
  //     });
  //   } catch (error) {
  //     console.error("Error enriching data:", error);
  //     return [];
  //   }
  // }, [otherInstruments, stockIndexList]);

  // // Initialize processed data when enriched data changes
  // useEffect(() => {
  //   if (enrichedData.length > 0) {
  //     dataRef.current = enrichedData;
  //     setProcessedData(enrichedData);
  //   }
  // }, [enrichedData]);
  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SBP FX Reval Rates</span>
        <span className={styles.management_date}>10-Jan-2026</span>
      </span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables_sofr"
            : "managementTables_sofr_Empty"
        }
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default SBPFXRevalRates;
