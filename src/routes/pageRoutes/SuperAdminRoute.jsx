import { HomeOutlined, KeyOutlined } from "@ant-design/icons";
import { Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import * as PAGES from "../../pages/SuperAdmin";
import {
  useAdminAuthStore,
  useSuperAdminAuthStore,
} from "../../store/hotelStore";
import { Auth, UnAuth } from "../ValidateAuth";
import Login from "../../pages/SuperAdmin/Login";
import SuperAdminCMS from "../../pages/SuperAdmin/SuperAdminCMS";

const SuperAdminRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      route: "/dashboard",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <SuperAdminCMS />,
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

        {/* Fallback Route */}
        <Route path="*" element={<div>Page Not Found</div>} />
        {/* <Route
          element={
            <BasicLayout navigations={navigations} store={useAdminAuthStore} />
          }
        >
        </Route> */}
      </Route>
    </Routes>
  );
};

export default SuperAdminRoute;
