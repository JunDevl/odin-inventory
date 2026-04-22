import { Navigate, type RouteObject } from "react-router";
import App from "./App";

import Operations from "./ui/pages/Operations/Operations";
import Entities from "./ui/pages/Entities/Entities";
import AvaliableItems from "./ui/pages/AvaliableItems/AvaliableItems";
import ItemCategories from "./ui/pages/ItemCategories/ItemCategories";
import Stocks from "./ui/pages/Stocks/Stocks";
import Auth from "./ui/pages/Auth/Auth";
import PageNotFound from "./ui/pages/PageNotFound/PageNotFound";
import ItemUnits from "./ui/pages/ItemUnits/ItemUnits";
import Account from "./ui/pages/Account/Account";

const userAuthId = localStorage.getItem("userUUID");

const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      {
        index: true,
        element: <Navigate to={userAuthId ? `/${userAuthId}/stocks` : `/auth`} replace />
      },
      {
        path: "auth",
        element: <Auth />
      },
      {
        path: ":userUUID",
        element: <App />,
        children: [
          {
            path: "stocks",
            element: <Stocks />
          },
          {
            path: "operations",
            element: <Operations />
          },
          {
            path: "entities",
            element: <Entities />
          },
          {
            path: "items/avaliable",
            element: <AvaliableItems />
          },
          {
            path: "items/categories",
            element: <ItemCategories />
          },
          {
            path: "items/units",
            element: <ItemUnits />
          },
          {
            path: "account",
            element: <Account />
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <PageNotFound />
  }
]

export default routes;