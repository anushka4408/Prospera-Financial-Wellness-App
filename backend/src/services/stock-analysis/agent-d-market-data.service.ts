import axios from "axios";
import { MarketDataResponse, MarketDataPoint, TechnicalIndicators } from "../../@types/stock-analysis.type";

export class AgentDMarketDataService {
  private readonly ALPHA_VANTAGE_API_KEY: string;
  private readonly ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

  constructor() {
    this.ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "DZU1720UG77KKE2R";
    if (!this.ALPHA_VANTAGE_API_KEY) {
      console.warn("ALPHA_VANTAGE_API_KEY not provided, using mock data");
    } else {
      console.log("✅ Alpha Vantage API key configured - using real market data");
    }
  }

  async fetchMarketData(ticker: string): Promise<MarketDataResponse> {
    try {
      console.log(`🔍 Agent D - Fetching market data for ${ticker}`);
      
      if (!this.ALPHA_VANTAGE_API_KEY) {
        return this.getMockMarketData(ticker);
      }

      // Fetch daily time series data
      const timeSeriesData = await this.fetchTimeSeriesData(ticker);
      
      // Fetch technical indicators
      const indicators = await this.fetchTechnicalIndicators(ticker);
      
      // Calculate latest price and change
      const latestPrice = timeSeriesData.latestPrice;
      const previousPrice = timeSeriesData.previousPrice;
      const changePercent24h = previousPrice > 0 
        ? ((latestPrice - previousPrice) / previousPrice) * 100 
        : 0;

      const response: MarketDataResponse = {
        ticker: ticker.toUpperCase(),
        fetchedAt: new Date().toISOString(),
        latestPrice,
        changePercent24h,
        history: timeSeriesData.history,
        indicators,
      };

      console.log(`✅ Agent D - Fetched market data for ${ticker}`);
      return response;
    } catch (error) {
      console.error("❌ Agent D - Error fetching market data:", error);
      // Return mock data on error
      return this.getMockMarketData(ticker);
    }
  }

  private async fetchTimeSeriesData(ticker: string): Promise<{
    latestPrice: number;
    previousPrice: number;
    history: MarketDataPoint[];
  }> {
    try {
      const response = await axios.get(this.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: "TIME_SERIES_DAILY",
          symbol: ticker,
          apikey: this.ALPHA_VANTAGE_API_KEY,
          outputsize: "compact",
        },
        timeout: 10000,
      });

      const timeSeries = response.data["Time Series (Daily)"];
      if (!timeSeries) {
        throw new Error("No time series data found");
      }

      const dates = Object.keys(timeSeries).sort().reverse();
      const history: MarketDataPoint[] = [];
      
      let latestPrice = 0;
      let previousPrice = 0;

      for (let i = 0; i < Math.min(dates.length, 90); i++) {
        const date = dates[i];
        const data = timeSeries[date];
        
        const dataPoint: MarketDataPoint = {
          date,
          open: parseFloat(data["1. open"]),
          high: parseFloat(data["2. high"]),
          low: parseFloat(data["3. low"]),
          close: parseFloat(data["4. close"]),
          volume: parseInt(data["5. volume"]),
        };

        history.push(dataPoint);

        if (i === 0) latestPrice = dataPoint.close;
        if (i === 1) previousPrice = dataPoint.close;
      }

      return { latestPrice, previousPrice, history };
    } catch (error) {
      console.warn("Failed to fetch time series data, using mock data");
      return this.getMockTimeSeriesData();
    }
  }

  private async fetchTechnicalIndicators(ticker: string): Promise<TechnicalIndicators> {
    try {
      // Fetch SMA 50
      const sma50Response = await axios.get(this.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: "SMA",
          symbol: ticker,
          interval: "daily",
          time_period: 50,
          series_type: "close",
          apikey: this.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 5000,
      });

      // Fetch SMA 200
      const sma200Response = await axios.get(this.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: "SMA",
          symbol: ticker,
          interval: "daily",
          time_period: 200,
          series_type: "close",
          apikey: this.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 5000,
      });

      // Fetch RSI
      const rsiResponse = await axios.get(this.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: "RSI",
          symbol: ticker,
          interval: "daily",
          time_period: 14,
          series_type: "close",
          apikey: this.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 5000,
      });

      // Fetch MACD
      const macdResponse = await axios.get(this.ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: "MACD",
          symbol: ticker,
          interval: "daily",
          series_type: "close",
          apikey: this.ALPHA_VANTAGE_API_KEY,
        },
        timeout: 5000,
      });

      const sma50Data = sma50Response.data["Technical Analysis: SMA"];
      const sma200Data = sma200Response.data["Technical Analysis: SMA"];
      const rsiData = rsiResponse.data["Technical Analysis: RSI"];
      const macdData = macdResponse.data["Technical Analysis: MACD"];

      const latestDate = Object.keys(sma50Data || {})[0];

      return {
        SMA50: latestDate ? parseFloat(sma50Data[latestDate]["SMA"]) : 0,
        SMA200: latestDate ? parseFloat(sma200Data[latestDate]["SMA"]) : 0,
        RSI14: latestDate ? parseFloat(rsiData[latestDate]["RSI"]) : 50,
        MACD: latestDate ? {
          macd: parseFloat(macdData[latestDate]["MACD"]),
          signal: parseFloat(macdData[latestDate]["MACD_Signal"]),
          hist: parseFloat(macdData[latestDate]["MACD_Hist"]),
        } : { macd: 0, signal: 0, hist: 0 },
      };
    } catch (error) {
      console.warn("Failed to fetch technical indicators, using mock data");
      return this.getMockIndicators();
    }
  }

  private getMockMarketData(ticker: string): MarketDataResponse {
    const mockHistory = this.getMockTimeSeriesData();
    const mockIndicators = this.getMockIndicators();

    return {
      ticker: ticker.toUpperCase(),
      fetchedAt: new Date().toISOString(),
      latestPrice: mockHistory.latestPrice,
      changePercent24h: -0.5 + Math.random() * 1, // Random change between -0.5% and 0.5%
      history: mockHistory.history,
      indicators: mockIndicators,
    };
  }

  private getMockTimeSeriesData(): { latestPrice: number; previousPrice: number; history: MarketDataPoint[] } {
    const history: MarketDataPoint[] = [];
    const basePrice = 150 + Math.random() * 100; // Random base price between 150-250
    let currentPrice = basePrice;

    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some random walk to price with trend
      const trend = Math.sin(i / 10) * 0.02; // Add some cyclical trend
      const volatility = (Math.random() - 0.5) * 0.03; // ±1.5% daily volatility
      const change = trend + volatility;
      currentPrice *= (1 + change);

      // Ensure price doesn't go negative
      currentPrice = Math.max(currentPrice, basePrice * 0.5);

      const open = currentPrice * (0.995 + Math.random() * 0.01);
      const high = Math.max(open, currentPrice) * (1.001 + Math.random() * 0.01);
      const low = Math.min(open, currentPrice) * (0.999 - Math.random() * 0.01);
      const close = currentPrice;
      const volume = Math.floor(Math.random() * 2000000) + 500000;

      history.push({
        date: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
      });
    }

    return {
      latestPrice: Math.round(currentPrice * 100) / 100,
      previousPrice: Math.round(history[history.length - 2]?.close || currentPrice * 100) / 100,
      history,
    };
  }

  private getMockIndicators(): TechnicalIndicators {
    const basePrice = 150 + Math.random() * 50;
    const sma50 = basePrice * (0.95 + Math.random() * 0.1); // SMA50 within 5% of price
    const sma200 = basePrice * (0.9 + Math.random() * 0.15); // SMA200 within 10% of price
    const rsi = 30 + Math.random() * 40; // RSI between 30-70
    const macdValue = -1 + Math.random() * 2;
    const signalValue = macdValue * (0.8 + Math.random() * 0.4);
    
    return {
      SMA50: Math.round(sma50 * 100) / 100,
      SMA200: Math.round(sma200 * 100) / 100,
      RSI14: Math.round(rsi * 10) / 10,
      MACD: {
        macd: Math.round(macdValue * 1000) / 1000,
        signal: Math.round(signalValue * 1000) / 1000,
        hist: Math.round((macdValue - signalValue) * 1000) / 1000,
      },
    };
  }
}

export default new AgentDMarketDataService();


