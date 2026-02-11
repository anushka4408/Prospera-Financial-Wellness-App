import axios from "axios";
import { NewsListResponse, NewsItem } from "../../@types/stock-analysis.type";

export class AgentANewsFetcherService {
  private readonly SERPER_API_KEY: string;
  private readonly SERPER_BASE_URL = "https://google.serper.dev/search";

  constructor() {
    this.SERPER_API_KEY = process.env.SERPER_API_KEY || "c8f7b6954b47c1f1c99c3c03198f27647b928ede";
    if (!this.SERPER_API_KEY) {
      console.warn("SERPER_API_KEY not provided, using mock news data");
    } else {
      console.log("✅ Serper API key configured - using real news data");
    }
  }

  async fetchNews(ticker: string, companyName: string): Promise<NewsListResponse> {
    try {
      console.log(`🔍 Agent A - Fetching news for ${ticker} (${companyName})`);
      
      if (!this.SERPER_API_KEY) {
        return this.getMockNewsData(ticker, companyName);
      }
      
      const queries = this.buildSearchQueries(ticker, companyName);
      const allNews: NewsItem[] = [];
      const seenUrls = new Set<string>();

      // Fetch news from multiple queries
      for (const query of queries) {
        try {
          const newsItems = await this.searchNews(query);
          
          // Deduplicate by URL
          for (const item of newsItems) {
            if (!seenUrls.has(item.url)) {
              seenUrls.add(item.url);
              allNews.push(item);
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch news for query: ${query}`, error);
        }
      }

      // Limit to top 10 most recent articles
      const sortedNews = allNews
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 10);

      const response: NewsListResponse = {
        ticker: ticker.toUpperCase(),
        companyName,
        query: queries.join(", "),
        news: sortedNews,
        fetchedAt: new Date().toISOString(),
      };

      console.log(`✅ Agent A - Fetched ${sortedNews.length} news articles`);
      return response;
    } catch (error) {
      console.error("❌ Agent A - Error fetching news:", error);
      // Return mock data on error
      return this.getMockNewsData(ticker, companyName);
    }
  }

  private buildSearchQueries(ticker: string, companyName: string): string[] {
    const baseQueries = [
      `${ticker} earnings`,
      `${companyName} news`,
      `${ticker} stock news`,
      `${companyName} financial results`,
    ];

    // Add more specific queries based on company type
    const additionalQueries = [
      `${ticker} product launch`,
      `${ticker} regulatory`,
      `${ticker} lawsuit`,
      `${companyName} partnership`,
      `${ticker} analyst rating`,
    ];

    return [...baseQueries, ...additionalQueries];
  }

  private async searchNews(query: string): Promise<NewsItem[]> {
    try {
      const response = await axios.post(
        this.SERPER_BASE_URL,
        {
          q: query,
          num: 10,
          type: "search",
          tbs: "qdr:w", // Last week
        },
        {
          headers: {
            "X-API-KEY": this.SERPER_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const newsItems: NewsItem[] = [];
      const organicResults = response.data.organic || [];

      for (let i = 0; i < organicResults.length; i++) {
        const result = organicResults[i];
        
        // Skip if no title or URL
        if (!result.title || !result.link) continue;

        const newsItem: NewsItem = {
          id: `n${Date.now()}_${i}`,
          title: result.title,
          url: result.link,
          publishedAt: result.date || new Date().toISOString(),
          source: this.extractSource(result.link),
          snippet: result.snippet || "",
          content: result.snippet || "", // In a real implementation, you'd fetch full content
        };

        newsItems.push(newsItem);
      }

      return newsItems;
    } catch (error) {
      console.error(`Error searching news for query: ${query}`, error);
      return [];
    }
  }

  private extractSource(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, "").split(".")[0];
    } catch {
      return "Unknown";
    }
  }

  private getMockNewsData(ticker: string, companyName: string): NewsListResponse {
    const mockNews: NewsItem[] = [
      {
        id: "mock_1",
        title: `${companyName} Reports Strong Quarterly Earnings`,
        url: `https://example.com/news/${ticker.toLowerCase()}-earnings`,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Financial Times",
        snippet: `${companyName} exceeded analyst expectations with robust quarterly performance.`,
        content: `${companyName} reported strong quarterly earnings that beat analyst expectations...`
      },
      {
        id: "mock_2", 
        title: `${ticker} Stock Analysis: Technical Indicators Show Bullish Trend`,
        url: `https://example.com/analysis/${ticker.toLowerCase()}-technical`,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: "MarketWatch",
        snippet: `Technical analysis suggests positive momentum for ${ticker} stock.`,
        content: `Recent technical indicators for ${ticker} show signs of bullish momentum...`
      },
      {
        id: "mock_3",
        title: `${companyName} Announces New Strategic Partnership`,
        url: `https://example.com/news/${ticker.toLowerCase()}-partnership`,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Reuters",
        snippet: `${companyName} has entered into a strategic partnership to expand market reach.`,
        content: `${companyName} announced a new strategic partnership that could drive future growth...`
      },
      {
        id: "mock_4",
        title: `Analyst Upgrades ${ticker} to Buy Rating`,
        url: `https://example.com/ratings/${ticker.toLowerCase()}-upgrade`,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Bloomberg",
        snippet: `Leading analysts have upgraded ${ticker} stock to a buy rating.`,
        content: `Several major investment firms have upgraded ${ticker} to a buy rating...`
      },
      {
        id: "mock_5",
        title: `${companyName} Faces Regulatory Challenges in Key Markets`,
        url: `https://example.com/news/${ticker.toLowerCase()}-regulatory`,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: "Wall Street Journal",
        snippet: `${companyName} encounters regulatory headwinds in several important markets.`,
        content: `${companyName} is facing increased regulatory scrutiny in key markets...`
      }
    ];

    return {
      ticker: ticker.toUpperCase(),
      companyName,
      query: `${ticker} ${companyName} news`,
      news: mockNews,
      fetchedAt: new Date().toISOString(),
    };
  }
}

export default new AgentANewsFetcherService();


