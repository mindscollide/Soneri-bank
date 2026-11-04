// Waits until the given lazy chunks (the UI the user is about to see) are
// loaded and the browser has painted, then runs `fn` (usually the API calls).
// Returns a cancel function: call it from the effect cleanup.
export const runAfterUiReady = (loaders, fn) => {
  let cancelled = false;

  Promise.allSettled(loaders.map((load) => load())).then(() => {
    // Let the loader / skeleton paint first, then start the requests
    requestAnimationFrame(() => {
      if (!cancelled) fn();
    });
  });

  return () => {
    cancelled = true;
  };
};
