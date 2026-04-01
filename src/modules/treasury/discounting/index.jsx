import React, { lazy, Suspense } from "react";
import { useMqttTopics } from "../../../hook/useMqttTopics";
import SectionLoader from "../../../shareComponents/elements/soneriLoader/SectionLoader";

// 🔹 Lazy load components
const TreasuryFeDiscountingTable = lazy(() =>
  import("./TreasuryFEDiscounting")
);
const TreasuryNonFeDiscountingTable = lazy(() =>
  import("./TreasuryNonFEDiscounting")
);

const TreasuryDiscounting = () => {
  useMqttTopics([`SBL_REAL_TIME_FEED_TREASURY`]);

  return (
    <>
      <Suspense fallback={<SectionLoader />}>
        <div>
          <TreasuryFeDiscountingTable />
        </div>
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <div>
          <TreasuryNonFeDiscountingTable />
        </div>
      </Suspense>
    </>
  );
};

export default TreasuryDiscounting;
