import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "../management.module.css";
import { clearSwapsinUSDForManagementFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import { convertCurrentTimeZone } from "../../../shareComponents/commonComponents/utils/timeFunction";
import dayjs from "dayjs";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";

// Selectors
const GetSwapsInUSDForTreasury = (state) =>
  state.WatchListReducer.GetSwapsInUSDForTreasury;

const swapsinUSDForManagementFeed = (state) =>
  state.RealtimeActionsSlice.swapsinUSDForManagementFeed;

const SwapsInUSD = memo(() => {
  const dispatch = useDispatch();

  const agGridComponentRef = useRef(null); // ✅ for ref={} prop on AgGridTable
  const gridApiRef = useRef(null); // ✅ for params.api in onGridReady
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);

  const [latestDate, setLatestDate] = useState("");
  const [currencyList, setCurrencyList] = useState([]);

  const swapsinUSDList = useSelector(GetSwapsInUSDForTreasury, shallowEqual);
  const fullFeed = useSelector(swapsinUSDForManagementFeed, shallowEqual);

  // ─────────────────────────────
  // Build row data from API
  const buildRowData = useCallback(() => {
    if (!swapsinUSDList?.swapsinUSDList) return [];

    try {
      setLatestDate(swapsinUSDList?.datetime);

      const data = swapsinUSDList.swapsinUSDList;

      // 🔹 Build currencyPair → currencyPairFull mapping
      const pairMapping = {};
      data.forEach((item) => {
        if (
          item.currencyPairFull &&
          item.currencyPairFull.includes(item.currencyPair)
        ) {
          pairMapping[item.currencyPair] = item.currencyPairFull;
        }
      });

      // 🔹 Get unique full currencies
      const currencySet = new Set();
      data.forEach((item) => {
        const full = item.currencyPairFull || pairMapping[item.currencyPair];
        if (full) currencySet.add(full);
      });

      const currencies = Array.from(currencySet);
      setCurrencyList(currencies);

      // 🔹 Group by Tenor (row-wise)
      const grouped = {};

      data.forEach((item) => {
        const tenor = item.tenor;
        const full = item.currencyPairFull || pairMapping[item.currencyPair];

        if (!grouped[tenor]) {
          grouped[tenor] = {
            tenorName: tenor,
          };
        }

        grouped[tenor][`${full}_bid`] = item.bid;
        grouped[tenor][`${full}_ask`] = item.ask;
      });

      return Object.values(grouped);
    } catch (error) {
      console.error("Error building row data:", error);
      return [];
    }
  }, [swapsinUSDList]);

  // ─────────────────────────────
  // ✅ FIX: Sync data into grid whenever API data arrives (handles race condition)
  useEffect(() => {
    if (!gridApiRef.current || !swapsinUSDList?.swapsinUSDList?.length) return;

    const rowData = buildRowData();
    if (rowData.length === 0) return;

    gridApiRef.current.setGridOption("rowData", rowData);

    // Rebuild rowNodeMap so live feed updates can target correct nodes
    rowNodeMap.current.clear();
    gridApiRef.current.forEachNode((node) => {
      if (node.data?.tenorName) {
        rowNodeMap.current.set(node.data.tenorName, node);
      }
    });
  }, [swapsinUSDList, buildRowData]);
  useEffect(() => {
    if (!gridApiRef.current) return;

    // ❌ Case: API returned null / empty
    if (!swapsinUSDList || !swapsinUSDList?.swapsinUSDList?.length) {
      gridApiRef.current.setGridOption("rowData", []); // clear grid
      gridApiRef.current.showNoRowsOverlay(); // ✅ show "no data"
      return;
    }

    // ✅ Case: Data exists
    gridApiRef.current.hideOverlay(); // remove loader / no rows
  }, [swapsinUSDList]);

  // ─────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      if (!isMountedRef.current) return;

      gridApiRef.current = params.api; // ✅ store actual AG Grid API

      const rowData = buildRowData();
      if (rowData.length > 0) {
        params.api.setGridOption("rowData", rowData);
        params.api.hideOverlay(); // ✅ ensure loader stops
      } else {
        params.api.showNoRowsOverlay(); // ✅ show empty UI immediately
      }
      // If data isn't ready yet, the useEffect above will handle it when it arrives
    },
    [buildRowData]
  );

  // ─────────────────────────────
  const onFirstDataRendered = useCallback((params) => {
    if (!isMountedRef.current) return;

    rowNodeMap.current.clear();
    params.api.forEachNode((node) => {
      if (node.data?.tenorName) {
        rowNodeMap.current.set(node.data.tenorName, node);
      }
    });
  }, []);

  // ─────────────────────────────
  // ✅ THROTTLED PROCESSOR
  const processQueue = useCallback(() => {
    if (
      !isMountedRef.current ||
      isProcessingRef.current ||
      !gridApiRef.current
    ) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    const timeSinceLastProcess = now - lastProcessTime.current;

    if (timeSinceLastProcess < 50) {
      rafRef.current = requestAnimationFrame(processQueue);
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    isProcessingRef.current = true;
    lastProcessTime.current = now;

    try {
      for (const [tenor, updates] of pendingUpdates.current.entries()) {
        let node = rowNodeMap.current.get(tenor);

        if (!node) {
          const newRow = {
            tenorName: tenor,
            ...updates.pairs,
          };

          gridApiRef.current.applyTransaction({ add: [newRow] });

          setTimeout(() => {
            gridApiRef.current.forEachNode((n) => {
              if (n.data.tenorName === tenor) {
                rowNodeMap.current.set(tenor, n);
              }
            });
          }, 0);
        } else {
          for (const [key, value] of Object.entries(updates.pairs)) {
            const currentValue = node.data[key];
            if (currentValue !== value) {
              node.setDataValue(key, value);
            }
          }
        }

        pendingUpdates.current.delete(tenor);
      }

      rafRef.current = null;
    } catch (error) {
      console.error("Error processing queue:", error);
      pendingUpdates.current.clear();
      rafRef.current = null;
    } finally {
      isProcessingRef.current = false;
    }
  }, []);

  // ─────────────────────────────
  // ✅ Queue with deduplication
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed?.swaapsInUSD || !isMountedRef.current) return;

      const { currencyPair, tenor, bid, ask } = feed.swaapsInUSD;
      const bidKey = `${currencyPair}_bid`;
      const askKey = `${currencyPair}_ask`;

      const existing = pendingUpdates.current.get(tenor) || {
        pairs: {},
      };

      existing.pairs[bidKey] = bid;
      existing.pairs[askKey] = ask;

      pendingUpdates.current.set(tenor, existing);

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(processQueue);
      }
    },
    [processQueue]
  );

  // ─────────────────────────────
  // ✅ Consume feed
  useEffect(() => {
    if (!fullFeed) return;

    if (Array.isArray(fullFeed)) {
      fullFeed.forEach(queueUpdate);
    } else {
      queueUpdate(fullFeed);
    }

    const clearTimeoutId = setTimeout(() => {
      if (isMountedRef.current && dispatch) {
        dispatch(clearSwapsinUSDForManagementFeed());
      }
    }, 200);

    return () => clearTimeout(clearTimeoutId);
  }, [fullFeed, queueUpdate, dispatch]);

  // ─────────────────────────────
  // ✅ Cleanup
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      pendingUpdates.current.clear();
      rowNodeMap.current.clear();
      isProcessingRef.current = false;
    };
  }, []);

  // ─────────────────────────────
  const columnDefs = useMemo(() => {
    const groupedColumns = currencyList.map((currency) => ({
      headerName: currency,
      cellClass: "instrument-cell",
      children: [
        {
          headerName: "Bid",
          field: `${currency}_bid`,
          width: 70,
          cellClass: "value-cell",
          valueFormatter: (p) =>
            p.value != null ? Number(p.value).toFixed(2) : "0.00",
        },
        {
          headerName: "Offer",
          field: `${currency}_ask`,
          width: 70,
          cellClass: "value-cell",
          valueFormatter: (p) =>
            p.value != null ? Number(p.value).toFixed(2) : "0.00",
        },
      ],
    }));

    return [
      {
        headerName: "",
        children: [
          {
            headerName: "Tenor",
            field: "tenorName",
            pinned: "left",
            width: 120,
            cellClass: "instrument-cell",
          },
        ],
      },
      ...groupedColumns,
    ];
  }, [currencyList]);

  const getRowId = useCallback((params) => params.data.tenorName, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
      editable: false,
    }),
    []
  );
  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>Swaps in USD</span>
        <span className={styles.management_date}>
          {latestDate && dayjs(latestDate).format("DD-MMM-YYYY h:mm A")}
        </span>
      </span>

      <div style={{ height: "300px", width: "100%" }}>
        <AgGridTable
          ref={agGridComponentRef}
          columnDefs={columnDefs}
          className="swapsInUSDManagement-grid"
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          domLayout="normal"
          theme="legacy"
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellFocus={true}
          loadingOverlayComponent={SectionLoader}
        />
      </div>
    </>
  );
});

SwapsInUSD.displayName = "SwapsInUSD";

export default SwapsInUSD;
