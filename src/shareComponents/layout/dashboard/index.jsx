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
import Dealer from "../../../modules/dealer";
import Interbank from "../../../modules/interbank";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  BlotterTransactionAdded,
  BlotterTransactionAddedForTreasury,
  BlotterTransactionRFQExpired,
  currentRatePublishedAction,
  FeDiscountingPublishedAction,
  marketStatusUpdated,
  NonFeDiscountingPublishedAction,
  setBlotterTransactionAddedForTreasuryDealBox,
  setBlotterTransactionRFQExpiredForTreasury,
  setBlotterTransactionRFQExpiredForTreasuryDealBox,
  setCategoryFeDiscounting,
  setCategoryForwardRates,
  setCategoryFowardsTenorsChanges,
  setCategoryNonFeDiscounting,
  setCategorySpotRates,
  setClearRates,
  setCounterPartyFeDiscounting,
  setCounterPartyForwardRates,
  setCounterPartyNonFeDiscounting,
  setCounterPartySpotRates,
  setCurrencyCrossesRatesFeed,
  setFxTradingCards,
  setMarketTimingsUpdated,
  setTenorsCreated,
  setTradeRightsStatusUpdated,
  setTreasuryFeDiscounting,
  setTreasuryForwardRates,
  setTreasuryFowardsTenorsChanges,
  setTreasuryNonFeDiscounting,
  setTreasurySpotRatesFeed,
  tenorWiseFowardsRatesPublishedActions,
} from "../../../store/slicers/realtimeActionsSlicer/realtimeActionSlice";
import { setMarketStatus } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  getAllInstrumentsApi,
  LogoutApi,
} from "../../../store/actions/authAction";
import { useMqttClient } from "../../commonComponents/utils/mqttConnection";
import { getMarketStatusApi } from "../../../store/actions/WatchlistAction";
import { setDealModalRequest } from "../../../store/slicers/modalSlicer/modalSlicer";

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
  const audioRef = useRef(null);
  const prevTopicRef = useRef(null);
  const prevPathRef = useRef(null);
  const marketStatus = useSelector(
    (state) => state.WatchListReducer.getMarketStatus
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
      // const type = data?.message; // ✅ FIX
      // const payload = data;

      console.log({ data, payload, type }, "handleMqttMessage");

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
              removedtenorList: payload.tenorWiseForwardRates.removedtenorList,
              updateTenorsDays:
                payload.tenorWiseForwardRates.updatedTenorDaysList,
            };

            dispatch(setCategoryFowardsTenorsChanges(tenorsData));
            dispatch(setTreasuryFowardsTenorsChanges(tenorsData));
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
          // startTransition(() => {
          //   dispatch(setTreasurySpotRatesFeed(payload));
          // });
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

        default:
          console.warn("No specific handler for this message type", payload);
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

  useEffect(() => {
    if (isTreasury || isDealer) {
      subscribeToTopics([
        `SBL_CURRENCY_CROSSES_REAL_TIME_FEED_TREASURY`,
        `SBL_REAL_TIME_FEED_TREASURY`,
      ]);

      if (!dealerValue.value) return;

      console.log(dealerValue, "dealerValuedealerValuedealerValue");
      const newTopic = `SBL_TREASURY_DEALER_RATES_${dealerValue.value}`;

      // Subscribe to the new topic
      subscribeToTopics([newTopic]);
      console.log("Subscribed to:", newTopic);

      // Store this topic as previous for next run
      if (prevTopicRef.current !== newTopic) {
        prevTopicRef.current = newTopic;
      }
    }

    // Cleanup to unsubscribe the previous topic
    // return () => {
    //   if (prevTopicRef.current) {
    //     unsubscribeFromTopics([prevTopicRef.current]);
    //     console.log("Unsubscribed from:", prevTopicRef.current);
    //   }
    // };
  }, [dealerValue.value]);

  useEffect(() => {
    if (!isConnected) return;

    //make isTreasuryCommented
    if (isTreasury || isDealer) {
      if (marketStatus) {
        // Subscribe only when status is true AND path is treasury
        subscribeToTopics(["SBL_REAL_TIME_FEED_TREASURY"]);
        console.log("Subscribed to SBL_REAL_TIME_FEED_TREASURY");
      } else {
        // Unsubscribe when status is false OR path is not treasury
        // unsubscribeFromTopics(["BOP_REAL_TIME_FEED_TREASURY"]);
        console.log("Unsubscribed from SBL_REAL_TIME_FEED_TREASURY_DEALER");
      }
    }
  }, [location.pathname, isConnected, marketStatus]);

  // Handle unsubscription only when leaving treasury path
  // useEffect(() => {
  //   const handlePathChange = () => {
  //     const wasTreasury = prevPathRef.current?.includes("treasury");
  //     const isNowTreasury = location.pathname.includes("treasury");

  //     // Unsubscribe only if we're leaving treasury path
  //     if (wasTreasury && !isNowTreasury) {
  //       unsubscribeFromTopics(["SBL_REAL_TIME_FEED_TREASURY_DEALER"]);
  //       console.log("Unsubscribed from BOP_REAL_TIME_FEED_TREASURY");
  //     }

  //     prevPathRef.current = location.pathname;
  //   };

  //   handlePathChange();
  // }, [location.pathname]);

  useEffect(() => {
    connectToMqtt({ subscribeID, userID });
    dispatch(getMarketStatusApi({ navigate }));

    // if (IsCorporate || IsBranch) {
    //   dispatch(GetAllNatureOfTransactionsApi({ navigate }));
    //   if (IsBranch) {
    //     dispatch(getAllActiveCorporatesApi({ navigate }));
    //   }
    // }
    if (isTreasury === "false") {
      dispatch(getAllInstrumentsApi({ navigate }));
    }
  }, []);

  return (
    <Layout style={layoutStyle}>
      <Header prefixCls="mainHeader">
        <MainHeader />
      </Header>
      <Content className="my-2">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default Dashboard;
