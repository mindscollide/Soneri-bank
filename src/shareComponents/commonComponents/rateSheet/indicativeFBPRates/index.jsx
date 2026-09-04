import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import styles from "../RateSheet.module.css";
import "../rateSheetAgGrid.css";
import AgGridTable from "../../elements/globalAgGridTable";
import SectionLoader from "../../../elements/soneriLoader/SectionLoader";
import NoDataOverlay from "../../../elements/soneriLoader/NoDataOverlay";
import { useSelector } from "react-redux";

const GetIndicativeFBPRates = (state) =>
  state.WatchListReducer.GetIndicativeFBPRates;
const treasuryRateSheetIndicativeFBPRates = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetIndicativeFBPRates;

const IndicativeFBPRates = memo(forwardRef((_props, ref) => {
  const [processedData, setProcessedData] = useState([]);
  const fbpRates = useSelector(GetIndicativeFBPRates);
  const fullFeed = useSelector(treasuryRateSheetIndicativeFBPRates);

  const getUniqueTenors = (data) => {
    const tenorMap = new Map();

    data.forEach((item) => {
      if (!tenorMap.has(item.tenorId)) {
        tenorMap.set(item.tenorId, {
          tenorId: item.tenorId,
          tenorName: item.tenor,
          // displayOrderPriority: item.displayOrderPriority,
        });
      }
    });

    return Array.from(tenorMap.values()).sort(
      (a, b) => a.displayOrderPriority - b.displayOrderPriority,
    );
  };

  const generateColumns = (tenors) => {
    const baseColumn = [
      {
        headerName: "Currency",
        field: "currencyName",
        cellClass: "rs-first-col",
        width: 150,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      headerName: tenor.tenorName.toUpperCase(),
      field: `tenorId_${tenor.tenorId}_value`,
      flex: 1,
      valueFormatter: ({ value }) => (value ? Number(value).toFixed(2) : "-"),
    }));
    return [...baseColumn, ...tenorColumns];
  };
  const tenors = useMemo(() => {
    if (!fbpRates?.fbpRates) return [];
    return getUniqueTenors(fbpRates.fbpRates);
  }, [fbpRates]);

  const columnDefs = useMemo(() => {
    return generateColumns(tenors);
  }, [tenors]);

  const defaultColDef = useMemo(
    () => ({
      resizable: false,
      sortable: false,
      suppressMovable: true,
    }),
    [],
  );

  useEffect(() => {
    if (fbpRates?.fbpRates) {
      try {
        const { fbpRates: fbpRatesData } = fbpRates;

        const grouped = Object.values(
          fbpRatesData.reduce((acc, item) => {
            const { currency, tenorId, value } = item;

            if (!acc[currency]) {
              acc[currency] = {
                currencyName: currency,
              };
            }

            // Create dynamic key
            acc[currency][`tenorId_${tenorId}_value`] = value;

            return acc;
          }, {}),
        );
        setProcessedData(grouped);
      } catch (error) {
        console.error(error);
      }
    }
  }, [fbpRates]);

  // MQTT Work
  // ✅ Batch update function
  // (row) => row.currencyName === currency;
  useEffect(() => {
    if (fullFeed && fullFeed.fbp) {
      const { currency, tenorId, value } = fullFeed.fbp;

      setProcessedData((prev) =>
        prev.map((row) => {
          if (row.currencyName === currency) {
            return {
              ...row,
              [`tenorId_${tenorId}_value`]: Number(value),
            };
          }
          return row;
        }),
      );
    }
  }, [fullFeed]);

  useImperativeHandle(
    ref,
    () => ({
      getExportData: () => ({
        headers: columnDefs.map((col) => col.headerName),
        rows: processedData.map((row) =>
          columnDefs.map((col) =>
            col.valueFormatter
              ? col.valueFormatter({ value: row[col.field] })
              : (row[col.field] ?? "-"),
          ),
        ),
      }),
    }),
    [columnDefs, processedData],
  );

  return (
    <>
      <span className={styles.tableheaderbar_SOFR}>Indicative FBP Rates</span>
      <AgGridTable
        className='rsAgGrid'
        style={{
          height:
            32 + (processedData.length === 0 ? 4 : processedData.length) * 32,
        }}
        rowData={processedData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(p) => String(p.data.currencyName)}
        suppressColumnVirtualisation={true}
        animateRows={false}
        loadingOverlayComponent={SectionLoader}
        noRowsOverlayComponent={NoDataOverlay}
      />
    </>
  );
}));

IndicativeFBPRates.displayName = "IndicativeFBPRates";

export default IndicativeFBPRates;
