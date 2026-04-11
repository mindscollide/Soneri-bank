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

const AgGridTable = forwardRef((props, ref) => {
  const apiRef = useRef(null);
  const columnApiRef = useRef(null);

  const onGridReady = useCallback(
    (params) => {
      apiRef.current = params.api;
      columnApiRef.current = params.columnApi;

      props.onGridReady?.(params);
    },
    [props.onGridReady]
  );

  useImperativeHandle(ref, () => ({
    api: apiRef.current,
    columnApi: columnApiRef.current,
  }));

  return (
    <div className={`ag-theme-alpine ${props.className || ""}`}>
      <AgGridReact
        {...props}
        headerHeight={32}
        rowHeight={32}
        onGridReady={onGridReady}
      />
    </div>
  );
});

export default AgGridTable;
