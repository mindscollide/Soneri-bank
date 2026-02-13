import { useEffect, useRef } from "react";

const VERSION_URL = "../../public/version.json"; // make sure it's in public folder

console.log(VERSION_URL, "VERSION_URLVERSION_URL")

function useAutoReload() {
  const currentVersion = useRef(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(VERSION_URL + "?t=" + new Date().getTime()); // prevent cache
        const data = await response.json();

        if (currentVersion.current && currentVersion.current !== data.version) {
          console.log("New version detected. Reloading...");
          window.location.reload(true); // force reload
        }

        currentVersion.current = data.version;
      } catch (err) {
        console.error("Error fetching version.json:", err);
      }
    };

    // check immediately, then every 30 seconds
    checkVersion();
    const interval = setInterval(checkVersion, 30000);

    return () => clearInterval(interval);
  }, []);
}

export default useAutoReload;
