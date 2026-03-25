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
    localStorage.setItem("activeTreasuryTab", tabTitle);
    dispatch(setActiveTab(tabTitle));
  };
  const tabs = [
    {
      label: `Live Rates`,
      key: "0",
      children: (
        <Suspense fallback={<>...Loading Live Rates</>}>
          <LiveRates />
        </Suspense>
      ),
    },
    {
      label: `Forwards`,
      key: "1",
      children: (
        <Suspense fallback={<>...Loading Forwards</>}>
          <Forwards />
        </Suspense>
      ),
    },
    {
      label: `Discounting`,
      key: "2",
      children: (
        <Suspense fallback={<>...Loading Discountings</>}>
          <TreasuryDiscounting />
        </Suspense>
      ),
    },

    {
      label: `News`,
      key: "3",
      children: (
        <Suspense fallback={<>...Loading News</>}>
          <News />
        </Suspense>
      ),
    },
    {
      label: `Rate Sheet`,
      key: "4",
      children: (
        <Suspense fallback={<>...Loading Rate Sheet</>}>
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
      <GlobalTabs items={tabs} defaultActiveKey={"0"} />
    </div>
  );
};

export default Treasury;
