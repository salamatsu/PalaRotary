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
