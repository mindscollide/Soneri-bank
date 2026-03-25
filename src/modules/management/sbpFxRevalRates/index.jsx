import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";
import { formatCompactDate } from "../../../utils/timeFunction";
const GetRevalRatesForTreasury = (state) =>
  state.WatchListReducer.GetRevalRatesForTreasury;

const sbpFXRevalRatesForManagementFeed = (state) =>
  state.RealtimeActionsSlice.sbpFXRevalRatesForManagementFeed;

const SBPFXRevalRates = memo(() => {
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const revalRatesList = useSelector(GetRevalRatesForTreasury);
  const fullFeed = useSelector(sbpFXRevalRatesForManagementFeed);

  // Local state for processed data
  const [processedData, setProcessedData] = useState([]);
  const [latestDate, setLatestDate] = useState("");

  console.log(fullFeed, "fullFeedRevalRaters");

  const getUniqueTenors = (data) => {
    const tenorMap = new Map();

    data.forEach((item) => {
      if (!tenorMap.has(item.tenorId)) {
        tenorMap.set(item.tenorId, {
          tenorId: item.tenorId,
          tenorName: item.tenorName,
          displayOrderPriority: item.displayOrderPriority,
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
        fixed: "left",
        align: "left",
        width: 120,
      },
    ];

    const tenorColumns = tenors.map((tenor) => ({
      title: tenor.tenorName,
      dataIndex: `tenorId_${tenor.tenorId}_value`,
      key: `tenor_${tenor.tenorId}`,
      align: "center",
      width: 110,
      render: (value) => value ?? "-",
    }));
    return [...baseColumn, ...tenorColumns];
  };

  const tenors = useMemo(() => {
    if (!revalRatesList?.revalRatesList) return [];
    return getUniqueTenors(revalRatesList.revalRatesList);
  }, [revalRatesList]);

  const columns = useMemo(() => {
    return generateColumns(tenors);
  }, [tenors]);

  useEffect(() => {
    if (revalRatesList?.revalRatesList) {
      try {
        const { revalRatesList: revalRatesListData } = revalRatesList;

        // ✅ Set initial date from API (take first item)
        if (revalRatesListData.length > 0) {
          const apiDate = revalRatesListData[0]?.lastModifiedDate;
          if (apiDate) {
            setLatestDate(apiDate);
          }
        }

        const uniqueTenors = Array.from(
          new Map(
            revalRatesListData.map((item) => [
              item.tenorId,
              {
                tenorId: item.tenorId,
                tenorName: item.tenorName,
              },
            ])
          ).values()
        );
        const grouped = Object.values(
          revalRatesListData.reduce((acc, item) => {
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
  }, [revalRatesList]);

  useEffect(() => {
    if (fullFeed && fullFeed.revalRates) {
      console.log(fullFeed, "fullFeedfullFeedRevalRates");
      const { currency, tenorId, value } = fullFeed.revalRates;

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
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>SBP FX Reval Rates</span>
        <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span>
      </span>

      <GlobalTable
        columns={columns}
        dataSource={processedData}
        prefixCls={
          processedData.length > 0
            ? "managementTables_sofr"
            : "managementTables_Empty"
        }
        pagination={false}
        scroll={{ y: 300, x: "max-content" }}
      />
    </>
  );
});

export default SBPFXRevalRates;
