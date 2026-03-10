import { ref, get } from "firebase/database";
import { db } from "../config/firebase.js";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function formatINR(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function extractCity(address = "") {
  if (!address) return "Unknown";
  const KNOWN_CITIES = [
    "Navi Mumbai", "Mumbai", "Pune", "Nashik", "Thane",
    "Kharghar", "Panvel", "Delhi", "Bangalore", "Bengaluru",
    "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Surat",
  ];
  const lower = address.toLowerCase();
  for (const city of KNOWN_CITIES) {
    if (lower.includes(city.toLowerCase())) return city;
  }
  // Fallback: last comma-separated part
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || "Unknown";
}

function normalizePlan(raw = "") {
  const p = (raw || "").toLowerCase();
  if (p.includes("enterprise"))                         return "Enterprise";
  if (p.includes("premium") || p.includes("pro"))      return "Pro";
  if (p.includes("standard") || p.includes("starter")) return "Starter";
  if (p.includes("trial"))                              return "Trial";
  return "None";
}

/* ─────────────────────────────────────────
   GET /api/superdashboard/regions
   Returns city-wise breakdown + plan distribution + summary
───────────────────────────────────────── */
export const getRegionStats = async (req, res) => {
  try {
    const rootSnap = await get(ref(db, "salonandspa"));
    if (!rootSnap.exists()) {
      return res.status(404).json({ message: "No data found" });
    }

    const data      = rootSnap.val();
    const salons    = data.salons     || {};
    const spas      = data.spas       || {};
    const admins    = data.admin      || {};
    const employees = data.employees  || {};
    const appts     = data.appointments?.salon || {};

    /* ── Revenue per salon from paid appointments ── */
    const salonRevenue = {};
    Object.entries(appts).forEach(([salonId, salonAppts]) => {
      let rev = 0;
      Object.values(salonAppts).forEach((appt) => {
        if (appt.paymentStatus === "paid") rev += Number(appt.totalAmount) || 0;
      });
      salonRevenue[salonId] = rev;
    });

    /* ── ownerId → subscription plan ── */
    const ownerPlan = {};
    Object.entries(admins).forEach(([uid, admin]) => {
      const sub = admin.subscription || {};
      ownerPlan[uid] = normalizePlan(sub.planName || sub.plan || "");
    });

    /* ── employees per ownerId ── */
    const empPerOwner = {};
    Object.values(employees).forEach((emp) => {
      const oid = emp.ownerId || "";
      if (oid) empPerOwner[oid] = (empPerOwner[oid] || 0) + 1;
    });

    /* ── Build city-wise data ── */
    const cityMap = {};

    const processPlace = (id, place, type) => {
      const city    = extractCity(place.address || "");
      const ownerId = place.ownerId || "";

      if (!cityMap[city]) {
        cityMap[city] = {
          city,
          salons:    0,
          spas:      0,
          total:     0,
          revenue:   0,
          employees: 0,
          ratings:   [],
          ownerIds:  new Set(),
        };
      }

      const c = cityMap[city];
      if (type === "salon") c.salons++;
      if (type === "spa")   c.spas++;
      c.total++;
      c.revenue  += salonRevenue[id] || 0;
      c.employees += empPerOwner[ownerId] || 0;
      if (place.rating) c.ratings.push(Number(place.rating));
      if (ownerId) c.ownerIds.add(ownerId);
    };

    Object.entries(salons).forEach(([id, s]) => processPlace(id, s, "salon"));
    Object.entries(spas).forEach(([id, s])   => processPlace(id, s, "spa"));

    /* ── Format regions ── */
    const regions = Object.values(cityMap).map((c) => ({
      city:             c.city,
      salons:           c.salons,
      spas:             c.spas,
      total:            c.total,
      revenue:          c.revenue,
      revenueFormatted: formatINR(c.revenue),
      employees:        c.employees,
      avgRating:        c.ratings.length
        ? Math.round((c.ratings.reduce((a, b) => a + b, 0) / c.ratings.length) * 10) / 10
        : null,
    }));

    /* ── Plan distribution (across all admins) ── */
    const planCount = {};
    Object.values(admins).forEach((admin) => {
      const sub  = admin.subscription || {};
      const plan = normalizePlan(sub.planName || sub.plan || "");
      planCount[plan] = (planCount[plan] || 0) + 1;
    });

    const planDist = Object.entries(planCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    /* ── Summary totals ── */
    const totalRevenue = Object.values(salonRevenue).reduce((a, b) => a + b, 0);

    return res.status(200).json({
      totalCities:    regions.length,
      totalSalons:    Object.keys(salons).length,
      totalSpas:      Object.keys(spas).length,
      totalEmployees: Object.keys(employees).length,
      totalRevenue:   formatINR(totalRevenue),
      planDist,
      regions,
    });
  } catch (error) {
    console.error("REGION STATS ERROR:", error);
    return res.status(500).json({ message: "Failed to load region stats" });
  }
};