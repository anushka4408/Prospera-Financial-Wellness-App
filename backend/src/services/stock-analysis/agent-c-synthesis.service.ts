import { genAI } from "../../config/google-ai.config";
import { 
  FinalRecommendation, 
  NewsSentimentsResponse, 
  MarketDataResponse, 
  UserProfile,
  NewsSummary,
  MarketSignals,
  SentimentAggregateInfo,
  EvidenceItem,
  FinancialHealthAnalysis,
  UserProfileSummary
} from "../../@types/stock-analysis.type";

export class AgentCSynthesisService {
  async generateRecommendation(
    ticker: string,
    companyName: string,
    userProfile: UserProfile,
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse,
    financialHealth: FinancialHealthAnalysis
  ): Promise<FinalRecommendation> {
    try {
      console.log(`🔍 Agent C - Generating recommendation for ${ticker}`);
      
      // Extract and process data
      const newsSummary = this.extractNewsSummary(newsSentiments);
      const marketSignals = this.extractMarketSignals(marketData);
      const sentimentAggregate = this.extractSentimentAggregate(newsSentiments);
      const userProfileSummary = this.extractUserProfileSummary(financialHealth);
      
      // Generate AI-powered recommendation
      const aiRecommendation = await this.generateAIRecommendation(
        ticker,
        companyName,
        userProfile,
        newsSummary,
        marketSignals,
        sentimentAggregate,
        newsSentiments,
        marketData,
        financialHealth
      );

      // Build evidence array
      const evidence = this.buildEvidenceArray(newsSentiments, marketData);
      
      // Generate actionable items
      const actionableItems = this.generateActionableItems(
        aiRecommendation.recommendation,
        {
          riskTolerance: userProfile.riskTolerance,
          timeHorizon: userProfile.timeHorizon
        },
        marketSignals
      );

      // Generate caveats
      const caveats = this.generateCaveats(newsSentiments, marketData);

      const finalRecommendation: FinalRecommendation = {
        ticker: ticker.toUpperCase(),
        companyName,
        generatedAt: new Date().toISOString(),
        userProfileSummary,
        newsSummary,
        marketSignals,
        sentimentAggregate,
        recommendation: aiRecommendation.recommendation,
        confidence: aiRecommendation.confidence,
        suggestedQuantity: aiRecommendation.suggestedQuantity,
        rationale: aiRecommendation.rationale,
        actionableItems,
        evidence,
        caveats,
        raw: {
          news: newsSentiments as any, // Type assertion for raw data
          sentiments: newsSentiments,
          market: marketData,
          financialHealth
        },
      };

      console.log(`✅ Agent C - Generated ${aiRecommendation.recommendation} recommendation with ${(aiRecommendation.confidence * 100).toFixed(1)}% confidence`);
      return finalRecommendation;
    } catch (error) {
      console.error("❌ Agent C - Error generating recommendation:", error);
      // Return fallback recommendation
      return this.generateFallbackRecommendation(ticker, companyName, userProfile, newsSentiments, marketData);
    }
  }

  private extractNewsSummary(sentiments: NewsSentimentsResponse): NewsSummary {
    const { aggregate } = sentiments;
    const topHeadlines = sentiments.items
      .slice(0, 3)
      .map(item => `${item.title} - ${item.sentiment}`);

    return {
      positive: Math.round(aggregate.positive * sentiments.items.length),
      negative: Math.round(aggregate.negative * sentiments.items.length),
      neutral: Math.round(aggregate.neutral * sentiments.items.length),
      topHeadlines,
    };
  }

  private extractMarketSignals(marketData: MarketDataResponse): MarketSignals {
    const { latestPrice, indicators } = marketData;
    const { SMA50, SMA200, RSI14 } = indicators;
    
    // Determine trend
    let trend: "up" | "down" | "flat" = "flat";
    if (SMA50 > SMA200 && latestPrice > SMA50) trend = "up";
    else if (SMA50 < SMA200 && latestPrice < SMA50) trend = "down";

    return {
      latestPrice,
      SMA50,
      SMA200,
      RSI14,
      trend,
    };
  }

  private extractSentimentAggregate(sentiments: NewsSentimentsResponse): SentimentAggregateInfo {
    const { weightedScore } = sentiments.aggregate;
    
    let interpretation: string;
    if (weightedScore > 0.3) interpretation = "strongly positive";
    else if (weightedScore > 0.1) interpretation = "mildly positive";
    else if (weightedScore > -0.1) interpretation = "neutral";
    else if (weightedScore > -0.3) interpretation = "mildly negative";
    else interpretation = "strongly negative";

    return {
      weightedScore,
      interpretation,
    };
  }

  private async generateAIRecommendation(
    ticker: string,
    companyName: string,
    userProfile: UserProfile,
    newsSummary: NewsSummary,
    marketSignals: MarketSignals,
    sentimentAggregate: SentimentAggregateInfo,
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse,
    financialHealth: FinancialHealthAnalysis
  ): Promise<{ recommendation: "BUY" | "HOLD" | "SELL"; confidence: number; suggestedQuantity: number; rationale: string }> {
    try {
      const prompt = this.buildAnalysisPrompt(
        ticker,
        companyName,
        userProfile,
        newsSummary,
        marketSignals,
        sentimentAggregate,
        newsSentiments,
        marketData,
        financialHealth
      );

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (!result.text) {
        throw new Error("No response from AI model");
      }

      // Parse AI response
      const aiResponse = result.text;
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendation: parsed.recommendation,
          confidence: Math.max(0, Math.min(1, parsed.confidence)),
          suggestedQuantity: parsed.suggestedQuantity || Math.floor(financialHealth.safeAllocation / marketData.latestPrice),
          rationale: parsed.rationale,
        };
      }

      throw new Error("Could not parse AI response");
    } catch (error) {
      console.warn("AI recommendation failed, using rule-based fallback:", error);
      return this.generateRuleBasedRecommendation(
        userProfile,
        marketSignals,
        sentimentAggregate,
        financialHealth
      );
    }
  }

  private buildAnalysisPrompt(
    ticker: string,
    companyName: string,
    userProfile: UserProfile,
    newsSummary: NewsSummary,
    marketSignals: MarketSignals,
    sentimentAggregate: SentimentAggregateInfo,
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse,
    financialHealth: FinancialHealthAnalysis
  ): string {
    return `You are a financial analyst providing stock recommendations. Analyze the following data and provide a BUY/HOLD/SELL recommendation with suggested quantity.

STOCK: ${ticker} (${companyName})
USER PROFILE: 
- Risk Tolerance: ${userProfile.riskTolerance}
- Time Horizon: ${userProfile.timeHorizon}
- Monthly Income: $${userProfile.monthlyIncome.toLocaleString()}
- Monthly Expenses: $${userProfile.monthlyExpenses.toLocaleString()}
- Savings: $${userProfile.savings.toLocaleString()}
- Current Portfolio: ${Object.entries(userProfile.currentPortfolio).map(([k, v]) => `${k}: ${v}`).join(", ")}

FINANCIAL HEALTH ANALYSIS:
- Financial Health Score: ${financialHealth.financialHealthScore}/100
- Safe Allocation: $${financialHealth.safeAllocation.toLocaleString()}
- Max Quantity: ${financialHealth.maxQuantity} shares
- Risk Factors: ${financialHealth.riskFactors.join(", ")}
- Recommendations: ${financialHealth.recommendations.join(", ")}

NEWS SENTIMENT ANALYSIS:
- Positive Articles: ${newsSummary.positive}
- Negative Articles: ${newsSummary.negative}  
- Neutral Articles: ${newsSummary.neutral}
- Weighted Sentiment Score: ${sentimentAggregate.weightedScore.toFixed(3)} (${sentimentAggregate.interpretation})
- Top Headlines: ${newsSummary.topHeadlines.join(", ")}

MARKET TECHNICAL ANALYSIS:
- Current Price: $${marketSignals.latestPrice.toFixed(2)}
- 50-day SMA: $${marketSignals.SMA50.toFixed(2)}
- 200-day SMA: $${marketSignals.SMA200.toFixed(2)}
- RSI(14): ${marketSignals.RSI14.toFixed(1)}
- Trend: ${marketSignals.trend}

RECENT NEWS SENTIMENTS:
${newsSentiments.items.slice(0, 5).map(item => 
  `- "${item.title}" (${item.sentiment}, ${(item.score * 100).toFixed(1)}% confidence)`
).join('\n')}

ANALYSIS REQUIREMENTS:
1. Consider the user's risk tolerance and time horizon
2. Weigh news sentiment against technical indicators
3. Account for market trends and momentum
4. Provide confidence level (0.0-1.0)
5. Give clear reasoning for the recommendation

RESPOND WITH ONLY THIS JSON FORMAT:
{
  "recommendation": "BUY|HOLD|SELL",
  "confidence": 0.0-1.0,
  "rationale": "2-5 paragraphs explaining your reasoning, considering both fundamental (news) and technical (market) factors, and how they align with the user's risk profile and time horizon."
}`;
  }

  private generateRuleBasedRecommendation(
    userProfile: UserProfile,
    marketSignals: MarketSignals,
    sentimentAggregate: SentimentAggregateInfo,
    financialHealth: FinancialHealthAnalysis
  ): { recommendation: "BUY" | "HOLD" | "SELL"; confidence: number; suggestedQuantity: number; rationale: string } {
    let score = 0;
    let factors: string[] = [];

    // News sentiment factor (40% weight)
    const sentimentScore = sentimentAggregate.weightedScore;
    score += sentimentScore * 0.4;
    if (sentimentScore > 0.2) factors.push("positive news sentiment");
    else if (sentimentScore < -0.2) factors.push("negative news sentiment");

    // Technical analysis factor (40% weight)
    const { latestPrice, SMA50, SMA200, RSI14, trend } = marketSignals;
    
    // Price vs moving averages
    if (latestPrice > SMA50 && SMA50 > SMA200) {
      score += 0.2;
      factors.push("price above key moving averages");
    } else if (latestPrice < SMA50 && SMA50 < SMA200) {
      score -= 0.2;
      factors.push("price below key moving averages");
    }

    // RSI analysis
    if (RSI14 > 70) {
      score -= 0.1;
      factors.push("overbought conditions (RSI > 70)");
    } else if (RSI14 < 30) {
      score += 0.1;
      factors.push("oversold conditions (RSI < 30)");
    }

    // Trend analysis
    if (trend === "up") {
      score += 0.1;
      factors.push("uptrend confirmed");
    } else if (trend === "down") {
      score -= 0.1;
      factors.push("downtrend confirmed");
    }

    // Risk tolerance adjustment
    if (userProfile.riskTolerance === "low") {
      score *= 0.8; // More conservative
    } else if (userProfile.riskTolerance === "high") {
      score *= 1.2; // More aggressive
    }

    // Time horizon adjustment
    if (userProfile.timeHorizon === "weeks") {
      score *= 0.7; // More short-term focused
    } else if (userProfile.timeHorizon === "years") {
      score *= 1.1; // More long-term focused
    }

    // Determine recommendation
    let recommendation: "BUY" | "HOLD" | "SELL";
    let confidence: number;

    if (score > 0.3) {
      recommendation = "BUY";
      confidence = Math.min(0.9, 0.5 + score * 0.5);
    } else if (score < -0.3) {
      recommendation = "SELL";
      confidence = Math.min(0.9, 0.5 + Math.abs(score) * 0.5);
    } else {
      recommendation = "HOLD";
      confidence = 0.6;
    }

    const rationale = `Based on rule-based analysis: ${factors.join(", ")}. ` +
      `The combined score of ${score.toFixed(2)} suggests a ${recommendation} recommendation ` +
      `with ${(confidence * 100).toFixed(1)}% confidence. ` +
      `This recommendation considers your ${userProfile.riskTolerance} risk tolerance ` +
      `and ${userProfile.timeHorizon} time horizon. ` +
      `Based on your financial health score of ${financialHealth.financialHealthScore}/100, ` +
      `you can safely invest up to ${financialHealth.maxQuantity} shares.`;

    const suggestedQuantity = Math.min(
      financialHealth.maxQuantity,
      Math.floor(financialHealth.safeAllocation / marketSignals.latestPrice)
    );

    return { recommendation, confidence, suggestedQuantity, rationale };
  }

  private buildEvidenceArray(
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse
  ): EvidenceItem[] {
    const evidence: EvidenceItem[] = [];

    // Add top news evidence
    newsSentiments.items.slice(0, 3).forEach(item => {
      evidence.push({
        type: "news",
        id: item.newsId,
        snippet: item.title,
        sentiment: item.sentiment,
        score: item.score,
      });
    });

    // Add technical indicators evidence
    const { indicators } = marketData;
    evidence.push({
      type: "indicator",
      name: "RSI14",
      value: indicators.RSI14,
      interpretation: indicators.RSI14 > 70 ? "overbought" : 
                     indicators.RSI14 < 30 ? "oversold" : "neutral",
    });

    evidence.push({
      type: "indicator", 
      name: "SMA50",
      value: indicators.SMA50,
      interpretation: marketData.latestPrice > indicators.SMA50 ? "price above SMA50" : "price below SMA50",
    });

    return evidence;
  }

  private generateActionableItems(
    recommendation: "BUY" | "HOLD" | "SELL",
    userPreferences: { riskTolerance: string; timeHorizon: string },
    marketSignals: MarketSignals
  ): string[] {
    const items: string[] = [];

    if (recommendation === "BUY") {
      items.push("Consider dollar-cost averaging to reduce timing risk");
      items.push("Set a stop-loss at 5-10% below entry price");
      if (userPreferences.riskTolerance === "low") {
        items.push("Start with a small position size");
      }
    } else if (recommendation === "SELL") {
      items.push("Consider taking profits if holding gains");
      items.push("Set a stop-loss to protect against further losses");
    } else {
      items.push("Monitor for better entry/exit opportunities");
      items.push("Review position size based on risk tolerance");
    }

    // Add RSI-specific advice
    if (marketSignals.RSI14 > 70) {
      items.push("RSI indicates overbought conditions - consider waiting for pullback");
    } else if (marketSignals.RSI14 < 30) {
      items.push("RSI indicates oversold conditions - potential buying opportunity");
    }

    return items;
  }

  private generateCaveats(
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse
  ): string[] {
    const caveats: string[] = [];

    if (newsSentiments.items.length === 0) {
      caveats.push("No recent news available - analysis based primarily on technical indicators");
    }

    if (newsSentiments.items.length < 5) {
      caveats.push("Limited news data may affect sentiment analysis accuracy");
    }

    caveats.push("Market data may be delayed by 15-20 minutes");
    caveats.push("Past performance does not guarantee future results");
    caveats.push("This analysis is for informational purposes only, not financial advice");

    return caveats;
  }

  private generateFallbackRecommendation(
    ticker: string,
    companyName: string,
    userProfile: UserProfile,
    newsSentiments: NewsSentimentsResponse,
    marketData: MarketDataResponse
  ): FinalRecommendation {
    const newsSummary = this.extractNewsSummary(newsSentiments);
    const marketSignals = this.extractMarketSignals(marketData);
    const sentimentAggregate = this.extractSentimentAggregate(newsSentiments);

    // Create basic financial health analysis for fallback
    const disposableIncome = userProfile.monthlyIncome - userProfile.monthlyExpenses;
    const safeAllocation = Math.min(userProfile.savings * 0.05, disposableIncome * 0.5);
    const maxQuantity = Math.floor(safeAllocation / marketData.latestPrice);
    
    const financialHealth: FinancialHealthAnalysis = {
      disposableIncome,
      safeAllocation,
      maxQuantity,
      financialHealthScore: 50, // Conservative fallback score
      riskFactors: ["Using conservative fallback due to analysis error"],
      recommendations: ["Consult with financial advisor", "Use conservative allocation"]
    };

    const ruleBased = this.generateRuleBasedRecommendation(
      userProfile,
      marketSignals,
      sentimentAggregate,
      financialHealth
    );

    const userProfileSummary: UserProfileSummary = {
      financialHealthScore: financialHealth.financialHealthScore,
      maxAllocation: financialHealth.safeAllocation,
      maxQuantity: financialHealth.maxQuantity
    };

    return {
      ticker: ticker.toUpperCase(),
      companyName,
      generatedAt: new Date().toISOString(),
      userProfileSummary,
      newsSummary,
      marketSignals,
      sentimentAggregate,
      recommendation: ruleBased.recommendation,
      confidence: ruleBased.confidence,
      suggestedQuantity: ruleBased.suggestedQuantity,
      rationale: ruleBased.rationale,
      actionableItems: this.generateActionableItems(
        ruleBased.recommendation,
        {
          riskTolerance: userProfile.riskTolerance,
          timeHorizon: userProfile.timeHorizon
        },
        marketSignals
      ),
      evidence: this.buildEvidenceArray(newsSentiments, marketData),
      caveats: this.generateCaveats(newsSentiments, marketData),
      raw: {
        news: newsSentiments as any,
        sentiments: newsSentiments,
        market: marketData,
        financialHealth
      },
    };
  }

  private extractUserProfileSummary(financialHealth: FinancialHealthAnalysis): UserProfileSummary {
    return {
      financialHealthScore: financialHealth.financialHealthScore,
      maxAllocation: financialHealth.safeAllocation,
      maxQuantity: financialHealth.maxQuantity
    };
  }

}

export default new AgentCSynthesisService();


