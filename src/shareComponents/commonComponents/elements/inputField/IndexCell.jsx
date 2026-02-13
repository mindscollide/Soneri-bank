import { memo } from "react";

export const IndexCell = memo(({ value, record, CellClassName }) => {
  return <span className={CellClassName}>{value}</span>;
});
