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
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
