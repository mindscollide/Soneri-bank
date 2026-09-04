import React from "react";
import "./NoDataOverlay.css";

// AG Grid's noRowsOverlayComponent — shown whenever a table has no rows
// (empty API response, or an API call that failed and fell back to []).
const NoDataOverlay = () => {
  return (
    <div className="noDataOverlay">
      <svg
        className="noDataOverlay-icon"
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7L12 3L20 7M4 7L12 11M4 7V17L12 21M20 7L12 11M20 7V17L12 21M12 11V21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="3"
          y1="21"
          x2="21"
          y2="3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="noDataOverlay-text">No Data Found</span>
    </div>
  );
};

export default NoDataOverlay;
