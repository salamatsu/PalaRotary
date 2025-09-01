import { RouterProvider, createBrowserRouter } from "react-router";
import LandingPage from "../pages/LandingPage";
import AdminRoute from "./pageRoutes/AdminRoute";
import ReceptionistRoute from "./pageRoutes/ReceptionistRoute";
import SuperAdminRoute from "./pageRoutes/SuperAdminRoute";
import WaterMonitoringDashboard from "../pages/WaterMonitoringDashboard";

const RootRoutes = () => {
  const router = createBrowserRouter([
    { path: "/", Component: LandingPage },
    { path: "/dam", Component: WaterMonitoringDashboard },
    { path: "/superadmin/*", Component: SuperAdminRoute },
    { path: "/admin/*", Component: AdminRoute },
    { path: "/receptionist/*", Component: ReceptionistRoute },
  ]);

  return <RouterProvider router={router} />;
};

export default RootRoutes;
