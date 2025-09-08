import { BranchesOutlined, DeliveredProcedureOutlined, DockerOutlined, GiftOutlined, HomeOutlined, MoneyCollectOutlined, UserOutlined } from "@ant-design/icons";
import { Route, Routes } from "react-router";
import Login from "../../pages/SuperAdmin/Login";
import * as SuperAdminCMS from "../../pages/SuperAdmin";
import {
  useSuperAdminAuthStore
} from "../../store/hotelStore";
import { Auth, UnAuth } from "../ValidateAuth";
import BasicLayout from "../../components/layout/BasicLayout";
import { BoxIcon, DollarSign, User } from "lucide-react";

const SuperAdminRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      route: "/dashboard",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Dashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/branches",
      name: "Branches",
      label: "Branches",
      icon: <BranchesOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/roomtypes",
      name: "Room Types",
      label: "Room Types",
      icon: <DockerOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.RoomTypes />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/DollarSign",
      name: "Rooms",
      label: "Rooms",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/rates",
      name: "Rates",
      label: "Rates",
      icon: <MoneyCollectOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/users",
      name: "Users",
      label: "Users",
      icon: <UserOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/promotions",
      name: "Promotions",
      label: "Promotions",
      icon: <GiftOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/services",
      name: "Services",
      label: "Services",
      icon: <DeliveredProcedureOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS.Branch />,
      isFilter: true,
      isShow: true,
    },

  ].map((page) => ({ ...page, route: "/superadmin" + page.route }));

  // ========== Render Routes ==========
  return (
    <Routes>
      <Route
        element={
          <UnAuth
            store={useSuperAdminAuthStore}
            redirect="/superadmin/dashboard"
          />
        }
      >
        <Route path="/" index element={<Login />} />
      </Route>

      {/* Protected Route Wrapper */}
      <Route
        element={<Auth store={useSuperAdminAuthStore} redirect="/superadmin" />}
      >

        <Route
          element={
            <BasicLayout navigations={navigations} store={useSuperAdminAuthStore} />
          }
        >
          {/* Main Layout Route */}
          {navigations
            .filter((page) => page.isShow) // Only create routes for visible pages
            .map((page) => {
              // Use 'route' instead of 'link' and fix the path extraction
              const routePath = page.route.replace("/superadmin/", "");

              console.log("Route path:", routePath);

              return (
                <Route
                  key={page.route}
                  path={routePath}
                  element={page.component}
                />
              );
            })}
        </Route>
        {/* Fallback Route */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Route>
    </Routes>
  );
};

export default SuperAdminRoute;
