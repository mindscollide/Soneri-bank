import { createSlice } from "@reduxjs/toolkit";
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
  GetCorporateDailyVolumeAPI,
  GetCurrencyCrossesApi,
  GetDashboardDataAPI,
  getDealerDashboardApi,
  getDiscountingRatesAction,
  GetDiscountingRatesForCounterPartyApi,
  GetDiscountingRatesForDealerApi,
  GetDiscountingRatesForTreasuryApi,
  GetFEDiscountingTableApi,
  GetForwardRatesForCounterPartyApi,
  GetLastAndCurrentPublishUSDRateSheetAction,
  getLastPublishRatesAction,
  getMarketStatusApi,
  GetMisDataByRangeAPI,
  GetNonFEDiscountingTableApi,
  GetSingleDealersSpreadApi,
  getTenorWiseForwardsAction,
  marketOnOffAction,
  PublishCurrentUSDRateSheetAction,
  publishDiscountingRatesAction,
  PublishFEDiscountingTableApi,
  PublishNewRatesAction,
  PublishNonFEDiscountingTableApi,
  PublishTenorWiseForwardsAction,
  SaveUserDashboardAPI,
} from "../../actions/WatchlistAction";

const WatchListSlice = createSlice({
  name: "WatchList",
  initialState: {
    responseMessage: "",
    error: null,

    // 🎯 loader flags for each API
    GetMisDataByRangeLoading: false,
    GetDashboardDataLoading: false,
    SaveUserDashboardLoading: false,
    GetAllTreasuryInstrumentsLoading: false,
    GetForwardRatesForCounterPartyLoading: false,
    GetDiscountingRatesForCounterPartyLoading: false,
    GetBankSpotForTreasuryLoading: false,
    GetBankForwardForTreasuryLoading: false,
    GetDiscountingRatesForTreasuryLoading: false,
    GetMarketStatusLoading: false,
    GetCorporateDailyVolumeLoading: false,

    // Loader states taken from Dealer of BOP
    marketOnOffLoading: false,
    clearRatesLoading: false,
    getLastPublishRatesLoading: false,
    publishNewRatesLoading: false,
    getAllTenorsLoading: false,
    createTenorLoading: false,
    getTenorWiseForwardsLoading: false,
    publishTenorWiseForwardsLoading: false,
    getDiscountingRatesLoading: false,
    publishDiscountingRatesLoading: false,
    getFeDiscountingLoading: false,
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

    // data states
    getAllInstrumentForCounterParties: null,
    GetMisDataByRange: null,
    SaveUserDashboardData: null,
    allInstrumentForTreasury: null,
    GetAllFowardsAndDiscountsRatesData: null,
    GetForwardRatesForCounterParty: null,
    GetDiscountingRatesForCounterParty: null,
    GetAllInstrumentForTreasury: null,
    GetBankSpotForTreasury: null,
    GetBankForwardForTreasury: null,
    GetDiscountingRatesForTreasury: null,
    getMarketStatus: null,
    watchlistTableDataCopy: null,
    GetCorporateDailyVolume: null,

    // Dealer from BOP
    // 🔄 Data states
    marketOnOff: null,
    clearRates: null,
    getLastPublishRates: null,
    getCurrentPublishRate: null,
    getAllTenors: null,
    createTenor: null,
    getTenorWiseForwardsRates: null,
    publishTenorwiseForwardRates: null,
    getDiscountingWiseRates: null,
    publishDiscountRates: null,
    getFeDiscounting: null,
    publishFeDiscounting: null,
    getNonFeDiscounting: null,
    publishNonFeDiscounting: null,
    getDealerDashboardData: null,
    forwardsForTreasuryBranch: [],
    GetCategoryWiseSpotRates: null,
    categoryValue: {
      value: 0,
      label: "",
    },
    dealerValue: {
      value: 0,
      label: "",
    },
    GetVoltMeterStatusRealtime: null,
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
  },
  reducers: {
    clearWatchListResponseMessage: (state) => {
      state.responseMessage = "";
    },
    setMarketStatus: (state, action) => {
      state.getMarketStatus = action.payload;
    },
    setWatchlistTableDataCopy(state, { payload }) {
      state.watchlistTableDataCopy = payload;
    },
    clearCorporateDailyVolume: (state) => {
      state.GetCorporateDailyVolume = null;
      state.GetCorporateDailyVolumeLoading = false;
    },
    // codeof dealer
    setUpdateVolMeterRealtime: (state, action) => {
      state.GetVoltMeterStatusRealtime = action.payload;
    },
    clearDealerResponseMessage: (state) => {
      state.responseMessage = "";
    },
    setForwardsForTreasuryBranch: (state, action) => {
      state.forwardsForTreasuryBranch = action.payload;
    },
    setCategoryValue: (state, action) => {
      state.categoryValue = action.payload;
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
        }
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // ------------------ GetMisDataByRange ------------------
      .addCase(GetMisDataByRangeAPI.pending, (state) => {
        state.GetMisDataByRangeLoading = true;
        state.error = null;
      })
      .addCase(GetMisDataByRangeAPI.fulfilled, (state, { payload }) => {
        state.GetMisDataByRangeLoading = false;
        state.GetMisDataByRange = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetMisDataByRangeAPI.rejected, (state, { payload }) => {
        state.GetMisDataByRangeLoading = false;
        state.GetMisDataByRange = null;
        state.error = payload;
      })

      // ------------------ GetDashboardData ------------------
      .addCase(GetDashboardDataAPI.pending, (state) => {
        state.GetDashboardDataLoading = true;
      })
      .addCase(GetDashboardDataAPI.fulfilled, (state, { payload }) => {
        state.GetDashboardDataLoading = false;
        state.getAllInstrumentForCounterParties = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetDashboardDataAPI.rejected, (state, { payload }) => {
        state.GetDashboardDataLoading = false;
        state.getAllInstrumentForCounterParties = null;
        state.error = payload;
      })

      // ------------------ SaveUserDashboard ------------------
      .addCase(SaveUserDashboardAPI.pending, (state) => {
        state.SaveUserDashboardLoading = true;
      })
      .addCase(SaveUserDashboardAPI.fulfilled, (state, { payload }) => {
        state.SaveUserDashboardLoading = false;
        state.SaveUserDashboardData = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(SaveUserDashboardAPI.rejected, (state, { payload }) => {
        state.SaveUserDashboardLoading = false;
        state.SaveUserDashboardData = null;
        state.error = payload;
      })

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

      // ------------------ GetForwardRatesForCounterParty ------------------
      .addCase(GetForwardRatesForCounterPartyApi.pending, (state) => {
        state.GetForwardRatesForCounterPartyLoading = true;
      })
      .addCase(
        GetForwardRatesForCounterPartyApi.fulfilled,
        (state, { payload }) => {
          state.GetForwardRatesForCounterPartyLoading = false;
          state.GetForwardRatesForCounterParty = payload?.response;
          state.responseMessage = payload?.message;
        }
      )
      .addCase(
        GetForwardRatesForCounterPartyApi.rejected,
        (state, { payload }) => {
          state.GetForwardRatesForCounterPartyLoading = false;
          state.GetForwardRatesForCounterParty = null;
          state.error = payload;
        }
      )

      // ------------------ GetDiscountingRatesForCounterParty ------------------
      .addCase(GetDiscountingRatesForCounterPartyApi.pending, (state) => {
        state.GetDiscountingRatesForCounterPartyLoading = true;
      })
      .addCase(
        GetDiscountingRatesForCounterPartyApi.fulfilled,
        (state, { payload }) => {
          state.GetDiscountingRatesForCounterPartyLoading = false;
          state.GetDiscountingRatesForCounterParty = payload?.response;
          state.responseMessage = payload?.message;
        }
      )
      .addCase(
        GetDiscountingRatesForCounterPartyApi.rejected,
        (state, { payload }) => {
          state.GetDiscountingRatesForCounterPartyLoading = false;
          state.GetDiscountingRatesForCounterParty = null;
          state.error = payload;
        }
      )

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
        }
      )
      .addCase(
        GetDiscountingRatesForTreasuryApi.rejected,
        (state, { payload }) => {
          state.GetDiscountingRatesForTreasuryLoading = false;
          state.GetDiscountingRatesForTreasury = null;
          state.error = payload;
        }
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

      //----------------GetCorporateDailyVolume------------------
      .addCase(GetCorporateDailyVolumeAPI.pending, (state) => {
        state.GetCorporateDailyVolumeLoading = true;
      })
      .addCase(GetCorporateDailyVolumeAPI.fulfilled, (state, { payload }) => {
        state.GetCorporateDailyVolumeLoading = false;
        state.GetCorporateDailyVolume = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetCorporateDailyVolumeAPI.rejected, (state, { payload }) => {
        state.GetCorporateDailyVolumeLoading = false;
        state.GetCorporateDailyVolume = null;
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
        }
      )
      .addCase(
        GetLastAndCurrentPublishUSDRateSheetAction.rejected,
        (state, { payload }) => {
          state.getLastPublishRatesSheetLoading = false;
          state.getLastPublishRatesSheet = null;
          state.error = payload;
        }
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
        }
      )
      .addCase(
        PublishCurrentUSDRateSheetAction.rejected,
        (state, { payload }) => {
          state.PublishCurrentUSDRateSheetLoading = false;
          state.PublishCurrentUSDRateSheet = null;
          state.error = payload;
        }
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

      // ✅ Get Tenor Wise Forwards
      .addCase(getTenorWiseForwardsAction.pending, (state) => {
        state.getTenorWiseForwardsLoading = true;
      })
      .addCase(getTenorWiseForwardsAction.fulfilled, (state, { payload }) => {
        state.getTenorWiseForwardsLoading = false;
        state.getTenorWiseForwardsRates = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getTenorWiseForwardsAction.rejected, (state, { payload }) => {
        state.getTenorWiseForwardsLoading = false;
        state.getTenorWiseForwardsRates = null;
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
        }
      )
      .addCase(
        PublishTenorWiseForwardsAction.rejected,
        (state, { payload }) => {
          state.publishTenorWiseForwardsLoading = false;
          state.publishTenorwiseForwardRates = null;
          state.error = payload;
          state.responseMessage = payload;
        }
      )

      // ✅ Get Discounting Rates
      .addCase(getDiscountingRatesAction.pending, (state) => {
        state.getDiscountingRatesLoading = true;
      })
      .addCase(getDiscountingRatesAction.fulfilled, (state, { payload }) => {
        state.getDiscountingRatesLoading = false;
        state.getDiscountingWiseRates = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getDiscountingRatesAction.rejected, (state, { payload }) => {
        state.getDiscountingRatesLoading = false;
        state.getDiscountingWiseRates = null;
        state.error = payload;
      })

      // ✅ Publish Discounting Rates
      .addCase(publishDiscountingRatesAction.pending, (state) => {
        state.publishDiscountingRatesLoading = true;
      })
      .addCase(
        publishDiscountingRatesAction.fulfilled,
        (state, { payload }) => {
          state.publishDiscountingRatesLoading = false;
          state.publishDiscountRates = payload?.response;
          state.responseMessage = payload?.message;
        }
      )
      .addCase(publishDiscountingRatesAction.rejected, (state, { payload }) => {
        state.publishDiscountingRatesLoading = false;
        state.publishDiscountRates = null;
        state.error = payload;
      })

      // ✅ FE Discounting
      .addCase(GetFEDiscountingTableApi.pending, (state) => {
        state.getFeDiscountingLoading = true;
      })
      .addCase(GetFEDiscountingTableApi.fulfilled, (state, { payload }) => {
        state.getFeDiscountingLoading = false;
        state.getFeDiscounting = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetFEDiscountingTableApi.rejected, (state, { payload }) => {
        state.getFeDiscountingLoading = false;
        state.getFeDiscounting = null;
        state.error = payload;
      })

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

      // ✅ Non-FE Discounting
      .addCase(GetNonFEDiscountingTableApi.pending, (state) => {
        state.getNonFeDiscountingLoading = true;
      })
      .addCase(GetNonFEDiscountingTableApi.fulfilled, (state, { payload }) => {
        state.getNonFeDiscountingLoading = false;
        state.getNonFeDiscounting = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(GetNonFEDiscountingTableApi.rejected, (state, { payload }) => {
        state.getNonFeDiscountingLoading = false;
        state.getNonFeDiscounting = null;
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
        }
      )
      .addCase(
        PublishNonFEDiscountingTableApi.rejected,
        (state, { payload }) => {
          state.publishNonFeDiscountingLoading = false;
          state.publishNonFeDiscounting = null;
          state.error = payload;
        }
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
        }
      )
      .addCase(
        GetBankForwardForTreasuryDealerApi.rejected,
        (state, { payload }) => {
          state.GetBankForwardForTreasuryDealerLoading = false;
          state.GetBankForwardForTreasuryDealer = null;
          state.error = payload;
        }
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
        }
      )
      .addCase(
        GetDiscountingRatesForDealerApi.rejected,
        (state, { payload }) => {
          state.GetDiscountingRatesForDealerLoading = false;
          state.GetDiscountingRatesForDealer = null;
          state.error = payload;
        }
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
      });
  },
});

export const {
  clearWatchListResponseMessage,
  setMarketStatus,
  setWatchlistTableDataCopy,
  clearCorporateDailyVolume,
  setUpdateVolMeterRealtime,
  clearDealerResponseMessage,
  setForwardsForTreasuryBranch,
  setCategoryValue,
  setDealerValue,
  updateForwardItem,
} = WatchListSlice.actions;
export default WatchListSlice.reducer;
