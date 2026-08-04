import "./Loader.css";
import SoneriLoader from "../../../assets/img/logo-main-loader.png";

const Loader = () => {
  return (
    <div className='body-loader'>
      <div className='body-loader-inner'>
        <div className='logo-loader-wrapper'>
          <img className='' src={SoneriLoader} />
          <div className='loader-line-highlight'></div>
          <div className='load-progress' style={{ display: "none" }}>
            <div className='color'></div>
            <div className='color-overlay-bg'></div>
            <div className='LoadingPercent moving-text'></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
