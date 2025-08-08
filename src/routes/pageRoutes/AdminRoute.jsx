import {
  HomeOutlined,
  KeyOutlined
} from "@ant-design/icons";
import { Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import * as PAGES from "../../pages/Admin";
import { useAdminAuthStore } from "../../store/hotelStore";
import { Auth } from "../ValidateAuth";

const AdminRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      link: "/admin",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <PAGES.Dashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      link: "crud",
      name: "CRUD",
      label: "CRUD",
      icon: <KeyOutlined className="h-5 w-5" />,
      component: <PAGES.HotelCRUDDashboard />,
      isFilter: true,
      isShow: true,
    },
  ];

  // ========== Render Routes ==========
  return (
    <Routes>
      {/* Protected Route Wrapper */}
      <Route
        element={<Auth store={useAdminAuthStore} redirect="/login" />}
      >
        {/* Main Layout Route */}
        <Route
          element={
            <BasicLayout
              navigations={navigations}
              store={useAdminAuthStore}
            />
          }
        >
          {/* Dynamic Route Generation */}
          {navigations
            .filter((page) => page.isShow) // Only create routes for visible pages
            .map((page) => (
              <Route
                key={`${page.link}`}
                path={page.link}
                element={page.component}
              />
            ))}

          {/* Fallback Route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoute;
