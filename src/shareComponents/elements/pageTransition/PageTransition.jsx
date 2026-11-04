import { useEffect, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import "./pageTransition.css";

const FADE_OUT_MS = 120;

// Fades the current route out, then fades the next one in.
// Keeps the previous route on screen for a moment, so keep FADE_OUT_MS short.
const PageTransition = () => {
  const { pathname } = useLocation();
  const outlet = useOutlet();

  const [shown, setShown] = useState({ pathname, outlet });
  const [leaving, setLeaving] = useState(false);
  const latest = useRef({ pathname, outlet });
  latest.current = { pathname, outlet };

  // Same route (e.g. re-render with new props): keep content up to date
  const sameRoute = shown.pathname === pathname;
  const content = sameRoute ? outlet : shown.outlet;

  useEffect(() => {
    if (shown.pathname === pathname) return;
    setLeaving(true);
    const timer = setTimeout(() => {
      setShown(latest.current);
      setLeaving(false);
    }, FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [pathname, shown.pathname]);

  return (
    <div
      key={shown.pathname}
      className={`page-transition ${leaving ? "page-transition--out" : "page-transition--in"}`}
    >
      {content}
    </div>
  );
};

export default PageTransition;
