import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { IndexCell } from "../../../shareComponents/commonComponents/elements/inputField/IndexCell";
import { formatDateUTCToGMT } from "../../../utils/timeFunction";
import GlobalTable from "../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { shallowEqual, useSelector } from "react-redux";

const GetUSDParityForTreasury = (state) =>
  state.WatchListReducer.GetUSDParityForTreasury?.usdParityCurrencies || [];
const GetAllOtherInstruments = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.spotInstruments;
const USDParity = memo(() => {
  const [processedData, setProcessedData] = useState([]);
  const dataRef = useRef([]);
  const lastUpdateRef = useRef(0);
  const updateQueueRef = useRef([]);
  const animationFrameRef = useRef(null);

  const crossInstruments = useSelector(GetAllOtherInstruments, shallowEqual);
  // const fullFeed = useSelector(GetUSDParityForTreasury);
  const worldCrosses = useSelector(GetUSDParityForTreasury, shallowEqual);

  // ✅ Memoized essential feed values
  // const feedEssentials = useMemo(() => {
  //   if (!fullFeed) return null;

  //   return {
  //     bid: fullFeed.bid,
  //     ask: fullFeed.ask,
  //     high: fullFeed.high,
  //     low: fullFeed.low,
  //     instrumentID: fullFeed.instrumentID,
  //     percentageChange: fullFeed.percentageChange,
  //     time: fullFeed.time,
  //   };
  // }, [
  //   fullFeed.bid,
  //   fullFeed.ask,
  //   fullFeed.high,
  //   fullFeed.low,
  //   fullFeed.instrumentID,
  //   fullFeed.percentageChange,
  //   fullFeed.time,
  // ]);

  const columns = useMemo(
    () => [
      {
        title: "USD Parity",
        children: [
          { title: "Instrument", dataIndex: "instrumentName" },
          {
            title: "Bid",
            dataIndex: "bid",
            className: "bidCol",
            width: "14%",
            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Ask",
            dataIndex: "ask",
            className: "offerCol",
            width: "14%",
            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "High",
            dataIndex: "high",
            width: "14%",
            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Low",
            dataIndex: "low",
            className: "offerCol",
            width: "14%",
            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "% Change",
            dataIndex: "percentageChange",
            className: "offerCol",
            width: "16%",
            render: (text) => {
              return text !== "-" && <IndexCell value={text.toFixed(4)} />;
            },
          },
          {
            title: "Time",
            dataIndex: "time",
            width: "14%",
            render: (text) =>
              text
                ? formatDateUTCToGMT(text).toTimeString().substring(0, 8)
                : "--:--:--",
          },
        ],
      },
    ],
    []
  );

  // ✅ Enriched base data
  const enrichedData = useMemo(() => {
    if (!crossInstruments || !worldCrosses) return [];
    console.log({ crossInstruments, worldCrosses }, "crossInstruments");
    try {
      return crossInstruments.map((instrument) => {
        const matchedCross = worldCrosses.find(
          (wc) => Number(wc.instrumentID) === instrument.instrumentID
        );
        return {
          instrumentID: Number(instrument.instrumentID),
          instrumentName: instrument.instrumentName,
          time: matchedCross?.time ?? "",

          bid: Number(matchedCross?.bid ?? 0),
          ask: Number(matchedCross?.ask ?? 0),
          high: Number(matchedCross?.high ?? 0),
          low: Number(matchedCross?.low ?? 0),
          percentageChange: Number(matchedCross?.percentageChange ?? 0),

          version: 0,
        };
      });
    } catch (error) {
      console.error("Error enriching data:", error);
      return [];
    }
  }, [crossInstruments, worldCrosses]);

  // Initialize processed data when enriched data changes
  useEffect(() => {
    if (enrichedData.length > 0) {
      dataRef.current = enrichedData;
      setProcessedData(enrichedData);
    }
  }, [enrichedData]);
  return (
    <GlobalTable
      columns={columns}
      dataSource={processedData}
      prefixCls={
        processedData.length > 0 ? "managementTables" : "managementTables_Empty"
      }
      // prefixCls={"LiveRatesTable"}
      rowKey={(record) =>
        `${record.instrumentID}-${record.secondaryInstrumentID}`
      }
      pagination={false}
      scroll={{ y: 300 }}
    />
  );
});

export default USDParity;
