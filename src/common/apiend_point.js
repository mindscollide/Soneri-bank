const baseURL = import.meta.env.VITE_BASE_URL;

const authApi = `${baseURL}${import.meta.env.VITE_AUTH_PORT}`;
const watchListApi = `${baseURL}${import.meta.env.VITE_WATCHLIST_PORT}`;
const blotterApi = `${baseURL}${import.meta.env.VITE_BLOTTER_PORT}`;
const reportApi = `${baseURL}${import.meta.env.VITE_REPORT_PORT}`;
const calculatorApi = `${baseURL}${import.meta.env.VITE_CALCULATOR_PORT}`;
const settingApi = `${baseURL}${import.meta.env.VITE_SETTING_PORT}`;
const chatApi = `${baseURL}${import.meta.env.VITE_CHAT_PORT}`;

export {
  authApi,
  watchListApi,
  blotterApi,
  reportApi,
  calculatorApi,
  settingApi,
  chatApi,
};
