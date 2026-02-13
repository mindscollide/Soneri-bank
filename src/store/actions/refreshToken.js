// import { refreshTokenRM } from "@/common/api_config";
// import { authApi } from "@/common/apiend_points";
import axios from "axios";
import { authApi } from "../../common/apiend_point";

// ✅ Plain async function (can be called anywhere)
export const refreshTokenFn = async () => {
  try {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      // localStorage.clear();
      // window.location.href = "/";
      throw new Error("Missing authentication tokens");
    }

    const Data = {
      RefreshToken: refreshToken,
      Token: token,
    };

    const form = new FormData();
    form.append("RequestData", JSON.stringify(Data));
    form.append("RequestMethod", refreshTokenRM.RequestMethod);

    const res = await axios.post(authApi, form);

    if (!res || !res.data) throw new Error("Invalid API response");

    const { responseCode, responseResult } = res.data;

    // Invalid token
    if (responseCode === 205) {
      // localStorage.clear();
      // window.location.href = "/";
      console.log("Refresh token expired");

      throw new Error("Invalid refresh token");
    }

    // Token refresh successful
    if (responseCode === 200 && responseResult) {
      const {
        isExecuted,
        responseMessage,
        token: newToken,
        refreshToken: newRefreshToken,
      } = responseResult;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      if (!isExecuted) {
        // localStorage.clear();
        // window.location.href = "/";
        console.log("Refresh token expired");

        throw new Error("Token execution failed");
      }

      const message = responseMessage.toLowerCase();

      if (
        message.includes(
          "ERM_AuthService_AuthManager_RefreshToken_01".toLowerCase()
        )
      ) {
        localStorage.setItem("token", newToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // ✅ Also update axios default headers immediately
        axios.defaults.headers.common["_token"] = newToken;
        return { token: newToken, refreshToken: newRefreshToken };
      }

      if (
        message.includes(
          "ERM_AuthService_AuthManager_RefreshToken_02".toLowerCase()
        )
      ) {
        // localStorage.clear();
        // window.location.href = "/";
        console.log("Refresh token expired");
        throw new Error("Refresh token expired");
      }

      throw new Error("Unexpected response message");
    }

    throw new Error("Unknown response code");
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
};
