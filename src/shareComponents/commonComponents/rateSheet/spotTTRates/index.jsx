import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetSpotTTRatesForRateSheet = (state) =>
  state.WatchListReducer.GetSpotTTRatesForRateSheet;

const treasuryRateSheetSpotTTRatesFeed = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetSpotTTRates;

const SpotTTRates = () => {
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const spotTTRatesData = useSelector(GetSpotTTRatesForRateSheet);
  const fullFeed = useSelector(treasuryRateSheetSpotTTRatesFeed);

  useEffect(() => {
    if (spotTTRatesData && spotTTRatesData !== null) {
      const { spotTTRates } = spotTTRatesData;
      if (Array.isArray(spotTTRates)) {
        setProcessedData(spotTTRates);
      }
    }
  }, [spotTTRatesData]);

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

  // MQTT Work
  // ✅ Batch update function
  const processUpdateQueue = useCallback(() => {
    if (updateQueueRef.current.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const updates = updateQueueRef.current;
    updateQueueRef.current = [];

    setProcessedData((prevData) => {
      if (!Array.isArray(prevData)) return prevData;

      let hasChanges = false;
      const updatedData = prevData.map((item) => {
        let updatedItem = { ...item };
        let changed = false;

        updates.forEach((update) => {
          const { spotTTRates } = update;

          if (spotTTRates && item.instrumentID === spotTTRates.instrumentID) {
            if (
              Number(updatedItem.currencyName) !==
                Number(spotTTRates.currencyName) ||
              Number(updatedItem.currencyCode) !==
                Number(spotTTRates.currencyCode) ||
              Number(updatedItem.bid) !== Number(spotTTRates.bid) ||
              Number(updatedItem.offer) !== Number(spotTTRates.offer)
            ) {
              updatedItem = {
                ...updatedItem,
                currencyName: spotTTRates.currencyName,
                currencyCode: spotTTRates.currencyCode,
                bid: spotTTRates.bid,
                offer: spotTTRates.offer,
                version: updatedItem.version + 1,
              };
              changed = true;
            }
          }
        });

        return changed ? updatedItem : item;
      });

      hasChanges = updatedData.some(
        (newItem, index) => newItem !== prevData[index]
      );

      return hasChanges ? updatedData : prevData;
    });

    animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
  }, []);

  // ✅ Queue update
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // ~60fps
      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
      }
    },
    [processUpdateQueue]
  );
  // ✅ Feed update effect
  useEffect(() => {
    if (!fullFeed) return;
    queueUpdate(fullFeed);
  }, [fullFeed, queueUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <span className={styles.tableheaderbar}>Spot TT Rates</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
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
