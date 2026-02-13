import { createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../common/apiend_point";
import { sendEmailForResetPaswordRM } from "../../common/api_config";
import createPostAPI from "../../utils/axiosInstance";

// Define the login async thunk
export const resetAndForgotPassword = createAsyncThunk(
  "auth/resetPassword", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue }) => {
    try {
      let resetAndForgotPasswordAction = createPostAPI(
        authApi,
        sendEmailForResetPaswordRM.RequestMethod
      );

      const response = await resetAndForgotPasswordAction(Data);
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        console.log(responseMessage, "responseMessageresponseMessage");
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForResetPasword_01".toLowerCase()
              )
          ) {
            navigate("/emailsent", { state: Data });
            return {
              response: response.data.responseResult,
              message: "Email for Reset Password Sent Successfully",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForResetPasword_02".toLowerCase()
              )
          ) {
            return rejectWithValue("No Emailsent for Reset Password");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForResetPasword_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Invalid Corporate User");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForResetPasword_04".toLowerCase()
              )
          ) {
            return rejectWithValue("Please Enter A valid Email");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForResetPasword_05".toLowerCase()
              )
          ) {
            return rejectWithValue("Something-went-wrong");
          } else {
            return rejectWithValue("Something-went-wrong");
          }
        } else {
          return rejectWithValue("Something-went-wrong");
        }
      }
    } catch (error) {
      // Reject with error message
      return rejectWithValue("Something-went-wrong");
    }
  }
);
