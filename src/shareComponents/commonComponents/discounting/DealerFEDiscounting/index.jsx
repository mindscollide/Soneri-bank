import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import styles from "./dealerFEDiscountingTable.module.css";

import { UpdateDealerDiscountingRates } from "../../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  clearDealerDiscountingClearRates,
  clearTreasuryDealerFeDiscounting,
} from "../../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";

import { IndexCell } from "../../elements/inputField/IndexCell";
import { buildDiscountingAgGridTable } from "../../utils/generateColumnsData";
import AgGridTable from "../../elements/globalAgGridTable";
import SectionLoader from "../../../../shareComponents/elements/soneriLoader/SectionLoader";

// ─────────────────────────────────────────────
const THROTTLE_INTERVAL_MS = 50; // ~20fps

const DealerFeDiscountingTable = memo(() => {
  const dispatch = useDispatch();

  // --- Refs ---
  const gridRef = useRef(null);
  const rowNodeMap = useRef(new Map()); // TenorID (string) → rowNode
  const pendingUpdates = useRef(new Map()); // "TenorID|instrumentName" → rate value
  const rafRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastProcessTime = useRef(0);
  const processQueueRef = useRef(null);
  const isGridReadyRef = useRef(false);

  // --- Selectors ---
  const TreasuryDealerFeDiscounting = useSelector(
    (state) => state.RealtimeActionsSlice.TreasuryDealerFeDiscounting,
    shallowEqual
  );
  const GetDiscountingRatesForDealer = useSelector(
    (state) => state.WatchListReducer.GetDiscountingRatesForDealer,
    shallowEqual
  );
  const getAllTenorsRecords = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );
  const allInstrumentForTreasuryData = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury,
    shallowEqual
  );
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
  );
  const ClearRatesData = useSelector(
    (state) => state.RealtimeActionsSlice.DealerDiscountingClearRates,
    shallowEqual
  );

  // ── 1. Build initial rowData + columnDefs ──────────────────────────────────
  const { rowData, columnDefs } = useMemo(() => {
    const { feDiscountingRates = [] } = GetDiscountingRatesForDealer || {};

    return buildDiscountingAgGridTable(
      3,
      feDiscountingRates,
      { tenors: getAllTenorsRecords?.tenors || [] },
      {
        instruments: allInstrumentForTreasuryData?.discountingInstruments || [],
      },
      IndexCell
    );
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetDiscountingRatesForDealer,
  ]);

  // ── 2. Rebuild node map (TenorID — capital T) ─────────────────────────────
  const updateNodeMap = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api || !isGridReadyRef.current) return;

    rowNodeMap.current.clear();
    api.forEachNode((node) => {
      if (node.data?.TenorID != null) {
        rowNodeMap.current.set(String(node.data.TenorID), node);
      }
    });
  }, []);

  // ── 3. RAF-throttled queue processor (~20fps) ─────────────────────────────
  const processQueue = useCallback(() => {
    const api = gridRef.current?.api;

    if (!isMountedRef.current || !api) {
      rafRef.current = null;
      return;
    }

    if (pendingUpdates.current.size === 0) {
      rafRef.current = null;
      return;
    }

    const now = Date.now();
    if (now - lastProcessTime.current < THROTTLE_INTERVAL_MS) {
      rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
      return;
    }

    lastProcessTime.current = now;

    let updatedCount = 0;
    let notFoundCount = 0;

    const updates = Array.from(pendingUpdates.current.entries());
    pendingUpdates.current.clear();

    updates.forEach(([key, rate]) => {
      // key: "TenorID|instrumentName"  e.g. "5|USD"
      const [tenorID, instrumentName] = key.split("|");
      const node = rowNodeMap.current.get(String(tenorID));

      if (node && node.data) {
        try {
          node.setDataValue(`rate_${instrumentName}`, rate);
          updatedCount++;
        } catch (error) {
          console.error("Dealer FE Discounting: setDataValue error:", error, {
            tenorID,
            instrumentName,
          });
        }
      } else {
        notFoundCount++;
        if (rowNodeMap.current.size > 0) {
          console.warn(
            `Dealer FE Discounting: node not found for TenorID: ${tenorID}, available: [${Array.from(
              rowNodeMap.current.keys()
            ).join(", ")}]`
          );
        }
      }
    });

    if (updatedCount > 0) {
      console.log(
        `✓ Dealer FE Discounting: Updated ${updatedCount} cells${
          notFoundCount > 0 ? `, ${notFoundCount} not found` : ""
        }`
      );
    }

    rafRef.current = null;
  }, []);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // ── 4. Receive real-time MQTT feed ───────────────────────────────────────
  useEffect(() => {
    if (
      !TreasuryDealerFeDiscounting ||
      TreasuryDealerFeDiscounting.length === 0 ||
      !allInstrumentForTreasuryData?.discountingInstruments
    ) {
      return;
    }

    const feeds = Array.isArray(TreasuryDealerFeDiscounting)
      ? TreasuryDealerFeDiscounting
      : [TreasuryDealerFeDiscounting];

    console.log("📨 Dealer FE Discounting: MQTT feeds received:", feeds.length);

    let updateCount = 0;

    feeds.forEach((feed) => {
      const rates = feed?.feDiscountingRates ?? [];

      rates.forEach((rate) => {
        const inst = allInstrumentForTreasuryData.discountingInstruments.find(
          (i) => Number(i.instrumentID) === Number(rate.instrumentID)
        );

        if (inst) {
          const key = `${rate.tenorID}|${inst.instrumentName}`;
          pendingUpdates.current.set(key, rate.bidWithSpread);
          updateCount++;
        }
      });
    });

    console.log(
      `📊 Dealer FE Discounting: Queued ${updateCount} updates, pending: ${pendingUpdates.current.size}`
    );

    if (pendingUpdates.current.size > 0) {
      if (rowNodeMap.current.size === 0) {
        updateNodeMap();
        setTimeout(() => {
          if (rowNodeMap.current.size > 0 && !rafRef.current) {
            rafRef.current = requestAnimationFrame(() =>
              processQueueRef.current?.()
            );
          }
        }, 100);
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() =>
          processQueueRef.current?.()
        );
      }
    }

    const clearId = setTimeout(() => {
      if (isMountedRef.current) dispatch(clearTreasuryDealerFeDiscounting());
    }, 1000);

    return () => clearTimeout(clearId);
  }, [
    TreasuryDealerFeDiscounting,
    allInstrumentForTreasuryData,
    dispatch,
    updateNodeMap,
  ]);

  // ── 5. Market closed → zero all rate cells ───────────────────────────────
  useEffect(() => {
    const api = gridRef.current?.api;
    if (marketStatus === false && api && isGridReadyRef.current) {
      api.forEachNode((node) => {
        if (!node.data) return;
        Object.keys(node.data).forEach((key) => {
          if (key.startsWith("rate_")) node.setDataValue(key, 0);
        });
      });
      console.log("📴 Dealer FE Discounting: Market closed — rates zeroed");
    }
  }, [marketStatus]);

  // ── 6. Global Clear Rates ────────────────────────────────────────────────
  useEffect(() => {
    if (!ClearRatesData?.areRatesClear) return;

    const api = gridRef.current?.api;

    try {
      if (GetDiscountingRatesForDealer?.feDiscountingRates?.length) {
        // Dispatch zeroed rates → triggers useMemo → grid refreshes automatically
        const clearedDiscountingRates =
          GetDiscountingRatesForDealer.feDiscountingRates.map((item) => ({
            ...item,
            rate: "0",
          }));

        dispatch(
          UpdateDealerDiscountingRates({
            ...GetDiscountingRatesForDealer,
            feDiscountingRates: clearedDiscountingRates,
          })
        );
      } else if (api && isGridReadyRef.current) {
        // Fallback: zero cells directly on the grid
        api.forEachNode((node) => {
          if (!node.data) return;
          Object.keys(node.data).forEach((key) => {
            if (key.startsWith("rate_")) node.setDataValue(key, 0);
          });
        });
      }

      dispatch(clearDealerDiscountingClearRates());
    } catch (error) {
      console.error("Dealer FE Discounting: Clear Rates Error:", error);
    }
  }, [ClearRatesData, GetDiscountingRatesForDealer, dispatch]);

  // ── 7. Grid lifecycle events ─────────────────────────────────────────────
  const onGridReady = useCallback(
    (params) => {
      console.log("✅ Dealer FE Discounting Grid ready");
      isGridReadyRef.current = true;
      setTimeout(() => updateNodeMap(), 100);
    },
    [updateNodeMap]
  );

  const onFirstDataRendered = useCallback(() => {
    console.log("✅ Dealer FE Discounting: First data rendered");
    updateNodeMap();
  }, [updateNodeMap]);

  const onRowDataUpdated = useCallback(() => {
    console.log("🔃 Dealer FE Discounting: Row data updated");
    updateNodeMap();
  }, [updateNodeMap]);

  // ── 8. Cleanup ───────────────────────────────────────────────────────────
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
    <div className={styles["mainDiscountingTable"]}>
      <span className="flex-fill mt-3 fs-4 fw-bold color-black mb-1">
        FE Discounting
      </span>

      <AgGridTable
        ref={gridRef}
        columnDefs={columnDefs}
        className="fe-discounting-grid"
        rowData={rowData}
        getRowId={(params) => String(params.data.TenorID)}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onRowDataUpdated={onRowDataUpdated}
        suppressColumnVirtualisation={true}
        suppressRowVirtualisation={false}
        animateRows={false}
        headerHeight={35}
        groupHeaderHeight={35}
        rowHeight={32}
        defaultColDef={defaultColDef}
        suppressScrollOnNewData={true}
        suppressAnimationFrame={false}
        loadingOverlayComponent={SectionLoader}
      />
    </div>
  );
});

DealerFeDiscountingTable.displayName = "DealerFeDiscountingTable";

export default DealerFeDiscountingTable;
