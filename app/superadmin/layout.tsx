"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  founder?: boolean;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

/* ─────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────── */
const NAV_SECTIONS: NavSection[] = [
  {
    section: "PLATFORM",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/superadmin/platform/dashboard",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        id: "salon",
        label: "Salon & Spa",
        href: "/superadmin/platform/salons",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7h18v13H3z" />
            <path d="M8 7V5a4 4 0 0 1 8 0v2" />
          </svg>
        ),
      },
      {
        id: "subscriptions",
        label: "Subscriptions",
        href: "/superadmin/platform/subscriptions",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
      {
        id: "users",
        label: "Users",
        href: "/superadmin/platform/users",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        id: "regions",
        label: "Regions & Franchise",
        href: "/superadmin/platform/regions",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      {
        id: "commission",
        label: "Commission",
        href: "/superadmin/management/commission",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        ),
      },
      {
        id: "reports",
        label: "Reports",
        href: "/superadmin/management/reports",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
      },
      {
        id: "blogs",
        label: "Blogs",
        href: "/superadmin/management/form",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "ADVANCED",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        href: "/superadmin/advanced/notifications",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
      {
        id: "whitelabel",
        label: "White Label",
        href: "/superadmin/advanced/white-label",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
        ),
      },
      {
        id: "compliance",
        label: "Compliance",
        href: "/superadmin/advanced/compliance",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        id: "sysmonitor",
        label: "System Monitor",
        href: "/superadmin/advanced/system-monitor",
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
      },
      {
        id: "founder",
        label: "Founder Mode",
        href: "/superadmin/advanced/founder",
        founder: true,
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
    ],
  },
];

/* ─────────────────────────────────────────
   PAGE TITLES MAP
───────────────────────────────────────── */
const PAGE_TITLES: Record<string, string> = {
  "/superadmin/platform/dashboard":      "Global Dashboard",
  "/superadmin/platform/salons":         "Salon & Spa",
  "/superadmin/platform/subscriptions":  "Subscriptions",
  "/superadmin/platform/users":          "Users",
  "/superadmin/platform/regions":        "Regions & Franchise",
  "/superadmin/management/commission":   "Commission & Marketplace",
  "/superadmin/management/reports":      "Reports",
  "/superadmin/advanced/notifications":  "Notifications",
  "/superadmin/advanced/white-label":    "White Label",
  "/superadmin/advanced/compliance":     "Compliance",
  "/superadmin/advanced/system-monitor": "System Monitor",
  "/superadmin/advanced/founder":        "Founder Mode",
};

/* ─────────────────────────────────────────
   SIDEBAR INNER CONTENT (shared between
   desktop sidebar and mobile drawer)
───────────────────────────────────────── */
function SidebarContent({
  collapsed,
  onNavClick,
}: {
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string): boolean =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Nav sections ── */}
      {NAV_SECTIONS.map(({ section, items }) => (
        <div key={section}>
          {!collapsed ? (
            <p className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-[1.2px] uppercase text-[#5a4a35]">
              {section}
            </p>
          ) : (
            <div className="h-2" />
          )}

          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onClick={onNavClick}
                className={`
                  flex items-center relative whitespace-nowrap overflow-hidden
                  text-[13.5px] no-underline transition-colors duration-100
                  ${collapsed ? "justify-center py-2.5 px-0" : "gap-2.5 py-[9px] px-4"}
                  ${
                    item.founder
                      ? "text-[#e8b84b] font-medium hover:bg-[#2a1a06]"
                      : active
                        ? "text-white font-medium bg-[#2e1f05]"
                        : "text-[#c5b49a] font-normal hover:bg-[#2a1a06] hover:text-[#e8d5b8]"
                  }
                `}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {/* Active left indicator */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#c8922a] rounded-r-[2px]" />
                )}

                {/* Icon */}
                <span className={`flex-shrink-0 ${active ? "opacity-100" : "opacity-70"}`}>
                  {item.icon}
                </span>

                {/* Label */}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}

      {/* ── Footer ── */}
      <div className="mt-auto px-4 py-3.5 border-t border-[#2e2010]">
        {!collapsed ? (
          <>
            <p className="text-[11px] text-[#7a6a55] font-medium mb-0.5">Platform Status</p>
            <div className="flex items-center gap-1.5 text-[11.5px] text-[#a0906e]">
              <span className="w-[7px] h-[7px] rounded-full bg-[#27ae60] flex-shrink-0 inline-block" />
              All systems operational
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <span className="w-[7px] h-[7px] rounded-full bg-[#27ae60] inline-block" />
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   SIDEBAR (desktop only)
───────────────────────────────────────── */
function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={`
        hidden lg:flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden
        bg-[#1a1208] transition-all duration-200 ease-in-out
        ${collapsed ? "w-[60px] min-w-[60px]" : "w-[220px] min-w-[220px]"}
      `}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-[18px] border-b border-[#2e2010] overflow-hidden flex-shrink-0">
        <div className="w-[34px] h-[34px] flex items-center justify-center flex-shrink-0">
          <img
            src="/logo.png"
            alt="NexSalon Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {!collapsed && (
          <span
            className="text-[18px] font-semibold text-white whitespace-nowrap tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            NEX<span className="text-[#e8b84b]">SALON</span>
          </span>
        )}
      </div>

      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

/* ─────────────────────────────────────────
   MOBILE DRAWER
───────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-200
          lg:hidden
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Drawer panel */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col
          bg-[#1a1208] overflow-y-auto overflow-x-hidden
          transition-transform duration-200 ease-in-out
          lg:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo row with close button */}
        <div className="flex items-center gap-3 px-4 py-[18px] border-b border-[#2e2010] flex-shrink-0">
          <div className="w-[34px] h-[34px] flex items-center justify-center flex-shrink-0">
            <img
              src="/logo.png"
              alt="NexSalon Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span
            className="text-[18px] font-semibold text-white whitespace-nowrap tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            NEX<span className="text-[#e8b84b]">SALON</span>
          </span>
          {/* Close button */}
          <button
            onClick={onClose}
            className="ml-auto p-1 text-[#5a4a35] hover:text-[#c5b49a] transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
            aria-label="Close navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SidebarContent collapsed={false} onNavClick={onClose} />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   TOPBAR
───────────────────────────────────────── */
function Topbar({
  pageTitle,
  onMenuClick,
}: {
  pageTitle: string;
  onMenuClick: () => void;
}) {
  return (
    <header
      className="flex items-center gap-3.5 h-[60px] px-4 sm:px-6 bg-white border-b border-[#e8e0d4] flex-shrink-0"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="flex lg:hidden items-center justify-center w-9 h-9 rounded-lg border border-[#e8e0d4]
                   text-[#7a6a55] hover:border-[#c8922a] hover:text-[#c8922a] transition-colors
                   bg-transparent cursor-pointer flex-shrink-0"
        aria-label="Open navigation"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Page title */}
      <span
        className="text-base font-semibold text-[#1a1208] whitespace-nowrap truncate"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {pageTitle}
      </span>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Bell */}
        <Link
          href="/superadmin/advanced/notifications"
          className="w-9 h-9 flex items-center justify-center border border-[#e8e0d4] rounded-lg
                     bg-transparent cursor-pointer text-[#7a6a55] hover:border-[#c8922a] hover:text-[#c8922a] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────
   LAYOUT — default export
   Place at: app/superadmin/layout.tsx

   ⚠️  NO <html> or <body> tags here.
       Those belong in app/layout.tsx only.
───────────────────────────────────────── */
export default function SuperAdminLayout({
  children,
}: {
 children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
 const pageTitle =
  PAGE_TITLES[pathname as keyof typeof PAGE_TITLES] ??
  "Global Dashboard";

  /* Close drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#f7f4ef]">
      {/* DESKTOP SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* MOBILE DRAWER */}
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* TOPBAR */}
        <Topbar
          pageTitle={pageTitle}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* PAGE CONTENT — injected by page.tsx */}
        <main className="flex-1 overflow-y-auto bg-[#f7f4ef]">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}