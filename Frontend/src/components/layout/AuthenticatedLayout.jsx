import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";

const NAVIGATION = [
  { label: "Overview", to: "/dashboard", section: "overview", icon: "⌂" },
  { label: "Explore Heritage", to: "/monuments", section: "explore", icon: "◇" },
  { label: "Saved Discoveries", to: "/dashboard?section=saved", section: "saved", icon: "♡" },
  { label: "Manuscripts", to: "/dashboard?section=manuscripts", section: "manuscripts", icon: "▤" },
  { label: "Contributions", to: "/dashboard?section=contributions", section: "contributions", icon: "✧" },
  { label: "Archive Search", to: "/archive/search", section: "search", icon: "⌕" },
  { label: "Heritage Map", to: "/map", section: "map", icon: "⌖" },
  { label: "3D Explorer", to: "/explorer", section: "3d", icon: "◈" },
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

function Sidebar({ active, user, onLogout, onClose }) {
  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Explorer";

  return (
    <aside className="flex h-full w-full flex-col bg-[#142b25] text-[#eee9dd]">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-7">
        <div className="grid h-10 w-9 shrink-0 place-items-center border border-[#c49a58] font-serif text-2xl text-[#c49a58]">
          H
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-xl tracking-tight">
            Heritage<span className="text-[#c49a58]">Verse</span>
          </h1>
          <p className="mt-1 text-[9px] tracking-[0.2em] text-white/40">
            DIGITAL HERITAGE ARCHIVE
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-xl text-white/60 lg:hidden"
            aria-label="Close menu"
          >
            ×
          </button>
        )}
      </div>

      <nav aria-label="Workspace" className="flex flex-col gap-1 px-5 pt-8">
        <p className="mb-3 px-3 text-[9px] font-semibold tracking-[0.2em] text-white/35">
          WORKSPACE
        </p>
        {NAVIGATION.map((item) => (
          <NavLink
            key={item.section}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onClose}
            className={() =>
              active === item.section
                ? "flex items-center gap-3 rounded-lg bg-[#c49a58]/15 px-3 py-3 text-left text-sm text-[#e4c58d] transition"
                : "flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            }
          >
            <span className="w-5 text-center text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {active === item.section && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c49a58]" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-white/10 p-5">
        <Link
          to="/dashboard?section=profile"
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/5"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#c49a58]/20 font-serif text-lg text-[#e4c58d]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-[10px] text-white/40">{user?.email}</p>
          </div>
          <span className="text-white/40">›</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-xs text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <span className="text-base">↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const active = getActiveSection(location.pathname, location.search);
  const pageTitle =
    NAVIGATION.find((item) => item.section === active)?.label ||
    (active === "profile" ? "My Profile" : "Overview");

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
    <div className="dashboard-layout min-h-screen bg-[#f5f2e9] text-[#263b30] lg:flex">
      <div className="hidden w-[270px] shrink-0 lg:block">
        <div className="fixed inset-y-0 w-[270px]">
          <Sidebar active={active} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative h-full w-[290px] max-w-[85vw]">
            <Sidebar
              active={active}
              user={user}
              onLogout={handleLogout}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-[#e5dfd1] bg-[#f5f2e9]/95 px-4 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1dacb] text-lg lg:hidden"
              aria-label="Open navigation"
            >
              ☰
            </button>
            <div>
              <p className="text-[9px] font-semibold tracking-[0.2em] text-[#a17b43]">
                HERITAGEVERSE WORKSPACE
              </p>
              <h2 className="mt-1 text-sm font-semibold text-[#263b30]">
                {pageTitle}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#898779] sm:block">
              {user?.email}
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-full border border-[#c9b88f] bg-[#eee7d8] font-serif text-lg text-[#98713e]">
              {(user?.user_metadata?.display_name ||
                user?.user_metadata?.full_name ||
                user?.email ||
                "E")
                .charAt(0)
                .toUpperCase()}
            </div>
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

        <footer className="border-t border-[#e5dfd1] px-4 py-5 text-center text-[10px] tracking-wide text-[#999383] sm:px-8">
          HERITAGEVERSE · PRESERVING OUR PAST, INSPIRING OUR FUTURE
        </footer>
      </div>

      {loggingOut && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-[#fffdf7] px-7 py-5 text-sm text-[#263b30] shadow-xl">
            Signing out...
          </div>
        </div>
      )}
    </div>
  );
}
