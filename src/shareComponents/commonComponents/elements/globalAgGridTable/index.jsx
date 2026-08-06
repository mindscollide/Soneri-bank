import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";
import { AgGridReact } from "ag-grid-react";

import "./ag-grid.style.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const AgGridTable = forwardRef(
  (
    {
      className = "",
      style,
      onGridReady,
      onGridPreDestroyed,
      getRowId,
      headerHeight = 32,
      rowHeight = 32,
      rowBuffer = 10,
      animateRows = false,
      asyncTransactionWaitMillis = 50,
      ...gridProps
    },
    ref,
  ) => {
    const gridApiRef = useRef(null);

    const handleGridReady = useCallback(
      (params) => {
        gridApiRef.current = params.api;
        onGridReady?.(params);
      },
      [onGridReady],
    );

    const handleGridPreDestroyed = useCallback(
      (event) => {
        onGridPreDestroyed?.(event);
        gridApiRef.current = null;
      },
      [onGridPreDestroyed],
    );

    useImperativeHandle(
      ref,
      () => ({
        get api() {
          return gridApiRef.current;
        },

        applyTransaction(transaction) {
          return gridApiRef.current?.applyTransaction(transaction);
        },

        applyTransactionAsync(transaction, callback) {
          if (!transaction) return;

          gridApiRef.current?.applyTransactionAsync(
            transaction,
            callback,
          );
        },

        updateRows(rows, callback) {
          if (!Array.isArray(rows) || rows.length === 0) return;

          gridApiRef.current?.applyTransactionAsync(
            { update: rows },
            callback,
          );
        },

        addRows(rows, callback) {
          if (!Array.isArray(rows) || rows.length === 0) return;

          gridApiRef.current?.applyTransactionAsync(
            { add: rows },
            callback,
          );
        },

        removeRows(rows, callback) {
          if (!Array.isArray(rows) || rows.length === 0) return;

          gridApiRef.current?.applyTransactionAsync(
            { remove: rows },
            callback,
          );
        },

        setRowData(rows) {
          gridApiRef.current?.setGridOption(
            "rowData",
            Array.isArray(rows) ? rows : [],
          );
        },

        getRowNode(rowId) {
          if (rowId === null || rowId === undefined) return undefined;

          return gridApiRef.current?.getRowNode(String(rowId));
        },

        setCellValue(rowId, field, value) {
          if (rowId === null || rowId === undefined || !field) return;

          const rowNode =
            gridApiRef.current?.getRowNode(String(rowId));

          rowNode?.setDataValue(field, value);
        },

        refreshCells(params = {}) {
          gridApiRef.current?.refreshCells(params);
        },

        redrawRows(params = {}) {
          gridApiRef.current?.redrawRows(params);
        },

        flushAsyncTransactions() {
          gridApiRef.current?.flushAsyncTransactions();
        },
      }),
      [],
    );

    return (
      <div
        className={`ag-theme-alpine ${className}`.trim()}
        style={style}
      >
        <AgGridReact
          {...gridProps}
          getRowId={getRowId}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          rowBuffer={rowBuffer}
          animateRows={animateRows}
          asyncTransactionWaitMillis={
            asyncTransactionWaitMillis
          }
          onGridReady={handleGridReady}
          onGridPreDestroyed={handleGridPreDestroyed}
        />
      </div>
    );
  },
);

AgGridTable.displayName = "AgGridTable";

export default AgGridTable;