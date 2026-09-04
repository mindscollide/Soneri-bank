import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import "../rateSheetAgGrid.css";
import AgGridTable from "../../elements/globalAgGridTable";
import SectionLoader from "../../../elements/soneriLoader/SectionLoader";
import NoDataOverlay from "../../../elements/soneriLoader/NoDataOverlay";
import { useSelector } from "react-redux";

const GetSOFRDataForRateSheet = (state) =>
  state.WatchListReducer.GetSOFRDataForRateSheet?.sofrList;

const treasuryRateSheetSofr = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetSofr;

const SOFR = memo(forwardRef((_props, ref) => {
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const [processedData, setProcessedData] = useState([]);
  const fullFeed = useSelector(treasuryRateSheetSofr);

  const sofrList = useSelector(GetSOFRDataForRateSheet);

  const columnDefs = useMemo(() => {
    if (!sofrList || sofrList.length === 0) return [];

    return sofrList.map((item, index) => ({
      headerName: item.tenor,
      field: item.tenor,
          flex: 1,
      cellClass: index === 0 ? "rs-first-col" : undefined,
    }));
  }, [sofrList]);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      minWidth: 90,
    }),
    []
  );

  useEffect(() => {
    if (sofrList && sofrList.length > 0) {
      const row = {};

      sofrList.forEach((item) => {
        row[item.tenor] = Number(item.rate).toFixed(4);
      });

      const tableData = [{ key: "row-0", ...row }];

      dataRef.current = tableData;
      setProcessedData(tableData);
    }
  }, [sofrList]);

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
          const { sofr } = update;

          if (sofr && item.tenor === sofr.tenor) {
            if (Number(updatedItem.rate) !== Number(sofr.rate)) {
              updatedItem = {
                ...updatedItem,
                rate: sofr.rate,
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
      if (now - lastUpdateRef.current < 200) return; // rate sheet only needs a few updates/sec
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

  useImperativeHandle(
    ref,
    () => ({
      getExportData: () => ({
        headers: columnDefs.map((col) => col.headerName),
        rows: processedData.map((row) =>
          columnDefs.map((col) =>
            col.valueFormatter
              ? col.valueFormatter({ value: row[col.field] })
              : (row[col.field] ?? "-"),
          ),
        ),
      }),
    }),
    [columnDefs, processedData],
  );

  return (
    <>
      <span className={styles.tableheaderbar_SOFR}>SOFR</span>
      <AgGridTable
        className="rsAgGrid rsAgGrid--bold"
        style={{
          height:
            32 + (processedData.length === 0 ? 4 : processedData.length) * 32,
        }}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data.key)}
        suppressColumnVirtualisation={true}
        animateRows={false}
        loadingOverlayComponent={SectionLoader}
        noRowsOverlayComponent={NoDataOverlay}
      />
    </>
  );
}));

SOFR.displayName = "SOFR";

export default SOFR;
