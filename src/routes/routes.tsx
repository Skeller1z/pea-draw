import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";
import LoginPage from "../Components/Login/LoginPage";
import MainMap from "../Components/Leaflet/MainMap";
import Main from "../Components/Main";
import Main2 from "../Components/Main2";
export default function Router() {

  return useRoutes([
    {
      path: "/",
      element: <LoginPage/>,
      
    },
    {
      path: "MainMap",
      element: <MainMap/>,
      
    },
    {
      path: "main",
      element: <Main2/>,
      
    },
  ]);
}
