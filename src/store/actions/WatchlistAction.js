import {
  GetAllInstrumentForTreasuryRM,
  GetBankForwardForTreasury,
  GetBankSpotForTreasury,
  GetCorporateDailyVolume,
  GetDashboardData,
  GetDiscountingRatesForCounterParty,
  GetDiscountingRatesForTreasury,
  GetForwardRatesForCounterParty,
  GetMisDataByRange,
  SaveUserDashboardRM,
  getMarketStatusRM,
} from "@/common/api_config";

// import { setCustomHeaders } from "@/common/utils";
import createPostAPI from "@/utils/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi, watchListApi } from "../../common/apiend_point";
import {
  AddDealerSpread,
  clearRatesRM,
  createTenorRM,
  GetAllDealersSpread,
  GetAllOtherInstruments,
  getAllTenorsRM,
  GetBankForwardForTreasuryDealer,
  GetBankSpotForDealer,
  GetCommoditiesForTreasury,
  GetCurrencyCrosses,
  getDealerDasboardDataRM,
  GetDiscountingRatesForDealer,
  getDiscountingRatesRM,
  GetFeDiscountingRM,
  GetIndicativeFBPRates,
  GetIndicesForTreasury,
  GetKiborDataForRateSheet,
  GetKiborDataForTreasury,
  GetLastAndCurrentPublishUSDRateSheet,
  getLastAndCurrentUSDRatesRM,
  GetNonFeDiscountingRatesRM,
  GetRatesForCurrencyNotesForRateSheet,
  GetRevalRatesForTreasury,
  GetSBPConversionRatesForRateSheet,
  GetSingleDealersSpread,
  GetSOFRDataForRateSheet,
  GetSOFRDataForTreasury,
  GetSpotTTRatesForRateSheet,
  GetSwapsInUSDForTreasury,
  getTenorWiseForwardRatesRM,
  GetUSDParityForTreasury,
  marketOnOffRM,
  PublishCurrentUSDRateSheet,
  publishCurrentUSDRatesRM,
  publishDiscountingRatesRM,
  PublishFeDiscountingRM,
  PublishNonFeDiscountingRatesRM,
  publishTenorWiseForwardRatesRM,
} from "../../common/api_config";
import {
  setCreateTenorModal,
  setPublishedSpotRates,
  setPublishedSpotRateSheet,
} from "../slicers/modalSlicer/modalSlicer";

// Define the GetAllFowardsAndDiscountsRates async thunk
export const GetDashboardDataAPI = createAsyncThunk(
  "watchlist/GetDashboardData", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetDashboardDataAction = createPostAPI(
        watchListApi,
        GetDashboardData.RequestMethod
      );

      const response = await GetDashboardDataAction();
      const { responseCode } = response.data;
      console.log(responseCode, "responseCoderesponseCode");

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetFXTradingSectionAndApplicableInstrument_01".toLowerCase()
              )
          ) {
            console.log(
              "getAllInstrumentsForCounterPartiesData",
              response.data
            );

            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDashboardData_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDashboardData_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetAllFowardsAndDiscountsRates async thunk
export const SaveUserDashboardAPI = createAsyncThunk(
  "watchlist/SaveUserDashboard", // A unique action type string
  async ({ Data, navigate }, { dispatch, rejectWithValue }) => {
    try {
      let SaveUserDashboard = createPostAPI(
        watchListApi,
        SaveUserDashboardRM.RequestMethod
      );

      const response = await SaveUserDashboard(Data);
      const { responseCode } = response.data;
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_SaveUserDashboard_01".toLowerCase()
              )
          ) {
            console.log("", response.data);
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_SaveUserDashboard_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_SaveUserDashboard_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetAllFowardsAndDiscountsRates async thunk
export const getAllTreasuryInstrumentsApi = createAsyncThunk(
  "watchlist/getAllTreasuryInstruments", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getAllInstruments = createPostAPI(
        watchListApi,
        GetAllInstrumentForTreasuryRM.RequestMethod
      );

      const response = await getAllInstruments();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllInstrumentForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllInstrumentForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllInstrumentForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllInstrumentForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetForwardRatesForCounterParty async thunk
export const GetForwardRatesForCounterPartyApi = createAsyncThunk(
  "watchlist/GetForwardRatesForCounterParty", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetForwardRatesForCounterPartyData = createPostAPI(
        watchListApi,
        GetForwardRatesForCounterParty.RequestMethod
      );

      const response = await GetForwardRatesForCounterPartyData();
      const { responseCode } = response.data;

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetForwardRatesForCounterParty_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetForwardRatesForCounterParty_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetForwardRatesForCounterParty_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetForwardRatesForCounterParty_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetForwardRatesForCounterParty async thunk
export const GetDiscountingRatesForCounterPartyApi = createAsyncThunk(
  "watchlist/GetDiscountingRatesForCounterParty", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetDiscountingRatesForCounterPartyData = createPostAPI(
        watchListApi,
        GetDiscountingRatesForCounterParty.RequestMethod
      );

      const response = await GetDiscountingRatesForCounterPartyData();
      const { responseCode } = response.data;

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForCounterParty_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForCounterParty_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForCounterParty_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForCounterParty_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetBankSpotForTreasuryApi = createAsyncThunk(
  "watchlist/GetBankSpotForTreasury",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetBankSpotForTreasuryData = createPostAPI(
        watchListApi,
        GetBankSpotForTreasury.RequestMethod
      );

      const response = await GetBankSpotForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankSpotForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankSpotForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankSpotForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankSpotForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const GetBankForwardForTreasuryApi = createAsyncThunk(
  "watchlist/GetBankForwardForTreasury",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetBankForwardForTreasuryData = createPostAPI(
        watchListApi,
        GetBankForwardForTreasury.RequestMethod
      );

      const response = await GetBankForwardForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankForwardForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankForwardForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankForwardForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetBankForwardForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
// Define the GetMisDataByRangeAPI async thunk
export const GetMisDataByRangeAPI = createAsyncThunk(
  "watchlist/GetMisDataByRange", // A unique action type string
  async ({ navigate, Data }, { dispatch, rejectWithValue }) => {
    try {
      let GetFXInstruGetMisDataByRange = createPostAPI(
        watchListApi,
        GetMisDataByRange.RequestMethod
      );

      const response = await GetFXInstruGetMisDataByRange(Data);
      const { responseCode } = response.data;
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetMisDataByRange_01".toLowerCase()
              )
          ) {
            console.log("", response.data);
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetMisDataByRange_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_WatchlistService_GetFXInstrumentsAPI_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetDiscountingRatesForTreasury async thunk
export const GetDiscountingRatesForTreasuryApi = createAsyncThunk(
  "watchlist/GetDiscountingRatesForTreasury", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetDiscountingRatesForTreasuryData = createPostAPI(
        watchListApi,
        GetDiscountingRatesForTreasury.RequestMethod
      );

      const response = await GetDiscountingRatesForTreasuryData();
      const { responseCode } = response.data;

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const getMarketStatusApi = createAsyncThunk(
  "watchlist/getMarketStatus",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      let getMarketStatusPost = createPostAPI(
        watchListApi,
        getMarketStatusRM.RequestMethod
      );

      const response = await getMarketStatusPost();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage, marketStatus } =
          response.data.responseResult;
        if (isExecuted) {
          switch (responseMessage.toLowerCase()) {
            case "WatchList_WatchListServiceManager_GetMarketStatus_01".toLowerCase():
              return {
                response: marketStatus,
                message: "",
              };
              break;
            case "WatchList_WatchListServiceManager_GetMarketStatus_02".toLowerCase():
              return rejectWithValue(
                import.meta.env.VITE_MQTT_PORT === "8883"
                  ? ""
                  : "No Record Found"
              );

            default:
              break;
          }
          console.log(responseMessage, "responseMessage");
        } else {
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetCorporateDailyVolume async thunk
export const GetCorporateDailyVolumeAPI = createAsyncThunk(
  "watchlist/GetCorporateDailyVolume", // A unique action type string
  async ({ navigate, Data }, { dispatch, rejectWithValue }) => {
    try {
      let GetCorporateDailyVolumeData = createPostAPI(
        watchListApi,
        GetCorporateDailyVolume.RequestMethod
      );

      const response = await GetCorporateDailyVolumeData(Data);
      const { responseCode } = response.data;
      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCorporateDailyVolume_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCorporateDailyVolume_02".toLowerCase()
              )
          ) {
            return rejectWithValue("No Record Found");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCorporateDailyVolume_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// code of Dealer from BOP

// Define the login async thunk
export const clearRatesAction = createAsyncThunk(
  "uploadRate/clearRate", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      let clearRates = createPostAPI(watchListApi, clearRatesRM.RequestMethod);

      const response = await clearRates(Data);
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_ClearRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_ClearRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_ClearRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_ClearRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const getLastPublishRatesAction = createAsyncThunk(
  "uploadRate/getLastPublishRates", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getLastPublishRates = createPostAPI(
        watchListApi,
        getLastAndCurrentUSDRatesRM.RequestMethod
      );

      const response = await getLastPublishRates();

      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const PublishNewRatesAction = createAsyncThunk(
  "uploadRate/PublishNewRates", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      let PublishNewRates = createPostAPI(
        watchListApi,
        publishCurrentUSDRatesRM.RequestMethod
      );

      const response = await PublishNewRates(Data);

      const { responseCode } = response.data;
      console.log(responseCode, "responseCoderesponseCode");

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRates_01".toLowerCase()
              )
          ) {
            dispatch(setPublishedSpotRates(false));

            return {
              response: response.data.responseResult,
              message: "Rates are published",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListiceManager_PublishTheCurrentUSDRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchList_PublishTheCurrentUSDRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes("WatchList_WatchListeCurrentUSDRates_04".toLowerCase())
          ) {
            WatchList_WatchList;
            WatchList_WatchList;
            WatchList_WatchList;
            WatchList_WatchList;
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage.toWatchList_WatchList.includes(
              "WatchList_WatchListServiceManager_PublishTheCurrentUSDRates_05".toLowerCase()
            )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// ----------------------------
// Define the login async thunk
export const GetLastAndCurrentPublishUSDRateSheetAction = createAsyncThunk(
  "uploadRate/GetLastAndCurrentPublishUSDRateSheet", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetLastAndCurrentPublishUSDRateSheetData = createPostAPI(
        watchListApi,
        GetLastAndCurrentPublishUSDRateSheet.RequestMethod
      );

      const response = await GetLastAndCurrentPublishUSDRateSheetData();

      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTheLastAndCurrentPublishUSDRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const PublishCurrentUSDRateSheetAction = createAsyncThunk(
  "uploadRate/PublishCurrentUSDRateSheet", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      let PublishCurrentUSDRateSheetData = createPostAPI(
        watchListApi,
        PublishCurrentUSDRateSheet.RequestMethod
      );

      const response = await PublishCurrentUSDRateSheetData(Data);

      const { responseCode } = response.data;
      console.log(responseCode, "responseCoderesponseCode");

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRateSheet_01".toLowerCase()
              )
          ) {
            dispatch(setPublishedSpotRateSheet(false));

            return {
              response: response.data.responseResult,
              message: "Rates are published",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTheCurrentUSDRateSheet_05".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// ---------------------------------

// Define the login async thunk
export const marketOnOffAction = createAsyncThunk(
  "watchlist/marketOnOff", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      let marketOnOff = createPostAPI(
        watchListApi,
        marketOnOffRM.RequestMethod
      );

      const response = await marketOnOff(Data);
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_MarketONOFF_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_MarketONOFF_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_MarketONOFF_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_MarketONOFF_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const getAllTenorsAction = createAsyncThunk(
  "uploadRate/getAllTenors", // A unique action type string
  async ({ rejectWithValue }) => {
    try {
      let getAllTenors = createPostAPI(authApi, getAllTenorsRM.RequestMethod);

      const response = await getAllTenors();

      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllTenors_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllTenors_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllTenors_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllTenors_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const createTenorAction = createAsyncThunk(
  "uploadRate/createTenors", // A unique action type string
  async ({ navigate, Data, setCreateTenor }, { dispatch, rejectWithValue }) => {
    try {
      let createTenor = createPostAPI(
        watchListApi,
        createTenorRM.RequestMethod
      );

      const response = await createTenor(Data);

      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_CreateTenor_01".toLowerCase()
              )
          ) {
            dispatch(setCreateTenorModal(false));
            setCreateTenor({
              noOfDays: "",
              tenorName: "",
            });
            return {
              response: response.data.responseResult,
              message: "Tenor has been created successfully",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_CreateTenor_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_CreateTenor_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_CreateTenor_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_CreateTenor_05".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the login async thunk
export const getTenorWiseForwardsAction = createAsyncThunk(
  "uploadRate/getTenorWiseForward", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getTenorWiseForwards = createPostAPI(
        watchListApi,
        getTenorWiseForwardRatesRM.RequestMethod
      );

      const response = await getTenorWiseForwards();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTenorWiseForwardRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTenorWiseForwardRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTenorWiseForwardRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetTenorWiseForwardRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);
// Define the login async thunk
export const PublishTenorWiseForwardsAction = createAsyncThunk(
  "uploadRate/publishTenorWiseForward", // A unique action type string
  async ({ navigate, Data }, { dispatch, rejectWithValue }) => {
    try {
      let PublishTenorWiseForwards = createPostAPI(
        watchListApi,
        publishTenorWiseForwardRatesRM.RequestMethod
      );

      const response = await PublishTenorWiseForwards(Data);

      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTenorWiseForwardRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "Forwards Rates are Published",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTenorWiseForwardRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTenorWiseForwardRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTenorWiseForwardRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishTenorWiseForwardRates_05".toLowerCase()
              )
          ) {
            return rejectWithValue("Input model is empty");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

export const getDiscountingRatesAction = createAsyncThunk(
  "uploadRate/getDiscountingRates",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getDiscountingRates = createPostAPI(
        watchListApi,
        getDiscountingRatesRM.RequestMethod
      );

      const response = await getDiscountingRates();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data?.responseResult,
              message: "Forwards Rates are Published",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDiscountingRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

export const publishDiscountingRatesAction = createAsyncThunk(
  "uploadRate/publishDiscountingRates",
  async ({ navigate, Data }, { dispatch, rejectWithValue }) => {
    try {
      let publishDiscountingRates = createPostAPI(
        watchListApi,
        publishDiscountingRatesRM.RequestMethod
      );
      const response = await publishDiscountingRates(Data);
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishDiscountingRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishDiscountingRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishDiscountingRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishDiscountingRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_PublishDiscountingRates_05".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

export const getDealerDashboardApi = createAsyncThunk(
  "uploadRates/getDashboardApi",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      let DealerDashboardApi = createPostAPI(
        watchListApi,
        getDealerDasboardDataRM.RequestMethod
      );
      const response = await DealerDashboardApi();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDealerDashboardData_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDealerDashboardData_02".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDealerDashboardData_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDealerDashboardData_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetDealerDashboardData_05".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetFEDiscountingTableApi = createAsyncThunk(
  "uploadRates/GetFeDiscounting",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      const getFeDiscounting = createPostAPI(
        watchListApi,
        GetFeDiscountingRM.RequestMethod
      );
      const response = await getFeDiscounting();
      console.log(response.data.responseCode, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetFEDiscountingRates_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "Fe Discounting Published Data Successfully",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetFEDiscountingRates_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetFEDiscountingRates_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetFEDiscountingRates_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);
export const PublishFEDiscountingTableApi = createAsyncThunk(
  "uploadRates/PublishFeDiscounting",
  async ({ Data, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const publishFeDiscounting = createPostAPI(
        watchListApi,
        PublishFeDiscountingRM.RequestMethod
      );
      const response = await publishFeDiscounting(Data);
      console.log(response, "result");
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishFEDiscountingRates_01".toLowerCase()
            )
        ) {
          return {
            response: null,
            message: "FE Discounting Rates Publish Successfully",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishFEDiscountingRates_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishFEDiscountingRates_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishFEDiscountingRates_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishFEDiscountingRates_05".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log("Error publishing FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetNonFEDiscountingTableApi = createAsyncThunk(
  "uploadRates/GetNonFeDiscounting",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      const getNonFeDiscounting = createPostAPI(
        watchListApi,
        GetNonFeDiscountingRatesRM.RequestMethod
      );
      const response = await getNonFeDiscounting();
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetNonFEDiscountingRates_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetNonFEDiscountingRates_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetNonFEDiscountingRates_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetNonFEDiscountingRates_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const PublishNonFEDiscountingTableApi = createAsyncThunk(
  "uploadRates/PublishNonFeDiscounting",
  async ({ Data, navigate }, { rejectWithValue, dispatch }) => {
    try {
      const publishNonFeDiscounting = createPostAPI(
        watchListApi,
        PublishNonFeDiscountingRatesRM.RequestMethod
      );
      const response = await publishNonFeDiscounting(Data);
      console.log(response, "result");
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishNonFEDiscountingRates_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "Non-FE Discounting Rates Published Successfully",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishNonFEDiscountingRates_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishNonFEDiscountingRates_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishNonFEDiscountingRates_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_PublishNonFEDiscountingRates_05".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log("Error publishing FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetBankSpotForDealerApi = createAsyncThunk(
  "watchlist/GetBankSpotForDealer",
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      const GetBankSpotForDealerData = createPostAPI(
        watchListApi,
        GetBankSpotForDealer.RequestMethod
      );
      const response = await GetBankSpotForDealerData(Data);
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankSpotForDealer_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankSpotForDealer_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankSpotForDealer_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankSpotForDealer_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching GetBankSpotForDealer:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetBankForwardForTreasuryDealerApi = createAsyncThunk(
  "watchlist/GetBankForwardForTreasuryDealer",
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      const GetBankForwardForTreasuryDealerData = createPostAPI(
        watchListApi,
        GetBankForwardForTreasuryDealer.RequestMethod
      );
      const response = await GetBankForwardForTreasuryDealerData(Data);
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankForwardForTreasuryDealer_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankForwardForTreasuryDealer_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankForwardForTreasuryDealer_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetBankForwardForTreasuryDealer_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetDiscountingRatesForDealerApi = createAsyncThunk(
  "watchlist/GetDiscountingRatesForDealer",
  async ({ navigate, Data }, { rejectWithValue, dispatch }) => {
    try {
      const GetDiscountingRatesForDealerData = createPostAPI(
        watchListApi,
        GetDiscountingRatesForDealer.RequestMethod
      );
      const response = await GetDiscountingRatesForDealerData(Data);
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetDiscountingRatesForTreasury_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetDiscountingRatesForDealer_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetDiscountingRatesForDealer_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);
// const response = await publishDiscountingRates(Data);
export const GetAllDealersSpreadApi = createAsyncThunk(
  "watchlist/GetAllDealersSpread",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      const GetAllDealersSpreadData = createPostAPI(
        watchListApi,
        GetAllDealersSpread.RequestMethod
      );
      const response = await GetAllDealersSpreadData();
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetAllDealersSpread_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetAllDealersSpread_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetAllDealersSpread_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetAllDealersSpread_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching GetAllDealersSpread data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetCurrencyCrossesApi = createAsyncThunk(
  "watchlist/GetCurrencyCrosses",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      const GetCurrencyCrossesData = createPostAPI(
        watchListApi,
        GetCurrencyCrosses.RequestMethod
      );
      const response = await GetCurrencyCrossesData();
      console.log(response, "result");
      const { responseCode } = response.data;
      console.log(responseCode, "result");

      if (responseCode === 200) {
        console.log(response, "result");

        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          console.log(response, "result");

          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetCurrencyCrosses_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetCurrencyCrosses_02".toLowerCase()
            )
        ) {
          return rejectWithValue("No Found");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetCurrencyCrosses_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetCurrencyCrosses_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching GetBankSpotForDealer:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const AddDealerSpreadApi = createAsyncThunk(
  "watchlist/AddDealerSpread",
  async ({ Data }, { rejectWithValue }) => {
    try {
      const AddDealerSpreadData = createPostAPI(
        watchListApi,
        AddDealerSpread.RequestMethod
      );
      const response = await AddDealerSpreadData(Data);
      console.log(response, "result");
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_AddDealerSpread_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "Data Saved Successfully.",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_AddDealerSpread_02".toLowerCase()
            )
        ) {
          return rejectWithValue("");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_AddDealerSpread_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_AddDealerSpread_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log("Error publishing FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const GetSingleDealersSpreadApi = createAsyncThunk(
  "watchlist/GetSingleDealersSpread",
  async ({ Data }, { rejectWithValue }) => {
    try {
      const GetSingleDealersSpreadData = createPostAPI(
        watchListApi,
        GetSingleDealersSpread.RequestMethod
      );
      const response = await GetSingleDealersSpreadData(Data);
      console.log(response, "result");
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (!isExecuted) {
          return rejectWithValue("Something went wrong");
        }
        if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetSingleDealersSpread_01".toLowerCase()
            )
        ) {
          return {
            response: response.data.responseResult,
            message: "",
          };
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetSingleDealersSpread_02".toLowerCase()
            )
        ) {
          return rejectWithValue("");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetSingleDealersSpread_03".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else if (
          responseMessage
            .toLowerCase()
            .includes(
              "WatchList_WatchListServiceManager_GetSingleDealersSpread_04".toLowerCase()
            )
        ) {
          return rejectWithValue("Someting went wrong");
        } else {
          return rejectWithValue("Someting went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      console.log("Error publishing FE discounting data:", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

// Define the GetAllFowardsAndDiscountsRates async thunk
export const GetAllOtherInstrumentsApi = createAsyncThunk(
  "watchlist/GetAllOtherInstruments", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetAllOtherInstrumentsData = createPostAPI(
        watchListApi,
        GetAllOtherInstruments.RequestMethod
      );

      const response = await GetAllOtherInstrumentsData();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllOtherInstruments_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllOtherInstruments_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllOtherInstruments_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetAllOtherInstruments_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        console.log("", response.data);
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

//GetUSDParityForTreasury
export const GetUSDParityForTreasuryApi = createAsyncThunk(
  "watchlist/GetUSDParityForTreasury",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let GetUSDParityForTreasuryData = createPostAPI(
        watchListApi,
        GetUSDParityForTreasury.RequestMethod
      );

      const response = await GetUSDParityForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetUSDParityForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetUSDParityForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetUSDParityForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetUSDParityForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetCommoditiesForTreasury
export const GetCommoditiesForTreasuryApi = createAsyncThunk(
  "watchlist/GetCommoditiesForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetCommoditiesForTreasuryData = createPostAPI(
        watchListApi,
        GetCommoditiesForTreasury.RequestMethod
      );

      const response = await GetCommoditiesForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCommoditiesForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCommoditiesForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCommoditiesForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetCommoditiesForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetIndicesForTreasury
export const GetIndicesForTreasuryApi = createAsyncThunk(
  "watchlist/GetIndicesForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetIndicesForTreasuryData = createPostAPI(
        watchListApi,
        GetIndicesForTreasury.RequestMethod
      );

      const response = await GetIndicesForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicesForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicesForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicesForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicesForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetKiborDataForTreasury
export const GetKiborDataForTreasuryApi = createAsyncThunk(
  "watchlist/GetKiborDataForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetKiborDataForTreasuryData = createPostAPI(
        watchListApi,
        GetKiborDataForTreasury.RequestMethod
      );

      const response = await GetKiborDataForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetSOFRDataForTreasury
export const GetSOFRDataForTreasuryApi = createAsyncThunk(
  "watchlist/GetSOFRDataForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetSOFRDataForTreasuryData = createPostAPI(
        watchListApi,
        GetSOFRDataForTreasury.RequestMethod
      );

      const response = await GetSOFRDataForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetRevalRatesForTreasury
export const GetRevalRatesForTreasuryApi = createAsyncThunk(
  "watchlist/GetRevalRatesForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetRevalRatesForTreasuryData = createPostAPI(
        watchListApi,
        GetRevalRatesForTreasury.RequestMethod
      );

      const response = await GetRevalRatesForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRevalRatesForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRevalRatesForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRevalRatesForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRevalRatesForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetRevalRatesForTreasury
export const GetSwapsInUSDForTreasuryApi = createAsyncThunk(
  "watchlist/GetSwapsInUSDForTreasury",
  async ({ rejectWithValue }) => {
    try {
      let GetSwapsInUSDForTreasuryData = createPostAPI(
        watchListApi,
        GetSwapsInUSDForTreasury.RequestMethod
      );

      const response = await GetSwapsInUSDForTreasuryData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSwapsInUSDForTreasury_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSwapsInUSDForTreasury_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSwapsInUSDForTreasury_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSwapsInUSDForTreasury_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetSpotTTRatesForRateSheet
export const GetSpotTTRatesForRateSheetApi = createAsyncThunk(
  "watchlist/GetSpotTTRatesForRateSheet",
  async ({ rejectWithValue }) => {
    try {
      let GetSpotTTRatesForRateSheetData = createPostAPI(
        watchListApi,
        GetSpotTTRatesForRateSheet.RequestMethod
      );

      const response = await GetSpotTTRatesForRateSheetData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSpotTTRatesForRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSpotTTRatesForRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSpotTTRatesForRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSpotTTRatesForRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetRatesForCurrencyNotesForRateSheet
export const GetRatesForCurrencyNotesForRateSheetApi = createAsyncThunk(
  "watchlist/GetRatesForCurrencyNotesForRateSheet",
  async ({ rejectWithValue }) => {
    try {
      let GetRatesForCurrencyNotesForRateSheetData = createPostAPI(
        watchListApi,
        GetRatesForCurrencyNotesForRateSheet.RequestMethod
      );

      const response = await GetRatesForCurrencyNotesForRateSheetData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRatesForCurrencyNotesForRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRatesForCurrencyNotesF2rRateSheet_01".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRatesForCurrencyNotesForRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetRatesForCurrencyNotesForRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetKiborDataForRateSheet
export const GetKiborDataForRateSheetApi = createAsyncThunk(
  "watchlist/GetKiborDataForRateSheet",
  async ({ rejectWithValue }) => {
    try {
      let GetKiborDataForRateSheetData = createPostAPI(
        watchListApi,
        GetKiborDataForRateSheet.RequestMethod
      );

      const response = await GetKiborDataForRateSheetData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetKiborDataForRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetSOFRDataForRateSheet
export const GetSOFRDataForRateSheetApi = createAsyncThunk(
  "watchlist/GetSOFRDataForRateSheet",
  async ({ rejectWithValue }) => {
    try {
      let GetSOFRDataForRateSheetData = createPostAPI(
        watchListApi,
        GetSOFRDataForRateSheet.RequestMethod
      );

      const response = await GetSOFRDataForRateSheetData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSOFRDataForRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetIndicativeFBPRates
export const GetIndicativeFBPRatesApi = createAsyncThunk(
  "watchlist/GetIndicativeFBPRates",
  async ({ rejectWithValue }) => {
    try {
      let GetIndicativeFBPRatesData = createPostAPI(
        watchListApi,
        GetIndicativeFBPRates.RequestMethod
      );

      const response = await GetIndicativeFBPRatesData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicativeFBPRates_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicativeFBPRates_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicativeFBPRates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetIndicativeFBPRates_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//GetSBPConversionRatesForRateSheet
export const GetSBPConversionRatesForRateSheetApi = createAsyncThunk(
  "watchlist/GetSBPConversionRatesForRateSheet",
  async ({ rejectWithValue }) => {
    try {
      let GetSBPConversionRatesForRateSheetData = createPostAPI(
        watchListApi,
        GetSBPConversionRatesForRateSheet.RequestMethod
      );

      const response = await GetSBPConversionRatesForRateSheetData();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSBPConversionRatesForRateSheet_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSBPConversionRatesForRateSheet_02".toLowerCase()
              )
          ) {
            return rejectWithValue(
              import.meta.env.VITE_MQTT_PORT === "8883" ? "" : "No Record Found"
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSBPConversionRatesForRateSheet_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Role doesn’t matched.");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "WatchList_WatchListServiceManager_GetSBPConversionRatesForRateSheet_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Exception occured.");
          } else {
            console.log("", response.data);
            return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
