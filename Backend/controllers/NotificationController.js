import { db } from "../config/firebase.js";
import { ref, get } from "firebase/database";

// GET RECENT NOTIFICATIONS (Last 3 Days) with Pagination
export const getRecentNotifications = async (req, res) => {
  try {
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    // --- Query params ---
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const typeFilter = req.query.type ? String(req.query.type).toUpperCase() : null;

    let notifications = [];

    // ─── 1. Fetch Admins ────────────────────────────────────────────────────
    if (!typeFilter || typeFilter === "NEW_ADMIN") {
      const adminSnap = await get(ref(db, "salonandspa/admin"));

      if (adminSnap.exists()) {
        Object.entries(adminSnap.val()).forEach(([id, admin]) => {
          if (!admin || typeof admin !== "object") return;
          if (!admin.createdAt || now - admin.createdAt > threeDays) return;

          notifications.push({
            id: `admin-${id}`,
            type: "NEW_ADMIN",
            title: "New Admin Registered",
            message: `${admin.name || "Unknown"} created an account`,
            createdAt: admin.createdAt,
          });
        });
      }
    }

    // ─── 2. Fetch Customers ─────────────────────────────────────────────────
    // Node is "salonandspa/customer" (singular), flat structure:
    // { uid, name, email, phone, createdAt, bookings: {...} }
    if (!typeFilter || typeFilter === "NEW_CUSTOMER") {
      const customerSnap = await get(ref(db, "salonandspa/customer"));

      if (customerSnap.exists()) {
        Object.entries(customerSnap.val()).forEach(([id, customer]) => {
          if (!customer || typeof customer !== "object") return;
          if (!customer.createdAt || now - customer.createdAt > threeDays) return;

          notifications.push({
            id: `customer-${id}`,
            type: "NEW_CUSTOMER",
            title: "New Customer",
            message: `${customer.name || customer.phone || "A new customer"} joined`,
            createdAt: customer.createdAt,
          });
        });
      }
    }

    // ─── Sort newest first ──────────────────────────────────────────────────
    notifications.sort((a, b) => b.createdAt - a.createdAt);

    // ─── Paginate ───────────────────────────────────────────────────────────
    const total = notifications.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.min(page, totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginated = notifications.slice(startIndex, startIndex + limit);

    res.json({
      total,
      count: paginated.length,
      currentPage: safePage,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      notifications: paginated,
    });
  } catch (error) {
    console.error("getRecentNotifications error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};