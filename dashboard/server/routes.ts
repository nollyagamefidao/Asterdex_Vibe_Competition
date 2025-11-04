import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AsterdexClient } from "./asterdex-client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TRACKED_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'DOGEUSDT', 'XRPUSDT', 'WLDUSDT', 'ASTERUSDT'];

// Path to bot's dashboard-data directory (in CryptoCompass root)
const DASHBOARD_DATA_DIR = path.join(__dirname, '../dashboard-data');

export async function registerRoutes(app: Express): Promise<Server> {
  const apiKey = process.env.ASTERDEX_API_KEY;
  const secretKey = process.env.ASTERDEX_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn('⚠️  Asterdex API credentials not found. Dashboard will use mock data.');
  }

  const asterdex = apiKey && secretKey ? new AsterdexClient(apiKey, secretKey) : null;

  app.get('/api/prices', async (req, res) => {
    try {
      if (!asterdex) {
        return res.status(503).json({ 
          error: 'Asterdex API not configured',
          message: 'API credentials are required'
        });
      }

      const pricePromises = TRACKED_SYMBOLS.map(async (symbol) => {
        try {
          const [tickerRes, ticker24hRes] = await Promise.all([
            asterdex.getTicker(symbol),
            asterdex.get24hrTicker(symbol)
          ]);

          const price = tickerRes.data?.price || 0;
          const priceChangePercent = ticker24hRes.data?.priceChangePercent || 0;

          const coinSymbol = symbol.replace('USDT', '');
          const coinNames: Record<string, string> = {
            'BTC': 'Bitcoin',
            'ETH': 'Ethereum',
            'SOL': 'Solana',
            'BNB': 'BNB',
            'DOGE': 'Dogecoin',
            'XRP': 'Ripple',
            'WLD': 'Worldcoin',
            'ASTER': 'Asterdex'
          };

          return {
            symbol: coinSymbol,
            name: coinNames[coinSymbol] || coinSymbol,
            price: parseFloat(price),
            change24h: parseFloat(priceChangePercent)
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      });

      const prices = (await Promise.all(pricePromises)).filter(p => p !== null);
      res.json(prices);
    } catch (error) {
      console.error('Error fetching prices:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  // Fetch live prices for specific symbols (for positions)
  app.get('/api/live-prices', async (req, res) => {
    try {
      if (!asterdex) {
        return res.status(503).json({ 
          error: 'Asterdex API not configured',
          message: 'API credentials are required'
        });
      }

      const symbols = req.query.symbols as string;
      if (!symbols) {
        return res.status(400).json({ error: 'symbols parameter is required' });
      }

      const symbolList = symbols.split(',').filter(s => s.trim());
      
      const pricePromises = symbolList.map(async (symbol) => {
        try {
          const tickerRes = await asterdex.getTicker(symbol);
          const price = tickerRes.data?.price || 0;
          
          return {
            symbol: symbol,
            price: parseFloat(price)
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return null;
        }
      });

      const prices = (await Promise.all(pricePromises)).filter(p => p !== null);
      
      // Return as a map for easy lookup
      const priceMap: Record<string, number> = {};
      prices.forEach(p => {
        if (p) priceMap[p.symbol] = p.price;
      });
      
      res.json(priceMap);
    } catch (error) {
      console.error('Error fetching live prices:', error);
      res.status(500).json({ error: 'Failed to fetch live prices' });
    }
  });

  app.get('/api/positions', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'positions.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json([]);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(data);
    } catch (error) {
      console.error('Error reading positions:', error);
      res.status(500).json({ error: 'Failed to load positions' });
    }
  });

  app.get('/api/account', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'account.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json({ 
          totalUnrealizedPnL: 0, 
          availableCash: 0,
          totalWalletBalance: 0,
          totalMarginBalance: 0
        });
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(data);
    } catch (error) {
      console.error('Error reading account:', error);
      res.status(500).json({ error: 'Failed to load account info' });
    }
  });

  app.get('/api/trades', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'trades.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json([]);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Multi-criteria sorting for stable, chronological order
      const sortedTrades = data.sort((a: any, b: any) => {
        // 1. Primary: Most recently closed first
        const closedDiff = (b.closedAt || 0) - (a.closedAt || 0);
        if (closedDiff !== 0) return closedDiff;
        
        // 2. Secondary: If closed at same time, most recently opened first
        const openedDiff = (b.openedAt || 0) - (a.openedAt || 0);
        if (openedDiff !== 0) return openedDiff;
        
        // 3. Tertiary: Alphabetical by symbol for stable sort
        return (a.symbol || '').localeCompare(b.symbol || '');
      });
      
      res.json(sortedTrades);
    } catch (error) {
      console.error('Error reading trades:', error);
      res.status(500).json({ error: 'Failed to load trades' });
    }
  });

  app.get('/api/chat-messages', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'ai-chat.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json([]);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Sort by timestamp descending (most recent first)
      const sortedMessages = data.sort((a: any, b: any) => b.timestamp - a.timestamp);
      
      res.json(sortedMessages);
    } catch (error) {
      console.error('Error reading AI chat:', error);
      res.status(500).json({ error: 'Failed to load AI chat logs' });
    }
  });

  // AI Recommendations endpoint
  app.get('/api/ai-recommendation', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'ai-recommendation.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json({ 
          message: 'Waiting for trading signals...',
          timestamp: Date.now()
        });
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      res.json(data);
    } catch (error) {
      console.error('Error reading AI recommendation:', error);
      res.status(500).json({ error: 'Failed to load AI recommendation' });
    }
  });

  // DeepSeek AI Responses endpoint
  app.get('/api/responses', async (req, res) => {
    try {
      const filePath = path.join(DASHBOARD_DATA_DIR, 'responses.json');
      
      if (!fs.existsSync(filePath)) {
        return res.json([]);
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Sort by timestamp descending (most recent first)
      const sortedResponses = Array.isArray(data) 
        ? data.sort((a: any, b: any) => b.timestamp - a.timestamp)
        : [];
      
      res.json(sortedResponses);
    } catch (error) {
      console.error('Error reading AI responses:', error);
      res.status(500).json({ error: 'Failed to load AI responses' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
