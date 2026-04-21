import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { clearSession, getRole, getToken } from "../auth/session";
import { cn } from "../utils/twMerge";
import { useQuery } from "@apollo/client/react";
import { EXPERT_PROFILE, ME } from "../graphql/documents";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  role: string;
}

const NAV_ITEMS: NavItem[] = [  
  { to: "/", label: "Search", end: true, role: "BUSINESS" },
  { to: "/profile", label: "Expert Profile", role: "EXPERT" },
  { to: "/quotes", label: "Quotes", role: "EXPERT" },
  { to: "/quotes", label: "Quotes", role: "BUSINESS" },
  { to: "/engagements", label: "Engagements", role: "BUSINESS" },
  { to: "/engagements", label: "Engagements", role: "EXPERT" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrandMark() {
  return (
    <div className="relative grid place-items-center w-8 h-8 border border-slate-300 shrink-0">
      {/* inner glow fill */}
      <div className="absolute inset-[3px] bg-slate-200" />
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="relative z-10"
      >
        <path
          d="M2 12L7 2L12 12"
          stroke="#0ea5e9"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3.5 9H10.5" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function SessionBadge({ token, role }: { token: string | null; role: string | null }) {
  if (token) {
    return (
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] shrink-0" />
        {role && <span className="text-sky-700 font-medium">{role}</span>}
        <span>signed in</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      <span>not signed in</span>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "font-mono text-[10px] uppercase tracking-widest",
        "px-3.5 py-1.5 rounded-sm border border-slate-300",
        "text-slate-700 bg-white cursor-pointer",
        "transition-colors duration-150",
        "hover:border-sky-400 hover:text-sky-700 hover:bg-sky-100"
      )}
    >
      Logout
    </button>
  );
}

// ─── Hamburger ────────────────────────────────────────────────────────────────

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  const lineBase = "block w-[22px] h-px bg-slate-400 transition-all duration-200 origin-center";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="flex lg:hidden flex-col gap-[5px] p-1.5 ml-auto bg-transparent border-none cursor-pointer"
    >
      <span
        className={cn(lineBase, open && "translate-y-[6.5px] rotate-45 !bg-sky-600")}
      />
      <span className={cn(lineBase, open && "opacity-0")} />
      <span
        className={cn(lineBase, open && "-translate-y-[6.5px] -rotate-45 !bg-sky-600")}
      />
    </button>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();
  const role = getRole();
  const isExpert = role === "EXPERT" && !!token;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const userRole = getRole();

  const { data: meData } = useQuery<{ me: { id: string } }>(ME, {
    fetchPolicy: "cache-first",
    skip: !isExpert,
  });

  const userId = meData?.me?.id;

  const { data: expertProfileData, loading: expertProfileLoading, error: expertProfileError } =
    useQuery<{ expertProfile: unknown }>(EXPERT_PROFILE, {
      variables: { userId },
      fetchPolicy: "cache-first",
      skip: !isExpert || !userId,
    });

  const hasExpertProfile = !!expertProfileData?.expertProfile;

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.role !== userRole) return false;
    if (userRole !== "EXPERT") return true;
    if (item.to === "/profile") return true;

    // Until the expert profile exists (or if it fails to load), hide other routes from the nav.
    if (expertProfileLoading || expertProfileError) return false;
    return hasExpertProfile;
  });

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(15,23,42,0.02) 39px,rgba(15,23,42,0.02) 40px)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* ── Header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 h-16 ",
          "bg-white/95 backdrop-blur-md",
          "border-b border-slate-200 transition-all duration-200",
          scrolled && "shadow-sm border-b-slate-200"
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-6 grid grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_1fr_auto] items-center gap-8">

          {/* Brand */}
          <NavLink to="/" className="flex items-center gap-2.5 no-underline shrink-0">
            <BrandMark />
            <span
              className="text-xl font-bold tracking-wide text-slate-900 leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Fin<span className="text-sky-600">Hire</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden lg:flex justify-center">
            <ul className="flex items-center gap-0.5 list-none">
              {filteredNavItems.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "relative px-3 py-1.5 rounded-sm no-underline whitespace-nowrap",
                        "font-mono text-[11px] font-medium uppercase tracking-[0.1em]",
                        "transition-colors duration-150",
                        isActive
                          ? "text-sky-600 after:absolute after:bottom-[-1px] after:left-3 after:right-3 after:h-px after:bg-sky-600 after:opacity-70"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      )
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop session */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <SessionBadge token={token} role={role} />
            {token && <LogoutButton onClick={handleLogout} />}
          </div>

          {/* Mobile hamburger */}
          <Hamburger open={menuOpen} onClick={() => setMenuOpen((o) => !o)} />
        </div>

        {/* Accent ticker line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none opacity-35"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #38bdf8 20%, #60a5fa 50%, #a5b4fc 80%, transparent 100%)",
          }}
        />
      </header>

      {/* ── Mobile drawer ── */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 flex-col overflow-y-auto",
          "bg-white/97 backdrop-blur-xl",
          "border-t border-slate-200 px-6 pt-8 pb-10 gap-1",
          menuOpen ? "flex" : "hidden"
        )}
      >
        {filteredNavItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between no-underline",
                "font-mono text-[13px] uppercase tracking-[0.12em]",
                "px-4 py-3.5 border-b border-slate-200",
                "transition-all duration-150",
                isActive
                  ? "text-sky-600 pl-6"
                  : "text-slate-500 hover:text-sky-600 hover:pl-6"
              )
            }
          >
            {label}
            <span className="opacity-30 text-xs">→</span>
          </NavLink>
        ))}

        <div className="mt-6 flex flex-col gap-3">
          <SessionBadge token={token} role={role} />
          {token && <LogoutButton onClick={handleLogout} />}
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
