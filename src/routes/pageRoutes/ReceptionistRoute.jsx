import { HomeOutlined, KeyOutlined } from "@ant-design/icons";
import { Route, Routes, Navigate } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import * as RECEPTIONISTPAGES from "../../pages/Receptionist";
import Login from "../../pages/Receptionist/Login";
import { useReceptionistAuthStore } from "../../store/hotelStore";
import { Auth, UnAuth } from "../ValidateAuth";

const ReceptionistRoute = () => {
  // ========== Navigation Configuration ==========
  const navigations = [
    {
      route: "/dashboard",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: <RECEPTIONISTPAGES.Dashboard />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/room-booking",
      name: "Room Booking",
      label: "Room Booking",
      icon: <KeyOutlined className="h-5 w-5" />,
      component: <RECEPTIONISTPAGES.RoomBooking />,
      isFilter: true,
      isShow: true,
    },
    {
      route: "/bookings",
      name: "Bookings",
      label: "Bookings",
      icon: <KeyOutlined className="h-5 w-5" />,
      component: <RECEPTIONISTPAGES.Bookings />,
      isFilter: true,
      isShow: true,
    },
  ].map((page) => ({ ...page, route: "/receptionist" + page.route }));

  return (
    <Routes>
      <Route
        element={
          <UnAuth
            store={useReceptionistAuthStore}
            redirect="/receptionist/dashboard"
          />
        }
      >
        <Route path="/" index element={<Login />} />
      </Route>

      <Route
        element={
          <Auth store={useReceptionistAuthStore} redirect="/receptionist" />
        }
      >
        <Route
          element={
            <BasicLayout
              navigations={navigations}
              store={useReceptionistAuthStore}
            />
          }
        >
          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {navigations
            .filter((page) => page.isShow) // Only create routes for visible pages
            .map((page) => {
              // Use 'route' instead of 'link' and fix the path extraction
              const routePath = page.route.replace("/receptionist/", "");

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
      </Route>
    </Routes>
  );
};

export default ReceptionistRoute;
