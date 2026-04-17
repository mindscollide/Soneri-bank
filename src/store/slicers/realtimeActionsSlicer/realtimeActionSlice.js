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
      console.log(payload, "checker");
      state.ClearRatesData = payload;
      // New Work
      state.DealerSpotClearRates = payload;
      state.DealerForwardClearRates = payload;
      state.DealerDiscountingClearRates = payload;
    },

    // Reducer logic
    setTreasuryFeDiscounting: (state, { payload }) => {
      state.TreasuryFeDiscounting = [
        ...(state.TreasuryFeDiscounting ?? []),
        payload,
      ];
    },

    clearTreasuryFeDiscounting: (state) => {
      state.TreasuryFeDiscounting = [];
    },
    // setTreasuryNonFeDiscounting: (state, { payload }) => {
    //   state.TreasuryNonFeDiscounting = payload;
    // },

    // Reducer logic
    setTreasuryNonFeDiscounting: (state, { payload }) => {
      state.TreasuryNonFeDiscounting = [
        ...(state.TreasuryNonFeDiscounting ?? []),
        payload,
      ];
    },
    clearTreasuryNonFeDiscounting: (state) => {
      state.TreasuryNonFeDiscounting = [];
    },
    setTreasuryForwardRates: (state, { payload }) => {
      // ✅ accumulate payloads, don't overwrite
      state.TreasuryForwardRates = [
        ...(state.TreasuryForwardRates ?? []),
        payload,
      ];
    },

    setTreasuryDealerForwardRates: (state, { payload }) => {
      // ✅ accumulate payloads, don't overwrite
      state.TreasuryDealerForwardRates = [
        ...(state.TreasuryDealerForwardRates ?? []),
        payload,
      ];
    },

    // setTreasurySpotRatesFeed: (state, { payload }) => {
    //   // if (!isEqual(state.TreasurySpotRatesFeed, payload)) {
    //   state.TreasurySpotRatesFeed = payload;
    //   // }
    // },

    setTreasurySpotRatesFeed: (state, { payload }) => {
      state.TreasurySpotRatesFeed = [
        ...(state.TreasurySpotRatesFeed ?? []),
        payload,
      ];
    },

    clearTreasurySpotRatesFeed: (state) => {
      state.TreasurySpotRatesFeed = [];
    },
    // setDealerSpotRatesFeed: (state, { payload }) => {
    //   if (!isEqual(state.DealerSpotRatesFeed, payload)) {
    //     state.DealerSpotRatesFeed = payload;
    //   }
    // },

    // ADD
    setDealerSpotRatesFeed: (state, { payload }) => {
      state.DealerSpotRatesFeed = [
        ...(state.DealerSpotRatesFeed ?? []),
        payload,
      ];
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
    // setTreasuryDealerFeDiscounting: (state, { payload }) => {
    //   if (!isEqual(state.TreasuryDealerFeDiscounting, payload)) {
    //     state.TreasuryDealerFeDiscounting = payload;
    //   }
    // },
    setTreasuryDealerFeDiscounting: (state, { payload }) => {
      // Accumulate payloads in the array buffer
      state.TreasuryDealerFeDiscounting = [
        ...(state.TreasuryDealerFeDiscounting ?? []),
        payload,
      ];
    },
    // 3. Add a clear action (CRITICAL)
    clearTreasuryDealerFeDiscounting: (state) => {
      state.TreasuryDealerFeDiscounting = [];
    },
    // setTreasuryDealerNonFeDiscounting: (state, { payload }) => {
    //   if (!isEqual(state.TreasuryDealerNonFeDiscounting, payload)) {
    //     state.TreasuryDealerNonFeDiscounting = payload;
    //   }
    // },
    setTreasuryDealerNonFeDiscounting: (state, { payload }) => {
      state.TreasuryDealerNonFeDiscounting = [
        ...(state.TreasuryDealerNonFeDiscounting ?? []),
        payload,
      ];
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
    // setCurrencyCrossesForManagementFeed: (state, { payload }) => {
    //   if (!isEqual(state.currencyCrossesForManagmentFeed, payload)) {
    //     state.currencyCrossesForManagmentFeed = payload;
    //   }
    // },
    setCurrencyCrossesForManagementFeed: (state, { payload }) => {
      // ✅ accumulate payloads, don't overwrite
      state.currencyCrossesForManagmentFeed = [
        ...(state.currencyCrossesForManagmentFeed ?? []),
        payload,
      ];
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
    // setTreasuryRateSheetSpotTTRates: (state, { payload }) => {
    //   state.treasuryRateSheetSpotTTRates = payload;
    // },

    setTreasuryRateSheetSpotTTRates: (state, { payload }) => {
      state.treasuryRateSheetSpotTTRates = [
        ...(state.treasuryRateSheetSpotTTRates ?? []),
        payload,
      ];
    },
    clearTreasuryRateSheetSpotTTRates: (state) => {
      state.treasuryRateSheetSpotTTRates = [];
    },

    setTreasuryRateSheetCurrencyNotes: (state, { payload }) => {
      state.treasuryRateSheetCurrencyNotes = [
        ...(state.treasuryRateSheetCurrencyNotes ?? []),
        payload,
      ];
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
    setClearNewsMQTT: (state, { payload }) => {
      state.realTimeNewsFeed = null;
    },
    // ✅ add a clear action to reset after processing
    clearTreasuryDealerForwardRates: (state) => {
      state.TreasuryDealerForwardRates = [];
    },

    // ✅ add a clear action to reset after processing
    clearTreasuryForwardRates: (state) => {
      state.TreasuryForwardRates = [];
    },

    // ✅ add a clear action to reset after processing
    clearCurrencyCrossesForManagmentFeed: (state) => {
      state.currencyCrossesForManagmentFeed = [];
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
