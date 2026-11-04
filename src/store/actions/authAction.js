import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  EmailTokenVerifyRM,
  ForgetPasswordRM,
  GetAllInstrumentsRM,
  loginRequestMethod,
  LogoutRM,
  ResetPasswordRM,
} from "../../common/api_config";
import { authApi } from "../../common/apiend_point";
import createPostAPI from "../../utils/axiosInstance";
import { roleBasedNavigation } from "../../common/utils";
import { encryptField } from "../../utils/encryption";

export const loginInApi = createAsyncThunk(
  "auth/login", // A unique action type string
  async ({ navigate, Data }, { rejectWithValue }) => {
    try {
      let getAuthResponse = createPostAPI(
        authApi,
        loginRequestMethod.RequestMethod,
      );

      const response = await getAuthResponse(Data);

      console.log(response, "loginInApiloginInApi");
      if (response.data.responseCode === 200) {
        const {
          isExecuted,
          responseMessage,
          token,
          refreshToken,
          isPasswordReset,
        } = response.data.responseResult;
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
              // Fresh login always lands on the first tab (Live Rates)

              if (isPasswordReset === false) {
                localStorage.setItem("email", email);
                localStorage.setItem("mustResetPassword", "true");
                navigate("/reset-password");
                return {
                  response: response.data.responseResult,
                  message: "",
                };
              }
              localStorage.removeItem("globalTabsActiveKey");
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
              localStorage.removeItem("mustResetPassword");

              // {
              //   branch !== null &&
              //     branch !== undefined &&
              //     localStorage.setItem("isTradeRights", branch.isTrade);
              // }

              // Password not reset yet (first login): must set a new one before using the app

              // localStorage.removeItem("mustResetPassword");

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
  },
);

export const LogoutApi = createAsyncThunk(
  "auth/Logout",
  async ({}, { rejectWithValue }) => {
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
            // success: storage is cleared and the user redirected in `finally`
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
    } finally {
      // Logout always ends the session locally, whatever the API answered
      localStorage.clear();
      window.location.href = "/";
    }
  },
);

export const getAllInstrumentsApi = createAsyncThunk(
  "auth/getAllInstruments",
  async ({}, { rejectWithValue }) => {
    try {
      let getInstruments = createPostAPI(
        authApi,
        GetAllInstrumentsRM.RequestMethod,
      );

      const response = await getInstruments();

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllInstruments_01".toLowerCase(),
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
                "ERM_AuthService_CommonManager_GetAllInstruments_02".toLowerCase(),
              )
          ) {
            return rejectWithValue("");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_CommonManager_GetAllInstruments_03".toLowerCase(),
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
  },
);

const ROLE_ID =
  import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true"
    ? 10
    : import.meta.env.VITE_APP_INCLUDE_DEALER === "true"
      ? 7
      : import.meta.env.VITE_APP_INCLUDE_TREASURY === "true"
        ? 8
        : 0;

// Data: { Email } (plain — encrypted here)
export const forgotPasswordApi = createAsyncThunk(
  "auth/forgotPassword",
  async ({ Data, navigate }, { rejectWithValue }) => {
    try {
      const forgotPassword = createPostAPI(
        authApi,
        ForgetPasswordRM.RequestMethod,
      );
      const response = await forgotPassword(Data);

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage } = response.data.responseResult;
        if (isExecuted) {
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForForgetPasword_01".toLowerCase(),
              )
          ) {
            navigate("/email-sent");
            return { response: response.data.responseResult, message: "Email Sent Successfully" };
          } else if (
            response.data.responseResult.responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForForgetPasword_02".toLowerCase(),
              )
          ) {
            return rejectWithValue("Invalid Email");
          } else if (
            response.data.responseResult.responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForForgetPasword_03".toLowerCase(),
              )
          ) {
            return rejectWithValue("User Inactive");
          } else if (
            response.data.responseResult.responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForForgetPasword_04".toLowerCase(),
              )
          ) {
            return rejectWithValue("Error Sending Email");
          } else if (
            response.data.responseResult.responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_SendEmailForForgetPasword_05".toLowerCase(),
              )
          ) {
            return rejectWithValue("Something went wrong");
          }
          // TODO: map the remaining ForgetPassword message keys once known
          return rejectWithValue("Something went wrong");
        }
      }
      console.log("", response.data);
      return rejectWithValue("Something went wrong");
    } catch (error) {
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  },
);

// Data: { EncryptedString } — the resetPass_action value of the emailed link.
// Valid link -> Reset Password screen, expired/invalid -> resend screen.
export const emailTokenVerifyApi = createAsyncThunk(
  "auth/emailTokenVerify",
  async ({ Data, navigate }, { rejectWithValue }) => {
    // const fail = (message) => {
    //   navigate("/resend-reset-password", { replace: true });
    //   return rejectWithValue(message);
    // };
    try {
      const verifyToken = createPostAPI(
        authApi,
        EmailTokenVerifyRM.RequestMethod,
      );
      const response = await verifyToken(Data);

      if (response.data.responseCode === 200) {
        const { isExecuted, responseMessage, email, firstName } =
          response.data.responseResult;
        if (isExecuted) {
        }
        if (
          responseMessage
            .toLowerCase()
            .includes("ERM_AuthService_AuthManager_EmailToken_01".toLowerCase())
        ) {
          // email / firstName stay encrypted; the reset call sends email back as-is
          navigate("/reset-password", {
            replace: true,
            state: { token: Data.EncryptedString, email, firstName },
          });
          return { response: null, message: "" };
        } else if (
          responseMessage
            .toLowerCase()
            .includes("ERM_AuthService_AuthManager_EmailToken_02".toLowerCase())
        ) {
          navigate("/link-expired", { replace: true });
          return rejectWithValue("Link Expired");
        } else if (
          responseMessage
            .toLowerCase()
            .includes("ERM_AuthService_AuthManager_EmailToken_03".toLowerCase())
        ) {
          return rejectWithValue("Something went wrong");
        }
      }
      return rejectWithValue("Something went wrong");
    } catch (error) {
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  },
);

// Data: { Email (already encrypted), Password (plain), EncryptedString }
// EncryptedString is the email-link token, or "" for the first-login reset.
export const resetPasswordApi = createAsyncThunk(
  "auth/resetPassword",
  async ({ Data, navigate }, { rejectWithValue }) => {
    try {
      const Password = await encryptField(Data.Password);
      const resetPassword = createPostAPI(
        authApi,
        ResetPasswordRM.RequestMethod,
      );
      const response = await resetPassword({
        Email: Data.Email,
        Password,
        DeviceID: "1",
        Device: "Browser",
        RoleID: ROLE_ID,
        EncryptedString: Data.EncryptedString || "",
      });

      if (response.data.responseCode === 200) {
        const {
          isExecuted,
          responseMessage,
          isPasswordReset,
          token,
          refreshToken,
          user,
        } = response.data.responseResult;
        if (isExecuted) {
          const {
            firstName,
            email,
            userRoleID,
            userID,
            branch,
            employeeID,
            ldapAccount,
            contactNumber,
            failedAttemptCount,
            userStatusID,
            isFEEnabled,
            isNonFEEnabled,
          } = user;
          if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ResetPassword_01".toLowerCase(),
              )
          ) {
            localStorage.removeItem("globalTabsActiveKey");
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
            localStorage.removeItem("mustResetPassword");

            roleBasedNavigation(navigate, userRoleID);
            return {
              response: response.data.responseResult,
              message: "",
            };
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ResetPassword_02".toLowerCase(),
              )
          ) {
            return rejectWithValue("Something went wrong");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ResetPassword_03".toLowerCase(),
              )
          ) {
            return rejectWithValue(
              "Password does not meet policy requirements",
            );
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ResetPassword_04".toLowerCase(),
              )
          ) {
            return rejectWithValue("Password Reset Failed");
          } else if (
            responseMessage
              .toLowerCase()
              .includes(
                "ERM_AuthService_AuthManager_ResetPassword_05".toLowerCase(),
              )
          ) {
            return rejectWithValue("Something went wrong");
          }
          // TODO: map the remaining ResetPassword message keys once known
          return rejectWithValue("Something went wrong");
        }
      }
      console.log("", response.data);
      return rejectWithValue("Something went wrong");
    } catch (error) {
      console.log("", error);
      return rejectWithValue("Something went wrong");
    }
  },
);
