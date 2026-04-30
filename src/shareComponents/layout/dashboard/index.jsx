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
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
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
import {
  setMarketStatus,
  updateTenors,
} from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import { getAllInstrumentsApi } from "../../../store/actions/authAction";
import { useMqttClient } from "../../commonComponents/utils/mqttConnection";
import { getMarketStatusApi } from "../../../store/actions/WatchlistAction";
import { MqttContext } from "../../../context/MqttContext";

const Dashboard = () => {
  const { Content, Header } = Layout;

  const layoutStyle = {
    borderRadius: 8,
    overflow: "hidden",
    background: "none",
    fontFamily: "Helvetica",
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // ─── MQTT message handler ─────────────────────────────────────────────────────
  const handleMqttMessage = useCallback(
    (data) => {
      const type = data?.payload?.message;
      const payload = data?.payload;

      try {
        switch (type) {
          case "MARKET_STATUS_UPDATED":
            dispatch(marketStatusUpdated(payload?.marketStatus?.isMarketOn));
            dispatch(setMarketStatus(payload?.marketStatus?.isMarketOn));
            break;

          case "CURRENT_USD_RATES_PUBLISHED":
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
            console.log("NONFE_DISCOUNTING_RATES_PUBLISHED", payload);
            startTransition(() => {
              dispatch(NonFeDiscountingPublishedAction(payload));
            });
            break;

          case "TENOR_WISE_FORWARD_RATES_PUBLISHED":
            startTransition(() => {
              dispatch(tenorWiseFowardsRatesPublishedActions(payload));
              const tenorsData = {
                newIsForwardtenorList:
                  payload.tenorWiseForwardRates.newIsForwardtenorList,
                removedtenorList:
                  payload.tenorWiseForwardRates.removedtenorList,
                updateTenorsDays:
                  payload.tenorWiseForwardRates.updatedTenorDaysList,
              };
              dispatch(setTreasuryFowardsTenorsChanges(tenorsData));
              dispatch(setDealerForwardTenorChanged(tenorsData));
              dispatch(updateTenors(tenorsData));
            });
            break;

          case "TENOR_CREATED":
            dispatch(setTenorsCreated(payload));
            break;

          case "RATES_CLEAR":
            dispatch(setClearRates(payload));
            break;

          case "DISPATCHER_DEALER_SPOT_RATES":
            // {
            //   payload.instrumentCrossRate.instrumentID === 21 &&
            //     console.log("DISPATCHER_DEALER_SPOT_RATES", payload);
            // }

            // console.log(
            //   payload.instrumentCrossRate.instrumentID,
            //   payload.instrumentParitySpot.instrumentID,
            //   "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            // );
            // if (payload?.instrumentCrossRate?.instrumentID === 21) {
            //   console.log(
            //     payload,
            //     "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            //   );
            // }
            // if (payload?.instrumentParitySpot?.instrumentID === 21) {
            //   console.log(
            //     payload,
            //     "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            //   );
            // }

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
            // console.log(
            //   payload.instrumentCrossRate.instrumentID,
            //   payload.instrumentParitySpot.instrumentID,
            //   "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            // );
            // if (payload?.instrumentCrossRate?.instrumentID === 21) {
            //   console.log(
            //     payload,
            //     "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            //   );
            // }
            // if (payload?.instrumentParitySpot?.instrumentID === 21) {
            //   console.log(
            //     payload,
            //     "TREASURY_SPOT_RATES_FEEDTREASURY_SPOT_RATES_FEED"
            //   );
            // }
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
            // if (payload.forwardRates[0].instrumentID === 21) {
            //   console.log("TREASURY_DEALER_FORWARD_RATES_FEED", payload);
            // }

            startTransition(() => {
              dispatch(setTreasuryDealerForwardRates(payload));
            });
            break;

          case "TREASURY_DEALER_FEDISCOUNTING_RATES_FEED":
            startTransition(() => {
              dispatch(setTreasuryDealerFeDiscounting(payload));
            });
            break;

          case "TREASURY_DEALER_NONFEDISCOUNTING_RATES_FEED":
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
            dispatch(setKiborForManagmentFeed(payload));
            break;

          case "TREASURY_MANAGEMENT_SOFR":
            dispatch(setSofrForManagmentFeed(payload));
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
            startTransition(() => {
              dispatch(setTreasuryRateSheetSpotTTRates(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_CURRENCY_NOTES":
            startTransition(() => {
              dispatch(setTreasuryRateSheetCurrencyNotes(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_CONVERSION_RATE":
            startTransition(() => {
              dispatch(setTreasuryRateSheetConversionRate(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_KIBOR":
            startTransition(() => {
              dispatch(setTreasuryRateSheetKibor(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_SOFR":
            startTransition(() => {
              dispatch(setTreasuryRateSheetSofr(payload));
            });
            break;

          case "TREASURY_RATE_SHEET_INDICATIVE_FBP_RATES":
            startTransition(() => {
              dispatch(setTreasuryRateSheetIndicativeFBPRates(payload));
            });
            break;

          case "REAL_TIME_NEWS_FEED":
            console.log("Received REAL_TIME_NEWS_FEED:", payload);
            startTransition(() => {
              dispatch(setRealTimeNewsFeed(payload));
            });
            break;

          default:
            console.warn("Unhandled MQTT message type:", type, payload);
        }
      } catch (error) {
        console.error("MQTT message handler error:", error);
      }
    },
    [dispatch]
  );

  // ─── MQTT client setup ────────────────────────────────────────────────────────
  const mqttConfig = useMemo(
    () => ({
      onMessageArrivedCallback: handleMqttMessage,
      onConnectionLostCallback: () => {
        console.warn("MQTT connection lost");
      },
    }),
    [handleMqttMessage]
  );

  const {
    connectToMqtt,
    subscribeToTopics,
    unsubscribeFromTopics,
    isConnected,
    activeTopics, // Set<string> — maintained inside useMqttClient
  } = useMqttClient(mqttConfig);

  // // ─── Keep unsubscribe fn in a ref so unsubscribeAll never goes stale ──────────
  // const unsubscribeRef = useRef(unsubscribeFromTopics);
  // useEffect(() => {
  //   unsubscribeRef.current = unsubscribeFromTopics;
  // }, [unsubscribeFromTopics]);

  // // ─── unsubscribeAll — called by MainHeader on navigation clicks ───────────────
  // // Clears every currently active topic instantly without waiting for
  // // component unmount. Components will re-subscribe when they mount.
  // const unsubscribeAll = useCallback(() => {
  //   if (!activeTopics || activeTopics.size === 0) return;
  //   const all = [...activeTopics];
  //   unsubscribeRef.current(all);
  //   console.log("[Dashboard] unsubscribeAll:", all);
  // }, [activeTopics]);

  // ─── One-time init: connect MQTT + fetch market status ───────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <MqttContext.Provider
      value={{
        subscribe: subscribeToTopics,
        unsubscribe: unsubscribeFromTopics,
        isConnected,
        activeTopics, // components read this inside useMqttTopics hook
        // unsubscribeAll, // MainHeader uses this
      }}
    >
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
