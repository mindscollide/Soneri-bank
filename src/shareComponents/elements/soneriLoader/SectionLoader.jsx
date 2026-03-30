// import React from "react";
// import SectionLoaderImage from "@/assets/Bop-Loader.svg";

// const SectionLoader = () => {
//   return (
//     <div className="Treasury_Spot_Spinner">
//       <div className="d-flex justify-content-center">
//         <img src={SectionLoaderImage} />
//       </div>
//     </div>
//   );
// };

// export default SectionLoader;

import React from "react";
import "./SectionLoader.css";
import LoaderImage from "../../../assets/Soneri-Loader.svg";

const SectionLoader = () => {
  return (
    <>
      <div className="loader">
        <div className="d-flex align-items-center justify-content-center h-clc-100">
          <img className="img-fluid" src={LoaderImage} alt="Section-Loader" />
        </div>
      </div>
    </>
  );
};

export default SectionLoader;
