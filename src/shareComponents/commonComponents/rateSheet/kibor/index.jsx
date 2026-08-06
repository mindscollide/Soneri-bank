import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import "../rateSheetAgGrid.css";
import AgGridTable from "../../elements/globalAgGridTable";
import { useSelector } from "react-redux";

const GetKiborDataForRateSheet = (state) =>
  state.WatchListReducer.GetKiborDataForRateSheet?.kiborList;

const treasuryRateSheetKibor = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetKibor;

const KIBOR = memo(() => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetKibor);

  const kiborList = useSelector(GetKiborDataForRateSheet);

  const columnDefs = useMemo(() => {
    if (!kiborList || kiborList.length === 0) return [];

    return kiborList.map((item, index) => ({
      headerName: item.tenor,
      field: item.tenor,
      flex: 1,
      cellClass: index === 0 ? "rs-first-col" : undefined,
    }));
  }, [kiborList]);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      minWidth: 90,
    }),
    [],
  );

  useEffect(() => {
    if (kiborList && kiborList.length > 0) {
      const row = {};

      kiborList.forEach((item) => {
        row[item.tenor] = Number(item.ask).toFixed(2);
      });

      const tableData = [{ key: "row-0", ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [kiborList]);

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
          const { kibor } = update;

          if (
            kibor &&
            item.tenor?.toLowerCase() === kibor.tenor?.toLowerCase()
          ) {
            if (Number(updatedItem.ask) !== Number(kibor.ask)) {
              updatedItem = {
                ...updatedItem,
                ask: kibor.ask,
                version: updatedItem.version + 1,
              };
              changed = true;
            }
          }
        });

        return changed ? updatedItem : item;
      });

      hasChanges = updatedData.some(
        (newItem, index) => newItem !== prevData[index],
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
      if (now - lastUpdateRef.current < 200) return; // rate sheet only needs a few updates/sec
      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
      }
    },
    [processUpdateQueue],
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
      <span className={styles.tableheaderbar_SOFR}>KIBOR</span>
      <AgGridTable
        className='rsAgGrid rsAgGrid--bold'
        style={{ height: 32 + Math.max(processedData.length, 1) * 32 }}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data.key)}
        suppressColumnVirtualisation={true}
        animateRows={false}
      />
    </>
  );
});

KIBOR.displayName = "KIBOR";

export default KIBOR;
