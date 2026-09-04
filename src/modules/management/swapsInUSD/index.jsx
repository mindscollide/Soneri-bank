import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "../management.module.css";
import { clearSwapsinUSDForManagementFeed } from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import dayjs from "dayjs";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";
import NoDataOverlay from "../../../shareComponents/elements/soneriLoader/NoDataOverlay";
import { convertUTCToLocal } from "../../../common/utils";
import DownloadHistoryPopover from "../../../shareComponents/commonComponents/elements/downloadHistoryPopover";
import { useDownloadHistoryContextMenu } from "../../../hook/useDownloadHistoryContextMenu";

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

  const pairMappingRef = useRef({}); // currencyPair (short code) → currencyPairFull

  const swapsinUSDList = useSelector(GetSwapsInUSDForTreasury, shallowEqual);
  const fullFeed = useSelector(swapsinUSDForManagementFeed, shallowEqual);

  const initialLatestDate = swapsinUSDList?.datetime ?? "";

  const [latestDate, setLatestDate] = useState(initialLatestDate);
  const latestDateRef = useRef(initialLatestDate);

  useEffect(() => {
    if (initialLatestDate && initialLatestDate !== latestDateRef.current) {
      latestDateRef.current = initialLatestDate;
      setLatestDate(initialLatestDate);
    }
  }, [initialLatestDate]);
  // ─────────────────────────────
  // Derive currency list + row data together, synchronously, in the same
  // render pass — this is what columnDefs and rowData below are built from,
  // so they can never go out of sync with each other (previously currencyList
  // was set as a side effect from inside an effect/onGridReady callback,
  // which meant rowData could be pushed into the grid via setGridOption
  // BEFORE columnDefs had a chance to recompute for the new currencies —
  // AG Grid would render once with mismatched columns, then do a full,
  // expensive column-group rebuild once state caught up on the next render).
  const { currencyList, rowData, pairMapping } = useMemo(() => {
    const data = swapsinUSDList?.swapsinUSDList;
    if (!Array.isArray(data) || data.length === 0) {
      return { currencyList: [], rowData: [], pairMapping: {} };
    }

    try {
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

      // 🔹 Group by Tenor (row-wise)
      const grouped = {};
      data.forEach((item) => {
        const tenor = item.tenor;
        const full = item.currencyPairFull || pairMapping[item.currencyPair];
        if (!grouped[tenor]) {
          grouped[tenor] = {
            tenorName: tenor,
            tenorId: item.tenorID,
          };
        }

        grouped[tenor][`${full}_bid`] = item.bid;
        grouped[tenor][`${full}_ask`] = item.ask;
        grouped[tenor][`${full}_currencyPair`] = item.currencyPair;
        grouped[tenor][`${full}_currencyPairFull`] = full;
      });

      return {
        currencyList: Array.from(currencySet),
        rowData: Object.values(grouped),
        pairMapping,
      };
    } catch (error) {
      console.error("Error building row data:", error);
      return { currencyList: [], rowData: [], pairMapping: {} };
    }
  }, [swapsinUSDList]);

  // Keep the ref in sync so queueUpdate (a stable useCallback) can always
  // resolve the live feed's short currencyPair code to the same full name
  // the initial columns were built with.
  useEffect(() => {
    pairMappingRef.current = pairMapping;
  }, [pairMapping]);

  // ─────────────────────────────
  // Rebuild rowNodeMap + overlay whenever rowData actually changes
  useEffect(() => {
    const api = gridApiRef.current;
    if (!api) return;

    if (rowData.length === 0) {
      api.showNoRowsOverlay();
    } else {
      api.hideOverlay();
    }

    rowNodeMap.current.clear();
    api.forEachNode((node) => {
      if (node.data?.tenorName) {
        rowNodeMap.current.set(node.data.tenorName, node);
      }
    });
  }, [rowData]);

  // ─────────────────────────────
  const onGridReady = useCallback((params) => {
    if (!isMountedRef.current) return;
    gridApiRef.current = params.api;
  }, []);

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
      if (!feed?.payload?.swaapsInUSD || !isMountedRef.current) return;
      const { dateTime, payload } = feed;
      const { currencyPair, currencyPairFull, tenor, bid, ask } =
        payload.swaapsInUSD;

      let converDateTime = convertUTCToLocal(dateTime);
      if (converDateTime && converDateTime !== latestDateRef.current) {
        latestDateRef.current = converDateTime;
        setLatestDate(converDateTime);
      }
      // Live feed messages almost always carry currencyPairFull as null —
      // resolve the short code through the same mapping the columns were
      // built from, so the key actually matches an existing column field.
      const full =
        currencyPairFull ||
        pairMappingRef.current[currencyPair] ||
        currencyPair;
      const bidKey = `${full}_bid`;
      const askKey = `${full}_ask`;

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
    [processQueue],
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
    [],
  );
  // Right-click on ANY cell (not just the Tenor column) needs to resolve
  // that specific instrument's id + the row's tenor id — a Bid/Offer cell
  // belongs to a currency-pair column (e.g. "USD/PKR_bid"), so pull the
  // currency prefix back out of the column id and read the matching
  // hidden id fields captured alongside bid/ask when the rows were built.
  const resolveSwapsInUSDData = useCallback((event) => {
    const colId = event.column?.getColId?.();
    const row = event.data ?? {};

    const currency = colId.replace(/_(bid|ask)$/, "");
    console.log(row, currency, colId, "resolveSwapsInUSDData");
    return {
      tenorName: row.tenorName,
      tenorId: row.tenorId,
      currencyPair: row[`${currency}_currencyPair`],
      currencyPairFull: row[`${currency}_currencyPairFull`],
    };
  }, []);

  // Any value cell (Bid/Offer), but explicitly NOT the Tenor column.
  const matchValueColumn = useCallback(
    (colId) => Boolean(colId) && colId !== "tenorName",
    [],
  );

  const {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  } = useDownloadHistoryContextMenu(
    matchValueColumn,
    "SwapsInUSD",
    resolveSwapsInUSDData,
  );

  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}>
        <span>Swaps in USD</span>
        <span className={styles.management_date}>
          {latestDate && dayjs(latestDate).format("DD-MMM-YYYY h:mm A")}
        </span>
      </span>

      <div
        style={{ height: "300px", width: "100%" }}
        onContextMenu={(e) => e.preventDefault()}>
        <AgGridTable
          ref={agGridComponentRef}
          rowData={rowData}
          columnDefs={columnDefs}
          className='swapsInUSDManagement-grid'
          getRowId={getRowId}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          onCellContextMenu={onCellContextMenu}
          domLayout='normal'
          theme='legacy'
          defaultColDef={defaultColDef}
          suppressScrollOnNewData={true}
          suppressAnimationFrame={false}
          suppressCellFocus={true}
          loadingOverlayComponent={SectionLoader}
          noRowsOverlayComponent={NoDataOverlay}
        />
      </div>

      <DownloadHistoryPopover
        popover={popover}
        onDownload={handleDownloadHistoryClick}
        onClose={closePopover}
      />
    </>
  );
});

SwapsInUSD.displayName = "SwapsInUSD";

export default SwapsInUSD;
