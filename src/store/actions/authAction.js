import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetAllInstrumentsRM,
  loginRequestMethod,
  LogoutRM,
} from "../../common/api_config";
import { authApi } from "../../common/apiend_point";
import createPostAPI from "../../utils/axiosInstance";
import { roleBasedNavigation } from "../../common/utils";

export const loginInApi = createAsyncThunk(
  "auth/login", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue }) => {
    try {
      let getAuthResponse = createPostAPI(
        authApi,
        loginRequestMethod.RequestMethod
      );

      const response = await getAuthResponse(Data);

      console.log(response, "loginInApiloginInApi");
      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage, token, refreshToken } =
          response.data.responseResult;
        console.log(isExecuted, "messageKeymessageKey");

        if (isExecuted) {
          console.log(responseMessage, "responseMessage");

          switch (responseMessage.toLowerCase()) {
            case "ERM_AuthService_AuthManager_Login_01".toLowerCase():
            case "ERM_AuthService_AuthManager_Login_02".toLowerCase():
            case "ERM_AuthService_AuthManager_Login_04".toLowerCase():
            case "ERM_AuthService_AuthManager_Login_05".toLowerCase():
              return rejectWithValue("User is Locked");
            case "ERM_AuthService_AuthManager_Login_06".toLowerCase():
              return rejectWithValue("User is Disabled");
            case "ERM_AuthService_AuthManager_Login_07".toLowerCase():
              return rejectWithValue("User is Closed");
            case "ERM_AuthService_AuthManager_Login_08".toLowerCase():
              return rejectWithValue("User is Dormant");
            case "ERM_AuthService_AuthManager_Login_09".toLowerCase():
              return rejectWithValue("Login Failed");
            case "ERM_AuthService_AuthManager_Login_10".toLowerCase():
              return rejectWithValue("Login Failed");
            case "ERM_AuthService_AuthManager_Login_11".toLowerCase():
              return rejectWithValue("Someting went wrong");
            case "ERM_AuthService_AuthManager_Login_12".toLowerCase():
              console.log("", response.data);
              return rejectWithValue("Not A valid role to login");

            case "ERM_AuthService_AuthManager_Login_13".toLowerCase():
              console.log("", response.data);
              return rejectWithValue("Branch is InActive");
            case "ERM_AuthService_AuthManager_Login_14".toLowerCase():
              return rejectWithValue("Invalid Role");
            case "ERM_AuthService_AuthManager_Login_03".toLowerCase(): {
              try {
              } catch (error) {}
              const {
                branch,
                employeeID,
                ldapAccount,
                userID,
                firstName,
                email,
                contactNumber,
                failedAttemptCount,
                userRoleID,
                userStatusID,
                creationDateTime,
                isFEEnabled,
                isNonFEEnabled,
              } = response.data.responseResult.user;
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", refreshToken);
              localStorage.setItem("name", firstName);
              localStorage.setItem("email", email);
              localStorage.setItem("roleId", userRoleID);
              localStorage.setItem("userID", userID);
              localStorage.setItem("branch", JSON.stringify(branch));
              localStorage.setItem("employeeID", employeeID);
              localStorage.setItem("ldapAccount", ldapAccount);
              localStorage.setItem("contactNumber", contactNumber);
              localStorage.setItem("failedAttemptCount", failedAttemptCount);
              localStorage.setItem("userStatusID", userStatusID);
              localStorage.setItem("isFEEnabled", isFEEnabled);
              localStorage.setItem("isNonFEEnabled", isNonFEEnabled);
              {
                branch !== null &&
                  branch !== undefined &&
                  localStorage.setItem("isTradeRights", branch.isTrade);
              }

              roleBasedNavigation(navigate, userRoleID);

              return {
                response: response.data.responseResult,
                message: "",
              };
            }
            default:
              console.log("", response.data);
              return rejectWithValue("Something went wrong");
          }
        } else {
          console.log("", response.data);
          return rejectWithValue("Something went wrong");
        }
      }
    } catch (error) {
      // Reject with error message
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  }
);

export const LogoutApi = createAsyncThunk(
  "auth/Logout",
  async ({ rejectWithValue }) => {
    try {
      const logoutUser = createPostAPI(authApi, LogoutRM.RequestMethod);
      const response = await logoutUser();
      const { responseCode } = response.data;

      if (responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes("ERM_AuthService_AuthManager_LogOut_01".toLowerCase())
          ) {
            // localStorage.clear();
            window.location.href = "/";
          } else if (
            responseMessage
              .toLowerCase()
              .includes("ERM_AuthService_AuthManager_LogOut_02".toLowerCase())
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes("ERM_AuthService_AuthManager_LogOut_03".toLowerCase())
          ) {
            return rejectWithValue("Something went wrong");
          } else {
            return rejectWithValue("Something went wrong");
          }
        }
      } else {
        return rejectWithValue("Something went wrong");
      }
    } catch (error) {
      return rejectWithValue("Something went wrong");
    }
  }
);

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
