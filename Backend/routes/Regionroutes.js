import express from "express";
import { getRegionStats } from "../controllers/Regioncontroller.js";

const router = express.Router();

router.get("/regions", getRegionStats);

export default router;