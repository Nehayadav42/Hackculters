
import { useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./context/useAuth.js";

import DepthGauge from "./components/layout/DepthGauge.jsx";
import Header from "./components/layout/Header.jsx";
import Hero from "./components/sections/Hero.jsx";
import ArchiveSearch from "./components/sections/ArchiveSearch.jsx";
import Manuscripts from "./components/sections/Manuscripts.jsx";
import Stepwell3D from "./components/sections/Stepwell3D.jsx";
import Architecture from "./components/sections/Architecture.jsx";

import { useArchiveSearch } from "./hooks/useArchiveSearch.js";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion.js";

import { BHOPAL_ENTRIES } from "./data/entries.js";
import { BHOPAL_GROUP } from "./data/bhopal.js";

import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MonumentsPage from "./pages/MonumentsPage.jsx";
import MonumentDetailPage from "./pages/MonumentDetailPage.jsx";
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout.jsx";
import ArchiveSearchPage from "./pages/ArchiveSearchPage.jsx";
import HeritageMapPage from "./pages/HeritageMapPage.jsx";

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
        <Manuscripts />
        <Stepwell3D />
        <Architecture />
      </main>
    </>
  );
}

function LandingRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : <PublicLandingPage />;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.search]);

  return null;
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logoutInProgress, finishSignOut } = useAuth();

  useEffect(() => {
    if (location.pathname === "/" && logoutInProgress) {
      finishSignOut();
    }
  }, [location.pathname, logoutInProgress, finishSignOut]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#11120f] text-[#c7a96b]">
        Loading HeritageVerse...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />

      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage
              onBack={() => navigate("/")}
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

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monuments" element={<MonumentsPage />} />
          <Route path="/monuments/:id" element={<MonumentDetailPage />} />
          <Route path="/archive/search" element={<ArchiveSearchPage />} />
          <Route path="/map" element={<HeritageMapPage />} />
          <Route
            path="/explorer"
            element={
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-[#a17b43]">
                    ILLUSTRATIVE ARCHITECTURE
                  </p>
                  <h1 className="mt-2 font-serif text-3xl text-[#183b32]">
                    3D Heritage Explorer
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5e655d]">
                    Explore procedural architectural visualizations. These
                    models are not photogrammetric scans or verified digital
                    twins.
                  </p>
                </div>
                <Stepwell3D />
              </div>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
