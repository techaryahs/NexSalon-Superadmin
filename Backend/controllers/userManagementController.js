import { ref, get } from "firebase/database";
import { db } from "../config/firebase.js";

/**
 * GET /api/superdashboard/users
 * Returns all users (superadmin + admins + employees) with pagination
 * Query params: page (default: 1), limit (default: 7), search, role
 */
export const getAllPlatformUsers = async (req, res) => {
  try {
    const rootSnap = await get(ref(db, "salonandspa"));

    if (!rootSnap.exists()) {
      return res.status(404).json({ message: "No users found" });
    }

    const root        = rootSnap.val();
    const admins      = root.admin      || {};
    const employees   = root.employees  || {};
    const superadmins = root.superadmin || {};
    const salons      = root.salons     || {};
    const spas        = root.spas       || {};

    /* ── Build ownerId → company name map ── */
    const companyMap = {};
    [...Object.values(salons), ...Object.values(spas)].forEach((place) => {
      const oid = place.ownerId || "";
      if (oid && !companyMap[oid]) {
        companyMap[oid] = place.name || place.branch || "";
      }
    });

    const allUsers = [];

    /* ── 1. Super Admins ── */
    Object.entries(superadmins).forEach(([uid, user]) => {
      if (typeof user !== "object") return;
      allUsers.push({
        id:         uid,
        name:       user.name  || "Super Admin",
        email:      user.email || "N/A",
        phone:      user.phone || "N/A",
        role:       "Super Admin",
        company:    "Platform",
        status:     "active",
        lastActive: formatLastActive(user.updatedAt || user.createdAt),
        initials:   getInitials(user.name || "SA"),
      });
    });

    /* ── 2. Salon Admins ── */
    Object.entries(admins).forEach(([uid, user]) => {
      if (typeof user !== "object") return;
      allUsers.push({
        id:         uid,
        name:       user.name || "N/A",
        email:      user.email || "N/A",
        phone:      user.phone || "N/A",
        role:       formatRole(user.role),
        company:    user.businessName || user.companyName || companyMap[uid] || "N/A",
        status:     normalizeStatus(user.subscription?.status),
        lastActive: formatLastActive(user.updatedAt || user.createdAt),
        initials:   getInitials(user.name),
      });
    });

    /* ── 3. Employees ── */
    Object.entries(employees).forEach(([uid, emp]) => {
      if (typeof emp !== "object") return;
      allUsers.push({
        id:         uid,
        name:       emp.name  || "N/A",
        email:      emp.email || "N/A",
        phone:      emp.phone || "N/A",
        role:       formatEmployeeRole(emp.role),
        company:    companyMap[emp.ownerId] || "N/A",
        status:     normalizeEmployeeStatus(emp),
        lastActive: formatLastActive(emp.updatedAt || emp.createdAt),
        initials:   getInitials(emp.name),
      });
    });

    /* ── Role summary counts (full dataset) ── */
    const roleSummary = {
      "Super Admin":    allUsers.filter((u) => u.role === "Super Admin").length,
      "Salon Admin":    allUsers.filter((u) => u.role === "Salon Admin").length,
      "Branch Manager": allUsers.filter((u) => u.role === "Branch Manager").length,
      "Receptionist":   allUsers.filter((u) => u.role === "Receptionist").length,
      "Staff":          allUsers.filter((u) => !["Super Admin", "Salon Admin", "Branch Manager", "Receptionist"].includes(u.role)).length,
    };

    /* ── Status summary counts (full dataset) ── */
    const statusSummary = {
      active:  allUsers.filter((u) => u.status === "active").length,
      blocked: allUsers.filter((u) => u.status === "blocked").length,
      pending: allUsers.filter((u) => u.status === "pending").length,
      total:   allUsers.length,
    };

    /* ── Pagination & search params ── */
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.max(1, parseInt(req.query.limit) || 7);
    const search = (req.query.search || "").toLowerCase();
    const role   = (req.query.role   || "").toLowerCase();

    /* ── Search filtering ── */
    let filteredUsers = allUsers;

    if (search) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(search)    ||
        user.email.toLowerCase().includes(search)   ||
        user.role.toLowerCase().includes(search)    ||
        user.company.toLowerCase().includes(search)
      );
    }

    /* ── Role filtering ── */
    if (role) {
      filteredUsers = filteredUsers.filter((user) =>
        user.role.toLowerCase().includes(role)
      );
    }

    /* ── Paginate ── */
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / limit);
    const startIndex = (page - 1) * limit;
    const users      = filteredUsers.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      roleSummary,
      statusSummary,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */

function formatRole(role = "") {
  if (role === "admin")      return "Salon Admin";
  if (role === "superadmin") return "Super Admin";
  return role;
}

function formatEmployeeRole(role = "") {
  const r = (role || "").trim().toLowerCase();
  if (r.includes("manager"))      return "Branch Manager";
  if (r.includes("receptionist")) return "Receptionist";
  if (r.includes("stylist"))      return "Staff";
  if (r.includes("employee"))     return "Staff";
  return role.trim().replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) || "Staff";
}

function normalizeStatus(status = "") {
  const s = (status || "").toLowerCase();
  if (s === "active")                          return "active";
  if (s === "suspended" || s === "cancelled")  return "blocked";
  if (s === "trial")                           return "pending";
  return "pending";
}

function normalizeEmployeeStatus(emp) {
  if (emp.isActive === false || emp.isActive === "false") return "blocked";
  if (emp.isActive === true  || emp.isActive === "true")  return "active";
  return "pending";
}

function getInitials(name = "") {
  return (name || "")
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "?";
}

function formatLastActive(timestamp) {
  if (!timestamp) return "Never";
  const diff  = Date.now() - Number(timestamp);
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  <  1)  return "Just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  <  7)  return `${days}d ago`;
  return new Date(Number(timestamp)).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}