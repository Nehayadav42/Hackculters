
import { useCallback } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

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
import Dashboard from "./pages/Dashboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function LandingPage() {
  const navigate = useNavigate();

  const archive = useArchiveSearch();
  const reducedMotion = usePrefersReducedMotion();
  const { jumpToGroup } = archive;

  const openBhopal = useCallback(
    (entryId = null) => {
      jumpToGroup(BHOPAL_GROUP, entryId);

      document
        .getElementById("walk")
        ?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
        });
    },
    [jumpToGroup, reducedMotion]
  );

  return (
    <>
      <DepthGauge />

      <main>
        <Header
          onAuthClick={() => navigate("/auth")}
        />

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#11120f] text-[#c7a96b]">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#11120f] text-[#c7a96b]">
        Loading HeritageVerse...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage
              onBack={() => navigate("/")}
              onAuthSuccess={() => navigate("/dashboard")}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
