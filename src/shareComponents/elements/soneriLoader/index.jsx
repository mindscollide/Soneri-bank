import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./Loader.css";
import SoneriLoader from "../../../assets/img/logo-main-loader.png";
import { setMainLoader } from "../../../store/slicers/authSlicer/authSlicer";

const Loader = () => {
  const [isLoader, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const WatchListReducerLoader = useSelector(
    (state) => state.WatchListReducer.Loader
  );
  const AuthLoader = useSelector((state) => state.authReducer.Loader);
  const mainLoader = useSelector((state) => state.authReducer.mainLoader);
  const NewsLoader = useSelector(
    (state) => state.WatchListReducer.NewsLoadingSpinner
  );

  // ✅ Remove mainLoader from isLoading — it was causing circular dependency
  const isLoading = [WatchListReducerLoader, AuthLoader, NewsLoader].some(
    Boolean
  );
  useEffect(() => {
    let timeout;

    if (isLoading) {
      setIsLoading(true);
    } else {
      timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }

    return () => clearTimeout(timeout);
  }, [isLoading, AuthLoader, WatchListReducerLoader, NewsLoader]);

  // ✅ Also handle mainLoader separately — show loader if mainLoader is true
  // regardless of the API loaders
  useEffect(() => {
    if (mainLoader) {
      setIsLoading(true);
    }
  }, [mainLoader]);

  return (
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
  );
};

export default Loader;
