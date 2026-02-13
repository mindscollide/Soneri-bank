import { useEffect, useRef, useState } from "react";

export const useTableScrollBottom = (
  onBottomReach,
  threshold = 0,
  prefixCls = "ant-table"
) => {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const containerRef = useRef(null);
  const previousScrollTopRef = useRef(0); // for detecting vertical scroll only

  useEffect(() => {
    const selector = `.${prefixCls}-body`;
    const scrollContainer = document.querySelector(selector);

    if (!scrollContainer) {
      console.warn(`📛 Scroll container not found for selector: ${selector}`);
      return;
    }

    containerRef.current = scrollContainer;

    const handleScroll = async () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Check if vertical scroll happened
      const scrolledVertically = scrollTop !== previousScrollTopRef.current;
      previousScrollTopRef.current = scrollTop;

      if (!scrolledVertically) return; // ignore horizontal-only scroll

      const isScrollable = scrollHeight > clientHeight;
      const isBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isScrollable && isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        await onBottomReach?.();

        // setTimeout(() => setHasReachedBottom(false), 1000);
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [hasReachedBottom, onBottomReach, threshold, prefixCls]);

  return {
    hasReachedBottom,
    containerRef,
    setHasReachedBottom,
  };
};
