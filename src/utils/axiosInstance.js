import axios from "axios";
import { ensureTokenRefreshed } from "./refreshHandler";
import { setCustomHeaders } from "@/common/utils";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔑 Always attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = {
      ...config.headers,
      _token: token || "",
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧠 Response interceptor handles refresh + retry
api.interceptors.response.use(
  async (response) => {
    let data = response.data;

    // Handle ArrayBuffer case (optional)
    if (data instanceof ArrayBuffer) {
      try {
        data = JSON.parse(new TextDecoder().decode(new Uint8Array(data)));
      } catch (error) {
        console.log(error);
      }
    }

    // 🔄 Token expired → refresh flow
    if (data?.responseCode === 417) {
      const originalRequest = response.config;

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await ensureTokenRefreshed();

          // ✅ Wait until token truly exists in localStorage
          const verifiedToken = localStorage.getItem("token");

          // ✅ Update both the retry request + Axios instance headers
          api.defaults.headers.common["_token"] = verifiedToken;
          originalRequest.headers._token = verifiedToken;

          // 🔁 Retry with the latest token
          return api(originalRequest);
        } catch (err) {
          // localStorage.clear();
          // window.location.href = "/";
          return Promise.reject(err);
        }
      }
    }

    // 🚫 Unauthorized
    if (data?.responseCode === 401) {
      // localStorage.clear();
      // window.location.href = "/";
      return Promise.reject("Unauthorized");
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.clear();
      // window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// 🧾 POST wrapper for your APIs
const createPostAPI =
  (url, requestMethod) => async (bodyData, isDoc, fileName, ext) => {
    const headers = setCustomHeaders(isDoc, fileName, ext);
    const form = new FormData();
    form.append("RequestMethod", requestMethod);

    if (bodyData && typeof bodyData === "object") {
      form.append("RequestData", JSON.stringify(bodyData));
    }

    if (isDoc && bodyData?.file instanceof File) {
      form.append("File", bodyData.file);
    }

    const config = {
      method: "POST",
      url,
      data: form,
      headers,
      ...(isDoc ? { responseType: "arraybuffer" } : {}),
    };

    return api(config);
  };
export default createPostAPI;
