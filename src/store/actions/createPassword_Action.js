import { roleBasedNavigation, setCustomHeaders } from "@/common/utils";
import { createAsyncThunk } from "@reduxjs/toolkit";

import createPostAPI from "@/utils/axiosInstance";
import { authApi } from "../../common/apiend_point";
import {
  createCorporateUserPasswordRM,
  validateLinkForCorporatePasswordRM,
} from "../../common/api_config";

// Define the login async thunk
export const validateLinkForCorporateCreatePasswordApi = createAsyncThunk(
  "auth/validatedCreatePasswordLink", // A unique action type string
  async ({ validateValue }, { rejectWithValue }) => {
    let Data = {
      EncryptedString: validateValue,
    };
    try {
      let validateLinkForCorporateCreatePassword = createPostAPI(
        authApi,
        validateLinkForCorporatePasswordRM.RequestMethod
      );

      const response = await validateLinkForCorporateCreatePassword(Data);

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        console.log(responseMessage, "responseMessageresponseMessage");
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ValidateLinkForCorporatePassword_01".toLowerCase()
              )
          ) {
            return {
              response: response.data.responseResult,
              message: "Email for Reset Password Sent Successfully",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ValidateLinkForCorporatePassword_02".toLowerCase()
              )
          ) {
            return rejectWithValue("No Emailsent for Reset Password");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ValidateLinkForCorporatePassword_03".toLowerCase()
              )
          ) {
            return rejectWithValue("Invalid Corporate User");
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

export const createCorporateCreatePasswordApi = createAsyncThunk(
  "auth/createPasswordCorporate", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue }) => {
    try {
      let createCorporateCreatePassword = createPostAPI(
        authApi,
        createCorporateUserPasswordRM.RequestMethod
      );

      const response = await createCorporateCreatePassword(Data);
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage, token, refreshToken } =
          response.data.responseResult;

        if (isExecuted) {
          const msg = responseMessage.toLowerCase();

          switch (msg) {
            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_01".toLowerCase():
              const {
                corporate,
                userID,
                firstName,
                email,
                contactNumber,
                userRoleID,
                userStatusID,
              } = response.data.responseResult.user;
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refreshToken);
              localStorage.setItem("name", firstName);
              localStorage.setItem("email", email);
              localStorage.setItem("roleId", userRoleID);
              localStorage.setItem("userID", userID);
              localStorage.setItem("corporate", JSON.stringify(corporate));
              localStorage.setItem("contactNumber", contactNumber);
              localStorage.setItem("userStatusID", userStatusID);
              roleBasedNavigation(navigate, userRoleID);
              return {
                response: response.data.responseResult,
                message: "",
              };

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_02".toLowerCase():
              return rejectWithValue("Invalid Email");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_03".toLowerCase():
              return rejectWithValue("Invalid Corporate User");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_04".toLowerCase():
              return rejectWithValue("User is InActive");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_05".toLowerCase():
              return rejectWithValue("Error while creating password");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_06".toLowerCase():
              return rejectWithValue("Something went wrong");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_07".toLowerCase():
              navigate("/");
              return rejectWithValue("Password Created but is InActive");

            case "ERM_AuthService_AuthManager_CreateCorporateUserPassword_08".toLowerCase():
              return rejectWithValue("Something went wrong");

            default:
              return rejectWithValue("Something went wrong");
          }
        } else {
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      console.log(error, "errorerror");
      // Reject with error message
      return rejectWithValue("Something went wrong");
    }
  }
);
