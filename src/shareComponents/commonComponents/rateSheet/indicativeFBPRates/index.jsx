import React, { useEffect, useMemo, useState } from "react";
import styles from "../RateSheet.module.css";
import GlobalTable from "../../elements/table/GlobalTable";
import { useSelector } from "react-redux";

const GetIndicativeFBPRates = (state) =>
  state.WatchListReducer.GetIndicativeFBPRates;

const IndicativeFBPRates = () => {
  const [processedData, setProcessedData] = useState("");
  const fbpRates = useSelector(GetIndicativeFBPRates);
  // const lastUpdateRef = useRef(0);
  // const updateQueueRef = useRef([]);
  // const animationFrameRef = useRef(null);
  // const fullFeed = useSelector(sbpFXRevalRatesForManagementFeed);

  console.log(fbpRates, "fbpRatesfbpRates");
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

    console.log(tenors, "generateColumnsgenerateColumns");

    const tenorColumns = tenors.map((tenor) => ({
      title: tenor.tenorName.toUpperCase(),
      dataIndex: `tenorId_${tenor.tenorId}_value`,
      key: `tenor_${tenor.tenorId}`,
      align: "center",
      width: 110,
      render: (value) => value.toFixed(2) ?? "-",
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

  console.log(columns, "columnscolumns");
  useEffect(() => {
    if (fbpRates?.fbpRates) {
      try {
        const { fbpRates: fbpRatesData } = fbpRates;

        const uniqueTenors = Array.from(
          new Map(
            fbpRatesData.map((item) => [
              item.tenorId,
              {
                tenorId: item.tenorId,
                tenorName: item.tenorName,
              },
            ])
          ).values()
        );
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
        console.log(grouped, "grouped");
        console.log(uniqueTenors, "uniqueTenors");
      } catch (error) {
        console.error(error);
      }
    }
  }, [fbpRates]);
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
