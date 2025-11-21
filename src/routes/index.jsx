import { Suspense, lazy } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";
import LoadingFallback from "../components/LoadingFallback";

// Lazy load pages
const PalarotaryLandingPage = lazy(() =>
  import("../pages/Palarotary/LandingPage")
);
const ClubRegistration = lazy(() =>
  import("../pages/Palarotary/ClubRegistration")
);
const MemberRegistration = lazy(() =>
  import("../pages/Palarotary/MemberRegistration")
);
const ShirtValidation = lazy(() =>
  import("../pages/Palarotary/ShirtValidation")
);
const ShirtOrdering = lazy(() => import("../pages/Palarotary/ShirtOrdering"));
const OrderConfirmation = lazy(() =>
  import("../pages/Palarotary/OrderConfirmation")
);
const PalarotaryAdminRoute = lazy(() =>
  import("./pageRoutes/PalarotaryAdminRoute")
);

const RootRoutes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <PalarotaryLandingPage />
        </Suspense>
      ),
    },
    {
      path: "/register-club",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ClubRegistration />
        </Suspense>
      ),
    },
    {
      path: "/register-member",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <MemberRegistration />
        </Suspense>
      ),
    },
    {
      path: "/shirt-order",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ShirtValidation />
        </Suspense>
      ),
    },
    {
      path: "/order-shirt",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <ShirtOrdering />
        </Suspense>
      ),
    },
    {
      path: "/order-confirmation",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <OrderConfirmation />
        </Suspense>
      ),
    },
    {
      path: "/admin/*",
      element: (
        <Suspense fallback={<LoadingFallback />}>
          <PalarotaryAdminRoute />
        </Suspense>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RootRoutes;
