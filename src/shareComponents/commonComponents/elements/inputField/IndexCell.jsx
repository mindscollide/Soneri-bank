import { memo } from "react";

export const IndexCell = memo(({ value, record, CellClassName }) => {
  const formatNumber = (num) => {
    if (
      num === null ||
      num === undefined ||
      num === "" ||
      num === "-" ||
      Number(num) === 0
    )
      return "-";
    return new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return <span className={CellClassName}>{formatNumber(value)}</span>;
});
