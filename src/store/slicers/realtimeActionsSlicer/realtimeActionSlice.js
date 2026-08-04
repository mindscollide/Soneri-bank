import { createSlice } from "@reduxjs/toolkit";
import { isEqual } from "lodash";

const MAX_BUFFER = 100;

const RealtimeActionsSlice = createSlice({
  name: "realtimeActions",
  initialState: {
    marketStatus: null,
    tenorsCreated: null,
    currentRatesPublished: null,
    FeDiscountingPublished: null,
    tenorWiseForwardsRates: null,
    NonFeDiscountingPublished: null,
    TreasurySpotRatesFeed: [],
    CurrencyCrossesRatesFeed: null,
    TreasuryFeDiscounting: [],
    TreasuryNonFeDiscounting: [],
    TreasuryForwardRates: [],
    ClearRatesData: null,
    treasuryFowardsTenorsChanges: null,
    tresmarkCrossPremiumRates: null,
    DealerSpotRatesFeed: [],
    TreasuryDealerForwardRates: [],

    TreasuryDealerFeDiscounting: [],

    TreasuryDealerNonFeDiscounting: [],
    spreadsForSingleUser: null,
    dealerForwardTenorChanged: null,
    DealerSpotClearRates: null,
    DealerForwardClearRates: null,
    DealerDiscountingClearRates: null,
    usdParityForManagmentFeed: null,
    currencyCrossesForManagmentFeed: [],
    commoditiesForManagementFeed: null,
    stockIndicesForManagementFeed: null,
    kiborForManagementFeed: null,
    sofrForManagementFeed: null,
    sbpFXRevalRatesForManagementFeed: null,
    swapsinUSDForManagementFeed: null,
    treasuryRateSheetSpotTTRates: [],
    // TREASURY_RATE_SHEET_CURRENCY_NOTES
    treasuryRateSheetCurrencyNotes: [],
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
      state.ClearRatesData = payload;
      // New Work
      state.DealerSpotClearRates = payload;
      state.DealerForwardClearRates = payload;
      state.DealerDiscountingClearRates = payload;
    },

    setTreasuryFeDiscounting: (state, { payload }) => {
      state.TreasuryFeDiscounting = [...(state.TreasuryFeDiscounting ?? []), payload].slice(-MAX_BUFFER);
    },

    clearTreasuryFeDiscounting: (state) => {
      state.TreasuryFeDiscounting = [];
    },
    setTreasuryNonFeDiscounting: (state, { payload }) => {
      state.TreasuryNonFeDiscounting = [...(state.TreasuryNonFeDiscounting ?? []), payload].slice(-MAX_BUFFER);
    },
    clearTreasuryNonFeDiscounting: (state) => {
      state.TreasuryNonFeDiscounting = [];
    },
    setTreasuryForwardRates: (state, { payload }) => {
      state.TreasuryForwardRates = [...(state.TreasuryForwardRates ?? []), payload].slice(-MAX_BUFFER);
    },

    setTreasuryDealerForwardRates: (state, { payload }) => {
      state.TreasuryDealerForwardRates = [...(state.TreasuryDealerForwardRates ?? []), payload].slice(-MAX_BUFFER);
    },

    setTreasurySpotRatesFeed: (state, { payload }) => {
      state.TreasurySpotRatesFeed = [...(state.TreasurySpotRatesFeed ?? []), payload].slice(-MAX_BUFFER);
    },

    clearTreasurySpotRatesFeed: (state) => {
      state.TreasurySpotRatesFeed = [];
    },
    setDealerSpotRatesFeed: (state, { payload }) => {
      state.DealerSpotRatesFeed = [...(state.DealerSpotRatesFeed ?? []), payload].slice(-MAX_BUFFER);
    },

    clearDealerSpotRatesFeed: (state) => {
      state.DealerSpotRatesFeed = [];
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
      state.TreasuryDealerFeDiscounting = [...(state.TreasuryDealerFeDiscounting ?? []), payload].slice(-MAX_BUFFER);
    },
    // 3. Add a clear action (CRITICAL)
    clearTreasuryDealerFeDiscounting: (state) => {
      state.TreasuryDealerFeDiscounting = [];
    },
    setTreasuryDealerNonFeDiscounting: (state, { payload }) => {
      state.TreasuryDealerNonFeDiscounting = [...(state.TreasuryDealerNonFeDiscounting ?? []), payload].slice(-MAX_BUFFER);
    },
    clearTreasuryDealerNonFeDiscounting: (state) => {
      state.TreasuryDealerNonFeDiscounting = [];
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
    clearUSDParityForManagementFeed: (state) => {
      state.usdParityForManagmentFeed = null;
    },
    setCurrencyCrossesForManagementFeed: (state, { payload }) => {
      state.currencyCrossesForManagmentFeed = [...(state.currencyCrossesForManagmentFeed ?? []), payload].slice(-MAX_BUFFER);
    },
    clearCurrencyCrossesForManagementFeed: (state) => {
      state.currencyCrossesForManagmentFeed = [];
    },

    setCommoditiesForManagmentFeed: (state, { payload }) => {
      if (!isEqual(state.commoditiesForManagementFeed, payload)) {
        state.commoditiesForManagementFeed = payload;
      }
    },
    clearCommoditiesForManagmentFeed: (state) => {
      state.commoditiesForManagementFeed = [];
    },
    setStockIndicesForManagmentFeed: (state, { payload }) => {
      if (!isEqual(state.stockIndicesForManagementFeed, payload)) {
        state.stockIndicesForManagementFeed = payload;
      }
    },

    clearStockIndicesForManagmentFeed: (state) => {
      state.stockIndicesForManagementFeed = null;
    },

    setKiborForManagmentFeed: (state, { payload }) => {
      state.kiborForManagementFeed = {
        ...payload,
        kibor: Array.isArray(payload.kibor)
          ? [...payload.kibor]
          : { ...payload.kibor },
      };
    },
    clearKiborForManagmentFeed: (state) => {
      state.kiborForManagementFeed = null;
    },

    // ✅ FIXED: store the whole payload as a single object (same pattern as KIBOR)
    // Previously this was accumulating payload.sofr into an array, which broke
    // the { sofr } destructuring in the component.
    setSofrForManagmentFeed: (state, { payload }) => {
      state.sofrForManagementFeed = {
        ...payload,
        sofr: Array.isArray(payload.sofr)
          ? [...payload.sofr]
          : { ...payload.sofr },
      };
    },
    clearSofrForManagmentFeed: (state) => {
      state.sofrForManagementFeed = null;
    },
    setSbpFXRevalRatesForManagmentFeed: (state, { payload }) => {
      // store ONLY latest message (no array, no spreading)
      state.sbpFXRevalRatesForManagementFeed = { ...payload };
    },
    clearSbpFXRevalRatesForManagmentFeed: (state) => {
      state.sbpFXRevalRatesForManagementFeed = null;
    },
    setSwapsinUSDForManagementFeed: (state, { payload }) => {
      state.swapsinUSDForManagementFeed = payload;
    },
    clearSwapsinUSDForManagementFeed: (state) => {
      state.swapsinUSDForManagementFeed = null;
    },
    setTreasuryRateSheetSpotTTRates: (state, { payload }) => {
      state.treasuryRateSheetSpotTTRates = [...(state.treasuryRateSheetSpotTTRates ?? []), payload].slice(-MAX_BUFFER);
    },
    clearTreasuryRateSheetSpotTTRates: (state) => {
      state.treasuryRateSheetSpotTTRates = [];
    },

    setTreasuryRateSheetCurrencyNotes: (state, { payload }) => {
      state.treasuryRateSheetCurrencyNotes = [...(state.treasuryRateSheetCurrencyNotes ?? []), payload].slice(-MAX_BUFFER);
    },
    clearTreasuryRateSheetCurrencyNotes: (state) => {
      state.treasuryRateSheetCurrencyNotes = [];
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
    setClearNewsMQTT: (state) => {
      state.realTimeNewsFeed = null;
    },
    clearTreasuryDealerForwardRates: (state) => {
      state.TreasuryDealerForwardRates = [];
    },
    clearTreasuryForwardRates: (state) => {
      state.TreasuryForwardRates = [];
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
  setClearNewsMQTT,
  clearTreasuryDealerForwardRates,
  clearTreasuryForwardRates,
  clearCurrencyCrossesForManagmentFeed,
  clearTreasuryDealerFeDiscounting,
  clearTreasuryDealerNonFeDiscounting,
  clearTreasuryFeDiscounting,
  clearTreasuryNonFeDiscounting,
  clearTreasurySpotRatesFeed,
  clearDealerSpotRatesFeed,
  clearTreasuryRateSheetSpotTTRates,
  clearTreasuryRateSheetCurrencyNotes,
  clearSwapsinUSDForManagementFeed,
  clearSbpFXRevalRatesForManagmentFeed,
  clearSofrForManagmentFeed,
  clearKiborForManagmentFeed,
  clearStockIndicesForManagmentFeed,
  clearCommoditiesForManagmentFeed,
  clearCurrencyCrossesForManagementFeed,
  clearUSDParityForManagementFeed,
} = RealtimeActionsSlice.actions;

export default RealtimeActionsSlice.reducer;
