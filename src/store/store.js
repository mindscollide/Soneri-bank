import { configureStore } from "@reduxjs/toolkit";
import React from "react";
import RealtimeActionsSlice from "./slicers/realtimeActionsSlicer/realtimeActionSlice";
import WatchListSlice from "./slicers/watchListSlicer/WatchListSlicer";
import authSlicer from "./slicers/authSlicer/authSlicer";
import modalSlicer from "./slicers/modalSlicer/modalSlicer";
export const store = configureStore({
  reducer: {
    RealtimeActionsSlice: RealtimeActionsSlice,
    authReducer: authSlicer,
    WatchListReducer: WatchListSlice,
    modalReducer: modalSlicer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
