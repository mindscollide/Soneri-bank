// src/PrivateRoute.jsx
import { getCookieValue } from "@/common/utils";
import { Navigate, Outlet } from "react-router-dom";

// isAuthenticated is passed as a prop to check if the user is logged in
const PrivateRoute = ({ element }) => {
  console.log(element, "elementelement");
  // If the user is not authenticated, navigate them to the login page
  let isUser = localStorage.getItem("user");
  let isRole = localStorage.getItem("roleID");
  let token = localStorage.getItem("token");
  // let getToken = getCookieValue("token");
  // console.log(getToken, "getTokengetToken");
  // if (getToken === null && getToken === "" ) {
  //   const expirationDate = new Date();
  //   expirationDate.setMinutes(expirationDate.getMinutes() + 1);
  //   document.cookie = `token=${token}; path=/; secure; samesite=strict; expires=${expirationDate.toUTCString()}`;
  // }
  // If authenticated, render the protected route's component
  return token ? element : <Navigate to={"/"} />;
};

export default PrivateRoute;
