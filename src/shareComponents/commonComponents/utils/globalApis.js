import createPostAPI from "@/utils/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../common/apiend_point";
import {
  GetActiveCorporatesRM,
  getAllCategoriesRM,
  GetAllInstrumentsRM,
  GetUsersEmail,
} from "../../../common/api_config";

// Define the login async thunk
export const getAllCategoriesAction = createAsyncThunk(
  "auth/getAllCategories", // A unique action type string
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getBlotterData = createPostAPI(
        authApi,
        getAllCategoriesRM.RequestMethod
      );

      const response = await getBlotterData();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllCategories_01".toLowerCase()
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
                "ERM_AuthService_CommonManager_GetAllCategories_02".toLowerCase()
              )
          ) {
            return rejectWithValue("");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllCategories_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
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

export const getAllInstrumentsApi = createAsyncThunk(
  "auth/getAllInstruments",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getInstruments = createPostAPI(
        authApi,
        GetAllInstrumentsRM.RequestMethod
      );

      const response = await getInstruments();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllInstruments_01".toLowerCase()
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
                "ERM_AuthService_CommonManager_GetAllInstruments_02".toLowerCase()
              )
          ) {
            return rejectWithValue("");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllInstruments_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
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

export const getAllActiveCorporatesApi = createAsyncThunk(
  "Auth/getAllActiveCorporates",
  async ({ navigate }, { dispatch, rejectWithValue }) => {
    try {
      let getActiveCorporates = createPostAPI(
        authApi,
        GetActiveCorporatesRM.RequestMethod
      );

      const response = await getActiveCorporates();
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetActiveCorporates_01".toLowerCase()
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
                "ERM_AuthService_CommonManager_GetActiveCorporates_02".toLowerCase()
              )
          ) {
            return rejectWithValue("");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetActiveCorporates_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else {
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

export const GetUsersEmailApi = createAsyncThunk(
  "auth/GetUsersEmail",
  async ({ navigate }, { rejectWithValue, dispatch }) => {
    try {
      let GetUsersEmailData = createPostAPI(
        authApi,
        GetUsersEmail.RequestMethod
      );

      const response = await GetUsersEmailData();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          switch (responseMessage.toLowerCase()) {
            case "ERM_AuthService_GetUsersEmail_01".toLowerCase():
              return {
                response: response.data.responseResult,
                message: "",
              };
            // break;
            case "ERM_AuthService_GetUsersEmail_02".toLowerCase():
              return rejectWithValue("No Email Available");

            case "ERM_AuthService_GetUsersEmail_03".toLowerCase():
              return rejectWithValue("Something went wrong");

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
