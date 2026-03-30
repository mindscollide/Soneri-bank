import { Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import Login from "../modules/auth/login";
import DashboardLayout from "../shareComponents/layout/dashboard";
import PrivateRoute from "../routes/PrivateRoutes";

import {
  ErrorFallback,
  logErrors,
} from "../shareComponents/elements/errorBoundary/ErrorBoundary";
import AllNews from "../modules/allNews";

const withErrorBoundary = (element) => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={logErrors}>
    {element}
  </ErrorBoundary>
);

const loadRoutes = async () => {
  const dashboardRoute = {
    path: "/SONERI",
    element: withErrorBoundary(<PrivateRoute element={<DashboardLayout />} />),
    children: [],
  };

  dashboardRoute.children.push({
    path: "allnews",
    element: withErrorBoundary(<PrivateRoute element={<AllNews />} />),
  });

  if (import.meta.env.VITE_APP_INCLUDE_TREASURY === "true") {
    const Interbank = (await import("../modules/interbank")).default;
    const Dealer = (await import("../modules/dealer")).default;
    const Treasury = (await import("../modules/treasury")).default;
    const Management = (await import("../modules/management")).default;
    dashboardRoute.children.push({
      path: "interbank",
      element: withErrorBoundary(<PrivateRoute element={<Interbank />} />),
    });
    dashboardRoute.children.push({
      path: "dealer",
      element: withErrorBoundary(<PrivateRoute element={<Dealer />} />),
    });
    dashboardRoute.children.push({
      path: "treasury",
      element: withErrorBoundary(<PrivateRoute element={<Treasury />} />),
    });
    dashboardRoute.children.push({
      path: "management",
      element: withErrorBoundary(<PrivateRoute element={<Management />} />),
    });
  }

  if (import.meta.env.VITE_APP_INCLUDE_DEALER === "true") {
    const Dealer = (await import("../modules/dealer")).default;

    dashboardRoute.children.push({
      path: "dealer",
      element: withErrorBoundary(<PrivateRoute element={<Dealer />} />),
    });
  }

  return [
    {
      path: "/",
      element: withErrorBoundary(<Login />),
    },
    dashboardRoute,
    {
      path: "*",
      element: <Navigate to="/" />,
    },
  ];
};

export default loadRoutes;
