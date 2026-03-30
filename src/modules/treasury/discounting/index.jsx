import React from "react";
import TreasuryFeDiscountingTable from "./TreasuryFEDiscounting";
import TreasuryNonFeDiscountingTable from "./TreasuryNonFEDiscounting";

const TreasuryDiscounting = () => {
  return (
    <>
      <div>
        <TreasuryFeDiscountingTable />
      </div>
      <div>
        <TreasuryNonFeDiscountingTable />
      </div>
    </>
  );
};

export default TreasuryDiscounting;
