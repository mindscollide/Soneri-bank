import React, { lazy, Suspense, useEffect, useRef } from "react";
import GlobalTabs from "../../shareComponents/elements/tabs";
// import LiveRates from "../../shareComponents/commonComponents/liveRates/index1";
// import Discounting from "../../shareComponents/commonComponents/discounting";
import News from "../../shareComponents/commonComponents/news";
import RateSheet from "../../shareComponents/commonComponents/rateSheet";
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
const LiveRates = lazy(() => import("./liveRates/index"));
const Forwards = lazy(() => import("./forwards/index"));
const TreasuryDiscounting = lazy(() => import("./discounting/index"));
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
    {
      label: `Discounting`,
      key: 2,
      children: (
        <Suspense fallback={<>...Loadings</>}>
          <TreasuryDiscounting />
        </Suspense>
      ),
    },

    { label: `News`, key: 3, children: <News /> },
    { label: `Rate Sheet`, key: 4, children: <RateSheet /> },
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
