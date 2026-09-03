import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setDownloadHistoryData,
  setDownloadHistoryModal,
} from "../store/slicers/watchListSlicer/WatchListSlicer";

// Shared right-click behavior for the first column of management tables:
// right-clicking that column's cell shows a small "Download History"
// popover at the cursor; clicking it hides the popover and opens the
// shared DownloadHistoryModal with the clicked row's data.
export const useDownloadHistoryContextMenu = (firstColumnField) => {
  const dispatch = useDispatch();
  const [popover, setPopover] = useState(null); // { x, y, rowData } | null

  const onCellContextMenu = useCallback(
    (event) => {
      if (event.column?.getColId?.() !== firstColumnField) return;

      event.event.preventDefault();

      setPopover({
        x: event.event.clientX,
        y: event.event.clientY,
        rowData: event.data,
      });
    },
    [firstColumnField],
  );

  const closePopover = useCallback(() => setPopover(null), []);

  const handleDownloadHistoryClick = useCallback(() => {
    dispatch(setDownloadHistoryData(popover?.rowData ?? null));
    dispatch(setDownloadHistoryModal(true));
    setPopover(null);
  }, [dispatch, popover]);

  return {
    popover,
    onCellContextMenu,
    closePopover,
    handleDownloadHistoryClick,
  };
};
