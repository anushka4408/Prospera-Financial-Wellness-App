import axios from "axios";
import { NewsSentimentsResponse, NewsSentimentItem, SentimentAggregate, NewsItem } from "../../@types/stock-analysis.type";

export class AgentBSentimentAnalyzerService {
  private readonly HUGGINGFACE_API_KEY: string;
  private readonly HUGGINGFACE_BASE_URL = "https://api-inference.huggingface.co/models";

  constructor() {
    this.HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";

if (!this.HUGGINGFACE_API_KEY) {
  console.warn("⚠️ HUGGINGFACE_API_KEY not set. Falling back to lexical sentiment analysis.");
} else {
  console.log("✅ Hugging Face API key configured - using AI sentiment analysis");
}

  }

  async analyzeSentiments(
    ticker: string,
    newsItems: NewsItem[]
  ): Promise<NewsSentimentsResponse> {
    try {
      console.log(`🔍 Agent B - Analyzing sentiments for ${ticker}`);
      
      const sentimentItems: NewsSentimentItem[] = [];
      const sentimentScores: number[] = [];
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };

      // Analyze each news item
      for (const newsItem of newsItems) {
        try {
          const sentimentResult = await this.analyzeArticleSentiment(newsItem);
          sentimentItems.push(sentimentResult);
          
          // Track sentiment distribution
          sentimentCounts[sentimentResult.sentiment.toLowerCase() as keyof typeof sentimentCounts]++;
          sentimentScores.push(sentimentResult.score);
        } catch (error) {
          console.warn(`Failed to analyze sentiment for news item ${newsItem.id}:`, error);
          // Add neutral sentiment as fallback
          const fallbackItem: NewsSentimentItem = {
            newsId: newsItem.id,
            title: newsItem.title,
            sentiment: "NEUTRAL",
            score: 0.5,
            notes: "Sentiment analysis failed, defaulting to neutral",
            sentenceLevel: [],
          };
          sentimentItems.push(fallbackItem);
          sentimentCounts.neutral++;
          sentimentScores.push(0.5);
        }
      }

      // Calculate aggregate sentiment
      const totalItems = sentimentItems.length;
      const aggregate: SentimentAggregate = {
        positive: totalItems > 0 ? sentimentCounts.positive / totalItems : 0,
        negative: totalItems > 0 ? sentimentCounts.negative / totalItems : 0,
        neutral: totalItems > 0 ? sentimentCounts.neutral / totalItems : 0,
        weightedScore: this.calculateWeightedScore(sentimentItems),
      };

      const response: NewsSentimentsResponse = {
        ticker: ticker.toUpperCase(),
        analysisDate: new Date().toISOString(),
        items: sentimentItems,
        aggregate,
      };

      console.log(`✅ Agent B - Analyzed ${sentimentItems.length} articles`);
      return response;
    } catch (error) {
      console.error("❌ Agent B - Error analyzing sentiments:", error);
      // Return neutral response on error
      return {
        ticker: ticker.toUpperCase(),
        analysisDate: new Date().toISOString(),
        items: [],
        aggregate: {
          positive: 0,
          negative: 0,
          neutral: 1,
          weightedScore: 0,
        },
      };
    }
  }

  private async analyzeArticleSentiment(newsItem: NewsItem): Promise<NewsSentimentItem> {
    try {
      // Use HuggingFace API if available
      if (this.HUGGINGFACE_API_KEY) {
        return await this.analyzeWithHuggingFace(newsItem);
      } else {
        // Fallback to simple lexical analysis
        return this.analyzeWithLexical(newsItem);
      }
    } catch (error) {
      console.warn(`Sentiment analysis failed for ${newsItem.id}, using fallback`);
      return this.analyzeWithLexical(newsItem);
    }
  }

  private async analyzeWithHuggingFace(newsItem: NewsItem): Promise<NewsSentimentItem> {
    const text = `${newsItem.title} ${newsItem.snippet}`;
    console.log(`🤖 Analyzing sentiment with HuggingFace: "${newsItem.title.substring(0, 50)}..."`);
    
    // Try primary model first
    try {
      const response = await axios.post(
        `${this.HUGGINGFACE_BASE_URL}/cardiffnlp/twitter-roberta-base-sentiment-latest`,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log(`✅ HuggingFace response received for: ${newsItem.title.substring(0, 30)}...`);
      
      const results = response.data[0];
      const topResult = results.reduce((max: any, current: any) => 
        current.score > max.score ? current : max
      );

      const sentiment = this.mapHuggingFaceLabel(topResult.label);
      const score = topResult.score;

      console.log(`📊 Sentiment result: ${sentiment} (${(score * 100).toFixed(1)}% confidence)`);

      return {
        newsId: newsItem.id,
        title: newsItem.title,
        sentiment,
        score,
        notes: `HuggingFace analysis: ${topResult.label} (${(score * 100).toFixed(1)}% confidence)`,
        sentenceLevel: this.analyzeSentenceLevel(text),
      };
    } catch (error: any) {
      console.warn("⚠️ Primary HuggingFace model failed, trying fallback model:", {
        error: error.message,
        status: error.response?.status
      });
      
      // Try fallback model
      try {
        const response = await axios.post(
          `${this.HUGGINGFACE_BASE_URL}/nlptown/bert-base-multilingual-uncased-sentiment`,
          { inputs: text },
          {
            headers: {
              Authorization: `Bearer ${this.HUGGINGFACE_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        console.log(`✅ Fallback HuggingFace model response received`);
        
        const results = response.data[0];
        const topResult = results.reduce((max: any, current: any) => 
          current.score > max.score ? current : max
        );

        const sentiment = this.mapHuggingFaceLabelFallback(topResult.label);
        const score = topResult.score;

        console.log(`📊 Fallback sentiment result: ${sentiment} (${(score * 100).toFixed(1)}% confidence)`);

        return {
          newsId: newsItem.id,
          title: newsItem.title,
          sentiment,
          score,
          notes: `HuggingFace fallback analysis: ${topResult.label} (${(score * 100).toFixed(1)}% confidence)`,
          sentenceLevel: this.analyzeSentenceLevel(text),
        };
      } catch (fallbackError: any) {
        console.warn("⚠️ Both HuggingFace models failed, using lexical fallback:", {
          primaryError: error.message,
          fallbackError: fallbackError.message
        });
        return this.analyzeWithLexical(newsItem);
      }
    }
  }

  private analyzeWithLexical(newsItem: NewsItem): NewsSentimentItem {
    const text = `${newsItem.title} ${newsItem.snippet}`.toLowerCase();
    
    // Simple lexical sentiment analysis
    const positiveWords = [
      "good", "great", "excellent", "positive", "strong", "up", "gain", "profit",
      "growth", "success", "win", "beat", "exceed", "surge", "rally", "boom"
    ];
    
    const negativeWords = [
      "bad", "terrible", "negative", "weak", "down", "loss", "decline", "fall",
      "crash", "drop", "miss", "disappoint", "concern", "worry", "risk", "threat"
    ];

    const positiveCount = positiveWords.reduce((count, word) => 
      count + (text.includes(word) ? 1 : 0), 0
    );
    
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (text.includes(word) ? 1 : 0), 0
    );

    let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
    let score: number;

    if (positiveCount > negativeCount) {
      sentiment = "POSITIVE";
      score = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = "NEGATIVE";
      score = Math.min(0.9, 0.5 + (negativeCount - positiveCount) * 0.1);
    } else {
      sentiment = "NEUTRAL";
      score = 0.5;
    }

    return {
      newsId: newsItem.id,
      title: newsItem.title,
      sentiment,
      score,
      notes: `Lexical analysis: ${positiveCount} positive, ${negativeCount} negative indicators`,
      sentenceLevel: this.analyzeSentenceLevel(text),
    };
  }

  private analyzeSentenceLevel(text: string): Array<{ text: string; sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"; score: number }> {
    // Simple sentence-level analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const results = [];

    for (const sentence of sentences.slice(0, 3)) { // Limit to first 3 sentences
      const trimmed = sentence.trim();
      if (trimmed.length < 10) continue;

      const positiveWords = ["good", "great", "excellent", "positive", "strong", "up", "gain"];
      const negativeWords = ["bad", "terrible", "negative", "weak", "down", "loss", "decline"];

      const positiveCount = positiveWords.reduce((count, word) => 
        count + (trimmed.toLowerCase().includes(word) ? 1 : 0), 0
      );
      
      const negativeCount = negativeWords.reduce((count, word) => 
        count + (trimmed.toLowerCase().includes(word) ? 1 : 0), 0
      );

      let sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
      let score: number;

      if (positiveCount > negativeCount) {
        sentiment = "POSITIVE";
        score = Math.min(0.9, 0.5 + positiveCount * 0.1);
      } else if (negativeCount > positiveCount) {
        sentiment = "NEGATIVE";
        score = Math.min(0.9, 0.5 + negativeCount * 0.1);
      } else {
        sentiment = "NEUTRAL";
        score = 0.5;
      }

      results.push({ text: trimmed, sentiment, score });
    }

    return results;
  }

  private mapHuggingFaceLabel(label: string): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
    const labelMap: Record<string, "POSITIVE" | "NEGATIVE" | "NEUTRAL"> = {
      "LABEL_2": "POSITIVE",
      "LABEL_0": "NEGATIVE", 
      "LABEL_1": "NEUTRAL",
      "POSITIVE": "POSITIVE",
      "NEGATIVE": "NEGATIVE",
      "NEUTRAL": "NEUTRAL",
    };
    
    return labelMap[label] || "NEUTRAL";
  }

  private mapHuggingFaceLabelFallback(label: string): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
    const labelMap: Record<string, "POSITIVE" | "NEGATIVE" | "NEUTRAL"> = {
      "5 stars": "POSITIVE",
      "4 stars": "POSITIVE", 
      "3 stars": "NEUTRAL",
      "2 stars": "NEGATIVE",
      "1 star": "NEGATIVE",
      "POSITIVE": "POSITIVE",
      "NEGATIVE": "NEGATIVE",
      "NEUTRAL": "NEUTRAL",
    };
    
    return labelMap[label] || "NEUTRAL";
  }

  private calculateWeightedScore(sentimentItems: NewsSentimentItem[]): number {
    if (sentimentItems.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const item of sentimentItems) {
      // Weight by recency (newer articles have higher weight)
      const daysSincePublished = (Date.now() - new Date(item.newsId.split('_')[0]).getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0.1, 1 - (daysSincePublished / 30)); // Decay over 30 days
      
      let sentimentValue = 0;
      if (item.sentiment === "POSITIVE") sentimentValue = item.score;
      else if (item.sentiment === "NEGATIVE") sentimentValue = -item.score;
      // NEUTRAL contributes 0

      weightedSum += sentimentValue * recencyWeight;
      totalWeight += recencyWeight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}

export default new AgentBSentimentAnalyzerService();


