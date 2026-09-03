import { createAction, createSlice } from "@reduxjs/toolkit";
export const setActiveTab = createAction("tabs/setActiveTab");

import {
  AddDealerSpreadApi,
  clearRatesAction,
  createTenorAction,
  GetAllDealersSpreadApi,
  GetAllOtherInstrumentsApi,
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  GetBankForwardForTreasuryApi,
  GetBankForwardForTreasuryDealerApi,
  GetBankSpotForDealerApi,
  GetBankSpotForTreasuryApi,
  GetCalculateTenorSwapAndForwardRateApi,
  GetCommoditiesForTreasuryApi,
  GetCurrencyCrossesApi,
  getDealerDashboardApi,
  GetDiscountingRatesForDealerApi,
  GetDiscountingRatesForTreasuryApi,
  GetIndicativeFBPRatesApi,
  GetIndicesForTreasuryApi,
  GetKiborDataForRateSheetApi,
  GetKiborDataForTreasuryApi,
  GetLastAndCurrentPublishUSDRateSheetAction,
  getLastPublishRatesAction,
  getMarketStatusApi,
  GetNewsDetailsByIDApi,
  GetNewsHeadlinesApi,
  GetRatesForCurrencyNotesForRateSheetApi,
  GetRefreshIconTenorsApi,
  GetRevalRatesForTreasuryApi,
  GetSBPConversionRatesForRateSheetApi,
  GetSingleDealersSpreadApi,
  GetSOFRDataForRateSheetApi,
  GetSOFRDataForTreasuryApi,
  GetSpotTTRatesForRateSheetApi,
  GetSwapsInUSDForTreasuryApi,
  GetT24RatesApi,
  GetUSDParityForTreasuryApi,
  marketOnOffAction,
  PublishCurrentUSDRateSheetAction,
  PublishFEDiscountingTableApi,
  PublishNewRatesAction,
  PublishNonFEDiscountingTableApi,
  PublishTenorWiseForwardsAction,
  GetWorldCurrencyHistoricalDataApi,
  GetCurrencyCrossesHistoricalDataApi,
  GetCommodityHistoricalDataApi,
  GetWorldIndicesHistoricalDataApi,
  GetKiborHistoricalDataApi,
  GetSOFRHistoricalDataApi,
  GetCurrencySwapsHistoricalDataApi,
  GetSBPFXRatesHistoryApi,
} from "../../actions/WatchlistAction";

const WatchListSlice = createSlice({
  name: "WatchList",
  initialState: {
    responseMessage: "",
    error: null,

    // 🎯 loader flags for each API
    GetAllTreasuryInstrumentsLoading: false,
    GetBankSpotForTreasuryLoading: false,
    GetBankForwardForTreasuryLoading: false,
    GetDiscountingRatesForTreasuryLoading: false,
    GetMarketStatusLoading: false,

    // Loader states taken from Dealer of BOP
    marketOnOffLoading: false,
    clearRatesLoading: false,
    getLastPublishRatesLoading: false,
    publishNewRatesLoading: false,
    getAllTenorsLoading: false,
    createTenorLoading: false,
    publishTenorWiseForwardsLoading: false,
    publishFeDiscountingLoading: false,
    getNonFeDiscountingLoading: false,
    publishNonFeDiscountingLoading: false,
    getDealerDashboardLoading: false,
    getLastPublishRatesSheetLoading: false,
    PublishCurrentUSDRateSheetLoading: false,
    GetBankSpotForDealerLoading: false,
    GetCurrencyCrossesLoading: false,
    GetBankForwardForTreasuryDealerLoading: false,
    GetDiscountingRatesForDealerLoading: false,
    GetAllDealersSpreadLoading: false,
    AddDealerSpreadLoading: false,
    GetSingleDealersSpreadLoading: false,
    GetAllOtherInstrumentsLoading: false,
    GetUSDParityForTreasuryLoading: false,
    GetCommoditiesForTreasuryLoading: false,
    GetIndicesForTreasuryLoading: false,
    GetKiborDataForTreasuryLoading: false,
    GetSOFRDataForTreasuryLoading: false,
    GetRevalRatesForTreasuryLoading: false,
    GetSwapsInUSDForTreasuryLoading: false,
    GetSpotTTRatesForRateSheetLoading: false,
    GetRatesForCurrencyNotesForRateSheetLoading: false,
    GetKiborDataForRateSheetLoading: false,
    GetSOFRDataForRateSheetLoading: false,
    GetIndicativeFBPRatesLoading: false,
    GetSBPConversionRatesForRateSheetLoading: false,
    GetNewsHeadlinesLoading: false,
    GetNewsDetailsByIDLoading: false,
    GetRefreshIconTenorsLoading: false,
    GetCalculateTenorSwapAndForwardRateLoading: false,
    GetT24RatesLoading: false,
    WorldCurrencyHistoricalDataLoading: null,
    CurrencyCrossesHistoricalDataLoading: null,
    CommodityHistoricalDataLoading: null,
    WorldIndicesHistoricalDataLoading: null,
    KiborHistoricalDataLoading: null,
    SOFRHistoricalDataLoading: null,
    CurrencySwapsHistoricalDataLoading: null,
    SBPFXRatesHistoryLoading: null,
    // data states
    GetAllInstrumentForTreasury: null,
    GetBankSpotForTreasury: null,
    GetBankForwardForTreasury: null,
    GetDiscountingRatesForTreasury: null,
    getMarketStatus: null,

    // Dealer from BOP
    // 🔄 Data states
    marketOnOff: null,
    clearRates: null,
    getLastPublishRates: null,
    getCurrentPublishRate: null,
    getAllTenors: null,
    createTenor: null,
    publishTenorwiseForwardRates: null,
    publishFeDiscounting: null,
    getNonFeDiscounting: null,
    publishNonFeDiscounting: null,
    getDealerDashboardData: null,
    forwardsForTreasuryBranch: [],
    dealerValue: {
      value: 0,
      label: "",
    },
    getLastPublishRatesSheet: null,
    PublishCurrentUSDRateSheet: null,
    GetBankSpotForDealer: null,
    GetCurrencyCrosses: null,
    GetBankForwardForTreasuryDealer: null,
    GetDiscountingRatesForDealer: null,
    GetAllDealersSpread: null,
    AddDealerSpread: null,
    GetSingleDealersSpread: null,
    GetAllOtherInstruments: null,
    GetUSDParityForTreasury: null,
    GetCommoditiesForTreasury: null,
    GetIndicesForTreasury: null,
    GetKiborDataForTreasury: null,
    GetSOFRDataForTreasury: null,
    GetRevalRatesForTreasury: null,
    GetSwapsInUSDForTreasury: null,
    GetSpotTTRatesForRateSheet: null,
    GetRatesForCurrencyNotesForRateSheet: null,
    GetKiborDataForRateSheet: null,
    GetSOFRDataForRateSheet: null,
    GetIndicativeFBPRates: null,
    GetSBPConversionRatesForRateSheet: null,
    GetNewsHeadlines: null,
    GetRefreshIconTenors: null,
    GetCalculateTenorSwapAndForwardRate: null,
    GetT24RatesData: null,

    // About Newa
    NewsByNewsIdViewModal: false,
    GetNewsDetailsByID: null,
    NewsLoadingSpinner: false,

    // for Management
    showDownloadHistoryModal: false,
    DownloadHistoryData: null,
    WorldCurrencyHistoricalData: null,
    CurrencyCrossesHistoricalData: null,
    CommodityHistoricalData: null,
    WorldIndicesHistoricalData: null,
    KiborHistoricalData: null,
    SOFRHistoricalData: null,
    CurrencySwapsHistoricalData: null,
    SBPFXRatesHistory: null,
  },
  reducers: {
    setNewsLoadingSpinner: (state, { payload }) => {
      state.NewsLoadingSpinner = payload;
    },
    setNewsByNewsIdViewModal: (state, { payload }) => {
      state.NewsByNewsIdViewModal = payload;
    },
    clearWatchListResponseMessage: (state) => {
      state.responseMessage = "";
    },
    setMarketStatus: (state, action) => {
      state.getMarketStatus = action.payload;
    },
    setForwardsForTreasuryBranch: (state, action) => {
      state.forwardsForTreasuryBranch = action.payload;
    },
    setDealerValue: (state, action) => {
      state.dealerValue = action.payload;
    },
    updateForwardItem: (state, action) => {
      const { tenorID, view, value } = action.payload;
      state.forwardsForTreasuryBranch = state.forwardsForTreasuryBranch.map(
        (item) => {
          if (item.tenorID === tenorID) {
            return {
              ...item,
              currentBid: view === "bid" ? value : item.currentBid,
              currentAsk: view === "ask" ? value : item.currentAsk,
            };
          }
          return item;
        },
      );
    },
    updateTenors: (state, { payload }) => {
      const { removedtenorList, newIsForwardtenorList } = payload;

      const removedSet = new Set(removedtenorList.map((t) => t.tenorID));
      const addedSet = new Set(newIsForwardtenorList.map((t) => t.tenorID));

      state.getAllTenors.tenors = state.getAllTenors.tenors.map((tenor) => {
        if (removedSet.has(tenor.tenorID)) {
          return {
            ...tenor,
            isForwardingApplicable: false,
          };
        }

        if (addedSet.has(tenor.tenorID)) {
          return {
            ...tenor,
            isForwardingApplicable: true,
          };
        }

        return tenor; // unchanged
      });
    },
    setDownloadHistoryModal: (state, { payload }) => {
      state.showDownloadHistoryModal = payload;
    },
    setDownloadHistoryData: (state, { payload }) => {
      state.DownloadHistoryData = payload;
    },
    UpdatetDealerSpotRates: (state, { payload }) => {
      state.GetBankSpotForDealer = payload;
    },
    UpdateDealerForwardRates: (state) => {
      state.GetBankForwardForTreasuryDealer = null;
    },
    UpdateDealerDiscountingRates: (state) => {
      state.GetDiscountingRatesForDealer = null;
    },

    // Individual Clear Reducers
    clearGetBankSpotForDealer: (state) => {
      state.GetBankSpotForDealer = null;
    },
    clearGetCurrencyCrosses: (state) => {
      state.GetCurrencyCrosses = null;
    },
    clearGetBankForwardForTreasuryDealer: (state) => {
      state.GetBankForwardForTreasuryDealer = null;
    },

    clearGetDiscountingRatesForDealer: (state) => {
      state.GetDiscountingRatesForDealer = null;
    },
    clearGetAllDealersSpread: (state) => {
      state.GetAllDealersSpread = null;
    },
    clearAddDealerSpread: (state) => {
      state.AddDealerSpread = null;
    },
    clearGetSingleDealersSpread: (state) => {
      state.GetSingleDealersSpread = null;
    },
    clearGetAllOtherInstruments: (state) => {
      state.GetAllOtherInstruments = null;
    },
    clearGetUSDParityForTreasury: (state) => {
      state.GetUSDParityForTreasury = null;
    },
    clearGetCommoditiesForTreasury: (state) => {
      state.GetCommoditiesForTreasury = null;
    },
    clearGetIndicesForTreasury: (state) => {
      state.GetIndicesForTreasury = null;
    },
    clearGetKiborDataForTreasury: (state) => {
      state.GetKiborDataForTreasury = null;
    },
    clearGetSOFRDataForTreasury: (state) => {
      state.GetSOFRDataForTreasury = null;
    },
    clearGetRevalRatesForTreasury: (state) => {
      state.GetRevalRatesForTreasury = null;
    },
    clearGetSwapsInUSDForTreasury: (state) => {
      state.GetSwapsInUSDForTreasury = null;
    },
    clearGetSpotTTRatesForRateSheet: (state) => {
      state.GetSpotTTRatesForRateSheet = null;
    },
    clearGetRatesForCurrencyNotesForRateSheet: (state) => {
      state.GetRatesForCurrencyNotesForRateSheet = null;
    },
    clearGetKiborDataForRateSheet: (state) => {
      state.GetKiborDataForRateSheet = null;
    },
    clearGetSOFRDataForRateSheet: (state) => {
      state.GetSOFRDataForRateSheet = null;
    },
    clearGetIndicativeFBPRates: (state) => {
      state.GetIndicativeFBPRates = null;
    },
    clearGetSBPConversionRatesForRateSheet: (state) => {
      state.GetSBPConversionRatesForRateSheet = null;
    },
    clearGetNewsHeadlines: (state) => {
      state.GetNewsHeadlines = null;
    },
    clearGetNewsDetailsByID: (state) => {
      state.GetNewsDetailsByID = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ------------------ GetAllTreasuryInstruments ------------------
      .addCase(getAllTreasuryInstrumentsApi.pending, (state) => {
        state.GetAllTreasuryInstrumentsLoading = true;
      })
      .addCase(getAllTreasuryInstrumentsApi.fulfilled, (state, { payload }) => {
        state.GetAllTreasuryInstrumentsLoading = false;
        state.GetAllInstrumentForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getAllTreasuryInstrumentsApi.rejected, (state, { payload }) => {
        state.GetAllTreasuryInstrumentsLoading = false;
        state.GetAllInstrumentForTreasury = null;
        state.error = payload;
      })

      // ------------------ GetBankSpotForTreasury ------------------
      .addCase(GetBankSpotForTreasuryApi.pending, (state) => {
        state.GetBankSpotForTreasuryLoading = true;
      })
      .addCase(GetBankSpotForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetBankSpotForTreasuryLoading = false;
        state.GetBankSpotForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetBankSpotForTreasuryApi.rejected, (state, { payload }) => {
        state.GetBankSpotForTreasuryLoading = false;
        state.GetBankSpotForTreasury = null;
        state.error = payload;
      })

      // ------------------ GetBankForwardForTreasury ------------------
      .addCase(GetBankForwardForTreasuryApi.pending, (state) => {
        state.GetBankForwardForTreasuryLoading = true;
      })
      .addCase(GetBankForwardForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetBankForwardForTreasuryLoading = false;
        state.GetBankForwardForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetBankForwardForTreasuryApi.rejected, (state, { payload }) => {
        state.GetBankForwardForTreasuryLoading = false;
        state.GetBankForwardForTreasury = null;
        state.error = payload;
      })

      // ------------------ GetDiscountingRatesForTreasury ------------------
      .addCase(GetDiscountingRatesForTreasuryApi.pending, (state) => {
        state.GetDiscountingRatesForTreasuryLoading = true;
      })
      .addCase(
        GetDiscountingRatesForTreasuryApi.fulfilled,
        (state, { payload }) => {
          state.GetDiscountingRatesForTreasuryLoading = false;
          state.GetDiscountingRatesForTreasury = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetDiscountingRatesForTreasuryApi.rejected,
        (state, { payload }) => {
          state.GetDiscountingRatesForTreasuryLoading = false;
          state.GetDiscountingRatesForTreasury = null;
          state.error = payload;
        },
      )

      // ------------------ GetMarketStatus ------------------
      .addCase(getMarketStatusApi.pending, (state) => {
        state.GetMarketStatusLoading = true;
      })
      .addCase(getMarketStatusApi.fulfilled, (state, { payload }) => {
        state.GetMarketStatusLoading = false;
        state.getMarketStatus = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getMarketStatusApi.rejected, (state, { payload }) => {
        state.GetMarketStatusLoading = false;
        state.getMarketStatus = null;
        state.error = payload;
      })

      // Code of dealer
      // ✅ Market On/Off
      .addCase(marketOnOffAction.pending, (state) => {
        state.marketOnOffLoading = true;
      })
      .addCase(marketOnOffAction.fulfilled, (state, { payload }) => {
        state.marketOnOffLoading = false;
        state.responseMessage = payload?.message;
        state.marketOnOff = payload?.response;
      })
      .addCase(marketOnOffAction.rejected, (state, { payload }) => {
        state.marketOnOffLoading = false;
        state.marketOnOff = null;
        state.error = payload;
      })

      // ✅ Clear Rates
      .addCase(clearRatesAction.pending, (state) => {
        state.clearRatesLoading = true;
      })
      .addCase(clearRatesAction.fulfilled, (state, { payload }) => {
        state.clearRatesLoading = false;
        state.clearRates = payload?.response;
      })
      .addCase(clearRatesAction.rejected, (state, { payload }) => {
        state.clearRatesLoading = false;
        state.clearRates = null;
        state.error = payload;
      })

      // ✅ Get Last Publish Rates
      .addCase(getLastPublishRatesAction.pending, (state) => {
        state.getLastPublishRatesLoading = true;
      })
      .addCase(getLastPublishRatesAction.fulfilled, (state, { payload }) => {
        state.getLastPublishRatesLoading = false;
        state.getLastPublishRates = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getLastPublishRatesAction.rejected, (state, { payload }) => {
        state.getLastPublishRatesLoading = false;
        state.getLastPublishRates = null;
        state.error = payload;
      })

      // ✅ Publish New Rates
      .addCase(PublishNewRatesAction.pending, (state) => {
        state.publishNewRatesLoading = true;
      })
      .addCase(PublishNewRatesAction.fulfilled, (state, { payload }) => {
        state.publishNewRatesLoading = false;
        state.getCurrentPublishRate = payload?.response;
        state.getLastPublishRates = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(PublishNewRatesAction.rejected, (state, { payload }) => {
        state.publishNewRatesLoading = false;
        state.getCurrentPublishRate = null;
        state.error = payload;
      })

      // ✅GetLastAndCurrentPublishUSDRateSheet
      .addCase(GetLastAndCurrentPublishUSDRateSheetAction.pending, (state) => {
        state.getLastPublishRatesSheetLoading = true;
      })
      .addCase(
        GetLastAndCurrentPublishUSDRateSheetAction.fulfilled,
        (state, { payload }) => {
          state.getLastPublishRatesSheetLoading = false;
          state.getLastPublishRatesSheet = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetLastAndCurrentPublishUSDRateSheetAction.rejected,
        (state, { payload }) => {
          state.getLastPublishRatesSheetLoading = false;
          state.getLastPublishRatesSheet = null;
          state.error = payload;
        },
      )

      // ✅ Publish New Rates
      .addCase(PublishCurrentUSDRateSheetAction.pending, (state) => {
        state.PublishCurrentUSDRateSheetLoading = true;
      })
      .addCase(
        PublishCurrentUSDRateSheetAction.fulfilled,
        (state, { payload }) => {
          state.PublishCurrentUSDRateSheetLoading = false;
          state.PublishCurrentUSDRateSheet = payload?.response;

          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        PublishCurrentUSDRateSheetAction.rejected,
        (state, { payload }) => {
          state.PublishCurrentUSDRateSheetLoading = false;
          state.PublishCurrentUSDRateSheet = null;
          state.error = payload;
        },
      )

      // ✅ Get All Tenors
      .addCase(getAllTenorsAction.pending, (state) => {
        state.getAllTenorsLoading = true;
      })
      .addCase(getAllTenorsAction.fulfilled, (state, { payload }) => {
        state.getAllTenorsLoading = false;
        state.getAllTenors = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getAllTenorsAction.rejected, (state, { payload }) => {
        state.getAllTenorsLoading = false;
        state.getAllTenors = null;
        state.error = payload;
      })

      // ✅ Create Tenor
      .addCase(createTenorAction.pending, (state) => {
        state.createTenorLoading = true;
      })
      .addCase(createTenorAction.fulfilled, (state, { payload }) => {
        state.createTenorLoading = false;
        state.createTenor = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(createTenorAction.rejected, (state, { payload }) => {
        state.createTenorLoading = false;
        state.createTenor = null;
        state.error = payload;
      })

      // ✅ Publish Tenor Wise Forwards
      .addCase(PublishTenorWiseForwardsAction.pending, (state) => {
        state.publishTenorWiseForwardsLoading = true;
      })
      .addCase(
        PublishTenorWiseForwardsAction.fulfilled,
        (state, { payload }) => {
          state.publishTenorWiseForwardsLoading = false;
          state.publishTenorwiseForwardRates = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        PublishTenorWiseForwardsAction.rejected,
        (state, { payload }) => {
          state.publishTenorWiseForwardsLoading = false;
          state.publishTenorwiseForwardRates = null;
          state.error = payload;
          state.responseMessage = payload;
        },
      )

      .addCase(PublishFEDiscountingTableApi.pending, (state) => {
        state.publishFeDiscountingLoading = true;
      })
      .addCase(PublishFEDiscountingTableApi.fulfilled, (state, { payload }) => {
        state.publishFeDiscountingLoading = false;
        state.publishFeDiscounting = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(PublishFEDiscountingTableApi.rejected, (state, { payload }) => {
        state.publishFeDiscountingLoading = false;
        state.publishFeDiscounting = null;
        state.error = payload;
      })

      .addCase(PublishNonFEDiscountingTableApi.pending, (state) => {
        state.publishNonFeDiscountingLoading = true;
      })
      .addCase(
        PublishNonFEDiscountingTableApi.fulfilled,
        (state, { payload }) => {
          state.publishNonFeDiscountingLoading = false;
          state.publishNonFeDiscounting = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        PublishNonFEDiscountingTableApi.rejected,
        (state, { payload }) => {
          state.publishNonFeDiscountingLoading = false;
          state.publishNonFeDiscounting = null;
          state.error = payload;
        },
      )

      // ✅ Dealer Dashboard
      .addCase(getDealerDashboardApi.pending, (state) => {
        state.getDealerDashboardLoading = true;
      })
      .addCase(getDealerDashboardApi.fulfilled, (state, { payload }) => {
        state.getDealerDashboardLoading = false;
        state.getDealerDashboardData = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getDealerDashboardApi.rejected, (state, { payload }) => {
        state.getDealerDashboardLoading = false;
        state.getDealerDashboardData = null;
        state.error = payload;
      })

      // ✅ GetBankSpotForDealer
      .addCase(GetBankSpotForDealerApi.pending, (state) => {
        state.GetBankSpotForDealerLoading = true;
      })
      .addCase(GetBankSpotForDealerApi.fulfilled, (state, { payload }) => {
        state.GetBankSpotForDealerLoading = false;
        state.GetBankSpotForDealer = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetBankSpotForDealerApi.rejected, (state, { payload }) => {
        state.GetBankSpotForDealerLoading = false;
        state.GetBankSpotForDealer = null;
        state.error = payload;
      })
      // ✅ GetCurrencyCrosses
      .addCase(GetCurrencyCrossesApi.pending, (state) => {
        state.GetCurrencyCrossesLoading = true;
      })
      .addCase(GetCurrencyCrossesApi.fulfilled, (state, { payload }) => {
        state.GetCurrencyCrossesLoading = false;
        state.GetCurrencyCrosses = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetCurrencyCrossesApi.rejected, (state, { payload }) => {
        state.GetCurrencyCrossesLoading = false;
        state.GetCurrencyCrosses = null;
        state.error = payload;
      })
      // ✅ GetBankForwardForTreasuryDealer
      .addCase(GetBankForwardForTreasuryDealerApi.pending, (state) => {
        state.GetBankForwardForTreasuryDealerLoading = true;
      })
      .addCase(
        GetBankForwardForTreasuryDealerApi.fulfilled,
        (state, { payload }) => {
          state.GetBankForwardForTreasuryDealerLoading = false;
          state.GetBankForwardForTreasuryDealer = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetBankForwardForTreasuryDealerApi.rejected,
        (state, { payload }) => {
          state.GetBankForwardForTreasuryDealerLoading = false;
          state.GetBankForwardForTreasuryDealer = null;
          state.error = payload;
        },
      )
      // ✅ GetDiscountingRatesForDealer
      .addCase(GetDiscountingRatesForDealerApi.pending, (state) => {
        state.GetDiscountingRatesForDealerLoading = true;
      })
      .addCase(
        GetDiscountingRatesForDealerApi.fulfilled,
        (state, { payload }) => {
          state.GetDiscountingRatesForDealerLoading = false;
          state.GetDiscountingRatesForDealer = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetDiscountingRatesForDealerApi.rejected,
        (state, { payload }) => {
          state.GetDiscountingRatesForDealerLoading = false;
          state.GetDiscountingRatesForDealer = null;
          state.error = payload;
        },
      )
      // ✅ GetAllDealersSpread
      .addCase(GetAllDealersSpreadApi.pending, (state) => {
        state.GetAllDealersSpreadLoading = true;
      })
      .addCase(GetAllDealersSpreadApi.fulfilled, (state, { payload }) => {
        state.GetAllDealersSpreadLoading = false;
        state.GetAllDealersSpread = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetAllDealersSpreadApi.rejected, (state, { payload }) => {
        state.GetAllDealersSpreadLoading = false;
        state.GetAllDealersSpread = null;
        state.error = payload;
      })

      // ✅ Publish Discounting Rates
      .addCase(AddDealerSpreadApi.pending, (state) => {
        state.AddDealerSpreadLoading = true;
      })
      .addCase(AddDealerSpreadApi.fulfilled, (state, { payload }) => {
        state.AddDealerSpreadLoading = false;
        state.AddDealerSpread = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(AddDealerSpreadApi.rejected, (state, { payload }) => {
        state.AddDealerSpreadLoading = false;
        state.AddDealerSpread = null;
        state.error = payload;
      })
      // ✅ GetSingleDealersSpread
      .addCase(GetSingleDealersSpreadApi.pending, (state) => {
        state.GetSingleDealersSpreadLoading = true;
      })
      .addCase(GetSingleDealersSpreadApi.fulfilled, (state, { payload }) => {
        state.GetSingleDealersSpreadLoading = false;
        state.GetSingleDealersSpread = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetSingleDealersSpreadApi.rejected, (state, { payload }) => {
        state.GetSingleDealersSpreadLoading = false;
        state.GetSingleDealersSpread = null;
        state.error = payload;
      })

      // ✅ GetAllOtherInstruments
      .addCase(GetAllOtherInstrumentsApi.pending, (state) => {
        state.GetAllOtherInstrumentsLoading = true;
      })
      .addCase(GetAllOtherInstrumentsApi.fulfilled, (state, { payload }) => {
        state.GetAllOtherInstrumentsLoading = false;
        state.GetAllOtherInstruments = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetAllOtherInstrumentsApi.rejected, (state, { payload }) => {
        state.GetAllOtherInstrumentsLoading = false;
        state.GetAllOtherInstruments = null;
        state.error = payload;
      })
      // ✅ GetUSDParityForTreasury
      .addCase(GetUSDParityForTreasuryApi.pending, (state) => {
        state.GetUSDParityForTreasuryLoading = true;
      })
      .addCase(GetUSDParityForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetUSDParityForTreasuryLoading = false;
        state.GetUSDParityForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetUSDParityForTreasuryApi.rejected, (state, { payload }) => {
        state.GetUSDParityForTreasuryLoading = false;
        state.GetUSDParityForTreasury = null;
        state.error = payload;
      })
      // ✅ GetCommoditiesForTreasury
      .addCase(GetCommoditiesForTreasuryApi.pending, (state) => {
        state.GetCommoditiesForTreasuryLoading = true;
      })
      .addCase(GetCommoditiesForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetCommoditiesForTreasuryLoading = false;
        state.GetCommoditiesForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetCommoditiesForTreasuryApi.rejected, (state, { payload }) => {
        state.GetCommoditiesForTreasuryLoading = false;
        state.GetCommoditiesForTreasury = null;
        state.error = payload;
      })

      // ✅ GetIndicesForTreasuryApi
      .addCase(GetIndicesForTreasuryApi.pending, (state) => {
        state.GetIndicesForTreasuryLoading = true;
      })
      .addCase(GetIndicesForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetIndicesForTreasuryLoading = false;
        state.GetIndicesForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetIndicesForTreasuryApi.rejected, (state, { payload }) => {
        state.GetIndicesForTreasuryLoading = false;
        state.GetIndicesForTreasury = null;
        state.error = payload;
      })

      // ✅ GetKiborDataForTreasury
      .addCase(GetKiborDataForTreasuryApi.pending, (state) => {
        state.GetKiborDataForTreasuryLoading = true;
      })
      .addCase(GetKiborDataForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetKiborDataForTreasuryLoading = false;
        state.GetKiborDataForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetKiborDataForTreasuryApi.rejected, (state, { payload }) => {
        state.GetKiborDataForTreasuryLoading = false;
        state.GetKiborDataForTreasury = null;
        state.error = payload;
      })

      // ✅ GetSOFRDataForTreasury
      .addCase(GetSOFRDataForTreasuryApi.pending, (state) => {
        state.GetSOFRDataForTreasuryLoading = true;
      })
      .addCase(GetSOFRDataForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetSOFRDataForTreasuryLoading = false;
        state.GetSOFRDataForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetSOFRDataForTreasuryApi.rejected, (state, { payload }) => {
        state.GetSOFRDataForTreasuryLoading = false;
        state.GetSOFRDataForTreasury = null;
        state.error = payload;
      })

      // ✅ GetRevalRatesForTreasury
      .addCase(GetRevalRatesForTreasuryApi.pending, (state) => {
        state.GetRevalRatesForTreasuryLoading = true;
      })
      .addCase(GetRevalRatesForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetRevalRatesForTreasuryLoading = false;
        state.GetRevalRatesForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetRevalRatesForTreasuryApi.rejected, (state, { payload }) => {
        state.GetRevalRatesForTreasuryLoading = false;
        state.GetRevalRatesForTreasury = null;
        state.error = payload;
      })

      // ✅ GetSwapsInUSDForTreasury
      .addCase(GetSwapsInUSDForTreasuryApi.pending, (state) => {
        state.GetSwapsInUSDForTreasuryLoading = true;
      })
      .addCase(GetSwapsInUSDForTreasuryApi.fulfilled, (state, { payload }) => {
        state.GetSwapsInUSDForTreasuryLoading = false;
        state.GetSwapsInUSDForTreasury = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetSwapsInUSDForTreasuryApi.rejected, (state, { payload }) => {
        state.GetSwapsInUSDForTreasuryLoading = false;
        state.GetSwapsInUSDForTreasury = null;
        state.error = payload;
      })

      // ✅ GetSpotTTRatesForRateSheet
      .addCase(GetSpotTTRatesForRateSheetApi.pending, (state) => {
        state.GetSpotTTRatesForRateSheetLoading = true;
      })
      .addCase(
        GetSpotTTRatesForRateSheetApi.fulfilled,
        (state, { payload }) => {
          state.GetSpotTTRatesForRateSheetLoading = false;
          state.GetSpotTTRatesForRateSheet = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(GetSpotTTRatesForRateSheetApi.rejected, (state, { payload }) => {
        state.GetSpotTTRatesForRateSheetLoading = false;
        state.GetSpotTTRatesForRateSheet = null;
        state.error = payload;
      })

      // ✅ GetRatesForCurrencyNotesForRateSheet
      .addCase(GetRatesForCurrencyNotesForRateSheetApi.pending, (state) => {
        state.GetRatesForCurrencyNotesForRateSheetLoading = true;
      })
      .addCase(
        GetRatesForCurrencyNotesForRateSheetApi.fulfilled,
        (state, { payload }) => {
          state.GetRatesForCurrencyNotesForRateSheetLoading = false;
          state.GetRatesForCurrencyNotesForRateSheet = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetRatesForCurrencyNotesForRateSheetApi.rejected,
        (state, { payload }) => {
          state.GetRatesForCurrencyNotesForRateSheetLoading = false;
          state.GetRatesForCurrencyNotesForRateSheet = null;
          state.error = payload;
        },
      )

      // ✅ GetKiborDataForRateSheet
      .addCase(GetKiborDataForRateSheetApi.pending, (state) => {
        state.GetKiborDataForRateSheetLoading = true;
      })
      .addCase(GetKiborDataForRateSheetApi.fulfilled, (state, { payload }) => {
        state.GetKiborDataForRateSheetLoading = false;
        state.GetKiborDataForRateSheet = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetKiborDataForRateSheetApi.rejected, (state, { payload }) => {
        state.GetKiborDataForRateSheetLoading = false;
        state.GetKiborDataForRateSheet = null;
        state.error = payload;
      })

      // ✅ GetSOFRDataForRateSheet
      .addCase(GetSOFRDataForRateSheetApi.pending, (state) => {
        state.GetSOFRDataForRateSheetLoading = true;
      })
      .addCase(GetSOFRDataForRateSheetApi.fulfilled, (state, { payload }) => {
        state.GetSOFRDataForRateSheetLoading = false;
        state.GetSOFRDataForRateSheet = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetSOFRDataForRateSheetApi.rejected, (state, { payload }) => {
        state.GetSOFRDataForRateSheetLoading = false;
        state.GetSOFRDataForRateSheet = null;
        state.error = payload;
      })

      // ✅ GetIndicativeFBPRates
      .addCase(GetIndicativeFBPRatesApi.pending, (state) => {
        state.GetIndicativeFBPRatesLoading = true;
      })
      .addCase(GetIndicativeFBPRatesApi.fulfilled, (state, { payload }) => {
        state.GetIndicativeFBPRatesLoading = false;
        state.GetIndicativeFBPRates = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetIndicativeFBPRatesApi.rejected, (state, { payload }) => {
        state.GetIndicativeFBPRatesLoading = false;
        state.GetIndicativeFBPRates = null;
        state.error = payload;
      })

      // ✅ GetSBPConversionRatesForRateSheet
      .addCase(GetSBPConversionRatesForRateSheetApi.pending, (state) => {
        state.GetSBPConversionRatesForRateSheetLoading = true;
      })
      .addCase(
        GetSBPConversionRatesForRateSheetApi.fulfilled,
        (state, { payload }) => {
          state.GetSBPConversionRatesForRateSheetLoading = false;
          state.GetSBPConversionRatesForRateSheet = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetSBPConversionRatesForRateSheetApi.rejected,
        (state, { payload }) => {
          state.GetSBPConversionRatesForRateSheetLoading = false;
          state.GetSBPConversionRatesForRateSheet = null;
          state.error = payload;
        },
      )

      // ------------------ GetNewsHeadlines ------------------
      .addCase(GetNewsHeadlinesApi.pending, (state) => {
        state.GetNewsHeadlinesLoading = true;
      })
      .addCase(GetNewsHeadlinesApi.fulfilled, (state, { payload }) => {
        state.GetNewsHeadlinesLoading = false;
        state.GetNewsHeadlines = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetNewsHeadlinesApi.rejected, (state, { payload }) => {
        state.GetNewsHeadlinesLoading = false;
        state.GetNewsHeadlines = null;
        state.error = payload;
      })

      // ------------------ GetNewsDetailsByID ------------------
      .addCase(GetNewsDetailsByIDApi.pending, (state) => {
        state.GetNewsDetailsByIDLoading = true;
      })
      .addCase(GetNewsDetailsByIDApi.fulfilled, (state, { payload }) => {
        state.GetNewsDetailsByIDLoading = false;
        state.GetNewsDetailsByID = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetNewsDetailsByIDApi.rejected, (state, { payload }) => {
        state.GetNewsDetailsByIDLoading = false;
        state.GetNewsDetailsByID = null;
        state.error = payload;
      })

      //GetRefreshIconTenorsApi
      // ------------------ GetRefreshIconTenorsApi ------------------
      .addCase(GetRefreshIconTenorsApi.pending, (state) => {
        state.GetRefreshIconTenorsLoading = true;
      })
      .addCase(GetRefreshIconTenorsApi.fulfilled, (state, { payload }) => {
        state.GetRefreshIconTenorsLoading = false;
        state.GetRefreshIconTenors = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetRefreshIconTenorsApi.rejected, (state, { payload }) => {
        state.GetRefreshIconTenorsLoading = false;
        state.GetRefreshIconTenors = null;
        state.error = payload;
      })
      .addCase(GetCalculateTenorSwapAndForwardRateApi.pending, (state) => {
        state.GetCalculateTenorSwapAndForwardRateLoading = true;
      })
      .addCase(
        GetCalculateTenorSwapAndForwardRateApi.fulfilled,
        (state, { payload }) => {
          state.GetCalculateTenorSwapAndForwardRateLoading = false;
          state.GetCalculateTenorSwapAndForwardRate = payload?.response;
          state.responseMessage = payload?.message;
        },
      )
      .addCase(
        GetCalculateTenorSwapAndForwardRateApi.rejected,
        (state, { payload }) => {
          state.GetCalculateTenorSwapAndForwardRateLoading = false;
          state.GetCalculateTenorSwapAndForwardRate = null;
          state.responseMessage = payload;
        },
      )
      .addCase(GetT24RatesApi.pending, (state) => {
        state.GetT24RatesLoading = true;
      })
      .addCase(GetT24RatesApi.fulfilled, (state, { payload }) => {
        state.GetT24RatesLoading = false;
        state.GetT24RatesData = payload.response;
        state.responseMessage = payload.message;
      })
      .addCase(GetT24RatesApi.rejected, (state, { payload }) => {
        state.GetT24RatesLoading = false;

        state.GetT24RatesData = null;
        state.responseMessage = payload;
      })
      .addCase(setActiveTab, (state, action) => {
        state.activeTab = action.payload;
      })
      // ============================================================
      // Historical Data APIs
      // ============================================================

      // ------------------ World Currency Historical Data ------------------
      .addCase(GetWorldCurrencyHistoricalDataApi.pending, (state) => {
        state.WorldCurrencyHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(
        GetWorldCurrencyHistoricalDataApi.fulfilled,
        (state, { payload }) => {
          state.WorldCurrencyHistoricalDataLoading = false;
          state.WorldCurrencyHistoricalData = payload?.response;
          state.responseMessage = payload?.message ?? "";
        },
      )
      .addCase(
        GetWorldCurrencyHistoricalDataApi.rejected,
        (state, { payload }) => {
          state.WorldCurrencyHistoricalDataLoading = false;
          state.WorldCurrencyHistoricalData = null;
          state.error = payload;
          state.responseMessage = payload ?? "";
        },
      )

      // ------------------ Currency Crosses Historical Data ------------------
      .addCase(GetCurrencyCrossesHistoricalDataApi.pending, (state) => {
        state.CurrencyCrossesHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(
        GetCurrencyCrossesHistoricalDataApi.fulfilled,
        (state, { payload }) => {
          state.CurrencyCrossesHistoricalDataLoading = false;
          state.CurrencyCrossesHistoricalData = payload?.response;
          state.responseMessage = payload?.message ?? "";
        },
      )
      .addCase(
        GetCurrencyCrossesHistoricalDataApi.rejected,
        (state, { payload }) => {
          state.CurrencyCrossesHistoricalDataLoading = false;
          state.CurrencyCrossesHistoricalData = null;
          state.error = payload;
          state.responseMessage = payload ?? "";
        },
      )

      // ------------------ Commodity Historical Data ------------------
      .addCase(GetCommodityHistoricalDataApi.pending, (state) => {
        state.CommodityHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(
        GetCommodityHistoricalDataApi.fulfilled,
        (state, { payload }) => {
          state.CommodityHistoricalDataLoading = false;
          state.CommodityHistoricalData = payload?.response;
          state.responseMessage = payload?.message ?? "";
        },
      )
      .addCase(GetCommodityHistoricalDataApi.rejected, (state, { payload }) => {
        state.CommodityHistoricalDataLoading = false;
        state.CommodityHistoricalData = null;
        state.error = payload;
        state.responseMessage = payload ?? "";
      })

      // ------------------ World Indices Historical Data ------------------
      .addCase(GetWorldIndicesHistoricalDataApi.pending, (state) => {
        state.WorldIndicesHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(
        GetWorldIndicesHistoricalDataApi.fulfilled,
        (state, { payload }) => {
          state.WorldIndicesHistoricalDataLoading = false;
          state.WorldIndicesHistoricalData = payload?.response;
          state.responseMessage = payload?.message ?? "";
        },
      )
      .addCase(
        GetWorldIndicesHistoricalDataApi.rejected,
        (state, { payload }) => {
          state.WorldIndicesHistoricalDataLoading = false;
          state.WorldIndicesHistoricalData = null;
          state.error = payload;
          state.responseMessage = payload ?? "";
        },
      )

      // ------------------ KIBOR Historical Data ------------------
      .addCase(GetKiborHistoricalDataApi.pending, (state) => {
        state.KiborHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(GetKiborHistoricalDataApi.fulfilled, (state, { payload }) => {
        state.KiborHistoricalDataLoading = false;
        state.KiborHistoricalData = payload?.response;
        state.responseMessage = payload?.message ?? "";
      })
      .addCase(GetKiborHistoricalDataApi.rejected, (state, { payload }) => {
        state.KiborHistoricalDataLoading = false;
        state.KiborHistoricalData = null;
        state.error = payload;
        state.responseMessage = payload ?? "";
      })

      // ------------------ SOFR Historical Data ------------------
      .addCase(GetSOFRHistoricalDataApi.pending, (state) => {
        state.SOFRHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(GetSOFRHistoricalDataApi.fulfilled, (state, { payload }) => {
        state.SOFRHistoricalDataLoading = false;
        state.SOFRHistoricalData = payload?.response;
        state.responseMessage = payload?.message ?? "";
      })
      .addCase(GetSOFRHistoricalDataApi.rejected, (state, { payload }) => {
        state.SOFRHistoricalDataLoading = false;
        state.SOFRHistoricalData = null;
        state.error = payload;
        state.responseMessage = payload ?? "";
      })

      // ------------------ Currency Swaps Historical Data ------------------
      .addCase(GetCurrencySwapsHistoricalDataApi.pending, (state) => {
        state.CurrencySwapsHistoricalDataLoading = true;
        state.error = null;
      })
      .addCase(
        GetCurrencySwapsHistoricalDataApi.fulfilled,
        (state, { payload }) => {
          state.CurrencySwapsHistoricalDataLoading = false;
          state.CurrencySwapsHistoricalData = payload?.response;
          state.responseMessage = payload?.message ?? "";
        },
      )
      .addCase(
        GetCurrencySwapsHistoricalDataApi.rejected,
        (state, { payload }) => {
          state.CurrencySwapsHistoricalDataLoading = false;
          state.CurrencySwapsHistoricalData = null;
          state.error = payload;
          state.responseMessage = payload ?? "";
        },
      )

      // ------------------ SBP FX Rates History ------------------
      .addCase(GetSBPFXRatesHistoryApi.pending, (state) => {
        state.SBPFXRatesHistoryLoading = true;
        state.error = null;
      })
      .addCase(GetSBPFXRatesHistoryApi.fulfilled, (state, { payload }) => {
        state.SBPFXRatesHistoryLoading = false;
        state.SBPFXRatesHistory = payload?.response;
        state.responseMessage = payload?.message ?? "";
      })
      .addCase(GetSBPFXRatesHistoryApi.rejected, (state, { payload }) => {
        state.SBPFXRatesHistoryLoading = false;
        state.SBPFXRatesHistory = null;
        state.error = payload;
        state.responseMessage = payload ?? "";
      });
  },
});

export const {
  // Standard Market/Dealer Actions
  setMarketStatus,
  setForwardsForTreasuryBranch,
  setDealerValue,
  updateForwardItem,
  UpdatetDealerSpotRates,
  UpdateDealerForwardRates,
  UpdateDealerDiscountingRates,
  updateTenors,

  // Treasury Field Clear Actions
  clearGetBankSpotForDealer,
  clearGetCurrencyCrosses,
  clearGetBankForwardForTreasuryDealer,
  clearGetDiscountingRatesForDealer,
  clearGetAllDealersSpread,
  clearAddDealerSpread,
  clearGetSingleDealersSpread,
  clearGetAllOtherInstruments,
  clearGetUSDParityForTreasury,
  clearGetCommoditiesForTreasury,
  clearGetIndicesForTreasury,
  clearGetKiborDataForTreasury,
  clearGetSOFRDataForTreasury,
  clearGetRevalRatesForTreasury,
  clearGetSwapsInUSDForTreasury,
  clearGetSpotTTRatesForRateSheet,
  clearGetRatesForCurrencyNotesForRateSheet,
  clearGetKiborDataForRateSheet,
  clearGetSOFRDataForRateSheet,
  clearGetIndicativeFBPRates,
  clearGetSBPConversionRatesForRateSheet,

  // News and Misc Clear Actions
  clearGetNewsHeadlines,
  clearGetNewsDetailsByID,
  clearWatchListResponseMessage,

  // News Modal
  setNewsByNewsIdViewModal,
  setNewsLoadingSpinner,
  setDownloadHistoryData,
  setDownloadHistoryModal,
} = WatchListSlice.actions;
export default WatchListSlice.reducer;
