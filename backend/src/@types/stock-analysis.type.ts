export interface UserPreferences {
  riskTolerance: "low" | "medium" | "high";
  timeHorizon: "days" | "weeks" | "months" | "years";
}

export interface UserProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  riskTolerance: "low" | "medium" | "high";
  currentPortfolio: Record<string, number>;
  timeHorizon: "weeks" | "months" | "years";
}

export interface StockAnalysisRequest {
  ticker: string;
  companyName: string;
  userProfile: UserProfile;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  snippet: string;
  content: string;
}

export interface NewsListResponse {
  ticker: string;
  companyName: string;
  query: string;
  news: NewsItem[];
  fetchedAt: string;
}

export interface SentenceLevelSentiment {
  text: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score: number;
}

export interface NewsSentimentItem {
  newsId: string;
  title: string;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score: number;
  notes: string;
  sentenceLevel: SentenceLevelSentiment[];
}

export interface SentimentAggregate {
  positive: number;
  negative: number;
  neutral: number;
  weightedScore: number;
}

export interface NewsSentimentsResponse {
  ticker: string;
  analysisDate: string;
  items: NewsSentimentItem[];
  aggregate: SentimentAggregate;
}

export interface MarketDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  SMA50: number;
  SMA200: number;
  RSI14: number;
  MACD: {
    macd: number;
    signal: number;
    hist: number;
  };
}

export interface MarketDataResponse {
  ticker: string;
  fetchedAt: string;
  latestPrice: number;
  changePercent24h: number;
  history: MarketDataPoint[];
  indicators: TechnicalIndicators;
}

export interface NewsSummary {
  positive: number;
  negative: number;
  neutral: number;
  topHeadlines: string[];
}

export interface MarketSignals {
  latestPrice: number;
  SMA50: number;
  SMA200: number;
  RSI14: number;
  trend: "up" | "down" | "flat";
}

export interface SentimentAggregateInfo {
  weightedScore: number;
  interpretation: string;
}

export interface UserProfileSummary {
  financialHealthScore: number;
  maxAllocation: number;
  maxQuantity: number;
}

export interface FinancialHealthAnalysis {
  disposableIncome: number;
  safeAllocation: number;
  maxQuantity: number;
  financialHealthScore: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface EvidenceItem {
  type: "news" | "indicator";
  id?: string;
  name?: string;
  snippet?: string;
  value?: number;
  sentiment?: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  score?: number;
  interpretation?: string;
}

export interface FinalRecommendation {
  ticker: string;
  companyName: string;
  generatedAt: string;
  userProfileSummary: UserProfileSummary;
  newsSummary: NewsSummary;
  marketSignals: MarketSignals;
  sentimentAggregate: SentimentAggregateInfo;
  recommendation: "BUY" | "HOLD" | "SELL";
  confidence: number;
  suggestedQuantity: number;
  rationale: string;
  actionableItems: string[];
  evidence: EvidenceItem[];
  caveats: string[];
  raw: {
    news: NewsListResponse;
    sentiments: NewsSentimentsResponse;
    market: MarketDataResponse;
    financialHealth: FinancialHealthAnalysis;
  };
}

export interface StockAnalysisResponse {
  success: boolean;
  message: string;
  data: FinalRecommendation;
}


