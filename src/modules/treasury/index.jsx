import React from "react";
import GlobalTabs from "../../shareComponents/elements/tabs";
import LiveRates from "../../shareComponents/commonComponents/liveRates/index1";
import Discounting from "../../shareComponents/commonComponents/discounting";
import Forwards from "../../shareComponents/commonComponents/forwards";
import SelectDropdown from "../../shareComponents/commonComponents/elements/selectDropdown/SelectDropdown";
import News from "../../shareComponents/commonComponents/news";
import RateSheet from "../../shareComponents/commonComponents/rateSheet";

const Treasury = () => {
  const tabs = [
    { label: `Live Rates`, key: 0, children: <LiveRates /> },
    { label: `Fowards`, key: 1, children: <Forwards /> },
    { label: `Discounting`, key: 2, children: <Discounting /> },
    { label: `News`, key: 3, children: <News /> },
    { label: `Rate Sheet`, key: 4, children: <RateSheet /> },
  ];
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
