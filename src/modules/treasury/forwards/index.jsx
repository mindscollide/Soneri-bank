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
    (state) => state.WatchListReducer.getAllTenors,
    shallowEqual
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
    console.log('🏗️ Built grid data:', {
      rows: result.rowData?.length,
      columns: result.columnDefs?.length
    });
    return result;
  }, [
    getAllTenorsRecords,
    allInstrumentForTreasuryData,
    GetBankForwardForTreasury,
  ]);

  // 2. Map Row Nodes to Map for O(1) Access
  const updateNodeMap = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) {
      console.warn('updateNodeMap: API not available');
      return;
    }

    rowNodeMap.current.clear();
    api.forEachNode((node) => {
      if (node.data?.tenorID) {
        rowNodeMap.current.set(String(node.data.tenorID), node);
      }
    });
    
    console.log('🗺️ Node map updated, size:', rowNodeMap.current.size, 'tenorIDs:', Array.from(rowNodeMap.current.keys()));
  }, []);

  // 3. Optimized Processor (20fps Throttle)
  const processQueue = useCallback(() => {
    const api = gridRef.current?.api;
    
    if (!isMountedRef.current || !api) {
      console.warn('processQueue: Not mounted or API unavailable');
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
      const [tenorID, instrumentName] = key.split("|");
      const node = rowNodeMap.current.get(String(tenorID));

      if (node && node.data) {
        try {
          // Direct cell update via setDataValue
          node.setDataValue(`bid_${instrumentName}`, update.bid);
          node.setDataValue(`ask_${instrumentName}`, update.ask);
          updatedCount++;
        } catch (error) {
          console.error('Error updating node:', error, { tenorID, instrumentName });
        }
      } else {
        notFoundCount++;
        // Only warn if we have nodes (otherwise it's expected)
        if (rowNodeMap.current.size > 0) {
          console.warn(`Node not found for tenorID: ${tenorID}, available: [${Array.from(rowNodeMap.current.keys()).join(', ')}]`);
        }
      }
    });

    if (updatedCount > 0) {
      console.log(`✓ Updated ${updatedCount} cells${notFoundCount > 0 ? `, ${notFoundCount} not found` : ''}`);
    }

    rafRef.current = null;
  }, []);

  // Keep processQueueRef up to date
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // 4. Handle Real-time Feed Updates
  useEffect(() => {
    if (!TreasuryForwardRates || !allInstrumentForTreasuryData?.forwardInstruments) {
      return;
    }

    const feeds = Array.isArray(TreasuryForwardRates)
      ? TreasuryForwardRates
      : [TreasuryForwardRates];
    
    console.log('📨 New MQTT data received:', feeds.length, 'feeds');

    let updateCount = 0;
    feeds.forEach((feed) => {
      if (!feed.forwardRates) {
        console.warn('Feed has no forwardRates:', feed);
        return;
      }

      feed.forwardRates.forEach((rate) => {
        const inst = allInstrumentForTreasuryData.forwardInstruments.find(
          (i) => Number(i.instrumentID) === Number(rate.instrumentID)
        );

        if (inst) {
          const key = `${rate.tenorID}|${inst.instrumentName}`;
          pendingUpdates.current.set(key, {
            bid: rate.bidWithSpread,
            ask: rate.askWithSpread,
          });
          updateCount++;
        }
      });
    });

    console.log(`📊 Queued ${updateCount} updates, total pending: ${pendingUpdates.current.size}`);

    // Schedule processing if we have updates and nodes
    if (pendingUpdates.current.size > 0) {
      if (rowNodeMap.current.size === 0) {
        console.error('❌ Node map is empty! Attempting to rebuild...');
        updateNodeMap();
        
        // Retry after map rebuild
        setTimeout(() => {
          if (rowNodeMap.current.size > 0 && !rafRef.current) {
            rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
          }
        }, 100);
      } else {
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => processQueueRef.current?.());
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
  }, [TreasuryForwardRates, allInstrumentForTreasuryData, dispatch, updateNodeMap]);

  // 5. Detect rowData changes (add/remove rows)
  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api || !rowData) return;

    const prevRowData = currentRowDataRef.current;
    const hasChanged = 
      !prevRowData || 
      prevRowData.length !== rowData.length ||
      JSON.stringify(prevRowData.map(r => r.tenorID)) !== JSON.stringify(rowData.map(r => r.tenorID));

    if (hasChanged) {
      console.log('🔄 RowData changed:', {
        previous: prevRowData?.length || 0,
        current: rowData.length,
        tenorIDs: rowData.map(r => r.tenorID)
      });

      // Update the grid with new row data
      api.setGridOption("rowData", rowData);
      
      // Store current rowData for next comparison
      currentRowDataRef.current = rowData;

      // Rebuild node map after grid updates
      setTimeout(() => {
        updateNodeMap();
        console.log('✅ Grid updated with new rows');
      }, 100);
    }
  }, [rowData, updateNodeMap]);

  // 6. Handle dealerForwardTenorChanged flag (legacy support)
  useEffect(() => {
    if (dealerForwardTenorChanged) {
      console.log('⚡ dealerForwardTenorChanged flag detected');
      dispatch(setDealerForwardTenorChanged(null));
    }
  }, [dealerForwardTenorChanged, dispatch]);

  // 7. Grid Events
  const onGridReady = useCallback(
    (params) => {
      console.log('✅ Grid ready');
      currentRowDataRef.current = rowData;
      setTimeout(updateNodeMap, 100);
    },
    [updateNodeMap, rowData]
  );

  const onFirstDataRendered = useCallback(() => {
    console.log('✅ First data rendered');
    updateNodeMap();
  }, [updateNodeMap]);

  const onRowDataUpdated = useCallback(() => {
    console.log('🔃 Row data updated event fired');
    updateNodeMap();
  }, [updateNodeMap]);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    console.log('🎬 Component mounted');
    
    return () => {
      console.log('🛑 Component unmounting');
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
      <span className='flex-fill mt-3 fs-4 fw-bold color-black mb-1'>
        Bank Forwards
      </span>

      <div style={{ width: "100%" }}>
        <AgGridTable
          ref={gridRef}
          columnDefs={columnDefs}
          className='liveRates-grid'
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
        />
      </div>
    </div>
  );
});

Forwards.displayName = "Forwards";

export default Forwards;