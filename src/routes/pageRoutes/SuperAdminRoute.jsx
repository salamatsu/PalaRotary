import { Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import Dashboard from "../../pages/SuperAdmin/Dashboard";
import { useSuperAdminAuthStore } from "../../store/hotelStore";
import { Auth } from "../ValidateAuth";

const SuperAdminRoute = () => {
  return (
    <Routes>
      <Route element={<Auth store={useSuperAdminAuthStore} redirect="/" />}>
        <Route
          element={
            <BasicLayout navigations={[]} store={useSuperAdminAuthStore} />
          }
        >
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SuperAdminRoute;
