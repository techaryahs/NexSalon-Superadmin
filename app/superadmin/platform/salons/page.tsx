"use client";

import { useState, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   TYPES
───────────────────────────────────────── */
type Status       = "Active" | "Pending" | "Suspended";
type Plan         = "Enterprise" | "Pro" | "Starter" | "Trial" | "None";
type Filter       = "All" | Status;
type BusinessType = "Salon" | "Spa";

interface Salon {
  id:             number;
  firebaseId:     string;
  name:           string;
  owner:          string;
  city:           string;
  plan:           Plan;
  branches:       number;
  activeBranches: number;
  revenue:        string;          // formatted by frontend
  rating:         number | null;
  status:         Status;
  type:           BusinessType;
}

interface Summary {
  total:     number;
  active:    number;
  pending:   number;
  suspended: number;
}

const ITEMS_PER_PAGE = 10; // matches backend default

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function normalizePlan(raw = ""): Plan {
  const p = raw.toLowerCase();
  if (p.includes("enterprise"))                          return "Enterprise";
  if (p.includes("premium") || p.includes("pro"))       return "Pro";
  if (p.includes("standard") || p.includes("starter"))  return "Starter";
  if (p.includes("trial"))                               return "Trial";
  return "None";
}

function normalizeStatus(raw = ""): Status {
  const s = raw.toLowerCase();
  if (s === "active")                          return "Active";
  if (s === "suspended" || s === "cancelled")  return "Suspended";
  return "Pending";
}

/* ─────────────────────────────────────────
   STYLING MAPS
───────────────────────────────────────── */
const planColors: Record<Plan, string> = {
  Enterprise: "bg-[#fdf3e0] text-[#c8922a] border-[#f0d9b0]",
  Pro:        "bg-[#fdf3e0] text-[#c8922a] border-[#f0d9b0]",
  Starter:    "bg-[#fdf3e0] text-[#c8922a] border-[#f0d9b0]",
  Trial:      "bg-[#eaf7f0] text-[#27ae60] border-[#c3ecd4]",
  None:       "bg-[#f5f5f5] text-[#999]   border-[#e0e0e0]",
};

const statusStyles: Record<Status, string> = {
  Active:    "bg-[#eaf7f0] text-[#27ae60] border-[#c3ecd4]",
  Pending:   "bg-[#fdf3e0] text-[#c8922a] border-[#f0d9b0]",
  Suspended: "bg-[#fdecea] text-[#c0392b] border-[#f5c6c2]",
};

const statusCountColors: Record<Status, string> = {
  Active:    "text-[#27ae60]",
  Pending:   "text-[#c8922a]",
  Suspended: "text-[#c0392b]",
};

/* ─────────────────────────────────────────
   ICON COMPONENTS
───────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function BanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#c8922a" stroke="#c8922a" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   MODAL
───────────────────────────────────────── */
function Modal({ salon, onClose }: { salon: Salon; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#e8e0d4]">
          <div>
            <h2 className="text-lg font-semibold text-[#1a1208]">{salon.name}</h2>
            <p className="text-xs text-[#7a6a55] mt-0.5">{salon.type} · {salon.city}</p>
          </div>
          <button onClick={onClose} className="text-[#7a6a55] hover:text-[#1a1208] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-3 text-sm">
          {[
            ["Owner",           salon.owner],
            ["City",            salon.city],
            ["Business Type",   salon.type],
            ["Plan",            salon.plan],
            ["Total Branches",  String(salon.branches)],
            ["Active Branches", String(salon.activeBranches)],
            ["Revenue",         salon.revenue],
            ["Rating",          salon.rating !== null ? `${salon.rating} ★` : "N/A"],
            ["Status",          salon.status],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-[#f5f0ea] pb-2 last:border-0">
              <span className="text-[#7a6a55]">{k}</span>
              <span className="font-medium text-[#1a1208]">{v}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-[#c8922a] hover:bg-[#b07d20] text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGINATION COMPONENT
───────────────────────────────────────── */
function Pagination({
  page,
  totalPages,
  total,
  perPage,
  onPage,
}: {
  page:       number;
  totalPages: number;
  total:      number;
  perPage:    number;
  onPage:     (p: number) => void;
}) {
  /* Build visible page numbers with ellipsis */
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3)            pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const start = Math.min((page - 1) * perPage + 1, total);
  const end   = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#e8e0d4]">
      <p className="text-[13px] text-[#7a6a55]">
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total} entries`}
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#7a6a55]
            hover:bg-[#f0ebe3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-[#b0a090] text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors
                ${page === p
                  ? "bg-[#c8922a] text-white"
                  : "text-[#7a6a55] hover:bg-[#f0ebe3]"
                }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#7a6a55]
            hover:bg-[#f0ebe3] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function SalonsPage() {
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState<Filter>("All");
  const [typeFilter, setTypeFilter] = useState<BusinessType | null>(null);
  const [page,       setPage]       = useState(1);

  // Data from server
  const [salons,     setSalons]     = useState<Salon[]>([]);
  const [summary,    setSummary]    = useState<Summary>({ total: 0, active: 0, pending: 0, suspended: 0 });
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [viewSalon,  setViewSalon]  = useState<Salon | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  /* ── Fetch from API with pagination ── */
  const fetchSalons = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(
        `http://localhost:3001/api/salon/salons?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      // Handle both { salons: [...] } and plain array responses
      const raw: any[] = Array.isArray(data) ? data : (data.salons ?? []);

      const mapped: Salon[] = raw.map((item: any, idx: number) => ({
        id:             item.id         ?? idx + 1,
        firebaseId:     item.firebaseId ?? String(idx),
        name:           item.name       || item.branch    || "Unnamed",
        owner:          item.owner      || item.ownerName || "Unknown",
        city:           item.city       || item.address   || "—",
        plan:           normalizePlan(item.plan ?? item.planName ?? ""),
        branches:       Number(item.branches       ?? item.branchCount ?? 0),
        activeBranches: Number(item.activeBranches ?? 0),
        // revenue may come as raw number or pre-formatted string
        revenue:
          item.revenue != null
            ? typeof item.revenue === "number"
              ? formatINR(item.revenue)
              : String(item.revenue)
            : "₹0",
        rating: item.rating != null ? Number(item.rating) : null,
        status: normalizeStatus(item.status ?? item.subscriptionStatus ?? ""),
        type:   item.type?.toLowerCase() === "spa" ? "Spa" : "Salon",
      }));

      setSalons(mapped);

      // Use server-provided summary if available, else compute from full list
      if (data.summary) {
        setSummary(data.summary);
      }
      setTotal(data.total ?? mapped.length);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: any) {
      console.error("Error fetching salons:", err);
      setError(err.message || "Failed to load salons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons(page);
  }, [page, fetchSalons]);

  /* ── Client-side filtering (on current page data) ── */
  const filtered = salons.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "All" || s.status === filter;
    const matchType   = !typeFilter || s.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  /* ── Handlers ── */
  const handleFilterChange = (f: Filter) => { setFilter(f); setPage(1); };
  const handleSearch       = (val: string) => { setSearch(val); setPage(1); };
  const handleTypeFilter   = (t: BusinessType) => {
    setTypeFilter((prev) => (prev === t ? null : t));
    setPage(1);
  };

  /* ── Optimistic status updates ── */
  const handleReactivate = async (salon: Salon) => {
    setSalons((prev) =>
      prev.map((s) => (s.id === salon.id ? { ...s, status: "Active" } : s))
    );
    try {
      await fetch(
        `http://localhost:3001/api/salon/salons/${salon.firebaseId}/status`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "active" }) }
      );
    } catch {
      // revert on failure
      fetchSalons(page);
    }
  };

  const handleSuspend = async (salon: Salon) => {
    const newStatus: Status = salon.status === "Suspended" ? "Active" : "Suspended";
    setSalons((prev) =>
      prev.map((s) => (s.id === salon.id ? { ...s, status: newStatus } : s))
    );
    try {
      await fetch(
        `http://localhost:3001/api/salon/salons/${salon.firebaseId}/status`,
        {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ status: newStatus.toLowerCase() }),
        }
      );
    } catch {
      fetchSalons(page);
    }
  };

  const FILTERS: Filter[] = ["All", "Active", "Pending", "Suspended"];

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="font-['DM_Sans',sans-serif] text-[#1a1208]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1208] leading-tight">Salon &amp; Spa Management</h1>
            <p className="text-sm text-[#7a6a55] mt-1">Manage all registered salons and spas on the platform</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {["Total", "Active", "Pending", "Suspended"].map((label) => (
            <div key={label} className="bg-white border border-[#e8e0d4] rounded-xl p-5 text-center animate-pulse">
              <div className="h-8 bg-[#f0ebe3] rounded mx-auto w-12 mb-2" />
              <p className="text-sm text-[#7a6a55]">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white border border-[#e8e0d4] rounded-2xl">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-[#f0ebe3] animate-pulse flex gap-4 items-center">
              <div className="w-9 h-9 rounded-full bg-[#f0ebe3]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[#f0ebe3] rounded w-40" />
                <div className="h-2.5 bg-[#f5f0ea] rounded w-28" />
              </div>
              <div className="h-3 bg-[#f0ebe3] rounded w-16" />
              <div className="h-3 bg-[#f0ebe3] rounded w-16" />
              <div className="h-3 bg-[#f0ebe3] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="font-['DM_Sans',sans-serif] text-[#1a1208]">
        <div className="bg-white border border-[#fdecea] rounded-2xl p-12 text-center">
          <p className="text-[#c0392b] font-medium mb-2">Failed to load salons</p>
          <p className="text-sm text-[#7a6a55] mb-4">{error}</p>
          <button
            onClick={() => fetchSalons(page)}
            className="bg-[#c8922a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#b07d20] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['DM_Sans',sans-serif] text-[#1a1208]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1208] leading-tight">
            Salon &amp; Spa Management
          </h1>
          <p className="text-sm text-[#7a6a55] mt-1">
            Manage all registered salons and spas on the platform
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#c8922a] hover:bg-[#b07d20] text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
          <PlusIcon />
          Add Salon
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",     value: summary.total,     cls: "text-[#1a1208]" },
          { label: "Active",    value: summary.active,    cls: statusCountColors.Active },
          { label: "Pending",   value: summary.pending,   cls: statusCountColors.Pending },
          { label: "Suspended", value: summary.suspended, cls: statusCountColors.Suspended },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white border border-[#e8e0d4] rounded-xl p-5 text-center">
            <p className={`text-3xl font-bold ${cls}`}>{value}</p>
            <p className="text-sm text-[#7a6a55] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-4 mb-6">

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#e8e0d4] rounded-xl px-4 py-2.5 w-72 text-sm text-[#7a6a55]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name, owner or city…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="bg-transparent outline-none flex-1 text-[#1a1208] placeholder:text-[#7a6a55]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                ${filter === f
                  ? "bg-[#c8922a] text-white border-[#c8922a]"
                  : "bg-white text-[#7a6a55] border-[#e8e0d4] hover:border-[#c8922a] hover:text-[#c8922a]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Business Type Filter */}
        <div className="flex items-center gap-2">
          {(["Salon", "Spa"] as BusinessType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                ${typeFilter === t
                  ? "bg-[#c8922a] text-white border-[#c8922a]"
                  : "bg-white text-[#7a6a55] border-[#e8e0d4] hover:border-[#c8922a] hover:text-[#c8922a]"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Active filter indicator */}
        {(filter !== "All" || typeFilter || search) && (
          <button
            onClick={() => { setFilter("All"); setTypeFilter(null); setSearch(""); setPage(1); }}
            className="text-xs text-[#c0392b] border border-[#f5c6c2] bg-[#fdecea] px-3 py-1.5 rounded-xl hover:bg-[#f9d9d7] transition-colors"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-[#e8e0d4] rounded-2xl overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-[2.5fr_0.8fr_1fr_1fr_1fr_0.8fr_1fr_1fr] px-6 py-3 border-b border-[#e8e0d4] bg-[#fdf9f4]">
          {["SALON / OWNER", "TYPE", "PLAN", "BRANCHES", "REVENUE", "RATING", "STATUS", "ACTIONS"].map((h) => (
            <p key={h} className="text-[11px] font-semibold tracking-wider text-[#7a6a55] uppercase">
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-[#7a6a55] text-sm">
            No salons found matching your criteria.
          </div>
        ) : (
          filtered.map((salon, i) => (
            <div
              key={salon.firebaseId}
              className={`grid grid-cols-[2.5fr_0.8fr_1fr_1fr_1fr_0.8fr_1fr_1fr] px-6 py-4 items-center
                ${i < filtered.length - 1 ? "border-b border-[#f0ebe3]" : ""}
                hover:bg-[#fdf9f4] transition-colors`}
            >
              {/* Salon name + owner */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0ebe3] flex items-center justify-center text-[13px] font-bold text-[#7a6a55] flex-shrink-0">
                  {salon.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[13.5px] font-medium text-[#1a1208]">{salon.name}</p>
                  <p className="text-[11.5px] text-[#7a6a55]">{salon.owner} · {salon.city}</p>
                </div>
              </div>

              {/* Type */}
              <div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                  salon.type === "Spa"
                    ? "bg-[#eaf0ff] text-[#3b5bdb] border-[#c7d2fe]"
                    : "bg-[#f0ebe3] text-[#7a6a55] border-[#e8e0d4]"
                }`}>
                  {salon.type}
                </span>
              </div>

              {/* Plan */}
              <div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${planColors[salon.plan]}`}>
                  {salon.plan}
                </span>
              </div>

              {/* Branches: total / active */}
              <div>
                <p className="text-[13.5px] text-[#1a1208] font-medium">{salon.branches}</p>
                {salon.activeBranches > 0 && (
                  <p className="text-[11px] text-[#27ae60]">{salon.activeBranches} active</p>
                )}
              </div>

              {/* Revenue */}
              <p className="text-[13.5px] font-semibold text-[#1a1208]">{salon.revenue}</p>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {salon.rating !== null ? (
                  <>
                    <StarIcon />
                    <span className="text-[13.5px] text-[#1a1208]">{salon.rating}</span>
                  </>
                ) : (
                  <span className="text-[13px] text-[#b0a090]">N/A</span>
                )}
              </div>

              {/* Status */}
              <div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusStyles[salon.status]}`}>
                  {salon.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewSalon(salon)}
                  title="View details"
                  className="text-[#b0a090] hover:text-[#1a1208] transition-colors"
                >
                  <EyeIcon />
                </button>
                <button
                  onClick={() => handleReactivate(salon)}
                  title="Reactivate"
                  className="text-[#b0a090] hover:text-[#27ae60] transition-colors"
                >
                  <RefreshIcon />
                </button>
                <button
                  onClick={() => handleSuspend(salon)}
                  title={salon.status === "Suspended" ? "Unsuspend" : "Suspend"}
                  className={`transition-colors ${
                    salon.status === "Suspended"
                      ? "text-[#c0392b]"
                      : "text-[#b0a090] hover:text-[#c0392b]"
                  }`}
                >
                  <BanIcon />
                </button>
              </div>
            </div>
          ))
        )}

        {/* ── Pagination ── */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          perPage={ITEMS_PER_PAGE}
          onPage={(p) => setPage(p)}
        />
      </div>

      {/* ── View Modal ── */}
      {viewSalon && (
        <Modal salon={viewSalon} onClose={() => setViewSalon(null)} />
      )}
    </div>
  );
}