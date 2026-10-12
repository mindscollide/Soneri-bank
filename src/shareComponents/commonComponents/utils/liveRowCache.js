// Keeps the latest live (MQTT) values of a grid outside the component, so they
// survive a tab switch / remount. Live patches go straight into AG Grid nodes
// and never reach the REST snapshot in Redux, so a rebuilt grid would otherwise
// fall back to stale snapshot values (e.g. USD rows that only change when the
// user updates a rate and are not re-sent by the stream).
//
// A new snapshot (fresh fetch / dealer change) supersedes the cached values.
export const createLiveRowCache = () => {
  const rows = new Map(); // rowKey -> { field: value }
  const state = { snapshot: null };

  const sameSnapshot = (a, b) =>
    Array.isArray(a) && Array.isArray(b)
      ? a.length === b.length && a.every((item, i) => item === b[i])
      : a === b;

  return {
    // Remember (merge) the given fields for a row
    remember(rowKey, fields) {
      rows.set(rowKey, { ...rows.get(rowKey), ...fields });
    },
    // Overlay cached values on freshly built rows. `snapshot` is the source
    // data (or an array of sources) the rows were built from.
    apply(rowData, getKey, snapshot) {
      if (!sameSnapshot(state.snapshot, snapshot)) {
        rows.clear();
        state.snapshot = snapshot;
      }
      if (rows.size === 0) return rowData;
      return rowData.map((row) => {
        const cached = rows.get(getKey(row));
        return cached ? { ...row, ...cached } : row;
      });
    },
  };
};
