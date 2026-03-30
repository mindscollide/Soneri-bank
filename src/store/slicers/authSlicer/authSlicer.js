import {
  // createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

// import { resetAndForgotPassword } from "../../container/loginScreens/forgetPassword/forgotPassword_Actions";
// import { setCustomHeaders } from "@/common/utils";

import { resetAndForgotPassword } from "../../actions/forgotPassword_Actions";
// import {
//   getAllActiveCorporatesApi,
//   getAllCategoriesAction,
//   // getAllInstrumentsApi,
//   GetUsersEmailApi,
// } from "../../../shareComponents/commonComponents/utils/globalApis";
// import {
//   createCorporateCreatePasswordApi,
//   validateLinkForCorporateCreatePasswordApi,
// } from "../../actions/createPassword_Action";
import {
  getAllInstrumentsApi,
  // GetAllNatureOfTransactionsApi,
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
    GetUsersEmail: null,
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

      .addCase(resetAndForgotPassword.pending, (state) => {
        state.Loader = true;
      })
      .addCase(resetAndForgotPassword.fulfilled, (state, { payload }) => {
        console.log(payload, "payloadpayload");
        state.Loader = false;
        state.error = null;
        state.responseMessage = payload?.message;
        state.resetPasswordResponse = payload?.response;
      })
      .addCase(resetAndForgotPassword.rejected, (state, { payload }) => {
        console.log(payload, "payloadpayload");
        state.Loader = false;
        state.error = null;
        state.responseMessage = payload;
        state.resetPasswordResponse = null;
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
