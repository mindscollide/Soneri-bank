import React, { useEffect, useMemo, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetIndicativeFBPRates = (state) =>
  state.WatchListReducer.GetIndicativeFBPRates;
const treasuryRateSheetIndicativeFBPRates = (state) =>
  state.RealtimeActionsSlice.treasuryRateSheetIndicativeFBPRates;

const IndicativeFBPRates = () => {
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
      (a, b) => a.displayOrderPriority - b.displayOrderPriority
    );
  };

  const generateColumns = (tenors) => {
    const baseColumn = [
      {
        title: "Currency",
        dataIndex: "currencyName",
        key: "currencyName",
        align: "center",
        width: 120,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      title: tenor.tenorName.toUpperCase(),
      dataIndex: `tenorId_${tenor.tenorId}_value`,
      key: `tenor_${tenor.tenorId}`,
      align: "center",
      width: 110,
      render: (value) => (value ? Number(value).toFixed(2) : "-"),
    }));
    return [...baseColumn, ...tenorColumns];
  };
  const tenors = useMemo(() => {
    if (!fbpRates?.fbpRates) return [];
    return getUniqueTenors(fbpRates.fbpRates);
  }, [fbpRates]);

  const columns = useMemo(() => {
    return generateColumns(tenors);
  }, [tenors]);

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
          }, {})
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
        })
      );
    }
  }, [fullFeed]);

  return (
    <>
      <span className={styles.tableheaderbar_SOFR}>Indicative FBP Rates</span>
      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0 ? "rateSheetTable" : "rateSheetTable_Empty"
        }
        pagination={false}
        scroll={{ y: 225, x: "max-content" }}
      />
    </>
  );
};

export default IndicativeFBPRates;
