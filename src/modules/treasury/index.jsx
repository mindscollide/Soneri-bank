import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useMqttTopics } from "../../hook/useMqttTopics";
const LiveRates = lazy(() =>
  import("../../shareComponents/commonComponents/liveRates/index")
);
const Forwards = lazy(() => import("./forwards/index"));
const TreasuryDiscounting = lazy(() => import("./discounting/index"));

const News = lazy(() => import("../../shareComponents/commonComponents/news"));
const RateSheet = lazy(() =>
  import("../../shareComponents/commonComponents/rateSheet")
);
const Treasury = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Local state to track active tab for the hook
  const [activeTabId, setActiveTabId] = useState(0);

  // 2. Define which topics belong to which tab
  const topicMap = {
    0: [], // Live Rates
    1: [], // Forwards
    2: [], // Discounting
    3: [`SBL_REAL_TIME_FEED_NEWS`], // News
    4: [], // Rate Sheet
  };
  // 3. Get the topics for the current tab
  // We use useMemo to prevent the hook from re-subscribing on every render
  // unless the activeTabId actually changes.
  const currentTopics = useMemo(
    () => topicMap[activeTabId] || [],
    [activeTabId]
  );

  // 4. Call the hook at the TOP LEVEL
  useMqttTopics(currentTopics);

  useEffect(() => {
    return () => {
      localStorage.removeItem("globalTabsActiveKey");
    };
  }, []);

  const handleTabChange = (tabTitle) => {
    setActiveTabId(tabTitle); // Update local state to trigger hook update
    dispatch(setActiveTab(tabTitle));
    dispatch(setActiveTreasuryTab(Number(tabTitle)));
  };
  const tabs = [
    {
      label: `Live Rates`,
      key: "0",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <LiveRates dealerIdForMQTT={null} />
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
