import React, { lazy, Suspense, useEffect, useRef } from "react";
import GlobalTabs from "../../shareComponents/elements/tabs";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GetAllOtherInstrumentsApi,
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  GetBankForwardForTreasuryApi,
  GetBankSpotForTreasuryApi,
  GetCurrencyCrossesApi,
  GetDiscountingRatesForTreasuryApi,
} from "../../store/actions/WatchlistAction";
import { setActiveTab } from "../../store/slicers/watchListSlicer/WatchListSlicer";
import { setActiveTreasuryTab } from "../../store/slicers/tabSlicer/tabSlicer";
import SectionLoader from "../../shareComponents/elements/soneriLoader/SectionLoader";
const LiveRates = lazy(() => import("./liveRates/index"));
const Forwards = lazy(() => import("./forwards/index"));
const TreasuryDiscounting = lazy(() => import("./discounting/index"));

const News = lazy(() => import("../../shareComponents/commonComponents/news"));
const RateSheet = lazy(() =>
  import("../../shareComponents/commonComponents/rateSheet")
);
const Treasury = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleTabChange = (tabTitle) => {
    dispatch(setActiveTab(tabTitle)); // ✅ keep existing logic
    dispatch(setActiveTreasuryTab(Number(tabTitle))); // ✅ reactive for Dashboard subscriptions
  };
  const tabs = [
    {
      label: `Live Rates`,
      key: "0",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <LiveRates />
        </Suspense>
      ),
    },
    {
      label: `Forwards`,
      key: "1",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <Forwards />
        </Suspense>
      ),
    },
    {
      label: `Discounting`,
      key: "2",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <TreasuryDiscounting />
        </Suspense>
      ),
    },

    {
      label: `News`,
      key: "3",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <News />
        </Suspense>
      ),
    },
    {
      label: `Rate Sheet`,
      key: "4",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <RateSheet />
        </Suspense>
      ),
    },
  ];
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(getAllTenorsAction({ navigate }));
    dispatch(GetAllOtherInstrumentsApi({ navigate }));
    dispatch(GetBankSpotForTreasuryApi({ navigate }));
    dispatch(GetCurrencyCrossesApi({ navigate }));
    dispatch(GetBankForwardForTreasuryApi({ navigate }));
    dispatch(GetDiscountingRatesForTreasuryApi({ navigate }));
  }, []);

  return (
    <div>
      <GlobalTabs
        items={tabs}
        defaultActiveKey={"0"}
        onChange={handleTabChange}
      />
    </div>
  );
};

export default Treasury;
