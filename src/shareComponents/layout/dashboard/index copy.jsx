import { Layout } from "antd";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import MainHeader from "../header";
import "./dashboard.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  currentRatePublishedAction,
  FeDiscountingPublishedAction,
  marketStatusUpdated,
  NonFeDiscountingPublishedAction,
  setClearRates,
  setCommoditiesForManagmentFeed,
  setCurrencyCrossesForManagementFeed,
  setCurrencyCrossesRatesFeed,
  setCurrentRateSheetRatesPublished,
  setDealerForwardTenorChanged,
  setDealerSpotRatesFeed,
  setKiborForManagmentFeed,
  setRealTimeNewsFeed,
  setSbpFXRevalRatesForManagmentFeed,
  setSofrForManagmentFeed,
  setStockIndicesForManagmentFeed,
  setSwapsinUSDForManagementFeed,
  setTenorsCreated,
  setTreasuryDealerFeDiscounting,
  setTreasuryDealerForwardRates,
  setTreasuryDealerNonFeDiscounting,
  setTreasuryFeDiscounting,
  setTreasuryForwardRates,
  setTreasuryFowardsTenorsChanges,
  setTreasuryNonFeDiscounting,
  setTreasuryRateSheetConversionRate,
  setTreasuryRateSheetCurrencyNotes,
  setTreasuryRateSheetIndicativeFBPRates,
  setTreasuryRateSheetKibor,
  setTreasuryRateSheetSofr,
  setTreasuryRateSheetSpotTTRates,
  setTreasurySpotRatesFeed,
  setUSDParityForManagementFeed,
  tenorWiseFowardsRatesPublishedActions,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { setMarketStatus } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  getAllInstrumentsApi,
  // LogoutApi,
} from "../../../store/actions/authAction";
import { useMqttClient } from "../../commonComponents/utils/mqttConnection";
import { getMarketStatusApi } from "../../../store/actions/WatchlistAction";
import { MqttContext } from "../../../context/MqttContext";
// import { setMainLoader } from "../../../store/slicers/authSlicer/authSlicer";

const Dashboard = () => {
  const { Content, Footer, Header } = Layout;

  const layoutStyle = {
    borderRadius: 8,
    overflow: "hidden",
    background: "none",
    fontFamily: "Helvetica",
  };

  // MQTT Work
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [isSoundOn, setIsSoundOn] = useState(false);
  // const audioRef = useRef(null);
  // const prevTopicRef = useRef(null);
  // const prevPathRef = useRef(null);
  // const marketStatus = useSelector(
  //   (state) => state.WatchListReducer.getMarketStatus
  // );
  const activeTreasuryTab = useSelector(
    (state) => state.tabReducer.activeTreasuryTab
  );
  const activeDealerTab = useSelector(
    (state) => state.tabReducer.activeDealerTab
  );
  // const categoryValue = useSelector(
  //   (state) => state.WatchListReducer.categoryValue
  // );

  const dealerValue = useSelector(
    (state) => state.WatchListReducer.dealerValue
  );

  const IsManagement = import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true";
  const isTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
  const isDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";
  const subscribeID = IsManagement
    ? "SBL_MANAGEMENT"
    : isTreasury
    ? "SBL_TREASURY"
    : isDealer
    ? "SBL_DEALER"
    : null;
  const userID = localStorage.getItem("userID");

  // Memoized MQTT message handler
  const handleMqttMessage = useCallback(
    (data) => {
      const type = data?.payload?.message;
      const payload = data?.payload;
      // console.log({ type }, "handleMqttMessage");
      // console.log(type === "TREASURY_MANAGEMENT_KIBOR", "handleMqttMessage");

      // const type = data?.message; // ✅ FIX
      // const payload = data;
      // if (type === "TREASURY_MANAGEMENT_KIBOR") {
      //   console.log({ data, payload, type }, "handleMqttMessage");
      // }
      try {
        switch (type) {
          case "MARKET_STATUS_UPDATED":
            console.log("MARKET_STATUS_UPDATED", payload);

            dispatch(marketStatusUpdated(payload?.marketStatus?.isMarketOn));
            dispatch(setMarketStatus(payload?.marketStatus?.isMarketOn));
            break;

          // ✅ USD, FE, NONFE (wrap in startTransition for smoothness)
          case "CURRENT_USD_RATES_PUBLISHED":
            console.log("CURRENT_USD_RATES_PUBLISHED_TEST");
            startTransition(() => {
              dispatch(currentRatePublishedAction(payload));
            });
            break;

          case "FE_DISCOUNTING_RATES_PUBLISHED":
            startTransition(() => {
              dispatch(FeDiscountingPublishedAction(payload));
            });
            break;
          case "NONFE_DISCOUNTING_RATES_PUBLISHED":
            startTransition(() => {
              dispatch(NonFeDiscountingPublishedAction(payload));
            });
            break;
          case "TENOR_WISE_FORWARD_RATES_PUBLISHED":
            startTransition(() => {
              dispatch(tenorWiseFowardsRatesPublishedActions(payload));

              let tenorsData = {
                newIsForwardtenorList:
                  payload.tenorWiseForwardRates.newIsForwardtenorList,
                removedtenorList:
                  payload.tenorWiseForwardRates.removedtenorList,
                updateTenorsDays:
                  payload.tenorWiseForwardRates.updatedTenorDaysList,
              };

              dispatch(setTreasuryFowardsTenorsChanges(tenorsData));
              dispatch(setDealerForwardTenorChanged(tenorsData));
            });
            break;
          // ✅ Market & Tenor
          case "TENOR_CREATED":
            dispatch(setTenorsCreated(payload));
            break;
          case "RATES_CLEAR":
            dispatch(setClearRates(payload));
            break;
          // ✅ Spot/Forward rates — wrap in transition
          case "DISPATCHER_DEALER_SPOT_RATES":
            startTransition(() => {
              dispatch(setDealerSpotRatesFeed(payload));
            });
            break;
          case "TREASURY_CURRENCY_CROSS_FEED":
            startTransition(() => {
              dispatch(setCurrencyCrossesRatesFeed(payload));
            });
            break;
          case "TREASURY_SPOT_RATES_FEED":
            startTransition(() => {
              dispatch(setTreasurySpotRatesFeed(payload));
            });
            break;
          case "TREASURY_FORWARD_RATES_FEED":
            startTransition(() => {
              dispatch(setTreasuryForwardRates(payload));
            });
            break;
          case "TREASURY_DEALER_FORWARD_RATES_FEED":
            // Dealer Forward will handle there
            startTransition(() => {
              dispatch(setTreasuryDealerForwardRates(payload));
            });
            break;

          case "TREASURY_DEALER_FEDISCOUNTING_RATES_FEED":
            // Dealer Fe Discounting will handle there
            startTransition(() => {
              dispatch(setTreasuryDealerFeDiscounting(payload));
            });
            break;

          case "TREASURY_DEALER_NONFEDISCOUNTING_RATES_FEED":
            // Dealer Non - Fe Discounting will handle there
            startTransition(() => {
              dispatch(setTreasuryDealerNonFeDiscounting(payload));
            });
            break;

          case "TREASURY_FEDISCOUNTING_RATES_FEED":
            startTransition(() => {
              dispatch(setTreasuryFeDiscounting(payload));
            });
            break;

          case "TREASURY_NONFEDISCOUNTING_RATES_FEED":
            startTransition(() => {
              dispatch(setTreasuryNonFeDiscounting(payload));
            });
            break;
          case "CURRENT_RATE_SHEET_RATES_PUBLISHED":
            console.log("CURRENT_RATE_SHEET_RATES_PUBLISHED");
            startTransition(() => {
              dispatch(setCurrentRateSheetRatesPublished(payload));
            });
            break;

          case "TREASURY_USD_PARITY_FEED":
            startTransition(() => {
              dispatch(setUSDParityForManagementFeed(payload));
            });
            break;
          case "TREASURY_CURRENCY_CROSSES_FEED":
            startTransition(() => {
              dispatch(setCurrencyCrossesForManagementFeed(payload));
            });
            break;
          case "TREASURY_CROSSES_PREMIUMS_RATES":
            // no dispatch needed currently
            break;

          case "TREASURY_COMMODITIES_FEED":
            startTransition(() => {
              dispatch(setCommoditiesForManagmentFeed(payload));
            });
            break;

          case "TREASURY_STOCK_INDICES_FEED":
            startTransition(() => {
              dispatch(setStockIndicesForManagmentFeed(payload));
            });
            break;
          case "TREASURY_MANAGEMENT_KIBOR":
            console.log("TREASURY_MANAGEMENT_KIBOR_Received");
            // startTransition(() => {
            dispatch(setKiborForManagmentFeed(payload));
            // });
            break;

          case "TREASURY_MANAGEMENT_SOFR":
            // startTransition(() => {
            dispatch(setSofrForManagmentFeed(payload));
            // });
            break;

          case "TREASURY_MANAGEMENT_SBP_FX_REVAL_RATES":
            startTransition(() => {
              dispatch(setSbpFXRevalRatesForManagmentFeed(payload));
            });
            break;
          case "TREASURY_MANAGEMENT_SWAPS_IN_USD":
            startTransition(() => {
              dispatch(setSwapsinUSDForManagementFeed(payload));
            });
            break;
          case "TREASURY_RATE_SHEET_SPOT_TT_RATES":
            // console.log("TREASURY_RATE_SHEET_SPOT_TT_RATES");
            startTransition(() => {
              dispatch(setTreasuryRateSheetSpotTTRates(payload));
            });
            break;
          case "TREASURY_RATE_SHEET_CURRENCY_NOTES":
            // console.log("TREASURY_RATE_SHEET_CURRENCY_NOTES");
            startTransition(() => {
              dispatch(setTreasuryRateSheetCurrencyNotes(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_CONVERSION_RATE":
            console.log("TREASURY_RATE_SHEET_CONVERSION_RATE");
            startTransition(() => {
              dispatch(setTreasuryRateSheetConversionRate(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_KIBOR":
            console.log("TREASURY_RATE_SHEET_KIBOR FBP Rates");
            startTransition(() => {
              dispatch(setTreasuryRateSheetKibor(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_SOFR":
            console.log("TREASURY_RATE_SHEET_SOFR");
            startTransition(() => {
              dispatch(setTreasuryRateSheetSofr(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_INDICATIVE_FBP_RATES":
            console.log("TREASURY_RATE_SHEET_INDICATIVE_FBP_RATES");
            startTransition(() => {
              dispatch(setTreasuryRateSheetIndicativeFBPRates(payload));
            });
            break;

          case "REAL_TIME_NEWS_FEED":
            console.log("REAL_TIME_NEWS_FEED");
            startTransition(() => {
              dispatch(setRealTimeNewsFeed(payload));
            });
            break;

          //

          default:
            console.warn("No specific handler for this message type", payload);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [dispatch]
  ); // ✅ Add dispatch here

  // MQTT configuration
  const mqttConfig = useMemo(
    () => ({
      onMessageArrivedCallback: handleMqttMessage,
      onConnectionLostCallback: () => {
        console.warn("MQTT disconnected inside feature");
      },
    }),
    [handleMqttMessage]
  );

  const {
    connectToMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    isConnected,
  } = useMqttClient(mqttConfig);

  // ✅ Expose unsubscribeAll so MainHeader can call it directly on click

  // This is created to remove all the topics when path is changed, to opitimize and reduce the lag
  const unsubscribeAll = useCallback(() => {
    if (prevTopicsRef.current.length) {
      unsubscribeRef.current(prevTopicsRef.current);
      console.log("Instant unsub (primary):", prevTopicsRef.current);
      prevTopicsRef.current = [];
    }
    if (prevSecondaryTopicsRef.current.length) {
      unsubscribeRef.current(prevSecondaryTopicsRef.current);
      console.log("Instant unsub (secondary):", prevSecondaryTopicsRef.current);
      prevSecondaryTopicsRef.current = [];
    }
  }, []);

  // useEffect(() => {
  //   if (!isConnected) return;
  //   const isDealerPath = location.pathname.toLowerCase().includes("dealer");

  //   if (isDealerPath) {
  //     if (isDealer) {
  //       // Dealer If Self (Login Dealer)
  //       const topic1 = `SBL_TREASURY_DEALER_RATES_${Number(
  //         localStorage.getItem("userID")
  //       )}`;
  //       const topic2 = `SBL_REAL_TIME_FEED_TREASURY_DEALER_${Number(
  //         localStorage.getItem("userID")
  //       )}`;
  //       const topic3 = "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY";
  //       subscribeToTopics([topic1, topic2, topic3]);
  //       return;
  //     } else if (
  //       dealerValue !== null &&
  //       dealerValue !== undefined &&
  //       dealerValue.value !== 0
  //     ) {
  //       const topic1 = `SBL_TREASURY_DEALER_RATES_${dealerValue.value}`;
  //       const topic2 = `SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerValue.value}`;
  //       const topic3 = "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY";

  //       const newTopics = [topic1, topic2, topic3];
  //       subscribeToTopics(newTopics);
  //       return;
  //     }
  //   }
  //   // const isTreasuryPath = location.pathname.toLowerCase().includes("treasury"); //for all treasury except rate sheet
  //   // const activeTab = localStorage.getItem("activeTreasuryTab"); // for Rate Sheet in Treasury
  //   // if (isTreasuryPath) {
  //   //   if (activeTab === 4) {
  //   //     subscribeToTopics(["SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY"]);
  //   //   }
  //   //   if (activeTab === 3) {
  //   //     subscribeToTopics(["REAL_TIME_FEED_NEWS"]);
  //   //   }
  //   // }
  // }, [isConnected, dealerValue]);

  // const prevTopicRef = useRef([]);

  // useEffect(() => {
  //   if (!isConnected) return;

  //   const isDealerPath = location.pathname.toLowerCase().includes("dealer");
  //   const isTreasuryPath = location.pathname.toLowerCase().includes("treasury");
  //   const isManagementPath = location.pathname
  //     .toLowerCase()
  //     .includes("management");
  //   const activeTab = Number(localStorage.getItem("activeTreasuryTab"));

  //   let newTopics = [];

  //   if (isDealerPath) {
  //     // ✅ CASE 1: Logged-in Dealer
  //     if (isDealer) {
  //       if (activeTab === 3) {
  //         // 🔴 Only NEWS for dealer on tab 3
  //         newTopics = ["REAL_TIME_FEED_NEWS"];
  //       } else {
  //         const userId = Number(localStorage.getItem("userID"));

  //         newTopics = [
  //           `SBL_TREASURY_DEALER_RATES_${userId}`,
  //           `SBL_REAL_TIME_FEED_TREASURY_DEALER_${userId}`,
  //           "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY",
  //         ];
  //       }
  //     }

  //     // ✅ CASE 2: Not a Dealer (viewer mode)
  //     else if (dealerValue && dealerValue.value !== 0) {
  //       newTopics = [
  //         `SBL_TREASURY_DEALER_RATES_${dealerValue.value}`,
  //         `SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerValue.value}`,
  //         "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY",
  //       ];
  //       // ❌ NO NEWS here ever
  //     }
  //   }

  //   if (isTreasuryPath) {
  //     newTopics = ["SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT"];
  //     // do work for treasury
  //   }

  //   if (isManagementPath) {
  //     // Do management Activity here
  //   }
  //   if (newTopics.length === 0) {
  //     //   const isTreasuryPath = location.pathname.toLowerCase().includes("treasury");

  //     // 🔴 No topics → unsubscribe all
  //     if (prevTopicRef.current.length) {
  //       unsubscribeFromTopics(prevTopicRef.current);
  //       console.log("Unsubscribed (no topics):", prevTopicRef.current);
  //       prevTopicRef.current = [];
  //     }
  //     return;
  //   }

  //   // 🔁 Compare with previous
  //   const prevTopics = prevTopicRef.current;

  //   const isSame =
  //     prevTopics.length === newTopics.length &&
  //     prevTopics.every((t, i) => t === newTopics[i]);

  //   if (!isSame) {
  //     if (prevTopics.length) {
  //       unsubscribeFromTopics(prevTopics);
  //       console.log("Unsubscribed:", prevTopics);
  //     }

  //     subscribeToTopics(newTopics);
  //     console.log("Subscribed:", newTopics);

  //     prevTopicRef.current = newTopics;
  //   }
  // }, [isConnected, dealerValue, isDealer, location.pathname]);

  // // Currently this useEffect is used
  // useEffect(() => {
  //   const isDealerPath = location.pathname.toLowerCase().includes("dealer");

  //   const isManagementPath = location.pathname
  //     .toLowerCase()
  //     .includes("management");

  //   const isTreasuryPath = location.pathname.toLowerCase().includes("treasury");

  //   // Condition for Dealer user when Logged in
  //   if (isDealerPath && isDealer && isConnected) {
  //     // console.log("reaced here");
  //     const topic1 = `SBL_TREASURY_DEALER_RATES_${Number(
  //       localStorage.getItem("userID")
  //     )}`;
  //     const topic2 = `SBL_REAL_TIME_FEED_TREASURY_DEALER_${Number(
  //       localStorage.getItem("userID")
  //     )}`;
  //     // topic for currency Crosses

  //     const topic3 = "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY";
  //     subscribeToTopics([topic1, topic2, topic3]);
  //     return;
  //   }
  //   // 🛑 Wait until dealerValue is ready
  //   if (!dealerValue && !isConnected) return;

  //   const dealerId = dealerValue.value;

  //   // Management Work
  //   if (isManagementPath && isConnected) {
  //     subscribeToTopics([
  //       "SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT",
  //       "SBL_REAL_TIME_STATIC_TREASURY_MANAGEMENT",
  //     ]);
  //   }
  //   // Treasury Work
  //   if (isTreasuryPath && isConnected) {
  //     console.log("in treasury path");
  //     subscribeToTopics(["SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT"]);
  //     console.log("SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT");
  //   }

  //   const topic1 = `SBL_TREASURY_DEALER_RATES_${dealerId}`;
  //   const topic2 = `SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerId}`;
  //   const topic3 = "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY";

  //   // const newTopics = [topic1, topic2, topic3];
  //   subscribeToTopics([topic1, topic2, topic3]);
  //   // return;
  //   // const isSame =
  //   //   JSON.stringify(prevTopicRef.current) === JSON.stringify(newTopics);

  //   // if (!isSame) {
  //   //   if (prevTopicRef.current?.length) {
  //   //     unsubscribeFromTopics(prevTopicRef.current);
  //   //     console.log("Unsubscribed (switch):", prevTopicRef.current);
  //   //   }

  //   //   subscribeToTopics(newTopics);
  //   //   console.log("Subscribed:", newTopics);

  //   //   prevTopicRef.current = newTopics;
  //   // }
  //   // ❌ If ANY required condition fails → unsubscribe
  //   if (
  //     !isTreasury ||
  //     !isDealerPath ||
  //     !dealerId ||
  //     dealerId === 0 ||
  //     !isManagementPath
  //   ) {
  //     if (prevTopicRef.current?.length) {
  //       unsubscribeFromTopics(prevTopicRef.current);
  //       console.log("Unsubscribed (condition failed):", prevTopicRef.current);
  //       prevTopicRef.current = [];
  //     }
  //     return;
  //   }
  //   return () => {
  //     if (prevTopicRef.current?.length) {
  //       unsubscribeFromTopics(prevTopicRef.current);
  //       console.log("Cleanup unsubscribe:", prevTopicRef.current);
  //       prevTopicRef.current = [];
  //     }
  //   };
  // }, [dealerValue, location.pathname, isTreasury, isConnected]);

  // useEffect(() => {
  //   if (!isConnected) return;

  //   const path = location.pathname.toLowerCase();

  //   if (path.includes("treasury")) {
  //     subscribeToTopics([
  //       "SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY",
  //       "REAL_TIME_FEED_NEWS",
  //     ]);

  //     if (marketStatus) {
  //       subscribeToTopics(["SBL_REAL_TIME_FEED_TREASURY"]);
  //     }
  //   } else if (path.includes("allnews")) {
  //     subscribeToTopics(["REAL_TIME_FEED_NEWS"]);
  //   } else {
  //     unsubscribeFromTopics([
  //       "SBL_REAL_TIME_FEED_TREASURY",
  //       "SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY",
  //       "REAL_TIME_FEED_NEWS",
  //     ]);
  //   }
  // }, [location.pathname, isConnected, marketStatus]);
  // End Here

  //New Optimiized useEffect:
  const location = useLocation(); // ✅ Add at top with other hooks

  const prevTopicsRef = useRef([]); // Effect 1: dealer/treasury/management
  const prevSecondaryTopicsRef = useRef([]); // Effect 2: rate sheet + news

  // ✅ Replace the useCallback with a stable ref-based approach
  const subscribeRef = useRef(subscribeToTopics);
  const unsubscribeRef = useRef(unsubscribeFromTopics);

  // Keep refs in sync without causing re-renders
  useEffect(() => {
    subscribeRef.current = subscribeToTopics;
    unsubscribeRef.current = unsubscribeFromTopics;
  }, [subscribeToTopics, unsubscribeFromTopics]);

  // ✅ Now updateSubscriptions never changes reference
  const updateSubscriptions = useCallback(
    (prevTopics, newTopics, refSetter) => {
      const isSame =
        prevTopics.length === newTopics.length &&
        prevTopics.every((t, i) => t === newTopics[i]);

      if (isSame) return;

      if (prevTopics.length) {
        unsubscribeRef.current(prevTopics);
        console.log("Unsubscribed:", prevTopics);
      }
      if (newTopics.length) {
        subscribeRef.current(newTopics);
        console.log("Subscribed:", newTopics);
      }
      refSetter(newTopics);
    },
    [] // ✅ empty deps — stable forever, uses refs internally
  );

  // // ✅ Remove updateSubscriptions from both effects' dependency arrays
  // useEffect(() => {
  //   // ... Effect 1 body
  // }, [isConnected, location.pathname, dealerValue, isDealer]); // ✅ no updateSubscriptions

  // useEffect(() => {
  //   // ... Effect 2 body
  // }, [isConnected, location.pathname, activeTreasuryTab, activeDealerTab]); // ✅ no updateSubscriptions

  // ─── Effect 1: Dealer / Treasury / Management ────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    const path = location.pathname.toLowerCase();
    const isDealerPath = path.includes("dealer");
    const isTreasuryPath = path.includes("treasury");
    const isManagementPath = path.includes("management");

    let newTopics = [];

    if (isDealerPath && isDealer) {
      const userId = Number(localStorage.getItem("userID"));
      newTopics = [
        `SBL_TREASURY_DEALER_RATES_${userId}`,
        `SBL_REAL_TIME_FEED_TREASURY_DEALER_${userId}`,
        "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY",
      ];
    } else if (isDealerPath && dealerValue != null && dealerValue.value !== 0) {
      newTopics = [
        `SBL_TREASURY_DEALER_RATES_${dealerValue.value}`,
        `SBL_REAL_TIME_FEED_TREASURY_DEALER_${dealerValue.value}`,
        "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY",
      ];
    } else if (isManagementPath) {
      newTopics = [
        "SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT",
        "SBL_REAL_TIME_STATIC_TREASURY_MANAGEMENT",
      ];
    } else if (isTreasuryPath) {
      // newTopics = ["SBL_REAL_TIME_FEED_TREASURY_MANAGEMENT"];
      newTopics = [
        "SBL_REAL_TIME_FEED_TREASURY",
        "SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY",
      ];
    }

    updateSubscriptions(
      prevTopicsRef.current,
      newTopics,
      (t) => (prevTopicsRef.current = t)
    );
  }, [isConnected, location.pathname, dealerValue, isDealer]);

  // ─── Effect 2: Rate Sheet + News (tab-based) ─────────────────────────────────
  useEffect(() => {
    if (!isConnected) return;

    const path = location.pathname.toLowerCase();
    const isDealerPath = path.includes("dealer");
    const isTreasuryPath = path.includes("treasury");
    const isManagementPath = path.includes("management"); // ✅ added

    let newTopics = [];

    // ❌ removed isAllNewsPath — no MQTT on /allnews
    if (isManagementPath) {
      // ✅ Management always gets news feed
      newTopics = ["REAL_TIME_FEED_NEWS"];
    } else if (isTreasuryPath) {
      if (activeTreasuryTab === 3) newTopics = ["REAL_TIME_FEED_NEWS"];
      if (activeTreasuryTab === 4)
        newTopics = ["SBL_REAL_TIME_RATE_SHEET_FEED_TREASURY"];
    } else if (isDealerPath) {
      if (activeDealerTab === 3) newTopics = ["REAL_TIME_FEED_NEWS"];
    }
    // ✅ /allnews → no topics, no subscription

    updateSubscriptions(
      prevSecondaryTopicsRef.current,
      newTopics,
      (t) => (prevSecondaryTopicsRef.current = t)
    );
  }, [isConnected, location.pathname, activeTreasuryTab, activeDealerTab]);
  //                                   ☝️ now reactive — re-runs on every tab change
  // ✅ Single unmount cleanup — runs once when Dashboard unmounts
  useEffect(() => {
    return () => {
      if (prevTopicsRef.current.length) {
        unsubscribeRef.current(prevTopicsRef.current);
        console.log("Unmount cleanup (primary):", prevTopicsRef.current);
        prevTopicsRef.current = [];
      }
      if (prevSecondaryTopicsRef.current.length) {
        unsubscribeRef.current(prevSecondaryTopicsRef.current);
        console.log(
          "Unmount cleanup (secondary):",
          prevSecondaryTopicsRef.current
        );
        prevSecondaryTopicsRef.current = [];
      }
    };
  }, []); // ✅ empty array = runs only on unmount
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    connectToMqtt({ subscribeID, userID });
    dispatch(getMarketStatusApi({ navigate }));

    if (isTreasury === "false") {
      dispatch(getAllInstrumentsApi({ navigate }));
    }
  }, []);

  return (
    <MqttContext.Provider value={{ unsubscribeAll }}>
      <Layout style={layoutStyle}>
        <Header prefixCls="mainHeader">
          <MainHeader />
        </Header>
        <Content className="my-2">
          <Outlet />
        </Content>
      </Layout>
    </MqttContext.Provider>
  );
};

export default Dashboard;
