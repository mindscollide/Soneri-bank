import styles from "./liveRates.module.css";
import GlobalTable from "../elements/table/GlobalTable";
import { memo } from "react";

// // ✅ Pure selectors (no object creation here)
const selectGetAllInstrumentForTreasury = (state) =>
  state.WatchListReducer.GetAllInstrumentForTreasury?.crossInstruments;
// const selectTreasurySpotRatesFeed = (state) =>
//   state.RealtimeActionsSlice.TreasurySpotRatesFeed;
const selectWorldCrosses = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCrosses || [];
const selectWorldCurrencies = (state) =>
  state.WatchListReducer.GetBankSpotForDealer?.worldCurrencies || [];
// const selectTreasuryBankSpotSpinner = (state) =>
//   state.WatchListReducer.GetBankSpotForTreasurySpinner;
// const selectMarketStatus = (state) => state.WatchListReducer.getMarketStatus;

const LiveRates = memo(() => {
  const dataSource = [
    {
      key: "1",
      bank_instrument: "USD / PKR",
      bank_bid: "288.00",
      bank_offer: "289.00",
      bank_time: "16:31:39",

      usd_instrument: "USD",
      usd_bid: "288.00",
      usd_offer: "289.00",
      usd_time: "16:31:39",

      cross_instrument: "USDEUR",
      cross_bid: "288.00",
      cross_offer: "289.00",
      cross_time: "16:31:39",
    },
    {
      key: "2",
      bank_instrument: "EUR / PKR",
      bank_bid: "288.00",
      bank_offer: "289.00",
      bank_time: "16:31:39",

      usd_instrument: "EUR",
      usd_bid: "288.00",
      usd_offer: "289.00",
      usd_time: "16:31:39",

      cross_instrument: "EURCAD",
      cross_bid: "288.00",
      cross_offer: "289.00",
      cross_time: "16:31:39",
    },
  ];
  const columns = [
    {
      title: "Bank Spot",
      children: [
        { title: "Instrument", dataIndex: "bank_instrument" },
        { title: "Bid", dataIndex: "bank_bid", className: "bidCol" },
        { title: "Offer", dataIndex: "bank_offer", className: "offerCol" },
        { title: "Time", dataIndex: "bank_time" },
      ],
    },
    {
      title: "USD Parity",
      children: [
        { title: "Instrument", dataIndex: "usd_instrument" },
        { title: "Bid", dataIndex: "usd_bid", className: "bidCol" },
        { title: "Offer", dataIndex: "usd_offer", className: "offerCol" },
        { title: "Time", dataIndex: "usd_time" },
      ],
    },
    {
      title: "Currency Crosses",
      children: [
        { title: "Instrument", dataIndex: "cross_instrument" },
        { title: "Bid", dataIndex: "cross_bid", className: "bidCol" },
        { title: "Offer", dataIndex: "cross_offer", className: "offerCol" },
        { title: "Time", dataIndex: "cross_time" },
      ],
    },
  ];

  // const GetAllDealersSpread = useSelector(
  //   (state) => state.WatchListReducer.GetAllDealersSpread
  // );
  // const GetCurrencyCrosses = useSelector(
  //   (state) => state.WatchListReducer.GetCurrencyCrosses
  // );

  // const GetBankSpotForDealer = useSelector(
  //   (state) => state.WatchListReducer.GetBankSpotForDealer
  // );

  // const GetAllInstrumentForTreasury = useSelector(
  //   (state) => state.WatchListReducer.GetAllInstrumentForTreasury
  // );
  console.log(
    // { GetBankSpotForDealer, GetCurrencyCrosses, GetAllInstrumentForTreasury },
    "GetAllDealersSpreadGetAllDealersSpread"
  );

  return (
    <div className={styles.LiveRateMainCard}>
      <GlobalTable
        className={"LiveRateMainCard"}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="small"
        scroll={{ y: "40vh", x: "max-content" }}
      />
    </div>
  );
});

export default LiveRates;
