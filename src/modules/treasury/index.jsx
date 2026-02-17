import React, { lazy, Suspense, useEffect } from "react";
import GlobalTabs from "../../shareComponents/elements/tabs";
// import LiveRates from "../../shareComponents/commonComponents/liveRates/index1";
import Discounting from "../../shareComponents/commonComponents/discounting";
import News from "../../shareComponents/commonComponents/news";
import RateSheet from "../../shareComponents/commonComponents/rateSheet";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAllTenorsAction,
  getAllTreasuryInstrumentsApi,
  GetBankForwardForTreasuryApi,
  GetBankSpotForTreasuryApi,
  GetCurrencyCrossesApi,
} from "../../store/actions/WatchlistAction";
const LiveRates = lazy(() => import("./liveRates/index"));
const Forwards = lazy(() => import("./forwards/index"));
const Treasury = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    { label: `Discounting`, key: 2, children: <Discounting /> },
    { label: `News`, key: 3, children: <News /> },
    { label: `Rate Sheet`, key: 4, children: <RateSheet /> },
  ];
  useEffect(() => {
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
    dispatch(getAllTenorsAction({ navigate }));

    dispatch(GetBankSpotForTreasuryApi({ navigate }));
    dispatch(GetCurrencyCrossesApi({ navigate }));
    dispatch(GetBankForwardForTreasuryApi({ navigate }));
    // dispatch(GetDiscountingRatesForDealerApi({ navigate, Data }));
  }, []);
  // const dealerDropdown = (
  //   <SelectDropdown
  //     isSearchable={true}
  //     defaultValue="Dealer 2"
  //     style={{ width: 150, background: "#0326b3", color: "#ffffff" }}
  //     classNamePrefix="treasuryInterbankSelectDealer"
  //     options={[
  //       { value: "Dealer 1", label: "Dealer 1" },
  //       { value: "Dealer 2", label: "Dealer 2" },
  //       { value: "Dealer 3", label: "Dealer 3" },
  //     ]}
  //   />
  // );
  return (
    <div className="mt-2">
      <GlobalTabs items={tabs} />
    </div>
  );
};

export default Treasury;
