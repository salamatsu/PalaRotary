import { RouterProvider, createBrowserRouter } from "react-router";
import { Dashboard } from "../pages/Receptionist";
import AdminRoute from "./pageRoutes/AdminRoute";
import ReceptionistRoute from "./pageRoutes/ReceptionistRoute";
import SuperAdminRoute from "./pageRoutes/SuperAdminRoute";

const RootRoutes = () => {
  const router = createBrowserRouter([
    { path: "/dashboard", Component: Dashboard },
    { path: "/superadmin/*", Component: SuperAdminRoute },
    { path: "/admin/*", Component: AdminRoute },
    { path: "/receptionist/*", Component: ReceptionistRoute },
  ]);

  return <RouterProvider router={router} />;
};

export default RootRoutes;
