// salonRoutes.js
import express from "express";
import { getAllSalons, updateSalonStatus } from "../controllers/SalonsController.js";

const router = express.Router();

router.get("/salons", getAllSalons);
router.patch("/:ownerId/status", updateSalonStatus); // ✅ this line must exist

export default router;