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
