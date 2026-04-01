import { createSlice } from "@reduxjs/toolkit";

import {
  getAllInstrumentsApi,
  loginInApi,
  LogoutApi,
} from "../../actions/authAction";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userDetails: null,
    responseMessage: "",
    Loader: false,
    error: null,
    resetPasswordResponse: null,
    refreshTokenResponse: null,
    logout: null,
    getAllInstruments: null,
    mainLoader: false,
  },
  reducers: {
    clearAuthResponseMessage: (state) => {
      state.responseMessage = "";
    },
    setMainLoader: (state, { payload }) => {
      state.mainLoader = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Pending state (while the API call is being made)
      .addCase(loginInApi.pending, (state) => {
        state.Loader = true;
        state.error = null;
      })
      // Fulfilled state (when the API call succeeds)
      .addCase(loginInApi.fulfilled, (state, { payload }) => {
        state.Loader = false;
        state.userDetails = payload?.response;
        state.error = null;
        state.responseMessage = payload?.message;
      })
      // Rejected state (when the API call fails)
      .addCase(loginInApi.rejected, (state, action) => {
        console.log(action, "actionaction");
        state.Loader = false;
        state.responseMessage = action.payload;
        state.user = null;
      })

      .addCase(LogoutApi.pending, (state) => {
        state.Loader = true;
      })
      .addCase(LogoutApi.fulfilled, (state, { payload }) => {
        state.Loader = false;
        state.logout = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(LogoutApi.rejected, (state, { payload }) => {
        state.Loader = false;
        state.logout = null;
        state.responseMessage = payload;
      })
      .addCase(getAllInstrumentsApi.pending, (state) => {
        state.Loader = true;
      })
      .addCase(getAllInstrumentsApi.fulfilled, (state, { payload }) => {
        state.Loader = false;
        state.getAllInstruments = payload?.response;
        state.responseMessage = payload?.message;
      })
      .addCase(getAllInstrumentsApi.rejected, (state, { payload }) => {
        state.Loader = false;
        state.getAllInstruments = null;
        state.responseMessage = payload;
      });
  },
});
export const { clearAuthResponseMessage, setMainLoader } = authSlice.actions;
export default authSlice.reducer;
