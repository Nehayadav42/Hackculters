import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import BackButton from "./BackButton.jsx";

const PUBLIC_NAVIGATION = [
  { label: "Explore Heritage", to: "/monuments", section: "explore", icon: "◇" },
  { label: "Archive Search", to: "/archive/search", section: "search", icon: "⌕" },
  { label: "Heritage Map", to: "/map", section: "map", icon: "⌖" },
  { label: "3D Explorer", to: "/explorer", section: "3d", icon: "◈" },
];

const ACCOUNT_NAVIGATION = [
  { label: "Overview", to: "/dashboard", section: "overview", icon: "⌂" },
  { label: "Saved Discoveries", to: "/dashboard?section=saved", section: "saved", icon: "♡" },
  { label: "Manuscript OCR", to: "/dashboard?section=manuscripts", section: "manuscripts", icon: "▤" },
  { label: "Contributions", to: "/dashboard?section=contributions", section: "contributions", icon: "✧" },
];

function getActiveSection(pathname, search) {
  if (pathname === "/monuments" || pathname.startsWith("/monuments/")) {
    return "explore";
  }
  if (pathname === "/archive/search") return "search";
  if (pathname === "/map") return "map";
  if (pathname === "/explorer") return "3d";
  if (pathname === "/dashboard") {
    const section = new URLSearchParams(search).get("section");
    return [
      "overview",
      "saved",
      "manuscripts",
      "contributions",
      "profile",
    ].includes(section)
      ? section
      : "overview";
  }
  return "overview";
}

function Sidebar({
  active,
  collapsed,
  user,
  onLogout,
  onClose,
}) {
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";
  const navigation = user
    ? [...ACCOUNT_NAVIGATION.slice(0, 1), ...PUBLIC_NAVIGATION, ...ACCOUNT_NAVIGATION.slice(1)]
    : PUBLIC_NAVIGATION;

  return (
    <aside className="app-sidebar flex h-full max-h-[100dvh] w-full flex-col overflow-y-auto overscroll-contain bg-[#1a2c3b] text-[#f3f5f6]">
      <div
        className={`flex shrink-0 items-center border-b border-white/10 py-5 ${
          collapsed ? "justify-center px-2" : "gap-3 px-5 sm:px-6"
        }`}
      >
        <Link
          to={user ? "/dashboard" : "/monuments"}
          onClick={onClose}
          aria-label="HeritageVerse home"
          className="grid h-10 w-9 shrink-0 place-items-center border border-[#bf6548] font-serif text-2xl text-[#e1a080]"
        >
          H
        </Link>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-serif text-xl tracking-tight">
              Heritage<span className="text-[#e1a080]">Verse</span>
            </h1>
            <p className="mt-1 text-[10px] font-medium tracking-[0.14em] text-white/75">
              DIGITAL HERITAGE ARCHIVE
            </p>
          </div>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto grid h-10 w-10 place-items-center rounded-lg text-2xl text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            ×
          </button>
        )}
      </div>

      <nav
        aria-label="HeritageVerse"
        className={`flex flex-col gap-1 py-5 sm:py-7 ${
          collapsed ? "items-center px-2" : "px-4 sm:px-5"
        }`}
      >
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-white/75">
            {user ? "WORKSPACE" : "DISCOVER"}
          </p>
        )}
        {navigation.map((item) => (
          <NavLink
            key={item.section}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onClose}
            title={collapsed ? item.label : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={() =>
              `flex min-h-11 items-center rounded-lg text-left text-sm transition ${
                collapsed ? "w-12 justify-center px-2" : "gap-3 px-3 py-3"
              } ${
                active === item.section
                  ? "bg-[#bf6548]/20 text-[#f0b395]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="w-5 shrink-0 text-center text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && active === item.section && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e1a080]" />
            )}
          </NavLink>
        ))}
      </nav>

      <div
        className={`app-sidebar-footer sticky bottom-0 z-10 mt-auto shrink-0 border-t border-white/15 bg-[#1a2c3b] ${
          collapsed ? "p-2" : "p-4 sm:p-5"
        }`}
      >
        {user ? (
          <>
            <Link
              to="/dashboard?section=profile"
              onClick={onClose}
              title={collapsed ? displayName : undefined}
              className={`flex min-h-11 items-center rounded-lg text-left transition hover:bg-white/5 ${
                collapsed ? "justify-center" : "gap-3 p-2"
              }`}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#bf6548]/20 font-serif text-lg text-[#f0b395]">
                {displayName.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    <p className="truncate text-xs text-white/75">{user.email}</p>
                  </div>
                  <span className="text-white/75">›</span>
                </>
              )}
            </Link>
            <button
              type="button"
              onClick={onLogout}
              title={collapsed ? "Sign out" : undefined}
              className={`mt-3 flex min-h-11 w-full items-center rounded-lg border border-white/15 text-sm font-medium text-white/85 transition hover:border-white/30 hover:bg-white/10 hover:text-white ${
                collapsed ? "justify-center" : "gap-3 px-3 py-3"
              }`}
            >
              <span className="text-base">↪</span>
              {!collapsed && "Sign out"}
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            onClick={onClose}
            title={collapsed ? "Sign in" : undefined}
            className={`flex min-h-11 items-center rounded-lg bg-[#bf6548] text-sm font-semibold text-white transition hover:bg-[#a95037] ${
              collapsed ? "justify-center" : "justify-center gap-2 px-3"
            }`}
          >
            <span aria-hidden="true">↗</span>
            {!collapsed && "Sign in to contribute"}
          </Link>
        )}
      </div>
    </aside>
  );
}

export default function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const active = getActiveSection(location.pathname, location.search);
  const navigation = user
    ? [...ACCOUNT_NAVIGATION, ...PUBLIC_NAVIGATION]
    : PUBLIC_NAVIGATION;
  const pageTitle =
    navigation.find((item) => item.section === active)?.label ||
    (active === "profile" ? "My Profile" : "Overview");
  const showBack = location.pathname !== "/dashboard";

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "Unable to sign out."
      );
      setLoggingOut(false);
    }
  }

  return (
    <div className="dashboard-layout min-h-screen bg-[#f3f5f6] text-[#182531] lg:flex">
      <div
        className={`hidden shrink-0 transition-[width] duration-300 lg:block ${
          sidebarCollapsed ? "w-[76px]" : "w-[270px]"
        }`}
      >
        <div
          className={`fixed inset-y-0 h-dvh transition-[width] duration-300 ${
            sidebarCollapsed ? "w-[76px]" : "w-[270px]"
          }`}
        >
          <Sidebar
            active={active}
            collapsed={sidebarCollapsed}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="HeritageVerse navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <div className="relative h-dvh max-h-dvh w-[300px] max-w-[88vw]">
            <Sidebar
              active={active}
              collapsed={false}
              user={user}
              onLogout={handleLogout}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="workspace-header sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-[#d7dfe4] bg-[#f3f5f6]/95 px-4 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#cbd4da] bg-white/70 text-lg text-[#182531] transition hover:bg-white lg:hidden"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className="hidden h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#cbd4da] bg-white/70 text-lg text-[#182531] transition hover:bg-white lg:grid"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-[#a95037]">
                {user ? "HERITAGEVERSE WORKSPACE" : "HERITAGEVERSE ARCHIVE"}
              </p>
              <h2 className="mt-0.5 truncate text-base font-semibold leading-tight text-[#182531]">
                {pageTitle}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {showBack && (
              <BackButton
                fallback={
                  user
                    ? "/dashboard"
                    : location.pathname.startsWith("/monuments/")
                      ? "/monuments"
                      : "/"
                }
                className="rounded-full border border-[#cbd4da] bg-white/70 px-4 py-2 text-sm font-medium text-[#344656] transition hover:border-[#bf6548] hover:text-[#a95037]"
              />
            )}
            {user && (
              <>
                <span className="hidden max-w-[24vw] truncate text-xs text-[#66727d] sm:block">
                  {user.email}
                </span>
                <div className="grid h-9 w-9 place-items-center rounded-full border border-[#cbd4da] bg-[#e7ecef] font-serif text-lg text-[#a95037]">
                  {(user.user_metadata?.display_name ||
                    user.user_metadata?.full_name ||
                    user.email ||
                    "E")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-8 sm:py-9 lg:px-10">
          {logoutError && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              Sign out failed: {logoutError}
            </div>
          )}
          <Outlet />
        </main>

        <footer className="border-t border-[#d7dfe4] px-4 py-5 text-center text-[10px] tracking-wide text-[#66727d] sm:px-8">
          HERITAGEVERSE · PRESERVING OUR PAST, INSPIRING OUR FUTURE
        </footer>
      </div>

      {loggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-[#f8f9fa] px-7 py-5 text-sm text-[#182531] shadow-xl">
            Signing out...
          </div>
        </div>
      )}
    </div>
  );
}
