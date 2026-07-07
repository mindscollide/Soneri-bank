import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "./forwards.module.css";

import {
  clearTreasuryForwardRates,
  setDealerForwardTenorChanged,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { buildForwardsAgGridTable } from "../../../shareComponents/commonComponents/utils/generateColumnsData";
import AgGridTable from "../../../shareComponents/commonComponents/elements/globalAgGridTable";
import { useMqttTopics } from "../../../hook/useMqttTopics";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";

const Forwards = memo(() => {
  useMqttTopics([`SBL_REAL_TIME_FEED_TREASURY`]);
  const dispatch = useDispatch();

  // --- Refs for Performance ---
  const gridRef = useRef(null);
  const rowNodeMap = useRef(new Map());
  const pendingUpdates = useRef(new Map());
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);
  const processQueueRef = useRef(null);
  const currentRowDataRef = useRef(null); // Track current rowData
  const isGridReadyRef = useRef(false);

  // --- Selectors ---
  const TreasuryForwardRates = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryForwardRates,
    shallowEqual
  );

  const GetBankForwardForTreasury = useSelector(
    (state) => state.WatchListReducer.GetBankForwardForTreasury,
    shallowEqual
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury,
    shallowEqual
  );
  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  const dealerForwardTenorChanged = useSelector(
    (state) => state.RealtimeActionsSlice.dealerForwardTenorChanged,
    shallowEqual
  );

  // 1. Build initial Row Data and Column Definitions
  const { rowData, columnDefs } = useMemo(() => {
    const result = buildForwardsAgGridTable(
      3,
      GetBankForwardForTreasury?.forwardRates || [],
      { tenors: getAllTenorsRecords?.tenors || [] },
      { instruments: allInstrumentForTreasuryData?.forwardInstruments || [] },
      IndexCell
    );

    return result;
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetBankForwardForTreasury,
  ]);

  // 2. Map Row Nodes to Map for O(1) Access
  const updateNodeMap = useCallback(() => {
    const api = gridRef.current?.api;

    if (!api || !isGridReadyRef.current) {
      return; // ✅ silently ignore (no warning spam)
    }

    rowNodeMap.current.clear();

    api.forEachNode((node) => {
      if (node.data?.tenorID) {
        rowNodeMap.current.set(String(node.data.tenorID), node);
      }
    });
  }, []);
  // 3. Optimized Processor (20fps Throttle)
  const processQueue = useCallback(() => {
    const api = gridRef.current?.api;

    if (!isMountedRef.current || !api) {
      console.warn("processQueue: Not mounted or API unavailable");
      rafRef.current = null;
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastProcessTime.current < 50) {
      rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
      return;
    }

    lastProcessTime.current = now;

    let updatedCount = 0;
    let notFoundCount = 0;

    // Process all pending updates
    const updates = Array.from(pendingUpdates.current.entries());
    pendingUpdates.current.clear();

    updates.forEach(([key, update]) => {
      const [tenorID, instrumentName] = key.split("_");
      const node = rowNodeMap.current.get(String(tenorID));

      console.log(update, node, key, "updateupdateupdate");

      if (node && node.data) {
        try {
          // Direct cell update via setDataValue
          node.setDataValue(`bid_${instrumentName}`, update.bid);
          node.setDataValue(`ask_${instrumentName}`, update.ask);
          updatedCount++;
        } catch (error) {
          console.error("Error updating node:", error, {
            tenorID,
            instrumentName,
          });
        }
      } else {
        notFoundCount++;
        // Only warn if we have nodes (otherwise it's expected)
        if (rowNodeMap.current.size > 0) {
          console.warn(
            `Node not found for tenorID: ${tenorID}, available: [${Array.from(
              rowNodeMap.current.keys()
            ).join(", ")}]`
          );
        }
      }
    });

    if (updatedCount > 0) {
      console.log(
        `✓ Updated ${updatedCount} cells${
          notFoundCount > 0 ? `, ${notFoundCount} not found` : ""
        }`
      );
    }

    rafRef.current = null;
  }, []);

  // Keep processQueueRef up to date
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // 4. Handle Real-time Feed Updates
  useEffect(() => {
    if (
      !TreasuryForwardRates ||
      !allInstrumentForTreasuryData?.forwardInstruments
    ) {
      return;
    }

    const feeds = Array.isArray(TreasuryForwardRates)
      ? TreasuryForwardRates
      : [TreasuryForwardRates];

    console.log("📨 New MQTT data received:", feeds.length, "feeds");

    let updateCount = 0;
    feeds.forEach((feed) => {
      if (!feed.forwardRates) {
        console.warn("Feed has no forwardRates:", feed);
        return;
      }

      feed.forwardRates.forEach((rate) => {
        const inst = allInstrumentForTreasuryData.forwardInstruments.find(
          (i) => Number(i.instrumentID) === Number(rate.instrumentID)
        );

        if (inst) {
          const key = `${rate.tenorID}_${inst.instrumentName}`;
          pendingUpdates.current.set(key, {
            bid: rate.bidWithSpread,
            ask: rate.askWithSpread,
          });
          updateCount++;
        }
      });
    });

    console.log(
      `📊 Queued ${updateCount} updates, total pending: ${pendingUpdates.current.size}`
    );

    // Schedule processing if we have updates and nodes
    if (pendingUpdates.current.size > 0) {
      if (rowNodeMap.current.size === 0) {
        // console.error("❌ Node map is empty! Attempting to rebuild...");
        updateNodeMap();

        // Retry after map rebuild
        setTimeout(() => {
          if (rowNodeMap.current.size > 0 && !rafRef.current) {
            rafRef.current = requestAnimationFrame(() =>
              processQueueRef.current?.()
            );
          }
        }, 100);
      } else {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() =>
            processQueueRef.current?.()
          );
        }
      }
    }

    // Clear Redux state after processing
    const clearId = setTimeout(() => {
      if (isMountedRef.current) {
        dispatch(clearTreasuryForwardRates());
      }
    }, 1000);

    return () => clearTimeout(clearId);
  }, [
    TreasuryForwardRates,
    allInstrumentForTreasuryData,
    dispatch,
    updateNodeMap,
  ]);

  useEffect(() => {
    const api = gridRef.current?.api;
    if (
      api &&
      dealerForwardTenorChanged !== null &&
      getAllTenorsRecords !== null
    ) {
      try {
        const { newIsForwardtenorList = [], removedtenorList = [] } =
          dealerForwardTenorChanged;

        const removedSet = new Set(removedtenorList.map((t) => t.tenorID));
        const addedSet = new Set(newIsForwardtenorList.map((t) => t.tenorID));

        if (!removedSet.size && !addedSet.size) {
          dispatch(setDealerForwardTenorChanged(null));
          return;
        }

        // 🔥 Get current rows from grid
        const existingRows = [];
        api.forEachNode((node) => {
          if (node.data) existingRows.push(node.data);
        });

        const existingMap = new Map(
          existingRows.map((r) => [String(r.tenorID), r])
        );

        // ---------------- REMOVE ----------------
        const toRemove = existingRows.filter((row) =>
          removedSet.has(row.tenorID)
        );

        // ---------------- ADD ----------------
        const referenceRow = existingRows[0] || null;

        console.log(referenceRow, "referenceRowreferenceRow");

        const toAdd = [];

        newIsForwardtenorList.forEach((addedTenor) => {
          if (existingMap.has(String(addedTenor.tenorID))) return;

          const fullTenor =
            getAllTenorsRecords.tenors.find(
              (t) => t.tenorID === addedTenor.tenorID
            ) || addedTenor;

          const previousRow = existingMap.get(String(addedTenor.tenorID));

          // 🔥 Build row (same logic as your reference)
          const newRow = {
            tenorID: fullTenor.tenorID,
            tenorName: fullTenor.tenorName,
            tenorDays: fullTenor.tenorDays,
          };
          console.log(referenceRow, newRow, "referenceRowreferenceRow");

          // Copy instrument columns from reference row
          if (referenceRow) {
            Object.keys(referenceRow).forEach((key) => {
              if (
                key.startsWith("InstrumentID_") ||
                key.startsWith("InstrumentName_") ||
                key.startsWith("bid_") ||
                key.startsWith("ask_")
              ) {
                newRow[key] =
                  previousRow?.[key] !== undefined ? previousRow[key] : "-";
              }
            });
          }

          toAdd.push(newRow);
        });

        // ---------------- APPLY TRANSACTION ----------------
        if (toAdd.length || toRemove.length) {
          console.log("⚡ Tenor Transaction", {
            add: toAdd.length,
            remove: toRemove.length,
          });

          api.applyTransaction({
            add: toAdd,
            remove: toRemove,
          });

          // 🔥 rebuild node map after change
          setTimeout(() => {
            updateNodeMap();

            // process MQTT updates after structure change
            if (pendingUpdates.current.size > 0 && !rafRef.current) {
              rafRef.current = requestAnimationFrame(() =>
                processQueueRef.current?.()
              );
            }
          }, 50);
        }

        dispatch(setDealerForwardTenorChanged(null));
      } catch (error) {
        console.error("Tenor sync error:", error);
      }
    }
  }, [dealerForwardTenorChanged, getAllTenorsRecords, updateNodeMap]);

  // 7. Grid Events
  const onGridReady = useCallback(
    (params) => {
      console.log("✅ Grid ready");

      isGridReadyRef.current = true;

      setTimeout(() => {
        updateNodeMap();
      }, 100);
    },
    [updateNodeMap]
  );

  const onFirstDataRendered = useCallback(() => {
    console.log("✅ First data rendered");
    updateNodeMap();
  }, [updateNodeMap]);

  const onRowDataUpdated = useCallback(() => {
    console.log("🔃 Row data updated event fired");
    updateNodeMap();
  }, [updateNodeMap]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    console.log("🎬 Component mounted");

    return () => {
      console.log("🛑 Component unmounting");
      isMountedRef.current = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingUpdates.current.clear();
      rowNodeMap.current.clear();
      currentRowDataRef.current = null;
    };
  }, []);

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
    <div className={styles.mainForwardTable}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        Bank Forwards
      </span>

      <AgGridTable
        ref={gridRef}
        columnDefs={columnDefs}
        className="liveRates-grid"
        rowData={rowData}
        getRowId={(params) => String(params.data.tenorID)}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onRowDataUpdated={onRowDataUpdated}
        suppressColumnVirtualisation={true}
        suppressRowVirtualisation={false}
        animateRows={false}
        headerHeight={35}
        rowHeight={32}
        defaultColDef={defaultColDef}
        suppressScrollOnNewData={true}
        suppressAnimationFrame={false}
        loadingOverlayComponent={SectionLoader}
      />
    </div>
  );
});

Forwards.displayName = "Forwards";

export default Forwards;
