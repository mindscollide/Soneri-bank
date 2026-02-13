import React from "react";
import DealerFeDiscounting from "./DealerNonFEDiscounting";
import DealerNonFeDiscounting from "./DealerNonFEDiscounting";
import DealerFeDiscountingTable from "./DealerFEDiscounting";

const DealerDiscounting = () => {
  return (
    <>
      <div>
        <DealerFeDiscountingTable />
      </div>
      <div>
        <DealerNonFeDiscounting />
      </div>
    </>
  );
};

export default DealerDiscounting;
