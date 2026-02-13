import "./App.css";
import Interbank from "./modules/interbank";
import Dashboard from "./shareComponents/layout/dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import loadRoutes from "./routes/routes";
import { ResponseMessage } from "./shareComponents/commonComponents/utils/ResponseMessageToast";
import Loader from "./shareComponents/elements/soneriLoader";
const router = createBrowserRouter(await loadRoutes());
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Loader />
      <ResponseMessage />
    </>
  );
}

export default App;
