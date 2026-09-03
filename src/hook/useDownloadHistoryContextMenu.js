import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setDownloadHistoryData,
  setDownloadHistoryModal,
} from "../store/slicers/watchListSlicer/WatchListSlicer";

// Shared right-click behavior for management tables: right-clicking a
// matching cell shows a small "Download History" popover at the cursor;
// clicking it hides the popover and opens the shared DownloadHistoryModal.
//
// `matchColumn` is one of:
//   - a field name (string) — only that column triggers the popover
//     (the original behavior: the table's first/instrument column)
//   - an array of field names — any of those columns trigger it
//   - "*" — any column triggers it
//   - a predicate function (colId) => boolean — for cases like Swaps in
//     USD, where the requirement is per-value-cell (any Bid/Offer cell,
//     to resolve THAT specific instrument + tenor) but explicitly NOT
//     the Tenor column itself.
//
// `resolveData` is optional: (event) => data. When omitted, the raw
// `event.data` (the whole row) is used, same as before. Tables that need
// to resolve column-specific identifiers (e.g. which currency pair a
// Bid/Offer cell belongs to) pass their own resolver.
export const useDownloadHistoryContextMenu = (
  matchColumn,
  path,
  resolveData,
) => {
  const dispatch = useDispatch();
  const [popover, setPopover] = useState(null); // { x, y, rowData } | null

  const onCellContextMenu = useCallback(
    (event) => {
      const colId = event.column?.getColId?.();
      const isMatch =
        typeof matchColumn === "function"
          ? matchColumn(colId)
          : matchColumn === "*"
            ? true
            : Array.isArray(matchColumn)
              ? matchColumn.includes(colId)
              : colId === matchColumn;

      if (!isMatch) return;

      event.event.preventDefault();

      setPopover({
        x: event.event.clientX,
        y: event.event.clientY,
        rowData: resolveData ? resolveData(event) : event.data,
      });
    },
    [matchColumn, resolveData],
  );

  const closePopover = useCallback(() => setPopover(null), []);

  const handleDownloadHistoryClick = useCallback(() => {
    dispatch(
      setDownloadHistoryData(
        popover ? { routePath: path, data: popover.rowData } : null,
      ),
    );
    dispatch(setDownloadHistoryModal(true));
    setPopover(null);
  }, [dispatch, popover, path]);

  return {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  };
};
