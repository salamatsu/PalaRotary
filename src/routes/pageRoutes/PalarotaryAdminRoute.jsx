import {
  HomeOutlined,
  ScanOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import BasicLayout from "../../components/layout/BasicLayout";
import { ComponentLoader } from "../../components/LoadingFallback";
import {
  AdminClubs,
  AdminDashboard,
  AdminMembers,
  Scanner,
} from "../../pages/Palarotary";
import { useAdminAuthStore } from "../../store/useAdminAuthStore";
import { Auth, UnAuth } from "../ValidateAuth";

const AdminLogin = lazy(() => import("../../pages/Palarotary/AdminLogin"));
const AdminTransactions = lazy(() =>
  import("../../pages/Palarotary/AdminTransactions")
);
const AdminMerchandise = lazy(() =>
  import("../../pages/Palarotary/AdminMerchandise")
);

const PalarotaryAdminRoute = () => {
  const navigations = [
    {
      route: "/dashboard",
      name: "Dashboard",
      label: "Dashboard",
      icon: <HomeOutlined className="h-5 w-5" />,
      component: (
        <Suspense fallback={<ComponentLoader />}>
          <AdminDashboard />
        </Suspense>
      ),
      isFilter: true,
      isShow: true,
    },
    {
      route: "/clubs",
      name: "clubs",
      label: "Club Registrations",
      icon: <BankOutlined className="h-5 w-5" />,
      component: (
        <Suspense fallback={<ComponentLoader />}>
          <AdminTransactions />
        </Suspense>
      ),
      isFilter: true,
      isShow: true,
    },
    {
      route: "/merchandise",
      name: "merchandise",
      label: "Merchandise",
      icon: <ScanOutlined className="h-5 w-5" />,
      component: (
        <Suspense fallback={<ComponentLoader />}>
          <AdminMerchandise />
        </Suspense>
      ),
      isFilter: true,
      isShow: true,
    },
  ].map((page) => ({ ...page, route: "/admin" + page.route }));

  return (
    <Routes>
      {/* Login Route - not authenticated */}
      <Route
        element={
          <UnAuth store={useAdminAuthStore} redirect="/admin/dashboard" />
        }
      >
        <Route
          path="/"
          index
          element={
            <Suspense fallback={<ComponentLoader />}>
              <AdminLogin />
            </Suspense>
          }
        />
      </Route>

      {/* Protected Routes - authenticated only */}
      <Route element={<Auth store={useAdminAuthStore} redirect="/admin" />}>
        {/* Main Layout Route */}
        <Route
          element={
            <BasicLayout navigations={navigations} store={useAdminAuthStore} />
          }
        >
          {navigations
            .filter((page) => page.isShow)
            .map((page) => {
              const routePath = page.route.replace("/admin/", "");
              return (
                <Route
                  key={page.route}
                  path={routePath}
                  element={page.component}
                />
              );
            })}

          {/* Default redirect to dashboard */}
          <Route
            path="*"
            element={<Navigate to="/admin/dashboard" replace />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default PalarotaryAdminRoute;
