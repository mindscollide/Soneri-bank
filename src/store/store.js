import { configureStore } from "@reduxjs/toolkit";
import RealtimeActionsSlice from "./slicers/realtimeActionsSlicer/realtimeActionSlice";
import WatchListSlice from "./slicers/watchListSlicer/WatchListSlicer";
import authSlicer from "./slicers/authSlicer/authSlicer";
import modalSlicer from "./slicers/modalSlicer/modalSlicer";
import tabSlicer from "./slicers/tabSlicer/tabSlicer";
export const store = configureStore({
  reducer: {
    RealtimeActionsSlice: RealtimeActionsSlice,
    authReducer: authSlicer,
    WatchListReducer: WatchListSlice,
    modalReducer: modalSlicer,
    tabReducer: tabSlicer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  // DevTools records every dispatched action + resulting state tree in memory
  // for time-travel debugging — with this app's high-frequency MQTT-driven
  // dispatches, leaving it on in production causes unbounded memory growth
  // the longer a tab stays open. Only enable it in local dev.
  devTools: import.meta.env.DEV,
});
