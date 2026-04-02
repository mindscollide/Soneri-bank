import { createSlice } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

const RealtimeActionsSlice = createSlice({
  name: "realtimeActions",
  initialState: {
    marketStatus: null,
    tenorsCreated: null,
    currentRatesPublished: null,
    FeDiscountingPublished: null,
    tenorWiseForwardsRates: null,
    NonFeDiscountingPublished: null,
    TreasurySpotRatesFeed: null,
    CurrencyCrossesRatesFeed: null,
    TreasuryFeDiscounting: null,
    TreasuryNonFeDiscounting: null,
    TreasuryForwardRates: null,
    ClearRatesData: null,
    treasuryFowardsTenorsChanges: null,
    tresmarkCrossPremiumRates: null,
    DealerSpotRatesFeed: null,
    TreasuryDealerForwardRates: null,
    TreasuryDealerFeDiscounting: null,
    TreasuryDealerNonFeDiscounting: null,
    spreadsForSingleUser: null,
    dealerForwardTenorChanged: null,
    DealerSpotClearRates: null,
    DealerForwardClearRates: null,
    DealerDiscountingClearRates: null,
    usdParityForManagmentFeed: null,
    currencyCrossesForManagmentFeed: null,
    commoditiesForManagementFeed: null,
    stockIndicesForManagementFeed: null,
    kiborForManagementFeed: null,
    sofrForManagementFeed: null,
    sbpFXRevalRatesForManagementFeed: null,
    swapsinUSDForManagementFeed: null,
    treasuryRateSheetSpotTTRates: null,
    // TREASURY_RATE_SHEET_CURRENCY_NOTES
    treasuryRateSheetCurrencyNotes: null,
    treasuryRateSheetConversionRate: null,
    treasuryRateSheetKibor: null,
    treasuryRateSheetSofr: null,
    treasuryRateSheetIndicativeFBPRates: null,
    currentRateSheetRatesPublished: null,
    realTimeNewsFeed: null,
  },
  reducers: {
    clearDealerSpotClearRates: (state) => {
      state.DealerSpotClearRates = null;
    },
    clearDealerForwardClearRates: (state) => {
      state.DealerForwardClearRates = null;
    },
    clearDealerDiscountingClearRates: (state) => {
      state.DealerDiscountingClearRates = null;
    },

    setTreasuryFowardsTenorsChanges: (state, { payload }) => {
      state.treasuryFowardsTenorsChanges = payload;
    },
    setClearRates: (state, { payload }) => {
      console.log(payload, "checker");
      state.ClearRatesData = payload;
      // New Work
      state.DealerSpotClearRates = payload;
      state.DealerForwardClearRates = payload;
      state.DealerDiscountingClearRates = payload;
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
    setTreasuryDealerForwardRates: (state, { payload }) => {
      state.TreasuryDealerForwardRates = payload;
    },

    setTreasurySpotRatesFeed: (state, { payload }) => {
      // if (!isEqual(state.TreasurySpotRatesFeed, payload)) {
      state.TreasurySpotRatesFeed = payload;
      // }
    },
    setDealerSpotRatesFeed: (state, { payload }) => {
      if (!isEqual(state.DealerSpotRatesFeed, payload)) {
        state.DealerSpotRatesFeed = payload;
      }
    },
    setCurrencyCrossesRatesFeed: (state, { payload }) => {
      if (!isEqual(state.CurrencyCrossesRatesFeed, payload)) {
        state.CurrencyCrossesRatesFeed = payload;
      }
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

    setTresmarkCrossPremiumRates(state, { payload }) {
      if (!isEqual(state.tresmarkCrossPremiumRates, payload)) {
        state.tresmarkCrossPremiumRates = payload;
      }
    },
    setTreasuryDealerFeDiscounting: (state, { payload }) => {
      if (!isEqual(state.TreasuryDealerFeDiscounting, payload)) {
        state.TreasuryDealerFeDiscounting = payload;
      }
    },
    setTreasuryDealerNonFeDiscounting: (state, { payload }) => {
      if (!isEqual(state.TreasuryDealerNonFeDiscounting, payload)) {
        state.TreasuryDealerNonFeDiscounting = payload;
      }
    },
    setSpreadsForSingleUser: (state, { payload }) => {
      state.spreadsForSingleUser = payload;
    },
    setDealerForwardTenorChanged: (state, { payload }) => {
      state.dealerForwardTenorChanged = payload;
    },
    setUSDParityForManagementFeed: (state, { payload }) => {
      if (!isEqual(state.usdParityForManagmentFeed, payload)) {
        state.usdParityForManagmentFeed = payload;
      }
    },
    setCurrencyCrossesForManagementFeed: (state, { payload }) => {
      if (!isEqual(state.currencyCrossesForManagmentFeed, payload)) {
        state.currencyCrossesForManagmentFeed = payload;
      }
    },

    setCommoditiesForManagmentFeed: (state, { payload }) => {
      if (!isEqual(state.commoditiesForManagementFeed, payload)) {
        state.commoditiesForManagementFeed = payload;
      }
    },
    setStockIndicesForManagmentFeed: (state, { payload }) => {
      if (!isEqual(state.stockIndicesForManagementFeed, payload)) {
        state.stockIndicesForManagementFeed = payload;
      }
    },

    setKiborForManagmentFeed: (state, { payload }) => {
      state.kiborForManagementFeed = {
        ...payload,
        kibor: Array.isArray(payload.kibor)
          ? [...payload.kibor]
          : { ...payload.kibor },
      };
    },

    setSofrForManagmentFeed: (state, { payload }) => {
      state.sofrForManagementFeed = payload;
    },
    setSbpFXRevalRatesForManagmentFeed: (state, { payload }) => {
      state.sbpFXRevalRatesForManagementFeed = payload;
    },
    setSwapsinUSDForManagementFeed: (state, { payload }) => {
      state.swapsinUSDForManagementFeed = payload;
    },
    setTreasuryRateSheetSpotTTRates: (state, { payload }) => {
      state.treasuryRateSheetSpotTTRates = payload;
    },
    setTreasuryRateSheetCurrencyNotes: (state, { payload }) => {
      state.treasuryRateSheetCurrencyNotes = payload;
    },

    setTreasuryRateSheetConversionRate: (state, { payload }) => {
      state.treasuryRateSheetConversionRate = payload;
    },
    setTreasuryRateSheetKibor: (state, { payload }) => {
      state.treasuryRateSheetKibor = payload;
    },
    setTreasuryRateSheetSofr: (state, { payload }) => {
      state.treasuryRateSheetSofr = payload;
    },
    setTreasuryRateSheetIndicativeFBPRates: (state, { payload }) => {
      state.treasuryRateSheetIndicativeFBPRates = payload;
    },
    setCurrentRateSheetRatesPublished: (state, { payload }) => {
      state.currentRateSheetRatesPublished = payload;
    },
    setRealTimeNewsFeed: (state, { payload }) => {
      state.realTimeNewsFeed = payload;
    },
  },
});

export const {
  setTreasuryFowardsTenorsChanges,
  setClearRates,
  setTreasuryFeDiscounting,
  setTreasuryNonFeDiscounting,
  setTreasurySpotRatesFeed,
  setTreasuryForwardRates,

  setTenorsCreated,
  currentRatePublishedAction,
  FeDiscountingPublishedAction,
  tenorWiseFowardsRatesPublishedActions,
  NonFeDiscountingPublishedAction,
  marketStatusUpdated,
  setTresmarkCrossPremiumRates,
  setCurrencyCrossesRatesFeed,
  setDealerSpotRatesFeed,
  setTreasuryDealerForwardRates,
  setTreasuryDealerFeDiscounting,
  setTreasuryDealerNonFeDiscounting,
  setSpreadsForSingleUser,
  setDealerForwardTenorChanged,
  clearDealerSpotClearRates,
  clearDealerForwardClearRates,
  clearDealerDiscountingClearRates,
  setUSDParityForManagementFeed,
  setCurrencyCrossesForManagementFeed,
  setCommoditiesForManagmentFeed,
  setStockIndicesForManagmentFeed,
  setKiborForManagmentFeed,
  setSofrForManagmentFeed,
  setSbpFXRevalRatesForManagmentFeed,
  setSwapsinUSDForManagementFeed,
  setTreasuryRateSheetSpotTTRates,
  setTreasuryRateSheetCurrencyNotes,
  setTreasuryRateSheetConversionRate,
  setTreasuryRateSheetKibor,
  setTreasuryRateSheetSofr,
  setTreasuryRateSheetIndicativeFBPRates,
  setCurrentRateSheetRatesPublished,
  setRealTimeNewsFeed,
} = RealtimeActionsSlice.actions;

export default RealtimeActionsSlice.reducer;
