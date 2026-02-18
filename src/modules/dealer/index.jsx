import React, { lazy, Suspense, useEffect, useState } from "react";
import GlobalTabs from "../../shareComponents/elements/tabs";
// import LiveRates from "../../shareComponents/commonComponents/liveRates/index1";
// import Discounting from "../../shareComponents/commonComponents/discounting";
import SelectDropdown from "../../shareComponents/commonComponents/elements/selectDropdown/SelectDropdown";
import {
  GetAllDealersSpreadApi,
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
import { setDealerValue } from "../../store/slicers/watchListSlicer/WatchListSlicer";
// import LiveRates from "../../shareComponents/commonComponents/liveRates";

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
  console.log({ isDealer, isTreasury }, "Role");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const GetAllDealersSpread = useSelector(
    (state) => state.WatchListReducer.GetAllDealersSpread
  );
  console.log(
    { GetAllDealersSpread },
    "GetAllDealersSpreadGetAllDealersSpread"
  );
  const [dealerOptions, setDealerOptions] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);

  const tabs = [
    {
      label: `Live Rates`,
      key: 0,
      children: (
        <Suspense fallback={<>...Loadings</>}>
          <LiveRates />
        </Suspense>
      ),
    },
    {
      label: `Forwards`,
      key: 1,
      children: (
        <Suspense fallback={<>...Loadings</>}>
          <Forwards />
        </Suspense>
      ),
    },
    {
      label: `Discounting`,
      key: 2,
      children: (
        <Suspense fallback={<>...Loadings</>}>
          <Discounting />
        </Suspense>
      ),
    },

    ...(isDealer
      ? [
          {
            label: `News`,
            key: 3,
            children: (
              <Suspense fallback={<>...Loadings</>}>
                <News />
              </Suspense>
            ),
          },
        ]
      : []),
  ];

  const handleChangeDealer = (event) => {
    console.log(event, "handleChangeDealer");
    let Data = { DealerId: event.value };
    let obj = {
      value: event.value,
      label: event.label,
    };
    dispatch(setDealerValue(obj));
    setSelectedDealer(event);
    dispatch(GetBankSpotForDealerApi({ navigate, Data }));
    dispatch(GetCurrencyCrossesApi({ navigate }));
    dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
    dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
  };

  useEffect(() => {
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(getAllTenorsAction({ navigate }));
    if (isTreasury) {
      dispatch(GetAllDealersSpreadApi({ navigate }));
    }
    if (isDealer) {
      const dealerId = localStorage.getItem("userID");
      let Data = { DealerId: Number(dealerId) };
      dispatch(GetSingleDealersSpreadApi({ Data }));
      dispatch(GetBankSpotForDealerApi({ navigate, Data }));
      dispatch(GetCurrencyCrossesApi({ navigate }));
      dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
      dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
    }
  }, []);

  useEffect(() => {
    if (GetAllDealersSpread && GetAllDealersSpread !== null) {
      try {
        const { dealersSpread } = GetAllDealersSpread;
        if (dealersSpread && Array.isArray(dealersSpread)) {
          const mappedDealers = dealersSpread.map((dealer) => ({
            value: dealer.userID,
            label: dealer.userName,
          }));
          if (mappedDealers.length > 0) {
            let Data = { DealerId: mappedDealers[0].value };
            dispatch(GetBankSpotForDealerApi({ navigate, Data }));
            dispatch(GetCurrencyCrossesApi({ navigate }));
            dispatch(GetBankForwardForTreasuryDealerApi({ navigate, Data }));
            dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
            setSelectedDealer(mappedDealers[0]);
            setDealerOptions(mappedDealers);
            let obj = {
              value: mappedDealers[0].value,
              label: mappedDealers[0].label,
            };
            dispatch(setDealerValue(obj));
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [GetAllDealersSpread]);

  console.log(dealerOptions, "dealerOptions");
  return (
    <div className="mt-2">
      <GlobalTabs
        items={tabs}
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
