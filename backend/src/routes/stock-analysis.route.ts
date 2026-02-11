import express from "express";
import {
  analyzeStockController,
  getAnalysisHistoryController,
  getLatestAnalysisController,
  deleteAnalysisController,
} from "../controllers/stock-analysis.controller";

const router = express.Router();

// POST /api/stock-analysis/analyze - Analyze a stock
router.post("/analyze", analyzeStockController);

// GET /api/stock-analysis/history - Get analysis history
router.get("/history", getAnalysisHistoryController);

// GET /api/stock-analysis/latest/:ticker - Get latest analysis for a ticker
router.get("/latest/:ticker", getLatestAnalysisController);

// DELETE /api/stock-analysis/:analysisId - Delete an analysis
router.delete("/:analysisId", deleteAnalysisController);

export default router;


