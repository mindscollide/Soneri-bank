import { useEffect, useState, useRef, useMemo } from "react";

export const RFQTImer = ({
  severTime,   // backend server timestamp in ms
  endTime,     // backend expiry timestamp in ms
  dispatch,
  apiFunction,
  Data,
  navigate,
}) => {

  // calculate client-server offset only once
  const offset = useMemo(() => Date.now() - severTime, [severTime]);

  const [timeLeft, setTimeLeft] = useState(endTime - (Date.now() - offset));
  const hasCalled = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() - offset; // "server-corrected" time
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);

        if (!hasCalled.current && apiFunction) {
          hasCalled.current = true;
          dispatch(apiFunction({ Data, navigate }));
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, dispatch, apiFunction, Data, navigate, offset]);

  // format mm:ss
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  if (timeLeft <= 0) return null;

  return (
    <span className="RFQ_TimerStyle">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
};
