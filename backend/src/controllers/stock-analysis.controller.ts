import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import StockAnalysisOrchestratorService from "../services/stock-analysis/orchestrator.service";
import { StockAnalysisRequest } from "../@types/stock-analysis.type";

export const analyzeStockController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { ticker, companyName, userProfile } = req.body;

    // Validate required fields
    if (!ticker || !companyName || !userProfile) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields: ticker, companyName, userProfile"
      });
    }

    // Validate user profile
    const requiredFields = ['monthlyIncome', 'monthlyExpenses', 'savings', 'riskTolerance', 'currentPortfolio', 'timeHorizon'];
    const missingFields = requiredFields.filter(field => !userProfile[field] && userProfile[field] !== 0);
    
    if (missingFields.length > 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: `Missing required userProfile fields: ${missingFields.join(', ')}`
      });
    }

    if (!["low", "medium", "high"].includes(userProfile.riskTolerance)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "riskTolerance must be 'low', 'medium', or 'high'"
      });
    }

    if (!["weeks", "months", "years"].includes(userProfile.timeHorizon)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "timeHorizon must be 'weeks', 'months', or 'years'"
      });
    }

    // Validate financial data
    if (userProfile.monthlyIncome < 0 || userProfile.monthlyExpenses < 0 || userProfile.savings < 0) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Financial values must be non-negative"
      });
    }

    console.log(`🔍 Stock Analysis Controller - Analyzing ${ticker} for user ${userId}`);
    
    const request: StockAnalysisRequest = {
      ticker: ticker.toUpperCase(),
      companyName,
      userProfile
    };

    const analysis = await StockAnalysisOrchestratorService.analyzeStock(userId, request);
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Stock analysis completed successfully",
      data: analysis
    });
  }
);

export const getAnalysisHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageLimit = parseInt(limit as string) || 10;
    
    const result = await StockAnalysisOrchestratorService.getAnalysisHistory(
      userId, 
      pageNumber, 
      pageLimit
    );
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Analysis history retrieved successfully",
      data: result.analyses,
      pagination: result.pagination
    });
  }
);

export const getLatestAnalysisController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { ticker } = req.params;
    
    if (!ticker) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Ticker parameter is required"
      });
    }

    const analysis = await StockAnalysisOrchestratorService.getLatestAnalysis(userId, ticker);
    
    if (!analysis) {
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        success: false,
        message: "No analysis found for this ticker"
      });
    }
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Latest analysis retrieved successfully",
      data: analysis
    });
  }
);

export const deleteAnalysisController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { analysisId } = req.params;
    
    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!analysisId) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Analysis ID is required"
      });
    }

    const result = await StockAnalysisOrchestratorService.deleteAnalysis(userId, analysisId);
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Analysis deleted successfully",
      data: result
    });
  }
);


