import React, {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"; // ✅ added useRef
import GlobalTabs from "../../shareComponents/elements/tabs";
import SelectDropdown from "../../shareComponents/commonComponents/elements/selectDropdown/SelectDropdown";
import {
  GetAllDealersSpreadApi,
  GetAllOtherInstrumentsApi,
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  GetBankForwardForTreasuryDealerApi,
  GetBankSpotForDealerApi,
  GetCurrencyCrossesApi,
  GetDiscountingRatesForDealerApi,
  GetSingleDealersSpreadApi,
} from "../../store/actions/WatchlistAction";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearGetAllDealersSpread,
  clearGetAllOtherInstruments,
  clearGetBankForwardForTreasuryDealer,
  clearGetBankSpotForDealer,
  clearGetCurrencyCrosses,
  clearGetDiscountingRatesForDealer,
  clearGetSingleDealersSpread,
  setDealerValue,
} from "../../store/slicers/watchListSlicer/WatchListSlicer";
import { setActiveDealerTab } from "../../store/slicers/tabSlicer/tabSlicer";
import SectionLoader from "../../shareComponents/elements/soneriLoader/SectionLoader";
import { useMqttTopics } from "../../hook/useMqttTopics";
// import { setActiveDealerTab } from "../../store/slicers/tabSlice/tabSlice"; // ✅ new

const LiveRates = lazy(() =>
  import("../../shareComponents/commonComponents/liveRates/index")
);
const Forwards = lazy(() =>
  import("../../shareComponents/commonComponents/forwards/index")
);
const Discounting = lazy(() =>
  import("../../shareComponents/commonComponents/discounting/index")
);
const News = lazy(() => import("../../shareComponents/commonComponents/news"));

const isTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
const isDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";

const Dealer = () => {
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

  const [dealerIdForMQTT, setDealerIdForMQTT] = useState(0);
  const GetAllDealersSpread = useSelector(
    (state) => state.WatchListReducer.GetAllDealersSpread
  );

  const [dealerOptions, setDealerOptions] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);

  // ✅ Tab change handler — mirrors Treasury pattern
  const handleTabChange = (tabTitle) => {
    setActiveTabId(tabTitle); // Update local state to trigger hook update
    dispatch(setActiveDealerTab(Number(tabTitle)));
  };

  console.log(dealerIdForMQTT, "selectedDealerselectedDealer");
  const tabs = [
    {
      label: "Live Rates",
      key: "0",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <LiveRates dealerIdForMQTT={dealerIdForMQTT} />
        </Suspense>
      ),
    },
    {
      label: "Forwards",
      key: "1",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <Forwards dealerIdForMQTT={dealerIdForMQTT} />
        </Suspense>
      ),
    },
    {
      label: "Discounting",
      key: "2",
      children: (
        <Suspense fallback={<SectionLoader />}>
          <Discounting dealerIdForMQTT={dealerIdForMQTT} />
        </Suspense>
      ),
    },
    ...(isDealer
      ? [
          {
            label: "News",
            key: "3",
            children: (
              <Suspense fallback={<SectionLoader />}>
                <News />
              </Suspense>
            ),
          },
        ]
      : []),
  ];

  const handleChangeDealer = (event) => {
    const Data = { DealerId: event.value };
    const obj = { value: event.value, label: event.label };

    dispatch(setDealerValue(obj));
    setSelectedDealer(event);
    setDealerIdForMQTT(event.value);
    dispatch(GetBankSpotForDealerApi({ navigate, Data }));
    dispatch(GetCurrencyCrossesApi({ navigate }));
    dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
    dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
  };

  // ✅ guard against double-fetch
  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(getAllTenorsAction({ navigate }));
    dispatch(GetAllOtherInstrumentsApi({ navigate }));

    if (isTreasury) {
      dispatch(GetAllDealersSpreadApi({ navigate }));
    }

    if (isDealer) {
      const dealerId = localStorage.getItem("userID");
      setDealerIdForMQTT(dealerId);
      const Data = { DealerId: Number(dealerId) };
      dispatch(GetSingleDealersSpreadApi({ Data }));
      dispatch(GetBankSpotForDealerApi({ navigate, Data }));
      dispatch(GetCurrencyCrossesApi({ navigate }));
      dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
      dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
    }

    // ✅ CLEANUP ON UNMOUNT
    return () => {
      let defaultData = {
        value: 0,
        label: "",
      };
      dispatch(setDealerValue(defaultData));
      dispatch(clearGetBankSpotForDealer());
      dispatch(clearGetCurrencyCrosses());
      dispatch(clearGetBankForwardForTreasuryDealer());
      dispatch(clearGetDiscountingRatesForDealer());
      dispatch(clearGetAllDealersSpread());
      dispatch(clearGetAllOtherInstruments());
      dispatch(clearGetSingleDealersSpread());
      // Reset ref so if they come back, it fetches fresh
      hasFetched.current = false;
    };
  }, []);

  useEffect(() => {
    if (!GetAllDealersSpread) return; // ✅ simpler null check

    try {
      const { dealersSpread } = GetAllDealersSpread;
      if (!Array.isArray(dealersSpread) || dealersSpread.length === 0) return;

      const mappedDealers = dealersSpread.map((dealer) => ({
        value: dealer.userID,
        label: dealer.userName,
      }));

      const firstDealer = mappedDealers[0];
      const Data = { DealerId: firstDealer.value };

      dispatch(GetBankSpotForDealerApi({ navigate, Data }));
      dispatch(GetCurrencyCrossesApi({ navigate }));
      dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
      dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
      dispatch(
        setDealerValue({ value: firstDealer.value, label: firstDealer.label })
      );

      setSelectedDealer(firstDealer);
      setDealerIdForMQTT(firstDealer.value);
      setDealerOptions(mappedDealers);
    } catch (error) {
      console.error("Error mapping dealers:", error);
    }
  }, [GetAllDealersSpread]);

  return (
    <div>
      <GlobalTabs
        items={tabs}
        onChange={handleTabChange} // ✅ was missing
        tabBarExtraContent={
          !isDealer && (
            <SelectDropdown
              options={dealerOptions}
              isSearchable={true}
              value={selectedDealer}
              style={{ width: 150, background: "#0326b3", color: "#ffffff" }}
              classNamePrefix="treasuryInterbankSelectDealer"
              onChange={handleChangeDealer}
            />
          )
        }
      />
    </div>
  );
};

export default Dealer;
