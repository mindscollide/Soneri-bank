import React, { useEffect, useRef } from "react";
import "./downloadHistoryPopover.css";

// Small fixed-position popover shown at the cursor on right-click.
// Closes on outside click or Escape.
const DownloadHistoryPopover = ({ popover, onDownload, onClose }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!popover) return;

    const handleOutsideClick = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [popover, onClose]);

  if (!popover) return null;

  return (
    <div
      ref={popoverRef}
      className="downloadHistoryPopover"
      style={{ top: popover.y, left: popover.x }}
    >
      <button
        type="button"
        className="downloadHistoryPopover-btn"
        onClick={onDownload}
      >
        Download History
      </button>
    </div>
  );
};

export default DownloadHistoryPopover;
