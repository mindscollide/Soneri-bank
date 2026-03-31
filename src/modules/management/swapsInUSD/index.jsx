import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import styles from "../management.module.css";
const GetSwapsInUSDForTreasury = (state) =>
  state.WatchListReducer.GetSwapsInUSDForTreasury;
const swapsinUSDForManagementFeed = (state) =>
  state.RealtimeActionsSlice.swapsinUSDForManagementFeed;

const SwapsInUSD = memo(() => {
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);
  const swapsinUSDList = useSelector(GetSwapsInUSDForTreasury);
  const fullFeed = useSelector(swapsinUSDForManagementFeed);
  // const [latestDate, setLatestDate] = useState("");

  // Local state for processed data
  const [processedData, setProcessedData] = useState([]);

  // console.log(swapsinUSDList, "swapsinUSDListswapsinUSDList");
  const { tableData, currencyList } = useMemo(() => {
    if (!swapsinUSDList?.swapsinUSDList)
      return { tableData: [], currencyList: [] };

    const data = swapsinUSDList.swapsinUSDList;

    // 🔹 Build currencyPair → currencyPairFull mapping
    const pairMapping = {};
    data.forEach((item) => {
      if (
        item.currencyPairFull &&
        item.currencyPairFull.includes(item.currencyPair)
      ) {
        pairMapping[item.currencyPair] = item.currencyPairFull;
      }
    });

    // 🔹 Get unique full currencies
    const currencySet = new Set();
    data.forEach((item) => {
      const full = item.currencyPairFull || pairMapping[item.currencyPair];
      if (full) currencySet.add(full);
    });

    const currencyList = Array.from(currencySet);

    // 🔹 Group by Tenor (row-wise)
    const grouped = {};

    data.forEach((item) => {
      const tenor = item.tenor;
      const full = item.currencyPairFull || pairMapping[item.currencyPair];

      if (!grouped[tenor]) {
        grouped[tenor] = {
          key: tenor,
          tenorName: tenor,
        };
      }

      grouped[tenor][`${full}_bid`] = item.bid;
      grouped[tenor][`${full}_ask`] = item.ask;
    });

    return {
      tableData: Object.values(grouped),
      currencyList,
    };
  }, [swapsinUSDList]);
  const columns = useMemo(() => {
    if (!currencyList.length) return [];

    const baseColumn = [
      {
        title: "",
        dataIndex: "tenorName",
        key: "tenorName",
        fixed: "left",
        width: 100,
        children: [
          {
            title: "Tenor",
            dataIndex: "tenorName",
            key: "tenorName",
            align: "left",
            width: 100,
          },
        ],
      },
    ];

    const currencyColumns = currencyList.map((currency) => ({
      title: currency,
      children: [
        {
          title: "Bid",
          dataIndex: `${currency}_bid`,
          key: `${currency}_bid`,
          align: "center",
          width: 100,
          render: (val) => (val ? Number(val).toFixed(2) : "0.00"),
        },
        {
          title: "Offer",
          dataIndex: `${currency}_ask`,
          key: `${currency}_ask`,
          align: "center",
          width: 100,
          render: (val) => (val ? Number(val).toFixed(2) : "0.00"),
        },
      ],
    }));

    return [...baseColumn, ...currencyColumns];
  }, [currencyList]);

  // MQTT Work
  // ✅ Batch update function
  // ✅ Batch update function (SBP FX Reval Rates)
  const processUpdateQueue = useCallback(() => {
    if (updateQueueRef.current.length === 0) {
      animationFrameRef.current = null;
      return;
    }

    const updates = updateQueueRef.current;
    updateQueueRef.current = [];

    setProcessedData((prevData) => {
      let updatedData = [...prevData];

      updates.forEach((feed) => {
        const swaapsInUSD = feed?.swaapsInUSD;
        if (!swaapsInUSD) return;

        const { currencyPair, tenor, bid, ask } = swaapsInUSD;
        const dynamicBidKey = `${currencyPair}_bid`;
        const dynamicAskKey = `${currencyPair}_ask`;

        const rowIndex = updatedData.findIndex(
          (row) => row.tenorName === tenor
        );

        if (rowIndex !== -1) {
          // Update existing row
          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            [dynamicBidKey]: bid,
            [dynamicAskKey]: ask,
          };
        } else {
          // Add new row
          updatedData.push({
            key: tenor,
            tenorName: tenor,
            [dynamicBidKey]: bid,
            [dynamicAskKey]: ask,
          });
        }
      });

      return updatedData;
    });

    animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
  }, []);

  // ✅ Queue update
  const queueUpdate = useCallback(
    (feed) => {
      if (!feed) return;

      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // ~60fps
      lastUpdateRef.current = now;

      updateQueueRef.current.push(feed);

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(processUpdateQueue);
      }
    },
    [processUpdateQueue]
  );
  // ✅ Feed update effect
  useEffect(() => {
    if (!fullFeed) return;
    queueUpdate(fullFeed);
  }, [fullFeed, queueUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  const mergedTableData = useMemo(() => {
    const dataMap = {};

    // Start with static tableData
    tableData.forEach((row) => {
      dataMap[row.tenorName] = { ...row };
    });

    // Merge processed MQTT updates
    processedData.forEach((row) => {
      if (!dataMap[row.tenorName]) {
        dataMap[row.tenorName] = { ...row };
      } else {
        dataMap[row.tenorName] = { ...dataMap[row.tenorName], ...row };
      }
    });

    return Object.values(dataMap);
  }, [tableData, processedData]);
  return (
    <>
      <span
        className={`${styles.tableheaderbar} d-flex justify-content-between`}
      >
        <span>Swaps in USD</span>
        {/* <span className={styles.management_date}>
          {formatCompactDate(latestDate)}
        </span> */}
      </span>

      <GlobalTable
        columns={columns}
        dataSource={mergedTableData}
        prefixCls={
          tableData.length > 0
            ? "managementTable_Swaps"
            : "managementTable_Swaps_Empty"
        }
        pagination={false}
        scroll={{ y: 275, x: "max-content" }}
      />
    </>
  );
});

export default SwapsInUSD;
