import { HomeOutlined, KeyOutlined } from "@ant-design/icons";
import { Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import * as PAGES from "../../pages/Admin";
import Login from "../../pages/Admin/Login";
import { useAdminAuthStore } from "../../store/hotelStore";
import { Auth, UnAuth } from "../ValidateAuth";

const AdminRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      route: "/",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <PAGES.Dashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/crud",
      name: "CRUD",
      label: "CRUD",
      icon: <KeyOutlined className="h-5 w-5" />,
      component: <PAGES.HotelCRUDDashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/hanz",
      name: "Hanz",
      label: "Hanz",
      icon: <KeyOutlined className="h-5 w-5" />,
      component: <PAGES.HotelCRUDDashboard />,
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
      {/* <Route element={<Auth store={useAdminAuthStore} redirect="/admin" />}> */}
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
      </Route>
      {/* </Route> */}
    </Routes>
  );
};

export default AdminRoute;
