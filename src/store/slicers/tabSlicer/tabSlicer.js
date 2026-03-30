// redux/slices/tabSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeTreasuryTab: 1, // Active tab for /treasury path
  activeDealerTab: 1, // Active tab for /dealer path
};

const tabSlice = createSlice({
  name: "tab",
  initialState,
  reducers: {
    setActiveTreasuryTab(state, { payload }) {
      state.activeTreasuryTab = payload;
      localStorage.setItem("activeTreasuryTab", payload); // ✅ keep localStorage in sync
    },
    setActiveDealerTab(state, { payload }) {
      state.activeDealerTab = payload;
      localStorage.setItem("activeDealerTab", payload); // ✅ keep localStorage in sync
    },
    resetTabState() {
      return initialState;
    },
  },
});

export const { setActiveTreasuryTab, setActiveDealerTab, resetTabState } =
  tabSlice.actions;

export default tabSlice.reducer;
