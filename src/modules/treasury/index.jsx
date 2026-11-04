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
import T24 from "../../shareComponents/commonComponents/t24";
import { runAfterUiReady } from "../../utils/runAfterUiReady";

// Loaders are kept separate so the active tab can be preloaded before the APIs fire
const loadLiveRates = () =>
  import("../../shareComponents/commonComponents/liveRates/index");
const loadForwards = () => import("./forwards/index");
const loadDiscounting = () => import("./discounting/index");
const loadNews = () => import("../../shareComponents/commonComponents/news");
const loadRateSheet = () =>
  import("../../shareComponents/commonComponents/rateSheet");

// tab key -> chunk (T24 is imported statically, so it needs no preload)
const TAB_LOADERS = {
  0: loadLiveRates,
  1: loadForwards,
  2: loadDiscounting,
  3: loadNews,
  4: loadRateSheet,
};

const LiveRates = lazy(loadLiveRates);
const Forwards = lazy(loadForwards);
const TreasuryDiscounting = lazy(loadDiscounting);
const News = lazy(loadNews);
const RateSheet = lazy(loadRateSheet);
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
    [activeTabId],
  );

  // 4. Call the hook at the TOP LEVEL
  useMqttTopics(currentTopics);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Deferred so a StrictMode remount does not wipe the saved tab
      setTimeout(() => {
        if (!mountedRef.current) localStorage.removeItem("globalTabsActiveKey");
      }, 0);
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
        {
      label: `T24`,
      key: "5",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <T24 />
        </Suspense>
      ),
    },
  ];
  const hasFetched = useRef(false);
  useEffect(() => {
    // APIs start only after the tab the user lands on has loaded; until then
    // the Suspense fallback (SectionLoader) is shown.
    const activeLoader =
      TAB_LOADERS[localStorage.getItem("globalTabsActiveKey") ?? 0] ||
      loadLiveRates;

    return runAfterUiReady([activeLoader], () => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      dispatch(getAllTreasuryInstrumentsApi({ navigate }));
      dispatch(getAllTenorsAction({ navigate }));
      dispatch(GetAllOtherInstrumentsApi({ navigate }));
      dispatch(GetBankSpotForTreasuryApi({ navigate }));
      dispatch(GetCurrencyCrossesApi({ navigate }));
      dispatch(GetBankForwardForTreasuryApi({ navigate }));
      dispatch(GetDiscountingRatesForTreasuryApi({ navigate }));
    });
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
