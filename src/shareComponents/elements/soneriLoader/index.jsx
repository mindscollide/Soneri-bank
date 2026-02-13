import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./Loader.css";
import SoneriLoader from "../../../assets/img/logo-main-loader.png";

const Loader = () => {
  const [isLoader, setIsLoading] = useState(true);

  const WatchListReducerLoader = useSelector(
    (state) => state.WatchListReducer.Loader
  );
  const AuthLoader = useSelector((state) => state.authReducer.Loader);

  const isLoading = [WatchListReducerLoader, AuthLoader].some(
    (loading) => loading
  );

  useEffect(() => {
    let timeout;

    if (isLoading) {
      setIsLoading(true); // Show loader
    } else {
      // Hide loader after a short delay when loading completes
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    // !location.pathname.toLowerCase().includes("Soneri".toLowerCase()) && (
    isLoader && (
      <div className="body-loader">
        <div className="body-loader-inner">
          <div className="logo-loader-wrapper">
            <img className="" src={SoneriLoader} />
            <div className="loader-line-highlight"></div>
            <div className="load-progress" style={{ display: "none" }}>
              <div className="color"></div>
              <div className="color-overlay-bg"></div>
              <div className="LoadingPercent moving-text"></div>
            </div>
          </div>
        </div>
      </div>
    )
    // )
  );
};

export default Loader;
