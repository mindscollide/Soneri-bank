import { createSlice } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

const RealtimeActionsSlice = createSlice({
  name: "realtimeActions",
  initialState: {
    marketTimingsUpdated: null,
    marketStatus: null,
    IncomingChat: [],
    tenorsCreated: null,
    currentRatesPublished: null,
    FeDiscountingPublished: null,
    tenorWiseForwardsRates: null,
    NonFeDiscountingPublished: null,
    categoryisAdded: null,
    categoryisUpdated: null,
    categoryisDeleted: null,
    dealBoxData: null,

    BlotterTransactionRFQExpired: null,
    BlotterTransactionRFQExpiredForTreasury: null,
    BlotterTransactionRFQExpiredForTreasuryDealBox: null,

    BlotterTransactionAdded: null,
    BlotterTransactionAddedForTreasury: null,
    BlotterTransactionAddedForTreasuryDealBox: null,

    BlotterTransactionAssigned: null,
    BlotterTransactionAssignedForTreasury: null,

    BlotterTransactionAccepted: null,
    BlotterTransactionAcceptedForTreasury: null,

    BlotterTransactionRFQQuoted: null,
    BlotterTransactionRFQQuotedForTreasury: null,
    BlotterTransactionRFQQuotedForTreasuryDealBox: null,

    BlotterTransactionCancellationRequestData: null,
    BlotterTransactionCancellationRequestDataForTreasury: null,

    BlotterTranscationCancelled: null,
    BlotterTranscationCancelledForTreasury: null,

    BlotterTransactionRejected: null,
    BlotterTransactionRejectedForTreasury: null,

    TransactionAssignedByTreasury: null,
    TreasurySpotRatesFeed: null,
    CounterPartySpotRates: null,
    CategorySpotRates: null,
    CategoryForwardRates: null,
    TreasuryFeDiscounting: null,
    TreasuryNonFeDiscounting: null,
    TreasuryForwardRates: null,
    FxTradingCards: null,
    CategoryFeDiscounting: null,
    CounterPartyNonFeDiscounting: null,
    CounterPartyForwardRates: null,
    CounterPartyFeDiscounting: null,
    CategoryNonFeDiscouting: null,
    ClearRatesData: null,
    CategorySpotClearRates: null,
    CategoryForwardClearRates: null,
    CategoryDiscountingClearRates: null,
    categoryFowardsTenorsChanges: null,
    counterPartyFowardsTenorsChanges: null,
    treasuryFowardsTenorsChanges: null,
    tradeRightsStatusUpdated: null,
    tresmarkCrossPremiumRates: null,
  },
  reducers: {
    setTradeRightsStatusUpdated: (state, { payload }) => {
      state.tradeRightsStatusUpdated = payload;
    },
    clearCategoryForwardClearRates: (state) => {
      state.CategoryForwardClearRates = null;
    },
    clearCategorySpotClearRates: (state) => {
      state.CategorySpotClearRates = null;
    },
    clearCategoryDiscountingClearRates: (state) => {
      state.CategoryDiscountingClearRates = null;
    },
    setCategoryFowardsTenorsChanges: (state, { payload }) => {
      state.categoryFowardsTenorsChanges = payload;
    },
    setCounterPartyFowardsTenorsChanges: (state, { payload }) => {
      state.counterPartyFowardsTenorsChanges = payload;
    },
    setTreasuryFowardsTenorsChanges: (state, { payload }) => {
      state.treasuryFowardsTenorsChanges = payload;
    },
    setClearRates: (state, { payload }) => {
      console.log(payload, "checker");
      state.ClearRatesData = payload;
      state.CategorySpotClearRates = payload;
      state.CategoryForwardClearRates = payload;
      state.CategoryDiscountingClearRates = payload;
    },
    setCategoryNonFeDiscounting: (state, { payload }) => {
      state.CategoryNonFeDiscouting = payload;
    },
    setCounterPartyFeDiscounting: (state, { payload }) => {
      state.CounterPartyFeDiscounting = payload;
    },
    setCounterPartyForwardRates: (state, { payload }) => {
      state.CounterPartyForwardRates = payload;
    },
    setCounterPartyNonFeDiscounting: (state, { payload }) => {
      state.CounterPartyNonFeDiscounting = payload;
    },
    setCategoryFeDiscounting: (state, { payload }) => {
      state.CategoryFeDiscounting = payload;
    },
    setFxTradingCards: (state, { payload }) => {
      state.FxTradingCards = payload;
    },
    setTreasuryFeDiscounting: (state, { payload }) => {
      state.TreasuryFeDiscounting = payload;
    },
    setTreasuryNonFeDiscounting: (state, { payload }) => {
      state.TreasuryNonFeDiscounting = payload;
    },
    setTreasuryForwardRates: (state, { payload }) => {
      state.TreasuryForwardRates = payload;
    },
    setCategorySpotRates: (state, { payload }) => {
      state.CategorySpotRates = payload;
    },
    setCategoryForwardRates: (state, { payload }) => {
      state.CategoryForwardRates = payload;
    },
    setCounterPartySpotRates: (state, { payload }) => {
      state.CounterPartySpotRates = payload;
    },
    setTreasurySpotRatesFeed: (state, { payload }) => {
      if (!isEqual(state.TreasurySpotRatesFeed, payload)) {
        state.TreasurySpotRatesFeed = payload;
      }
    },
    setDealBoxData(state, { payload }) {
      state.dealBoxData = payload;
    },
    setMarketTimingsUpdated(state, { payload }) {
      state.marketTimingsUpdated = payload;
    },
    setIncomingChat(state, { payload }) {
      state.IncomingChat = [...state.IncomingChat, payload];
    },
    clearIncomingChat(state) {
      state.IncomingChat = []; // reset to empty
    },
    setTenorsCreated(state, { payload }) {
      state.tenorsCreated = payload;
    },
    currentRatePublishedAction(state, { payload }) {
      state.currentRatesPublished = payload;
    },
    FeDiscountingPublishedAction(state, { payload }) {
      state.FeDiscountingPublished = payload;
    },
    tenorWiseFowardsRatesPublishedActions(state, { payload }) {
      state.tenorWiseForwardsRates = payload;
    },
    NonFeDiscountingPublishedAction(state, { payload }) {
      state.NonFeDiscountingPublished = payload;
    },
    marketStatusUpdated(state, { payload }) {
      state.marketStatus = payload;
    },
    categoryisAdded(state, { payload }) {
      state.categoryisAdded = payload;
    },
    categoryisUpdated(state, { payload }) {
      state.categoryisUpdated = payload;
    },
    categoryisDeleted(state, { payload }) {
      state.categoryisDeleted = payload;
    },
    BlotterTransactionRFQExpired(state, { payload }) {
      state.BlotterTransactionRFQExpired = payload;
    },
    setBlotterTransactionRFQExpiredForTreasury(state, { payload }) {
      state.BlotterTransactionRFQExpiredForTreasury = payload;
    },
    setBlotterTransactionRFQExpiredForTreasuryDealBox(state, { payload }) {
      state.BlotterTransactionRFQExpiredForTreasuryDealBox = payload;
    },
    BlotterTransactionAdded(state, { payload }) {
      console.log("CheckerCheckerChecker122121212", payload);
      state.BlotterTransactionAdded = payload;
    },
    BlotterTransactionAddedForTreasury(state, { payload }) {
      state.BlotterTransactionAddedForTreasury = payload;
    },
    setBlotterTransactionAddedForTreasuryDealBox(state, { payload }) {
      state.BlotterTransactionAddedForTreasuryDealBox = payload;
    },
    BlotterTransactionAssigned(state, { payload }) {
      state.BlotterTransactionAssigned = payload;
    },
    BlotterTransactionAssignedForTreasury(state, { payload }) {
      state.BlotterTransactionAssignedForTreasury = payload;
    },
    BlotterTransactionAccepted(state, { payload }) {
      state.BlotterTransactionAccepted = payload;
    },
    BlotterTransactionAcceptedForTreasury(state, { payload }) {
      state.BlotterTransactionAcceptedForTreasury = payload;
    },
    BlotterTransactionRFQQuoted(state, { payload }) {
      state.BlotterTransactionRFQQuoted = payload;
    },
    BlotterTransactionRFQQuotedForTreasury(state, { payload }) {
      state.BlotterTransactionRFQQuotedForTreasury = payload;
    },
    setBlotterTransactionRFQQuotedForTreasuryDealBox(state, { payload }) {
      state.BlotterTransactionRFQQuotedForTreasuryDealBox = payload;
    },
    BlotterTransactionCancellationRequest(state, { payload }) {
      state.BlotterTransactionCancellationRequestData = payload;
    },
    BlotterTransactionCancellationRequestForTreasury(state, { payload }) {
      state.BlotterTransactionCancellationRequestDataForTreasury = payload;
    },
    BlotterTranscationCancelled(state, { payload }) {
      state.BlotterTranscationCancelled = payload;
    },
    BlotterTranscationCancelledForTreasury(state, { payload }) {
      state.BlotterTranscationCancelledForTreasury = payload;
    },
    BlotterTransactionRejected(state, { payload }) {
      state.BlotterTransactionRejected = payload;
    },
    BlotterTransactionRejectedForTreasury(state, { payload }) {
      state.BlotterTransactionRejectedForTreasury = payload;
    },

    TransactionAssignedByTreasury(state, { payload }) {
      state.TransactionAssignedByTreasury = payload;
    },
    setTresmarkCrossPremiumRates(state, { payload }) {
      state.tresmarkCrossPremiumRates = payload;
    },
  },
});

export const {
  setTradeRightsStatusUpdated,
  setCategoryFowardsTenorsChanges,
  setTreasuryFowardsTenorsChanges,
  setCounterPartyFowardsTenorsChanges,
  setClearRates,
  setCategoryFeDiscounting,
  setFxTradingCards,
  setTreasuryFeDiscounting,
  setTreasuryNonFeDiscounting,
  setTreasurySpotRatesFeed,
  setTreasuryForwardRates,
  setBlotterTransactionRFQQuotedForTreasuryDealBox,
  setBlotterTransactionRFQExpiredForTreasury,
  BlotterTransactionAddedForTreasury,
  BlotterTransactionAssignedForTreasury,
  BlotterTransactionAcceptedForTreasury,
  BlotterTransactionRFQQuotedForTreasury,
  BlotterTransactionCancellationRequestForTreasury,
  BlotterTranscationCancelledForTreasury,
  BlotterTransactionRejectedForTreasury,
  TransactionAssignedByTreasury,
  BlotterTransactionRejected,
  BlotterTranscationCancelled,
  BlotterTransactionCancellationRequest,
  BlotterTransactionAccepted,
  BlotterTransactionAssigned,
  BlotterTransactionAdded,
  categoryisAdded,
  categoryisUpdated,
  categoryisDeleted,
  setIncomingChat,
  setMarketTimingsUpdated,
  setTenorsCreated,
  currentRatePublishedAction,
  FeDiscountingPublishedAction,
  tenorWiseFowardsRatesPublishedActions,
  NonFeDiscountingPublishedAction,
  marketStatusUpdated,
  BlotterTransactionRFQExpired,
  BlotterTransactionRFQQuoted,
  setBlotterTransactionRFQExpiredForTreasuryDealBox,
  setBlotterTransactionAddedForTreasuryDealBox,
  setDealBoxData,
  setCounterPartySpotRates,
  setCategorySpotRates,
  setCategoryForwardRates,
  setCounterPartyNonFeDiscounting,
  setCounterPartyForwardRates,
  setCounterPartyFeDiscounting,
  setCategoryNonFeDiscounting,
  clearIncomingChat,
  clearCategoryDiscountingClearRates,
  clearCategoryForwardClearRates,
  clearCategorySpotClearRates,
  setTresmarkCrossPremiumRates,
} = RealtimeActionsSlice.actions;

export default RealtimeActionsSlice.reducer;
