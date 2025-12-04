import { Suspense, lazy } from "react";
import { RouterProvider, createBrowserRouter, ScrollRestoration } from "react-router";
import LoadingFallback from "../components/LoadingFallback";

// Lazy load pages
const PalarotaryLandingPage = lazy(() =>
  import("../pages/Palarotary/LandingPage")
);
const GroundRules = lazy(() => import("../pages/Palarotary/GroundRules"));
const GeneralGuide = lazy(() => import("../pages/Palarotary/GeneralGuide"));
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
const Success = lazy(() => import("../pages/Palarotary/Success"));
const ClubPaymentProof = lazy(() =>
  import("../pages/Palarotary/ClubPaymentProof")
);
const PalarotaryAdminRoute = lazy(() =>
  import("./pageRoutes/PalarotaryAdminRoute")
);
const NotFound = lazy(() => import("../pages/Palarotary/NotFound"));

// Layout component with scroll restoration
const Layout = ({ children }) => (
  <>
    <ScrollRestoration />
    {children}
  </>
);

const RootRoutes = () => {
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <PalarotaryLandingPage />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/ground-rules",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <GroundRules />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/general-guide",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <GeneralGuide />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/register-club",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ClubRegistration />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/register-member",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <MemberRegistration />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/shirt-order",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ShirtValidation />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/order-shirt",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ShirtOrdering />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/order-confirmation",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <OrderConfirmation />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/payment/success",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <Success />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/club-payment-proof",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <ClubPaymentProof />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "/admin/*",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <PalarotaryAdminRoute />
            </Suspense>
          </Layout>
        ),
      },
      {
        path: "*",
        element: (
          <Layout>
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          </Layout>
        ),
      },
    ],
    {
      future: { v7_startTransition: true },
    }
  );

  return <RouterProvider router={router} />;
};

export default RootRoutes;
