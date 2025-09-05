import { BranchesOutlined, GiftOutlined, HomeOutlined, KeyOutlined, UserOutlined } from "@ant-design/icons";
import { Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import * as PAGES from "../../pages/Admin";
import Login from "../../pages/Admin/Login";
import { useAdminAuthStore } from "../../store/hotelStore";
import { Auth, UnAuth } from "../ValidateAuth";
import { DollarSign, ServerIcon } from "lucide-react";

const AdminRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      route: "/dashboard",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <PAGES.Dashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/branch",
      name: "Branch",
      label: "Branch Managment",
      icon: <BranchesOutlined className="h-5 w-5" />,
      component: <PAGES.Branch />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/roomType",
      name: "RoomType",
      label: "Room Type",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <PAGES.RoomTypes />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/RoomManagement",
      name: "RoomManagement",
      label: "Room Management",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <PAGES.RoomManagement />,
      isFilter: true,
      isShow: true,
    },

    {
      route: "/RatesAndPricing",
      name: "RatesAndPricing",
      label: "Rates & Pricing",
      icon: <DollarSign className="h-5 w-5" />,
      component: <PAGES.RatesAndPricing />,
      isFilter: true,
      isShow: true,
    },

    {
      route: "/accounts",
      name: "AccountManagement",
      label: "Account Management",
      icon: <UserOutlined className="h-5 w-5" />,
      component: <PAGES.AccountManagement />,
      isFilter: true,
      isShow: true,
    },

    {
      route: "/Promotions",
      name: "Promotions",
      label: "Promotions",
      icon: <GiftOutlined className="h-5 w-5" />,
      component: <PAGES.Promotions />,
      isFilter: true,
      isShow: true,
    },

    {
      route: "/AdditionalServices",
      name: "AdditionalServices",
      label: "AdditionalServices",
      icon: <ServerIcon className="h-5 w-5" />,
      component: <PAGES.AdditionalServices />,
      isFilter: true,
      isShow: true,
    },
  ].map((page) => ({ ...page, route: "/admin" + page.route }));

  // ========== Render Routes ==========
  return (
    <Routes>
      <Route
        element={
          <UnAuth store={useAdminAuthStore} redirect="/admin/dashboard" />
        }
      >
        <Route path="/" index element={<Login />} />
      </Route>

      {/* Protected Route Wrapper */}
      <Route element={<Auth store={useAdminAuthStore} redirect="/admin" />}>
        {/* Main Layout Route */}
        <Route
          element={
            <BasicLayout navigations={navigations} store={useAdminAuthStore} />
          }
        >
          {navigations
            .filter((page) => page.isShow) // Only create routes for visible pages
            .map((page) => {
              // Use 'route' instead of 'link' and fix the path extraction
              const routePath = page.route.replace("/admin/", "");

              return (
                <Route
                  key={page.route}
                  path={routePath}
                  element={page.component}
                />
              );
            })}

          {/* Fallback Route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
