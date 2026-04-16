import "./App.css";
import Interbank from "./modules/interbank";
import Dashboard from "./shareComponents/layout/dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import loadRoutes from "./routes/routes";
import { ResponseMessage } from "./shareComponents/commonComponents/utils/ResponseMessageToast";
import Loader from "./shareComponents/elements/soneriLoader";
import { useEffect } from "react";
const router = createBrowserRouter(await loadRoutes());
function App() {
  useEffect(() => {
    const isTreasury = import.meta.env.VITE_APP_INCLUDE_TREASURY === "true";
    const isDealer = import.meta.env.VITE_APP_INCLUDE_DEALER === "true";
    const isManagement = import.meta.env.VITE_APP_INCLUDE_MANAGEMENT === "true";
    if (isTreasury) {
      document.title = "Soneri - Treasury";
      return;
    }
    if (isDealer) {
      document.title = "Soneri - Dealer";
      return;
    }
    if (isManagement) {
      document.title = "Soneri - Management";
      return;
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      {/* <Loader /> */}
      <ResponseMessage />
    </>
  );
}

export default App;
