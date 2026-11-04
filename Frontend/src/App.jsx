
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";

import { useAuth } from "./context/useAuth.js";

import DepthGauge from "./components/layout/DepthGauge.jsx";
import Footer from "./components/layout/Footer.jsx";
import Header from "./components/layout/Header.jsx";
import Hero from "./components/sections/Hero.jsx";
import ArchiveSearch from "./components/sections/ArchiveSearch.jsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout.jsx";

import { useArchiveSearch } from "./hooks/useArchiveSearch.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";
import { navigateBack, trackPageVisit } from "./utils/navigation.js";

import { BHOPAL_ENTRIES } from "./data/entries.js";
import { BHOPAL_GROUP } from "./data/bhopal.js";

// Lazy-loaded pages
const AuthPage = lazy(() => import("./pages/AuthPage.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const MonumentsPage = lazy(() => import("./pages/MonumentsPage.jsx"));
const MonumentDetailPage = lazy(
  () => import("./pages/MonumentDetailPage.jsx")
);
const ArchiveSearchPage = lazy(
  () => import("./pages/ArchiveSearchPage.jsx")
);
const HeritageMapPage = lazy(
  () => import("./pages/HeritageMapPage.jsx")
);

// Lazy-loaded 3D viewer
const Stepwell3D = lazy(
  () => import("./components/sections/Stepwell3D.jsx")
);

function StepwellFallback() {
  return (
    <div className="flex min-h-[300px] items-center justify-center bg-[#1a2c3b] text-[#bf6548]">
      Loading 3D Heritage Experience...
    </div>
  );
}

function LazyStepwell3D({ eager = false }) {
  const containerRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (eager) {
      return undefined;
    }

    const container = containerRef.current;

    if (!container || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "600px 0px",
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [eager, shouldLoad]);

  return (
    <div
      ref={containerRef}
      id="see"
      className="min-h-screen bg-[#1a2c3b]"
    >
      {shouldLoad ? (
        <Suspense fallback={<StepwellFallback />}>
          <Stepwell3D />
        </Suspense>
      ) : (
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <p className="text-sm tracking-wide text-[#bf6548]">
            The interactive 3D heritage experience will load here.
          </p>
        </div>
      )}
    </div>
  );
}

function PublicLandingPage() {
  const navigate = useNavigate();
  const archive = useArchiveSearch();
  const reducedMotion = usePrefersReducedMotion();
  const { jumpToGroup } = archive;

  const openBhopal = useCallback(
    (entryId = null) => {
      jumpToGroup(BHOPAL_GROUP, entryId);

      document.getElementById("walk")?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [jumpToGroup, reducedMotion]
  );

  return (
    <>
      <DepthGauge />

      <main className="landing-main">
        <Header onAuthClick={() => navigate("/auth")} />

        <Hero
          bhopalEntries={BHOPAL_ENTRIES}
          onOpenBhopal={openBhopal}
        />

        <ArchiveSearch archive={archive} />
        <LazyStepwell3D />
        <Footer />
      </main>
    </>
  );
}

function LandingRoute() {
  const { user } = useAuth();

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <PublicLandingPage />
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();

  const { user, loading, logoutInProgress, finishSignOut } = useAuth();

  useEffect(() => {
    trackPageVisit(
      location.pathname,
      `${location.pathname}${location.search}${location.hash}`,
      navigationType
    );
  }, [location.pathname, location.search, location.hash, navigationType]);

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/" && logoutInProgress) {
      finishSignOut();
    }
  }, [location.pathname, logoutInProgress, finishSignOut]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1822] text-[#e1a080]">
        Loading HeritageVerse...
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0f1822] text-[#e1a080]">
          Loading HeritageVerse...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingRoute />} />

        <Route
          path="/auth"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage
                onBack={() => navigateBack(navigate, "/")}
                onAuthSuccess={() => {
                  const destination = location.state?.from;

                  navigate(
                    destination
                      ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
                      : "/dashboard",
                    { replace: true }
                  );
                }}
              />
            )
          }
        />

        <Route element={<AuthenticatedLayout />}>
          <Route path="/monuments" element={<MonumentsPage />} />
          <Route path="/monuments/:id" element={<MonumentDetailPage />} />
          <Route path="/archive/search" element={<ArchiveSearchPage />} />
          <Route path="/map" element={<HeritageMapPage />} />
          <Route
            path="/explorer"
            element={
              <main className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-[#bf6548]">
                    INTERACTIVE ARCHITECTURE
                  </p>
                  <h1 className="mt-2 font-serif text-3xl text-[#1a2c3b]">
                    3D Heritage Explorer
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66727d]">
                    Explore architectural interpretations based on available
                    site records. These are not surveyed or photogrammetric
                    models.
                  </p>
                </div>
                <LazyStepwell3D eager />
              </main>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
