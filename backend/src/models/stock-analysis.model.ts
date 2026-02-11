import mongoose, { Document, Schema } from "mongoose";
import { FinalRecommendation } from "../@types/stock-analysis.type";

export interface StockAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  ticker: string;
  companyName: string;
  userPreferences: {
    riskTolerance: "low" | "medium" | "high";
    timeHorizon: "days" | "weeks" | "months" | "years";
  };
  analysis: FinalRecommendation;
  createdAt: Date;
  updatedAt: Date;
}

const stockAnalysisSchema = new Schema<StockAnalysisDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    ticker: {
      type: String,
      required: true,
      uppercase: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    userPreferences: {
      riskTolerance: {
        type: String,
        enum: ["low", "medium", "high"],
        required: true,
      },
      timeHorizon: {
        type: String,
        enum: ["days", "weeks", "months", "years"],
        required: true,
      },
    },
    analysis: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
stockAnalysisSchema.index({ userId: 1, ticker: 1, createdAt: -1 });
stockAnalysisSchema.index({ ticker: 1, createdAt: -1 });

const StockAnalysisModel = mongoose.model<StockAnalysisDocument>(
  "StockAnalysis",
  stockAnalysisSchema
);

export default StockAnalysisModel;


