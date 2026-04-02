import createPostAPI from "@/utils/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../../common/apiend_point";
import { GetAllInstrumentsRM } from "../../../common/api_config";

export const getAllInstrumentsApi = createAsyncThunk(
  "auth/getAllInstruments",
  async ({ rejectWithValue }) => {
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
