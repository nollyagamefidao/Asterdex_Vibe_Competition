/**
 * ADVANCED TRADING BOT - MULTI-POSITION WITH TRAILING STOP LOSS + BREAK-EVEN SL + TOKEN SCANNER
 * INTEGRATED: Token Scanner for 50+ tokens with AI-powered opportunity detection
 * 
 * FIXED: Complete precision rules for all scanner tokens + notional value validation
 */

const https = require('https');
const axios = require('axios');
const os = require('os'); // ✅ OS detection and system info
const AsterDexSimpleClient = require('./asterdex-simple-client');

// ✅ Twitter/X API Client
let TwitterApi;
try {
  TwitterApi = require('twitter-api-v2').TwitterApi;
} catch (e) {
  console.log('⚠️  twitter-api-v2 not installed. Run: npm install twitter-api-v2');
}

/**
 * Detect system information and apply optimizations
 * @returns {Object} System information and recommendations
 */
function detectAndOptimizeSystem() {
  // OS detection
  const platform = os.platform();
  let osType = 'Unknown';
  let isWindows = false;
  let isLinux = false;
  
  if (platform === 'win32') {
    osType = 'Windows';
    isWindows = true;
  } else if (platform === 'linux') {
    osType = 'Linux';
    isLinux = true;
  } else if (platform === 'darwin') {
    osType = 'macOS';
  }
  
  // System resources
  const cpuCount = os.cpus().length;
  const totalMemoryGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const freeMemoryGB = (os.freemem() / (1024 ** 3)).toFixed(2);
  const memoryUsagePercent = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1);
  
  // Node.js memory optimization
  const heapStats = process.memoryUsage();
  const heapUsedMB = (heapStats.heapUsed / (1024 ** 2)).toFixed(2);
  const heapTotalMB = (heapStats.heapTotal / (1024 ** 2)).toFixed(2);
  
  // Calculate optimal settings based on available resources
  const recommendedWorkers = Math.max(2, Math.min(cpuCount - 1, 8)); // Leave 1 core free, max 8
  const recommendedMaxMemoryMB = Math.floor(parseFloat(freeMemoryGB) * 1024 * 0.7); // Use 70% of free RAM
  
  // Apply Node.js optimizations
  if (global.gc) {
    // Garbage collection is exposed, we can call it manually if needed
    console.log('✅ Manual GC available (--expose-gc flag detected)');
  }
  
  return {
    platform,
    osType,
    isWindows,
    isLinux,
    cpuCount,
    totalMemoryGB,
    freeMemoryGB,
    memoryUsagePercent,
    heapUsedMB,
    heapTotalMB,
    recommendedWorkers,
    recommendedMaxMemoryMB,
    nodeVersion: process.version
  };
}

// ✅ Detect system at startup
const SYSTEM_INFO = detectAndOptimizeSystem();

const CONFIG = {
  apiKey: 'ASTERDEXAPIKEY',
  secretKey: 'ASYERDEXSECRETAPI',
  deepseekApiKey: 'YOUR-DEEPSEEK-API',
  deepseekModel: 'deepseek-chat',
  maxRetries: 3,
  
  // ✅ TWITTER/X API CONFIGURATION
  twitterEnabled: true, // Set to true to enable auto-tweets
  twitterApiKey: 'twitterApiKey',
  twitterApiSecret: 'twitterApiSecret',
  twitterAccessToken: 'twitterAccessToken',
  twitterAccessSecret: 'twitterAccessSecret',
  twitterOnlyProfits: false, // Only tweet profitable trades
  twitterMinProfit: 1.0, // Minimum profit % to tweet (if twitterOnlyProfits is true)
  
  tradingPairs: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'BNBUSDT', 'ASTERUSDT', 'WLDUSDT'],
  coinMapping: {
    'BTCUSDT': 'BTC', 'ETHUSDT': 'ETH', 'SOLUSDT': 'SOL', 'XRPUSDT': 'XRP',
    'DOGEUSDT': 'DOGE', 'BNBUSDT': 'BNB', 'ASTERUSDT': 'ASTER', 'WLDUSDT': 'WLD',
    // Extended tokens from scanner
    'AVAXUSDT': 'AVAX', 'ETCUSDT': 'ETC', 'APTUSDT': 'APT', 'GALAUSDT': 'GALA',
    'LINKUSDT': 'LINK', 'ADAUSDT': 'ADA', 'MATICUSDT': 'MATIC', 'DOTUSDT': 'DOT',
    'ATOMUSDT': 'ATOM', 'UNIUSDT': 'UNI', 'AAVEUSDT': 'AAVE', 'LTCUSDT': 'LTC',
    'NEARUSDT': 'NEAR', 'ICPUSDT': 'ICP', 'FILUSDT': 'FIL', 'ARBUSDT': 'ARB',
    'OPUSDT': 'OP', 'SUIUSDT': 'SUI', 'FETUSDT': 'FET', 'SHIBUSDT': 'SHIB',
    'CRVUSDT': 'CRV', 'MKRUSDT': 'MKR', 'COMPUSDT': 'COMP', 'SUSHIUSDT': 'SUSHI',
    'SNXUSDT': 'SNX', '1INCHUSDT': '1INCH', 'YFIUSDT': 'YFI', 'CAKEUSDT': 'CAKE',
    'LDOUSDT': 'LDO', 'AXSUSDT': 'AXS', 'SANDUSDT': 'SAND', 'MANAUSDT': 'MANA',
    'ENJUSDT': 'ENJ', 'IMXUSDT': 'IMX', 'AGIXUSDT': 'AGIX', 'OCEANGUSDT': 'OCEANG',
    'RNDRUSDT': 'RNDR', 'PEPEUSDT': 'PEPE', 'FLOKIUSDT': 'FLOKI', 'BONKUSDT': 'BONK',
    'FTMUSDT': 'FTM', 'GMXUSDT': 'GMX', 'ALGOUSDT': 'ALGO', 'HBARUSDT': 'HBAR',
    'VETUSDT': 'VET', 'THETAUSDT': 'THETA', 'EOSUSDT': 'EOS', 'TRXUSDT': 'TRX'
  },
  
  precisionRules: {
    'BTCUSDT': { quantity: 3, minQty: 0.001, price: 1 }, 
    'ETHUSDT': { quantity: 3, minQty: 0.001, price: 2 },
    'SOLUSDT': { quantity: 2, minQty: 0.01, price: 2 }, 
    'XRPUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'DOGEUSDT': { quantity: 0, minQty: 1, price: 5 }, 
    'BNBUSDT': { quantity: 2, minQty: 0.01, price: 1 },
    'ASTERUSDT': { quantity: 1, minQty: 0.1, price: 4 }, 
    'WLDUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    // Extended tokens from scanner - COMPLETE PRECISION RULES
    'AVAXUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'ETCUSDT': { quantity: 1, minQty: 0.1, price: 2 },
    'APTUSDT': { quantity: 2, minQty: 0.01, price: 3 },
    'GALAUSDT': { quantity: 0, minQty: 10, price: 6 }, // FIXED: Increased minQty from 1 to 10
    'LINKUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'ADAUSDT': { quantity: 0, minQty: 1, price: 4 },
    'MATICUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'DOTUSDT': { quantity: 1, minQty: 0.1, price: 3 }, // FIXED: Precision error, changed from 2 to 1
    'ATOMUSDT': { quantity: 2, minQty: 0.01, price: 3 },
    'UNIUSDT': { quantity: 0, minQty: 1, price: 3 },
    'AAVEUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'CRVUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'MKRUSDT': { quantity: 3, minQty: 0.001, price: 1 },
    'COMPUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'SUSHIUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'SNXUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    '1INCHUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'YFIUSDT': { quantity: 3, minQty: 0.001, price: 1 },
    'CAKEUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'ARBUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'OPUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'LDOUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'SUIUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'AXSUSDT': { quantity: 2, minQty: 0.01, price: 3 },
    'SANDUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'MANAUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'ENJUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'IMXUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'FETUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'AGIXUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'OCEANGUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'RNDRUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'SHIBUSDT': { quantity: 0, minQty: 1000, price: 8 },
    'PEPEUSDT': { quantity: 0, minQty: 1000, price: 8 },
    'FLOKIUSDT': { quantity: 0, minQty: 1000, price: 8 },
    'BONKUSDT': { quantity: 0, minQty: 1000, price: 8 },
    'FTMUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'GMXUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'NEARUSDT': { quantity: 0, minQty: 1, price: 4 },
    'ICPUSDT': { quantity: 2, minQty: 0.01, price: 3 },
    'FILUSDT': { quantity: 2, minQty: 0.01, price: 3 },
    'LTCUSDT': { quantity: 2, minQty: 0.01, price: 2 },
    'ALGOUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'HBARUSDT': { quantity: 1, minQty: 0.1, price: 5 },
    'VETUSDT': { quantity: 0, minQty: 10, price: 6 },
    'THETAUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'EOSUSDT': { quantity: 1, minQty: 0.1, price: 4 },
    'TRXUSDT': { quantity: 0, minQty: 100, price: 6 } // FIXED: Increased minQty from 10 to 100
  },
  
  fees: { maker: 0.0002, taker: 0.0005, totalRoundTrip: 0.001 },
  riskPerTrade: 0.02,
  minConfidence: 0.68,
  maxLeverage: 15,
  highConfidenceMinLeverage: 10, // NEW: Minimum leverage for high confidence (15x)
  highConfidenceMaxLeverage: 18, // NEW: Maximum leverage for confidence >= 80% (20x, not 25x)
  highConfidenceThreshold: 0.85, // NEW: Confidence threshold for higher leverage
  highConfidenceBalanceUsage: 0.25, // NEW: Use up to 80% of balance for high-confidence trades
  minNotionalValue: 5.5, // FIXED: Exchange minimum is 5.0, using 5.5 for safety margin
  maxFeeToNotionalRatio: 0.02,
  loopInterval: 60000, // 1 minute (60 seconds) - Used when NO positions
  loopIntervalWithPositions: 15000, // 15 seconds - Used when positions are OPEN
  minPositionHoldTime: 600000, // 10 minutes
  maxPositionHoldTime: 14400000, // 4 hours - Auto close if in profit and not hit TP
  minRotationHoldTime: 3600000, // ✅ NEW: 60 minutes - Minimum hold time before position can be closed for rotation
  positionRotationEnabled: false,     // Enable/disable position rotation feature
  rotationMaxProfitThreshold: 5.0,    // Maximum profit % to consider for rotation (≤5% profit)
  rotationMinScoreRequired: 99,       // Minimum scanner score required for rotation (Score ≥99)
  
  // Multi-position settings
  maxPositions: 10,
  minBalancePerPosition: 3.0,
  
  // SCALPER MODE - Quick pullback trades with higher leverage
  scalperEnabled: true,
  scalperMaxLeverage: 15, // Maximum 25x for scalper trades
  scalperMinPullback: 4.0, // Minimum 2% pullback from recent high
  scalperMaxPullback: 9.0, // Maximum 6% pullback (deeper = reversal risk)
  scalperProfitTarget: 4.5, // Quick 1.5% profit target
  scalperStopLoss: 3.0, // Tight 1.0% stop loss
  scalperMinRSI: 70, // Enter when RSI oversold
  scalperMaxRSI: 80, // Don't enter if RSI too high
  scalperMaxPositions: 3, // Maximum 3 scalper positions at once
  scalperRequire4hCheck: true, // Must pass 4H timeframe check
  scalperSkipDeepSeekValidation: true, // ✅ Skip DeepSeek validation for scalpers (saves tokens, faster entry)
  
  // Break-even stop-loss settings
  breakEvenEnabled: true,
  breakEvenProfitTrigger: 5.0,
  breakEvenTimeInProfit: 3600000,
  breakEvenMinProfitUSDT: 0.25, // ✅ Minimum profit in USDT before break-even activates (prevents moving SL for tiny profits)
  
  // Profit Protection - Lock partial gains when in profit but before TP
  profitProtectionEnabled: true,
  profitProtectionTrigger: 2.0, // Activate when 2% profit reached
  profitProtectionLockPercent: 50, // Lock 50% of current profit
  profitProtectionMinDistance: 1.0, // Only move SL if current SL is >1% away
  
  // Trailing stop-loss
  trailingStopEnabled: true,
  trailingStopTrigger: 0.05,     // Activate at 5% profit
  trailingStopProfitLock: 0.80,  // Lock 80% of profit
  
  // Dynamic TP updates
  dynamicTPEnabled: true,
  tpUpdateInterval: 2,
  
  // TOKEN SCANNER settings
  scannerEnabled: true,
  scannerInterval: 1, // Run scanner every 1 loop (3 minutes)
  scannerTopResults: 5, // Show top 5 opportunities
  
  colors: {
    reset: '\x1b[0m', bright: '\x1b[1m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m'
  }
};

// ============================================
// DASHBOARD DATA EXPORT MODULE
// ============================================
const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, 'dashboard-data');

// Create dashboard-data directory if it doesn't exist
if (!fs.existsSync(DASHBOARD_DIR)) {
  fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
  console.log('✅ Created dashboard-data directory');
}

// ✅ Random motivational phrases for position opening
const OPENING_PHRASES = [
  "🚀 TO THE MOON!",
  "💎 DIAMOND HANDS ACTIVATED!",
  "🔥 LET'S GOOO!",
  "⚡ POWER MOVE!",
  "🎯 LOCKED AND LOADED!",
  "💪 BIG BRAIN TRADE!",
  "🌟 FEELING BULLISH!",
  "🎰 ALL IN BABY!",
  "🏆 WINNING PLAY!",
  "💰 MONEY PRINTER GO BRRR!",
  "🦅 EAGLE EYE ENTRY!",
  "🎪 SHOWTIME!",
  "⚔️ BATTLE MODE ON!",
  "🌊 RIDING THE WAVE!",
  "🎭 IT'S HAPPENING!",
  "🔮 CRYSTAL CLEAR SETUP!",
  "🎸 ROCK AND ROLL!",
  "🌈 RAINBOW PROFITS INCOMING!",
  "🦁 KING OF THE JUNGLE!",
  "⭐ STAR PLAYER ACTIVATED!",
  "🎯 SNIPER ENTRY!",
  "🚁 HELICOPTER MONEY!",
  "🎲 FEELING LUCKY!",
  "🏹 BULLSEYE!",
  "💥 BOOM! HERE WE GO!",
  "🐂 BULL RUN INITIATED!",
  "🐻 BEAR TRAP SPRUNG!",
  "🎊 PARTY TIME!",
  "🛸 SPACE MISSION LAUNCHED!",
  "⚡ LIGHTNING STRIKE!",
  "🌪️ TORNADO ENTRY!",
  "🎆 FIREWORKS ACTIVATED!",
  "🏁 RACE TO PROFITS!",
  "🎢 ROLLERCOASTER TIME!",
  "🦸 SUPERHERO MODE!",
  "🎤 DROP THE MIC!",
  "🌋 VOLCANO ERUPTION!",
  "🎯 PERFECT SHOT!",
  "🏅 GOLD MEDAL TRADE!",
  "🚂 GAIN TRAIN DEPARTING!"
];

// Helper function to get random phrase
function getRandomOpeningPhrase() {
  return OPENING_PHRASES[Math.floor(Math.random() * OPENING_PHRASES.length)];
}

class DashboardExporter {
  constructor() {
    this.aiDecisionLog = [];
    this.completedTradesLog = [];
    this.lastAIRecommendation = null; // ✅ NEW: Store latest AI recommendation
    this.deepseekResponsesLog = []; // ✅ NEW: Store DeepSeek prompts & responses
  }

  /**
   * Log AI decision for dashboard
   */
  logAIDecision(decision) {
    const logEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      type: decision.type || 'validation',
      coin: decision.coin,
      action: decision.action,
      confidence: decision.confidence || 0,
      reasoning: decision.reasoning || '',
      result: decision.result || 'pending',
      price: decision.price || 0,
      scannerScore: decision.scannerScore || 0
    };
    
    this.aiDecisionLog.push(logEntry);
    
    // Keep last 100 decisions
    if (this.aiDecisionLog.length > 100) {
      this.aiDecisionLog.shift();
    }
  }

  /**
   * Log DeepSeek prompt and response for dashboard
   */
  logDeepSeekConversation(prompt, response, parsedDecision = null, error = null) {
    const logEntry = {
      id: Date.now(),
      timestamp: Date.now(),
      date: new Date().toISOString(),
      
      // Prompt sent to DeepSeek
      prompt: {
        full: prompt,
        length: prompt.length,
        preview: prompt.substring(0, 500) + '...'
      },
      
      // Response received from DeepSeek
      response: {
        raw: response || error,
        parsed: parsedDecision,
        success: parsedDecision !== null && !error,
        error: error
      },
      
      // Extracted decision info (if available)
      decision: parsedDecision ? {
        action: parsedDecision.action,
        coin: parsedDecision.coin,
        confidence: parsedDecision.confidence,
        reasoning: parsedDecision.reasoning,
        leverage: parsedDecision.leverage || 0,
        quantity: parsedDecision.quantity || 0
      } : null
    };
    
    this.deepseekResponsesLog.push(logEntry);
    
    // Keep last 50 conversations (they can be large)
    if (this.deepseekResponsesLog.length > 50) {
      this.deepseekResponsesLog.shift();
    }
  }

  /**
   * Log completed trade for dashboard
   */
  logCompletedTrade(trade) {
    // Calculate entry and exit notional values
    const entryNotional = trade.entryPrice * trade.quantity;
    const exitNotional = trade.exitPrice * trade.quantity;
    
    // Calculate estimated trading fee (0.04% taker fee on both entry and exit)
    const entryFee = entryNotional * 0.0004;
    const exitFee = exitNotional * 0.0004;
    const totalFee = entryFee + exitFee;
    
    // Format holding time for display
    const minutes = Math.round(trade.holdTime || 0);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const holdingTime = hours > 0 
      ? `${hours}H ${remainingMinutes}M` 
      : `${remainingMinutes}M`;
    
    // Format date for display
    const now = new Date();
    const dateStr = `${(now.getMonth() + 1)}/${now.getDate()}, ${now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })}`;
    
    // Create trade entry with ALL fields the dashboard needs
    const tradeEntry = {
      // ✅ PRIMARY FIELDS (for dashboard table display)
      id: `trade-${Date.now()}`,
      symbol: trade.symbol,                                    // "BTCUSDT"
      side: trade.side.toLowerCase(),                          // "long" or "short"
      coin: trade.coin,                                        // "BTC"
      entryPrice: parseFloat(trade.entryPrice.toFixed(8)),   // $98200.0000
      exitPrice: parseFloat(trade.exitPrice.toFixed(8)),     // $98950.0000
      quantity: parseFloat(trade.quantity.toFixed(8)),        // 0.015
      pnl: parseFloat(trade.pnlUSDT.toFixed(2)),             // $11.25
      pnlPercent: parseFloat(trade.profitPercent.toFixed(2)), // +0.76%
      fee: parseFloat(totalFee.toFixed(2)),                   // $1.06
      leverage: trade.leverage + 'X',                          // "15X"
      
      // ✅ ADDITIONAL FIELDS (for TradeCard component)
      botName: "DeepSeek Chat V3.1",
      tradeType: trade.side.toUpperCase(),                     // "LONG" or "SHORT"
      token: trade.coin,                                       // "BTC"
      date: dateStr,                                           // "11/1, 2:30 PM"
      entryNotional: parseFloat(entryNotional.toFixed(2)),    // Entry value
      exitNotional: parseFloat(exitNotional.toFixed(2)),      // Exit value
      holdingTime: holdingTime,                                // "2H 45M"
      netPnL: parseFloat(trade.pnlUSDT.toFixed(2)),           // Same as pnl
      
      // ✅ METADATA FIELDS
      openedAt: trade.openedAt || (Date.now() - (trade.holdTime * 60000)),
      closedAt: Date.now(),
      durationMinutes: minutes,
      reason: trade.reason || 'Manual close',
      isProfit: trade.isProfit
    };
    
    this.completedTradesLog.push(tradeEntry);
    
    // Keep last 200 trades
    if (this.completedTradesLog.length > 200) {
      this.completedTradesLog.shift();
    }
  }

  /**
   * Export all dashboard data
   */
  exportData(positions, account, scannerResults = []) {
    try {
      // Export positions
      const positionsData = positions.map(pos => ({
        id: pos.symbol,
        symbol: pos.symbol,
        side: (pos.side && pos.side.toLowerCase() === 'long') || parseFloat(pos.positionAmt) > 0 ? 'LONG' : 'SHORT',
        coin: pos.coin,
        leverage: pos.leverage + 'X',
        notional: pos.notional,
        unrealizedPnL: pos.unrealizedPnL,
        entryPrice: pos.entryPrice,
        markPrice: pos.markPrice,
        positionAmt: Math.abs(parseFloat(pos.positionAmt)),
        openedAt: pos.openTime,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit
      }));
      
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'positions.json'),
        JSON.stringify(positionsData, null, 2)
      );

      // Export completed trades
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'trades.json'),
        JSON.stringify(this.completedTradesLog, null, 2)
      );

      // Export account summary
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'account.json'),
        JSON.stringify(account, null, 2)
      );

      // Export AI decisions
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'ai-chat.json'),
        JSON.stringify(this.aiDecisionLog, null, 2)
      );

      // Export scanner results
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'scanner-results.json'),
        JSON.stringify(scannerResults, null, 2)
      );

      // ✅ Export DeepSeek responses (NEW)
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'responses.json'),
        JSON.stringify(this.deepseekResponsesLog, null, 2)
      );

      // ✅ Export AI recommendation (NEW)
      if (this.lastAIRecommendation) {
        fs.writeFileSync(
          path.join(DASHBOARD_DIR, 'ai-recommendation.json'),
          JSON.stringify(this.lastAIRecommendation, null, 2)
        );
      }

      // Export timestamp for dashboard sync
      fs.writeFileSync(
        path.join(DASHBOARD_DIR, 'last-update.json'),
        JSON.stringify({ timestamp: Date.now(), date: new Date().toISOString() }, null, 2)
      );

    } catch (error) {
      console.error('❌ Error exporting dashboard data:', error.message);
    }
  }

  // ✅ NEW: Method to update AI recommendation
  updateAIRecommendation(title, message) {
    this.lastAIRecommendation = {
      title: title || '🤖 AI Trading Update',
      message: message || 'Analyzing market conditions...',
      timestamp: Date.now()
    };
  }
}

// Initialize dashboard exporter
const dashboardExporter = new DashboardExporter();

/**
 * TOKEN SCANNER CLASS
 * Integrated scanner for detecting opportunities across 50+ tokens
 */
class TokenScanner {
  constructor(config) {
    this.config = config;
    this.scanHistory = new Map();
    this.volumeBaselines = new Map();
    this.priceRanges = new Map();
    
    // Extended token list (44 tokens - VERIFIED on AsterDex)
    this.scanTokens = [
      'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT',
      'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'DOTUSDT', 'LINKUSDT', 'ATOMUSDT',
      'UNIUSDT', 'AAVEUSDT', 'SUSHIUSDT', 'CAKEUSDT',
      'ARBUSDT', 'OPUSDT', 'APTUSDT', 'SUIUSDT',
      'AXSUSDT', 'SANDUSDT', 'MANAUSDT', 'ENJUSDT', 'GALAUSDT', 'IMXUSDT',
      'WLDUSDT', 'FETUSDT', 'RNDRUSDT',
      'SHIBUSDT', 'PEPEUSDT', 'FLOKIUSDT', 'BONKUSDT',
      'FTMUSDT', 'GMXUSDT', 'NEARUSDT', 'ICPUSDT', 'FILUSDT', 
      'LTCUSDT', 'ETCUSDT', 'ALGOUSDT', 'HBARUSDT', 'VETUSDT', 
      'TRXUSDT', 'ASTERUSDT'
    ];
    
    this.thresholds = {
      rsi: {
        // Standard RSI (14) for regular trading
        oversold: 30,
        overbought: 70,
        extremeOversold: 20,
        extremeOverbought: 80
      },
      // ✅ NEW: Scalping-specific RSI thresholds
      scalping: {
        // 1-minute scalping with RSI(2-3)
        rsi1m: {
          period: 3,           // RSI period for 1-min scalping
          oversold: 20,        // Buy when RSI crosses back above 20
          overbought: 80,      // Sell when RSI crosses back below 80
          exitLevel: 50        // Exit when RSI returns to 50
        },
        // 5-minute scalping with RSI(7)
        rsi5m: {
          period: 7,           // RSI period for 5-min scalping
          oversold: 30,        // Buy when RSI crosses above 30
          overbought: 70,      // Sell when RSI crosses below 70
          exitLevel: 50        // Exit when RSI returns to 50
        }
      },
      volume: { spikeMultiplier: 2.0, extremeSpikeMultiplier: 3.0 },
      breakout: { minPriceMove: 2.0, strongBreakout: 5.0 },
      minHistoryBars: 50
    };
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    let gains = 0, losses = 0;
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) gains += changes[i];
      else losses += Math.abs(changes[i]);
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate Fast RSI for scalping (RSI 2, 3, or 7)
   * @param {Array} prices - Array of closing prices
   * @param {Number} period - RSI period (2, 3, or 7 for scalping)
   * @returns {Number|null} - RSI value
   */
  calculateFastRSI(prices, period = 3) {
    if (prices.length < period + 1) return null;
    
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);
    
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < changes.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  /**
   * Calculate EMA (Exponential Moving Average)
   * @param {Array} prices - Array of prices
   * @param {Number} period - EMA period
   * @returns {Number|null} - Current EMA value
   */
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  // NEW: Calculate EMA (Exponential Moving Average)
  calculateEMA(prices, period = 20) {
    if (prices.length < period) return null;
    
    // Calculate simple moving average for first period
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate EMA for remaining prices
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  // NEW: Calculate MACD (Moving Average Convergence Divergence)
  calculateMACD(prices) {
    if (prices.length < 26) return null;
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    if (!ema12 || !ema26) return null;
    
    return ema12 - ema26;
  }

  // NEW: Calculate MACD signal line (9-period EMA of MACD)
  calculateMACDSignal(prices) {
    if (prices.length < 34) return null; // Need at least 34 prices for MACD + signal
    
    // Calculate MACD values for the last 26 prices
    const macdValues = [];
    for (let i = 26; i <= prices.length; i++) {
      const slice = prices.slice(0, i);
      const macd = this.calculateMACD(slice);
      if (macd !== null) {
        macdValues.push(macd);
      }
    }
    
    if (macdValues.length < 9) return null;
    return this.calculateEMA(macdValues, 9);
  }

  // NEW: Detect MACD Crossover
  detectMACDCross(prices) {
    if (prices.length < 36) return null;
    
    // Calculate current MACD and signal
    const currentSlice = prices.slice(0, prices.length);
    const ema12_current = this.calculateEMA(currentSlice, 12);
    const ema26_current = this.calculateEMA(currentSlice, 26);
    const macd_current = ema12_current - ema26_current;
    const signal_current = this.calculateMACDSignal(prices);
    
    // Calculate previous MACD and signal
    const prevSlice = prices.slice(0, prices.length - 1);
    const ema12_prev = this.calculateEMA(prevSlice, 12);
    const ema26_prev = this.calculateEMA(prevSlice, 26);
    const macd_prev = ema12_prev - ema26_prev;
    const signal_prev = this.calculateMACDSignal(prevSlice);
    
    if (!signal_current || !signal_prev) return null;
    
    // Detect crossover
    const bullishCross = macd_prev < signal_prev && macd_current > signal_current;
    const bearishCross = macd_prev > signal_prev && macd_current < signal_current;
    
    return {
      isBullish: bullishCross,
      isBearish: bearishCross,
      macd: macd_current,
      signal: signal_current,
      histogram: macd_current - signal_current
    };
  }

  // NEW: Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
    
    const variance = recentPrices
      .map(p => Math.pow(p - sma, 2))
      .reduce((a, b) => a + b, 0) / period;
    
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev),
      bandwidth: (std * stdDev * 2) / sma * 100
    };
  }

  // NEW: Calculate VWAP (Volume Weighted Average Price)
  calculateVWAP(klines) {
    if (!klines || klines.length < 1) return null;
    
    let totalValue = 0;
    let totalVolume = 0;
    
    // Use last 20 klines for VWAP calculation
    const recentKlines = klines.slice(-20);
    
    for (const kline of recentKlines) {
      const high = parseFloat(kline[2]);
      const low = parseFloat(kline[3]);
      const close = parseFloat(kline[4]);
      const volume = parseFloat(kline[5]);
      
      const typicalPrice = (high + low + close) / 3;
      totalValue += typicalPrice * volume;
      totalVolume += volume;
    }
    
    return totalVolume > 0 ? totalValue / totalVolume : null;
  }

  calculateVolumeProfile(volumes) {
    if (volumes.length < 20) return null;
    const recentVolume = volumes.slice(-10);
    const historicalVolume = volumes.slice(0, -10);
    
    // Add safety checks for division by zero
    const avgRecent = recentVolume.reduce((a, b) => a + b, 0) / recentVolume.length;
    const avgHistorical = historicalVolume.reduce((a, b) => a + b, 0) / historicalVolume.length;
    
    // Prevent NaN from division by zero
    const volumeRatio = avgHistorical > 0 ? avgRecent / avgHistorical : 1;
    const currentVol = volumes[volumes.length - 1];
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    return {
      currentVolume: currentVol,
      averageVolume: avgVol,
      volumeRatio: volumeRatio,
      isSpike: currentVol > avgVol * this.thresholds.volume.spikeMultiplier,
      isExtremeSpike: currentVol > avgVol * this.thresholds.volume.extremeSpikeMultiplier
    };
  }

  detectBreakout(prices, volumes) {
    if (prices.length < 20) return null;
    const currentPrice = prices[prices.length - 1];
    const recentPrices = prices.slice(-20);
    const high20 = Math.max(...recentPrices);
    const low20 = Math.min(...recentPrices);
    const range = high20 - low20;
    const position = (currentPrice - low20) / range;
    const priceChange = ((currentPrice - prices[prices.length - 5]) / prices[prices.length - 5]) * 100;
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const volumeConfirmed = volumeProfile && volumeProfile.isSpike;
    return {
      isBreakingUp: position > 0.9 && priceChange > this.thresholds.breakout.minPriceMove,
      isBreakingDown: position < 0.1 && priceChange < -this.thresholds.breakout.minPriceMove,
      isStrongBreakup: position > 0.95 && priceChange > this.thresholds.breakout.strongBreakout && volumeConfirmed,
      isStrongBreakdown: position < 0.05 && priceChange < -this.thresholds.breakout.strongBreakout && volumeConfirmed,
      priceChange: priceChange,
      positionInRange: position,
      volumeConfirmed: volumeConfirmed
    };
  }

  // SCALPER PULLBACK DETECTION - Best entries for scalping
  detectScalperPullback(prices, volumes, rsi, timeframe4h) {
    if (prices.length < 30) return null;
    
    const currentPrice = prices[prices.length - 1];
    
    // Find recent high (last 20 candles = 1 hour on 3-min chart)
    const recent20 = prices.slice(-20);
    const recentHigh = Math.max(...recent20);
    const recentLow = Math.min(...recent20);
    
    // Calculate pullback depth from recent high
    const pullbackPercent = ((recentHigh - currentPrice) / recentHigh) * 100;
    
    // Check if price is pulling back (not at high)
    const isPullingBack = pullbackPercent > 0.5; // At least 0.5% below high
    
    // Volume should be declining (not panic selling)
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const isLowVolume = volumeProfile && volumeProfile.volumeRatio < 1.5;
    
    // RSI should be in buy zone
    const rsiGood = rsi >= 30 && rsi <= 45;
    
    // 4H timeframe check - not near 24h high
    let tf4hGood = true;
    if (timeframe4h) {
      tf4hGood = timeframe4h.distanceFromHigh24h > 2.0; // At least 2% below 24h high
    }
    
    // Check if this is a bounce from support
    const distanceFromLow = ((currentPrice - recentLow) / recentLow) * 100;
    const isBouncing = distanceFromLow < 3.0; // Within 3% of recent low
    
    // SCALPER CRITERIA
    const isScalperEntry = (
      isPullingBack &&
      pullbackPercent >= 2.0 &&     // At least 2% pullback
      pullbackPercent <= 6.0 &&     // Not too deep (reversal risk)
      rsiGood &&                    // RSI in buy zone
      isLowVolume &&                // Volume declining
      tf4hGood                      // 4H timeframe check
    );
    
    const isPerfectScalperEntry = (
      isScalperEntry &&
      isBouncing &&                 // Bouncing from support
      rsi <= 35 &&                  // Strong oversold
      pullbackPercent >= 3.0 && pullbackPercent <= 5.0  // Perfect depth
    );
    
    return {
      isScalperEntry: isScalperEntry,
      isPerfectScalperEntry: isPerfectScalperEntry,
      pullbackPercent: pullbackPercent.toFixed(2),
      recentHigh: recentHigh,
      recentLow: recentLow,
      rsi: rsi,
      volumeRatio: volumeProfile ? volumeProfile.volumeRatio : 0,
      distanceFromLow: distanceFromLow.toFixed(2),
      tf4hCheck: tf4hGood,
      signal: isPerfectScalperEntry ? 'PERFECT_SCALP' :
              isScalperEntry ? 'SCALP_ENTRY' : 'NO_SCALP'
    };
  }

  // NEW: PUMP & PULLBACK DETECTION
  detectPumpAndPullback(prices, volumes, rsi) {
    if (prices.length < 30) return null;
    
    const currentPrice = prices[prices.length - 1];
    
    // Calculate short-term price changes
    const change5m = ((currentPrice - prices[prices.length - 2]) / prices[prices.length - 2]) * 100;  // 3-min change
    const change15m = ((currentPrice - prices[prices.length - 5]) / prices[prices.length - 5]) * 100; // 15-min change
    const change30m = ((currentPrice - prices[prices.length - 10]) / prices[prices.length - 10]) * 100; // 30-min change
    
    // Volume analysis
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const currentVol = volumes[volumes.length - 1];
    const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volRatio = currentVol / avgVol;
    
    // Find recent high (last 10 candles = 30 minutes)
    const recent10 = prices.slice(-10);
    const recentHigh = Math.max(...recent10);
    const recentLow = Math.min(...recent10);
    const distanceFromHigh = ((recentHigh - currentPrice) / recentHigh) * 100;
    const distanceFromLow = ((currentPrice - recentLow) / recentLow) * 100;
    
    // PUMP DETECTION
    // A pump is: rapid price increase (>3% in 15min) + high volume (>2x avg) + RSI climbing
    const isPump = (
      change15m > 3 &&           // Price up >3% in 15 minutes
      volRatio > 2.0 &&          // Volume spike
      change5m > 0               // Still going up
    );
    
    const isStrongPump = (
      change15m > 5 &&           // Price up >5% in 15 minutes
      volRatio > 3.0 &&          // Extreme volume
      rsi > 60                   // RSI confirming strength
    );
    
    // PULLBACK DETECTION
    // A pullback is: small retracement (2-5%) after recent rally, lower volume
    const isInRecentRally = change30m > 5; // Price was up >5% in last 30 min
    const isRetracing = change15m < 0 && change15m > -5; // Down but not too much
    const isLowVolume = volRatio < 1.5; // Volume declining
    
    const isPullback = (
      isInRecentRally &&         // Had a recent rally
      isRetracing &&             // Now pulling back 0-5%
      distanceFromHigh < 10 &&   // Still near recent highs
      isLowVolume                // Volume declining
    );
    
    const isHealthyPullback = (
      isPullback &&
      rsi > 40 &&                // RSI still healthy
      rsi < 70 &&                // Not overbought
      change15m > -3             // Shallow pullback (-0% to -3%)
    );
    
    // DUMP DETECTION (opposite of pump)
    const isDump = (
      change15m < -3 &&          // Price down >3% in 15 minutes
      volRatio > 2.0 &&          // Volume spike
      change5m < 0               // Still going down
    );
    
    return {
      // Pump indicators
      isPump: isPump,
      isStrongPump: isStrongPump,
      pumpStrength: isPump ? Math.min(100, change15m * 10 + (volRatio - 2) * 10) : 0,
      
      // Pullback indicators
      isPullback: isPullback,
      isHealthyPullback: isHealthyPullback,
      pullbackDepth: isRetracing ? Math.abs(change15m) : 0,
      
      // Dump indicators
      isDump: isDump,
      
      // Raw data
      change5m: change5m.toFixed(2),
      change15m: change15m.toFixed(2),
      change30m: change30m.toFixed(2),
      volumeRatio: volRatio.toFixed(2),
      distanceFromHigh: distanceFromHigh.toFixed(2),
      distanceFromLow: distanceFromLow.toFixed(2),
      
      // Actionable signals
      signal: isStrongPump ? 'STRONG_PUMP' : 
              isPump ? 'PUMP' : 
              isHealthyPullback ? 'HEALTHY_PULLBACK' :
              isPullback ? 'PULLBACK' :
              isDump ? 'DUMP' : 'NORMAL'
    };
  }

  // NEW: Helper method for EMA calculation
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  }

  // NEW: Bollinger Bands (Strategy #4)
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((a, b) => a + b, 0) / period;
    
    const variance = recentPrices
      .map(p => Math.pow(p - sma, 2))
      .reduce((a, b) => a + b, 0) / period;
    
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev),
      bandwidth: (std * stdDev * 2) / sma * 100 // Percentage bandwidth
    };
  }

  // NEW: Detect MACD Crossover
  detectMACDCross(prices) {
    if (prices.length < 36) return null;
    
    // Calculate current MACD and signal
    const currentSlice = prices.slice(0, prices.length);
    const ema12_current = this.calculateEMA(currentSlice, 12);
    const ema26_current = this.calculateEMA(currentSlice, 26);
    const macd_current = ema12_current - ema26_current;
    const signal_current = this.calculateMACDSignal(prices);
    
    // Calculate previous MACD and signal
    const prevSlice = prices.slice(0, prices.length - 1);
    const ema12_prev = this.calculateEMA(prevSlice, 12);
    const ema26_prev = this.calculateEMA(prevSlice, 26);
    const macd_prev = ema12_prev - ema26_prev;
    const signal_prev = this.calculateMACDSignal(prevSlice);
    
    if (!signal_current || !signal_prev) return null;
    
    // Detect crossover
    const bullishCross = macd_prev < signal_prev && macd_current > signal_current;
    const bearishCross = macd_prev > signal_prev && macd_current < signal_current;
    
    return {
      isBullish: bullishCross,
      isBearish: bearishCross,
      macd: macd_current,
      signal: signal_current,
      histogram: macd_current - signal_current
    };
  }

  calculateOpportunityScore(analysis) {
    let score = 0;
    if (analysis.rsi !== null) {
      if (analysis.rsi < this.thresholds.rsi.extremeOversold) {
        score += 30;
      } else if (analysis.rsi < this.thresholds.rsi.oversold) {
        score += 20;
      } else if (analysis.rsi > this.thresholds.rsi.extremeOverbought) {
        score += 25;
      } else if (analysis.rsi > this.thresholds.rsi.overbought) {
        score += 15;
      } else {
        score += 5;
      }
    }
    if (analysis.volumeProfile) {
      if (analysis.volumeProfile.isExtremeSpike) {
        score += 30;
      } else if (analysis.volumeProfile.isSpike) {
        score += 20;
      } else if (analysis.volumeProfile.volumeRatio > 1.2) {
        score += 10;
      }
    }
    if (analysis.breakout) {
      if (analysis.breakout.isStrongBreakup || analysis.breakout.isStrongBreakdown) {
        score += 40;
      } else if (analysis.breakout.isBreakingUp || analysis.breakout.isBreakingDown) {
        score += 25;
      } else if (Math.abs(analysis.breakout.priceChange) > 1.0) {
        score += 10;
      }
    }
    
    // NEW: Bollinger Bands scoring
    if (analysis.bollingerBands) {
      const bb = analysis.bollingerBands;
      const currentPrice = analysis.price;
      
      // Price touching or below lower band (oversold)
      if (currentPrice <= bb.lower * 1.002) {
        score += 20;
      }
      // Price touching or above upper band (overbought)
      else if (currentPrice >= bb.upper * 0.998) {
        score += 15;
      }
      
      // High bandwidth = high volatility = opportunity
      if (bb.bandwidth > 3) {
        score += 5;
      }
    }
    
    // NEW: COMBO STRATEGIES - Extra points for multiple confirmations
    
    // Strategy #1: VWAP + MACD (BEST COMBO)
    if (analysis.vwap && analysis.macdCross) {
      const priceAboveVWAP = analysis.price > analysis.vwap;
      const macdBullish = analysis.macdCross.isBullish;
      const volumeSpike = analysis.volumeProfile && analysis.volumeProfile.isSpike;
      
      if (priceAboveVWAP && macdBullish && volumeSpike) {
        score += 25; // Perfect long setup
      } else if (!priceAboveVWAP && analysis.macdCross.isBearish && volumeSpike) {
        score += 25; // Perfect short setup
      }
    }
    
    // Strategy #4: RSI + Bollinger Bands (MEAN REVERSION)
    if (analysis.rsi !== null && analysis.bollingerBands) {
      const bb = analysis.bollingerBands;
      const currentPrice = analysis.price;
      
      // Oversold: RSI low + price at lower BB
      if (analysis.rsi < 30 && currentPrice <= bb.lower * 1.002) {
        score += 20; // Strong reversal signal
      }
      // Overbought: RSI high + price at upper BB
      else if (analysis.rsi > 70 && currentPrice >= bb.upper * 0.998) {
        score += 15; // Strong reversal signal
      }
    }
    
    return Math.min(score, 100);
  }

  getRecommendedAction(analysis) {
    const { rsi, breakout, volume, vwap, vwapDeviation, macdCross, bollingerBands: bb, scalping1m, scalping5m } = analysis;
    const currentPrice = analysis.price;
    
    // ═══════════════════════════════════════════════════════════
    // PRIORITY 1: SCALPING SIGNALS (Highest Priority)
    // ═══════════════════════════════════════════════════════════
    
    // 1-minute scalping signals (ultra-fast)
    if (scalping1m && scalping1m.signal === 'BUY' && scalping1m.strength >= 85) {
      return { 
        action: 'scalp_long',  // Use scalp action for 25x leverage
        confidence: scalping1m.strength / 100,
        reason: `1MIN SCALP: ${scalping1m.reason}`,
        stopLoss: scalping1m.stopLoss,
        takeProfit: scalping1m.takeProfit
      };
    }
    
    if (scalping1m && scalping1m.signal === 'SELL' && scalping1m.strength >= 85) {
      return { 
        action: 'scalp_short',
        confidence: scalping1m.strength / 100,
        reason: `1MIN SCALP: ${scalping1m.reason}`,
        stopLoss: scalping1m.stopLoss,
        takeProfit: scalping1m.takeProfit
      };
    }
    
    // 5-minute scalping signals (fast)
    if (scalping5m && scalping5m.signal === 'BUY' && scalping5m.strength >= 80) {
      return { 
        action: 'scalp_long',
        confidence: scalping5m.strength / 100,
        reason: `5MIN SCALP: ${scalping5m.reason}`,
        stopLoss: scalping5m.stopLoss,
        takeProfit: scalping5m.takeProfit
      };
    }
    
    if (scalping5m && scalping5m.signal === 'SELL' && scalping5m.strength >= 80) {
      return { 
        action: 'scalp_short',
        confidence: scalping5m.strength / 100,
        reason: `5MIN SCALP: ${scalping5m.reason}`,
        stopLoss: scalping5m.stopLoss,
        takeProfit: scalping5m.takeProfit
      };
    }
    
    // Strategy #1: VWAP + MACD (HIGHEST PRIORITY)
    if (vwap && macdCross && volume) {
      const priceAboveVWAP = currentPrice > vwap;
      
      if (priceAboveVWAP && macdCross.isBullish && volume.isSpike) {
        return { action: 'LONG', confidence: 0.90 }; // Very high confidence
      }
      if (!priceAboveVWAP && macdCross.isBearish && volume.isSpike) {
        return { action: 'SHORT', confidence: 0.90 }; // Very high confidence
      }
    }
    
    // Strategy #4: RSI + Bollinger Bands (HIGH PRIORITY)
    if (rsi !== null && bb && volume) {
      const touchingLower = currentPrice <= bb.lower * 1.002;
      const touchingUpper = currentPrice >= bb.upper * 0.998;
      
      if (rsi < 30 && touchingLower && volume.isSpike) {
        return { action: 'LONG', confidence: 0.85 };
      }
      if (rsi > 70 && touchingUpper && volume.isSpike) {
        return { action: 'SHORT', confidence: 0.85 };
      }
    }
    
    // Original logic (fallback)
    if (rsi < this.thresholds.rsi.oversold && breakout && breakout.isBreakingUp && volume && volume.isSpike) {
      return { action: 'LONG', confidence: 0.85 };
    }
    if (rsi > this.thresholds.rsi.overbought && breakout && breakout.isBreakingDown && volume && volume.isSpike) {
      return { action: 'SHORT', confidence: 0.85 };
    }
    if (rsi < this.thresholds.rsi.oversold) {
      return { action: 'LONG', confidence: 0.70 };
    }
    if (rsi > this.thresholds.rsi.overbought) {
      return { action: 'SHORT', confidence: 0.70 };
    }
    if (breakout && breakout.isStrongBreakup && volume && volume.volumeConfirmed) {
      return { action: 'LONG', confidence: 0.75 };
    }
    if (breakout && breakout.isStrongBreakdown && volume && volume.volumeConfirmed) {
      return { action: 'SHORT', confidence: 0.75 };
    }
    return { action: 'HOLD', confidence: 0.50 };
  }

  async fetchKlines(symbol, interval = '5m', limit = 100) {
    return new Promise((resolve, reject) => {
      const url = `https://fapi.asterdex.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const req = https.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            // Validate kline data structure
            if (!Array.isArray(parsed) || parsed.length === 0) {
              reject(new Error(`Invalid kline data for ${symbol}: not an array or empty`));
              return;
            }
            
            // Check for valid kline structure [timestamp, open, high, low, close, volume, ...]
            const firstCandle = parsed[0];
            if (!Array.isArray(firstCandle) || firstCandle.length < 6) {
              reject(new Error(`Invalid kline structure for ${symbol}`));
              return;
            }
            
            resolve(parsed);
          } catch (error) {
            reject(new Error(`Parse error for ${symbol}: ${error.message}`));
          }
        });
      });
      req.on('error', (error) => reject(error));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout fetching ${symbol}`));
      });
    });
  }

  async analyzeToken(symbol, timeframe4h = null) {
    try {
      const klines = await this.fetchKlines(symbol, '5m', 100);
      if (!klines || klines.length < this.thresholds.minHistoryBars) {
        return null;
      }
      const closes = klines.map(k => parseFloat(k[4]));
      const highs = klines.map(k => parseFloat(k[2]));
      const lows = klines.map(k => parseFloat(k[3]));
      const volumes = klines.map(k => parseFloat(k[5]));
      const currentPrice = closes[closes.length - 1];
      
      // Standard RSI (14) for regular analysis
      const rsi = this.calculateRSI(closes, 14);
      
      // ✅ NEW: Fast RSI for scalping detection
      const rsi7 = this.calculateFastRSI(closes, 7);   // For 5-min scalping
      const rsi3 = this.calculateFastRSI(closes, 3);   // For 1-min scalping
      
      // ✅ NEW: EMAs for trend filtering
      const ema9 = this.calculateEMA(closes, 9);       // Fast EMA for 1-min scalping
      const ema20 = this.calculateEMA(closes, 20);     // For 5-min scalping
      const ema50 = this.calculateEMA(closes, 50);     // For 5-min scalping
      
      const volumeProfile = this.calculateVolumeProfile(volumes);
      const breakout = this.detectBreakout(closes, volumes);
      const pumpPullback = this.detectPumpAndPullback(closes, volumes, rsi);
      const scalperPullback = this.detectScalperPullback(closes, volumes, rsi, timeframe4h);
      
      // NEW: Advanced indicators (VWAP, MACD Signal, Bollinger Bands)
      const vwap = this.calculateVWAP(klines);
      const vwapDeviation = vwap ? ((currentPrice - vwap) / vwap) * 100 : 0;
      const macdCross = this.detectMACDCross(closes);
      const bollingerBands = this.calculateBollingerBands(closes, 20, 2);

      // ✅ NEW: Advanced scalping signal detection
      const scalping1m = this.detect1MinScalping(closes, highs, lows, volumes, rsi3, ema9, bollingerBands);
      const scalping5m = this.detect5MinScalping(closes, volumes, rsi7, ema20, ema50);
      
      const analysis = {
        symbol: symbol,
        price: currentPrice,
        rsi: rsi,
        rsi7: rsi7,                     // ✅ NEW: RSI(7) for 5-min scalping
        rsi3: rsi3,                     // ✅ NEW: RSI(3) for 1-min scalping
        ema9: ema9,                     // ✅ NEW: 9 EMA
        ema20: ema20,                   // ✅ NEW: 20 EMA
        ema50: ema50,                   // ✅ NEW: 50 EMA
        volumeProfile: volumeProfile,
        breakout: breakout,
        pumpPullback: pumpPullback,
        scalperPullback: scalperPullback,
        scalping1m: scalping1m,         // ✅ NEW: 1-min scalping signals
        scalping5m: scalping5m,         // ✅ NEW: 5-min scalping signals
        vwap: vwap, // NEW!
        vwapDeviation: vwapDeviation, // NEW!
        macdCross: macdCross, // NEW!
        bollingerBands: bollingerBands, // NEW!
        timestamp: Date.now()
      };
      analysis.score = this.calculateOpportunityScore(analysis);
      const recommendation = this.getRecommendedAction(analysis);
      analysis.recommendedAction = recommendation.action;
      analysis.confidence = recommendation.confidence;
      
      // VALIDATION: Filter out tokens with suspicious indicators (stale data)
      // Calculate data freshness percentage
      const uniquePrices = new Set(closes.map(p => p.toFixed(4)));
      const dataFreshness = (uniquePrices.size / closes.length) * 100;
      
      // Check for stale data conditions
      const hasSuspiciousRSI = rsi !== null && (rsi > 90 || rsi < 10);
      const hasFlatBB = bollingerBands !== null && bollingerBands.width === 0;
      const hasStaleData = dataFreshness < 50; // Less than 50% unique prices = stale
      const hasVeryStaleData = uniquePrices.size < 10; // Extremely stale (less than 10 unique in 100 candles)
      
      // Filter conditions
      if (hasVeryStaleData) {
        // Completely stale data (like MATIC with 1 unique price)
        return null;
      }
      
      if (hasStaleData && (hasSuspiciousRSI || hasFlatBB)) {
        // Low freshness + suspicious indicators = unreliable
        return null;
      }
      
      if (hasSuspiciousRSI && hasFlatBB) {
        // Both RSI extreme AND flat BB = definitely bad data
        return null;
      }
      
      // Optional: Add freshness score to analysis for monitoring
      analysis.dataFreshness = dataFreshness;
      
      return analysis;
    } catch (error) {
      return null;
    }
  }

  /**
   * 1-MINUTE SCALPING STRATEGY
   * Based on RSI(2-3) + Bollinger Bands + 9 EMA
   * Article: https://www.mc2.fi/blog/best-rsi-for-scalping
   */
  detect1MinScalping(closes, highs, lows, volumes, rsi3, ema9, bb) {
    if (!rsi3 || !ema9 || !bb) {
      return { signal: 'NO_SIGNAL', strength: 0, reason: 'Missing indicators' };
    }
    
    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];
    const prevRSI = closes.length > 10 ? this.calculateFastRSI(closes.slice(0, -1), 3) : null;
    
    // Check if current candle is bullish/bearish
    const isBullishCandle = currentPrice > prevPrice;
    const isBearishCandle = currentPrice < prevPrice;
    
    // Volume spike detection
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const hasVolumeSpike = volumeProfile && volumeProfile.isSpike;
    
    // ═══════════════════════════════════════════════════════════
    // BUY SIGNAL (LONG)
    // ═══════════════════════════════════════════════════════════
    // 1. RSI(3) drops below 20 (oversold) and crosses back above 20
    // 2. Price touches or slightly outside lower Bollinger Band
    // 3. Price remains above 9 EMA (uptrend)
    // 4. Enter after bullish candle closes
    
    const rsiCrossedUp = prevRSI && prevRSI < 20 && rsi3 >= 20;
    const touchingLowerBB = currentPrice <= bb.lower * 1.005; // Within 0.5% of lower band
    const aboveEMA9 = currentPrice > ema9;
    
    if (rsiCrossedUp && touchingLowerBB && aboveEMA9 && isBullishCandle) {
      const strength = hasVolumeSpike ? 95 : 85;
      return {
        signal: 'BUY',
        strength: strength,
        type: '1MIN_SCALP',
        reason: 'RSI(3) oversold bounce + BB support + above EMA9',
        entry: currentPrice,
        stopLoss: currentPrice * 0.995,  // 0.5% SL
        takeProfit: currentPrice * 1.005, // 0.5% TP (3-5 pips)
        rsi: rsi3,
        volumeConfirmed: hasVolumeSpike
      };
    }
    
    // ═══════════════════════════════════════════════════════════
    // SELL SIGNAL (SHORT)
    // ═══════════════════════════════════════════════════════════
    // 1. RSI(3) rises above 80 (overbought) and crosses back below 80
    // 2. Price touches or slightly outside upper Bollinger Band
    // 3. Price stays below 9 EMA (downtrend)
    // 4. Enter after bearish candle closes
    
    const rsiCrossedDown = prevRSI && prevRSI > 80 && rsi3 <= 80;
    const touchingUpperBB = currentPrice >= bb.upper * 0.995; // Within 0.5% of upper band
    const belowEMA9 = currentPrice < ema9;
    
    if (rsiCrossedDown && touchingUpperBB && belowEMA9 && isBearishCandle) {
      const strength = hasVolumeSpike ? 95 : 85;
      return {
        signal: 'SELL',
        strength: strength,
        type: '1MIN_SCALP',
        reason: 'RSI(3) overbought rejection + BB resistance + below EMA9',
        entry: currentPrice,
        stopLoss: currentPrice * 1.005,  // 0.5% SL
        takeProfit: currentPrice * 0.995, // 0.5% TP (3-5 pips)
        rsi: rsi3,
        volumeConfirmed: hasVolumeSpike
      };
    }
    
    // Exit signal: RSI returns to 50 (neutral zone)
    if (Math.abs(rsi3 - 50) < 5) {
      return {
        signal: 'EXIT',
        strength: 70,
        type: '1MIN_SCALP',
        reason: 'RSI(3) returned to neutral (50)',
        rsi: rsi3
      };
    }
    
    // No signal
    return {
      signal: 'NO_SIGNAL',
      strength: 0,
      reason: `RSI(3): ${rsi3.toFixed(1)}, waiting for setup`,
      rsi: rsi3
    };
  }

  /**
   * 5-MINUTE SCALPING STRATEGY
   * Based on RSI(7) + Dual EMA (20 & 50) trend filter
   * Article: https://www.mc2.fi/blog/best-rsi-for-scalping
   */
  detect5MinScalping(closes, volumes, rsi7, ema20, ema50) {
    if (!rsi7 || !ema20 || !ema50) {
      return { signal: 'NO_SIGNAL', strength: 0, reason: 'Missing indicators' };
    }
    
    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];
    const prevRSI = closes.length > 20 ? this.calculateFastRSI(closes.slice(0, -1), 7) : null;
    
    // Check if current candle is bullish/bearish (green/red close)
    const isGreenCandle = currentPrice > prevPrice;
    const isRedCandle = currentPrice < prevPrice;
    
    // Volume confirmation
    const volumeProfile = this.calculateVolumeProfile(volumes);
    const hasVolumeSpike = volumeProfile && volumeProfile.isSpike;
    
    // Trend detection: both EMAs aligned
    const bullishTrend = currentPrice > ema20 && currentPrice > ema50 && ema20 > ema50;
    const bearishTrend = currentPrice < ema20 && currentPrice < ema50 && ema20 < ema50;
    
    // Check for choppy market (EMAs too close = avoid trading)
    const emaDistance = Math.abs((ema20 - ema50) / ema50) * 100;
    const isChoppy = emaDistance < 0.5; // EMAs within 0.5% of each other
    
    if (isChoppy) {
      return {
        signal: 'NO_SIGNAL',
        strength: 0,
        reason: 'Choppy market - EMAs too close, RSI oscillating',
        rsi: rsi7,
        emaDistance: emaDistance.toFixed(2)
      };
    }
    
    // ═══════════════════════════════════════════════════════════
    // BUY SIGNAL (LONG)
    // ═══════════════════════════════════════════════════════════
    // 1. RSI(7) drops below 30 (oversold) and then moves up
    // 2. Price above both 20 EMA and 50 EMA (uptrend confirmed)
    // 3. Wait for green candle close
    // 4. Volume spike for confirmation
    
    const rsiMovingUp = prevRSI && prevRSI < 30 && rsi7 > prevRSI;
    
    if (rsiMovingUp && bullishTrend && isGreenCandle) {
      const strength = hasVolumeSpike ? 95 : 80;
      return {
        signal: 'BUY',
        strength: strength,
        type: '5MIN_SCALP',
        reason: 'RSI(7) oversold + uptrend + green candle',
        entry: currentPrice,
        stopLoss: Math.min(ema20, ema50) * 0.995,  // Below support EMA
        takeProfit: currentPrice * 1.01,  // 1% TP (5-10 pips)
        rsi: rsi7,
        volumeConfirmed: hasVolumeSpike,
        trend: 'BULLISH'
      };
    }
    
    // ═══════════════════════════════════════════════════════════
    // SELL SIGNAL (SHORT)
    // ═══════════════════════════════════════════════════════════
    // 1. RSI(7) goes above 70 (overbought) and then moves down
    // 2. Price below both 20 EMA and 50 EMA (downtrend confirmed)
    // 3. Wait for red candle close
    // 4. Volume spike for confirmation
    
    const rsiMovingDown = prevRSI && prevRSI > 70 && rsi7 < prevRSI;
    
    if (rsiMovingDown && bearishTrend && isRedCandle) {
      const strength = hasVolumeSpike ? 95 : 80;
      return {
        signal: 'SELL',
        strength: strength,
        type: '5MIN_SCALP',
        reason: 'RSI(7) overbought + downtrend + red candle',
        entry: currentPrice,
        stopLoss: Math.max(ema20, ema50) * 1.005,  // Above resistance EMA
        takeProfit: currentPrice * 0.99,  // 1% TP (5-10 pips)
        rsi: rsi7,
        volumeConfirmed: hasVolumeSpike,
        trend: 'BEARISH'
      };
    }
    
    // Exit signal: RSI returns to 50
    if (Math.abs(rsi7 - 50) < 5) {
      return {
        signal: 'EXIT',
        strength: 70,
        type: '5MIN_SCALP',
        reason: 'RSI(7) returned to neutral (50)',
        rsi: rsi7
      };
    }
    
    // No clear signal
    return {
      signal: 'NO_SIGNAL',
      strength: 0,
      reason: `RSI(7): ${rsi7.toFixed(1)}, waiting for setup`,
      rsi: rsi7,
      trend: bullishTrend ? 'BULLISH' : bearishTrend ? 'BEARISH' : 'NEUTRAL'
    };
  }

  async scanAllTokens() {
    const startTime = Date.now();
    console.log(`\n${this.config.colors.cyan}${this.config.colors.bright}🔍 TOKEN SCANNER INITIATED${this.config.colors.reset}`);
    console.log(`📊 Scanning ${this.scanTokens.length} tokens...`);
    console.log(`⏱️  Estimated time: ${Math.ceil(this.scanTokens.length * 0.3)} seconds\n`);
    const results = [];
    let successCount = 0;
    let failCount = 0;
    const batchSize = 5;
    for (let i = 0; i < this.scanTokens.length; i += batchSize) {
      const batch = this.scanTokens.slice(i, i + batchSize);
      const batchPromises = batch.map(symbol => this.analyzeToken(symbol));
      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        if (result) {
          results.push(result);
          successCount++;
        } else {
          failCount++;
        }
      }
      const progress = Math.min(i + batchSize, this.scanTokens.length);
      const percent = ((progress / this.scanTokens.length) * 100).toFixed(0);
      process.stdout.write(`\r📈 Progress: ${percent}% (${progress}/${this.scanTokens.length}) - Found ${results.length} opportunities`);
      if (i + batchSize < this.scanTokens.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    console.log('\n');
    results.sort((a, b) => b.score - a.score);
    const scanDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`${this.config.colors.green}✅ SCAN COMPLETE${this.config.colors.reset}`);
    console.log(`⏱️  Duration: ${scanDuration}s`);
    console.log(`✅ Success: ${successCount} tokens`);
    if (failCount > 0) {
      console.log(`⚠️  Failed: ${failCount} tokens`);
    }
    console.log(`🎯 Opportunities found: ${results.length}\n`);
    return results;
  }

  getTopOpportunities(allResults, count = 10) {
    // TIERED OPPORTUNITY SYSTEM
    // Tier 1 - PREMIUM: Perfect score (100/100), confidence 70%+
    // Tier 2 - GOOD: High score (80-99), confidence 70%+
    // Tier 3 - ACCEPTABLE: Decent score (70-79), confidence 65%+
    
    const premium = allResults.filter(r => 
      r.score === 100 && r.confidence >= 0.70 && r.recommendedAction !== 'HOLD'
    );
    
    const good = allResults.filter(r => 
      r.score >= 80 && r.score < 100 && r.confidence >= 0.70 && r.recommendedAction !== 'HOLD'
    );
    
    const acceptable = allResults.filter(r => 
      r.score >= 70 && r.score < 80 && r.confidence >= 0.65 && r.recommendedAction !== 'HOLD'
    );
    
    // Add tier labels to each opportunity
    premium.forEach(opp => opp.tier = 'PREMIUM');
    good.forEach(opp => opp.tier = 'GOOD');
    acceptable.forEach(opp => opp.tier = 'ACCEPTABLE');
    
    // Combine all tiers (premium first, then good, then acceptable)
    const combined = [...premium, ...good, ...acceptable];
    
    // Log tier distribution
    console.log(`${this.config.colors.cyan}📊 Opportunity Tiers:${this.config.colors.reset}`);
    console.log(`   ${this.config.colors.bright}🏆 PREMIUM (100/100):${this.config.colors.reset} ${premium.length} opportunities`);
    console.log(`   ${this.config.colors.green}✅ GOOD (80-99):${this.config.colors.reset} ${good.length} opportunities`);
    console.log(`   ${this.config.colors.yellow}⚠️  ACCEPTABLE (70-79):${this.config.colors.reset} ${acceptable.length} opportunities`);
    console.log();
    
    return combined.slice(0, count);
  }

  formatOpportunities(opportunities) {
    if (opportunities.length === 0) {
      console.log(`${this.config.colors.yellow}⚠️  No high-confidence opportunities found${this.config.colors.reset}\n`);
      return;
    }
    console.log(`${this.config.colors.cyan}${this.config.colors.bright}🎯 TOP OPPORTUNITIES${this.config.colors.reset}`);
    console.log(`╔═══════════════════════════════════════════════════════════╗\n`);
    opportunities.forEach((opp, index) => {
      const symbol = opp.symbol.replace('USDT', '');
      const action = opp.recommendedAction;
      const actionColor = action === 'LONG' ? this.config.colors.green : this.config.colors.red;
      
      // Display tier badge
      let tierBadge = '';
      let tierColor = '';
      if (opp.tier === 'PREMIUM') {
        tierBadge = '🏆 PREMIUM';
        tierColor = this.config.colors.bright + this.config.colors.magenta;
      } else if (opp.tier === 'GOOD') {
        tierBadge = '✅ GOOD';
        tierColor = this.config.colors.green;
      } else if (opp.tier === 'ACCEPTABLE') {
        tierBadge = '⚠️  ACCEPTABLE';
        tierColor = this.config.colors.yellow;
      }
      
      console.log(`${index + 1}. ${tierColor}[${tierBadge}]${this.config.colors.reset} ${this.config.colors.bright}${symbol}${this.config.colors.reset} - Score: ${opp.score.toFixed(0)}/100`);
      console.log(`   ${actionColor}${action}${this.config.colors.reset} @ ${opp.price.toFixed(6)} (Confidence: ${(opp.confidence * 100).toFixed(0)}%)`);
      if (opp.rsi !== null) {
        const rsiColor = opp.rsi < 30 ? this.config.colors.green : 
                        opp.rsi > 70 ? this.config.colors.red : 
                        this.config.colors.yellow;
        console.log(`   📊 RSI: ${rsiColor}${opp.rsi.toFixed(1)}${this.config.colors.reset}`);
      }
      if (opp.volumeProfile) {
        const volStatus = opp.volumeProfile.isExtremeSpike ? '🔥 EXTREME SPIKE' :
                         opp.volumeProfile.isSpike ? '📈 SPIKE' : '📊 Normal';
        console.log(`   ${volStatus} (${(opp.volumeProfile.volumeRatio * 100).toFixed(0)}% of avg)`);
      }
      if (opp.breakout) {
        if (opp.breakout.isStrongBreakup) {
          console.log(`   🚀 STRONG BREAKOUT UP (+${opp.breakout.priceChange.toFixed(2)}%)`);
        } else if (opp.breakout.isStrongBreakdown) {
          console.log(`   💥 STRONG BREAKDOWN (${opp.breakout.priceChange.toFixed(2)}%)`);
        } else if (opp.breakout.isBreakingUp) {
          console.log(`   📈 Breaking resistance (+${opp.breakout.priceChange.toFixed(2)}%)`);
        } else if (opp.breakout.isBreakingDown) {
          console.log(`   📉 Breaking support (${opp.breakout.priceChange.toFixed(2)}%)`);
        }
      }
      // NEW: Display pump/pullback signals
      if (opp.pumpPullback) {
        const pp = opp.pumpPullback;
        if (pp.isStrongPump) {
          console.log(`   ${this.config.colors.green}🔥 STRONG PUMP DETECTED! (+${pp.change15m}% in 15min, Vol: ${pp.volumeRatio}x)${this.config.colors.reset}`);
        } else if (pp.isPump) {
          console.log(`   ${this.config.colors.green}⚡ PUMP (+${pp.change15m}% in 15min, Vol: ${pp.volumeRatio}x)${this.config.colors.reset}`);
        } else if (pp.isHealthyPullback) {
          console.log(`   ${this.config.colors.cyan}🔄 HEALTHY PULLBACK (${pp.change15m}% after +${pp.change30m}% rally)${this.config.colors.reset}`);
        } else if (pp.isPullback) {
          console.log(`   ${this.config.colors.yellow}📉 PULLBACK (${pp.change15m}% after +${pp.change30m}% rally)${this.config.colors.reset}`);
        } else if (pp.isDump) {
          console.log(`   ${this.config.colors.red}💔 DUMP (${pp.change15m}% in 15min, Vol: ${pp.volumeRatio}x)${this.config.colors.reset}`);
        }
      }
      // NEW: Display scalper signals
      if (opp.scalperPullback) {
        const sp = opp.scalperPullback;
        if (sp.isPerfectScalperEntry) {
          console.log(`   ${this.config.colors.bright}${this.config.colors.green}⚡💎 PERFECT SCALP ENTRY! (${sp.pullbackPercent}% pullback, RSI ${sp.rsi.toFixed(1)})${this.config.colors.reset}`);
        } else if (sp.isScalperEntry) {
          console.log(`   ${this.config.colors.green}⚡ SCALP ENTRY (${sp.pullbackPercent}% pullback, RSI ${sp.rsi.toFixed(1)})${this.config.colors.reset}`);
        }
      }
      
      // NEW: Display VWAP info
      if (opp.vwap) {
        const vwapStatus = opp.vwapDeviation > 0 ? 
          `${this.config.colors.green}+${opp.vwapDeviation.toFixed(2)}% above VWAP${this.config.colors.reset}` :
          `${this.config.colors.red}${opp.vwapDeviation.toFixed(2)}% below VWAP${this.config.colors.reset}`;
        console.log(`   💹 VWAP: ${opp.vwap.toFixed(6)} (${vwapStatus})`);
      }
      
      // NEW: Display MACD crossover
      if (opp.macdCross) {
        if (opp.macdCross.isBullish) {
          console.log(`   ${this.config.colors.green}📈 MACD: BULLISH CROSSOVER (Signal: ${opp.macdCross.signal.toFixed(4)})${this.config.colors.reset}`);
        } else if (opp.macdCross.isBearish) {
          console.log(`   ${this.config.colors.red}📉 MACD: BEARISH CROSSOVER (Signal: ${opp.macdCross.signal.toFixed(4)})${this.config.colors.reset}`);
        }
      }
      
      // NEW: Display Bollinger Bands
      if (opp.bollingerBands) {
        const bb = opp.bollingerBands;
        const currentPrice = opp.price;
        let bbStatus = '';
        
        if (currentPrice <= bb.lower * 1.002) {
          bbStatus = `${this.config.colors.green}Touching Lower Band${this.config.colors.reset}`;
        } else if (currentPrice >= bb.upper * 0.998) {
          bbStatus = `${this.config.colors.red}Touching Upper Band${this.config.colors.reset}`;
        } else {
          bbStatus = `${this.config.colors.yellow}Between Bands${this.config.colors.reset}`;
        }
        
        console.log(`   📊 Bollinger Bands: Width ${bb.bandwidth.toFixed(2)}% (${bbStatus})`);
      }
      console.log();
    });
  }

  generateScannerPrompt(opportunities, currentPositions, coinMapping) {
    let prompt = `\n[TOKEN SCANNER RESULTS - 50+ Tokens Analyzed]\n\n`;
    
    if (opportunities.length === 0) {
      prompt += `No high-confidence opportunities found in current market scan.\n`;
      prompt += `All scanned tokens are in neutral zones.\n\n`;
      return prompt;
    }
    
    prompt += `Found ${opportunities.length} HIGH-CONFIDENCE opportunities:\n\n`;
    opportunities.forEach((opp, index) => {
      const symbol = opp.symbol.replace('USDT', '');
      prompt += `${index + 1}. ${symbol} [Score: ${opp.score}/100]\n`;
      prompt += `   Action: ${opp.recommendedAction} @ ${opp.price.toFixed(6)}\n`;
      prompt += `   Confidence: ${(opp.confidence * 100).toFixed(0)}%\n`;
      if (opp.rsi !== null) {
        prompt += `   RSI: ${opp.rsi.toFixed(1)}`;
        if (opp.rsi < 30) prompt += ` (OVERSOLD - STRONG BUY SIGNAL)`;
        if (opp.rsi > 70) prompt += ` (OVERBOUGHT - STRONG SHORT SIGNAL)`;
        prompt += `\n`;
      }
      if (opp.volumeProfile) {
        if (opp.volumeProfile.isExtremeSpike) {
          prompt += `   Volume: EXTREME SPIKE (${(opp.volumeProfile.volumeRatio * 100).toFixed(0)}% of avg) - HIGH CONVICTION\n`;
        } else if (opp.volumeProfile.isSpike) {
          prompt += `   Volume: SPIKE (${(opp.volumeProfile.volumeRatio * 100).toFixed(0)}% of avg) - STRONG SIGNAL\n`;
        }
      }
      if (opp.breakout) {
        if (opp.breakout.isStrongBreakup) {
          prompt += `   Pattern: STRONG UPWARD BREAKOUT (+${opp.breakout.priceChange.toFixed(2)}%) with VOLUME CONFIRMATION\n`;
        } else if (opp.breakout.isStrongBreakdown) {
          prompt += `   Pattern: STRONG DOWNWARD BREAKOUT (${opp.breakout.priceChange.toFixed(2)}%) with VOLUME CONFIRMATION\n`;
        }
      }
      const hasPosition = currentPositions.some(p => p.symbol === opp.symbol);
      if (hasPosition) {
        prompt += `   WARNING: ALREADY IN POSITION - Consider for TP/SL adjustments or scaling\n`;
      } else {
        prompt += `   STATUS: NO POSITION - Fresh opportunity available\n`;
      }
      prompt += `\n`;
    });
    prompt += `[SCANNER RECOMMENDATIONS]\n`;
    prompt += `- PRIORITY: Focus on opportunities with Score >70 and Confidence >75%\n`;
    prompt += `- CONSIDER: Tokens with extreme RSI + volume spike = highest probability\n`;
    prompt += `- DIVERSIFY: If portfolio allows, consider top 2-3 scanner opportunities\n`;
    prompt += `- VALIDATE: Cross-reference scanner signals with your technical analysis\n\n`;
    return prompt;
  }
}

class AdvancedTradingBot {
  constructor(config) {
    this.config = config;
    this.client = new AsterDexSimpleClient(config.apiKey, config.secretKey);
    
    // ✅ Initialize Twitter client if enabled
    this.twitterClient = null;
    if (this.config.twitterEnabled && TwitterApi) {
      try {
        this.twitterClient = new TwitterApi({
          appKey: this.config.twitterApiKey,
          appSecret: this.config.twitterApiSecret,
          accessToken: this.config.twitterAccessToken,
          accessSecret: this.config.twitterAccessSecret,
        });
        console.log('✅ Twitter/X client initialized');
      } catch (error) {
        console.log(`⚠️  Twitter initialization failed: ${error.message}`);
        this.config.twitterEnabled = false;
      }
    }
    this.scanner = new TokenScanner(config); // INTEGRATED SCANNER
    this.startTime = Date.now();
    this.loopCount = 0;
    this.loopTimer = null; // ✅ Store timer reference for dynamic interval changes
    this.currentInterval = config.loopInterval; // ✅ Track current interval
    this.priceHistory = {};
    this.scannerOnlyMode = false; // ✅ Fallback mode when DeepSeek API is unavailable
    this.lastDeepSeekAttempt = Date.now(); // ✅ Track last API check
    this.technicalData = {};
    this.initialBalance = null;
    this.activePositions = new Map();
    this.dashboardExporter = dashboardExporter;
    this.totalFeesPaid = 0;
    this.slTpOrders = new Map();
    this.trailingStopActive = new Map();
    this.breakEvenActive = new Map();
    this.lastTPUpdate = new Map();
    this.apiFailureCount = 0;
    this.scannerResults = []; // Store latest scanner results
    this.recentlyClosed = new Map(); // NEW: Track recently closed positions {symbol: {closeTime, closeLoop}}
    this.scalperPositions = new Map(); // NEW: Track scalper positions separately
    
    // PERFORMANCE CACHES
    this.cache = {
      marketData: new Map(),           // Cache ticker/kline data
      marketDataExpiry: new Map(),     // Expiry timestamps
      klines4h: new Map(),             // Cache 4H candles (longer TTL)
      klines4hExpiry: new Map(),
      technicalIndicators: new Map(),  // Cache calculated indicators
      precisionRulesCache: new Map(),  // Cache precision lookups
      symbolMappingCache: new Map(),   // Cache symbol<->coin conversions
      lastPrices: new Map()            // Track price changes for smart invalidation
    };
    
    // Cache TTL settings (in milliseconds)
    this.cacheTTL = {
      marketData: 30000,      // 30 seconds for ticker/3min klines
      klines4h: 600000,       // 10 minutes for 4H data (changes slowly)
      technicalIndicators: 60000,  // 1 minute for calculated indicators
      precisionRules: Infinity // Never expire (static data)
    };
    
    // Performance metrics
    this.perfMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      cachedApiCalls: 0
    };
  }

  // CACHE HELPERS
  getCachedData(cacheMap, expiryMap, key) {
    if (!cacheMap.has(key)) {
      this.perfMetrics.cacheMisses++;
      return null;
    }
    
    const expiry = expiryMap.get(key);
    if (expiry && Date.now() > expiry) {
      // Expired
      cacheMap.delete(key);
      expiryMap.delete(key);
      this.perfMetrics.cacheMisses++;
      return null;
    }
    
    this.perfMetrics.cacheHits++;
    return cacheMap.get(key);
  }
  
  setCachedData(cacheMap, expiryMap, key, value, ttl) {
    cacheMap.set(key, value);
    if (ttl && ttl !== Infinity) {
      expiryMap.set(key, Date.now() + ttl);
    }
  }
  
  invalidateCache(symbol) {
    // Invalidate all caches for a specific symbol
    this.cache.marketData.delete(symbol);
    this.cache.marketDataExpiry.delete(symbol);
    this.cache.technicalIndicators.delete(symbol);
    this.cache.lastPrices.delete(symbol);
  }
  
  printCacheStats() {
    const total = this.perfMetrics.cacheHits + this.perfMetrics.cacheMisses;
    const hitRate = total > 0 ? (this.perfMetrics.cacheHits / total * 100).toFixed(1) : 0;
    console.log(`${this.config.colors.cyan}📊 Cache Performance:${this.config.colors.reset}`);
    console.log(`  Hit Rate: ${hitRate}% (${this.perfMetrics.cacheHits} hits / ${this.perfMetrics.cacheMisses} misses)`);
    console.log(`  API Calls Saved: ${this.perfMetrics.cachedApiCalls}`);
    console.log();
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    let gains = 0, losses = 0;
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) gains += changes[i];
      else losses += Math.abs(changes[i]);
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period; i < changes.length; i++) {
      const change = changes[i];
      if (change > 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateEMA(prices, period = 20) {
    if (prices.length < period) return null;
    
    // Calculate simple moving average for first period
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate EMA for remaining prices
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  calculateMACD(prices) {
    if (prices.length < 26) return null;
    
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    
    if (!ema12 || !ema26) return null;
    
    return ema12 - ema26;
  }


  calculateVolumeProfile(volumes) {
    if (volumes.length < 1) return null;
    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    const averageVolume = totalVolume / volumes.length;
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    const standardDeviation = Math.sqrt(
      volumes.reduce((a, b) => a + Math.pow(b - averageVolume, 2), 0) / volumes.length
    );
    return {
      totalVolume,
      averageVolume,
      maxVolume,
      minVolume,
      standardDeviation,
      volatility: standardDeviation / averageVolume
    };
  }

  calculateTechnicalIndicators(coin, prices) {
    if (prices.length < 20) return null;
    
    // CHECK CACHE FIRST - Use price array as part of cache key
    const currentPrice = prices[prices.length - 1];
    const cacheKey = `${coin}_${currentPrice.toFixed(6)}`;
    
    // Check if cached and still valid
    const cached = this.getCachedData(
      this.cache.technicalIndicators,
      new Map(), // Using separate expiry tracking
      cacheKey
    );
    
    if (cached) {
      this.perfMetrics.cachedApiCalls++;
      return cached;
    }
    
    // Calculate fresh indicators
    const indicators = {
      ema20: this.calculateEMA(prices, 20),
      macd: this.calculateMACD(prices),
      rsi14: this.calculateRSI(prices, 14)
    };
    
    // Cache the result with 1 minute TTL
    this.setCachedData(
      this.cache.technicalIndicators,
      new Map(), // Using cache.technicalIndicators for both data and expiry
      cacheKey,
      indicators,
      this.cacheTTL.technicalIndicators
    );
    
    this.perfMetrics.apiCalls++;
    return indicators;
  }

  roundQuantity(symbol, quantity) {
    // CHECK PRECISION CACHE FIRST
    const cacheKey = `${symbol}_precision`;
    let rules = this.getCachedData(
      this.cache.precisionRulesCache,
      new Map(),
      cacheKey
    );
    
    if (!rules) {
      // Cache miss - get from config and cache it
      rules = this.config.precisionRules[symbol];
      if (rules) {
        this.setCachedData(
          this.cache.precisionRulesCache,
          new Map(),
          cacheKey,
          rules,
          this.cacheTTL.precisionRules // Infinity - never expires
        );
      }
    }
    
    if (!rules) return parseFloat(quantity.toFixed(2));
    const precision = rules.quantity;
    const rounded = parseFloat(quantity.toFixed(precision));
    if (rounded < rules.minQty) return rules.minQty;
    return rounded;
  }

  roundPrice(symbol, price) {
    // CHECK PRECISION CACHE FIRST
    const cacheKey = `${symbol}_precision`;
    let rules = this.getCachedData(
      this.cache.precisionRulesCache,
      new Map(),
      cacheKey
    );
    
    if (!rules) {
      // Cache miss - get from config and cache it
      rules = this.config.precisionRules[symbol];
      if (rules) {
        this.setCachedData(
          this.cache.precisionRulesCache,
          new Map(),
          cacheKey,
          rules,
          this.cacheTTL.precisionRules // Infinity - never expires
        );
      }
    }
    
    if (!rules || !rules.price) return parseFloat(price.toFixed(2));
    return parseFloat(price.toFixed(rules.price));
  }

  // PRE-ORDER VALIDATION - CATCHES ERRORS BEFORE SUBMISSION
  validateOrderParameters(symbol, quantity, leverage, price) {
    const rules = this.config.precisionRules[symbol];
    const errors = [];
    
    if (!rules) {
      errors.push(`No precision rules defined for ${symbol}`);
      return { valid: false, errors };
    }
    
    // Check minimum quantity
    if (quantity < rules.minQty) {
      errors.push(`Quantity ${quantity} below minimum ${rules.minQty}`);
    }
    
    // Check notional value
    const notional = quantity * price;
    if (notional < this.config.minNotionalValue) {
      errors.push(`Notional ${notional.toFixed(2)} below minimum ${this.config.minNotionalValue}`);
    }
    
    // Check precision (quantity should match rules.quantity decimal places)
    const quantityStr = quantity.toString();
    const decimalIndex = quantityStr.indexOf('.');
    if (decimalIndex >= 0) {
      const decimals = quantityStr.length - decimalIndex - 1;
      if (decimals > rules.quantity) {
        errors.push(`Quantity precision ${decimals} exceeds maximum ${rules.quantity}`);
      }
    }
    
    // Check margin requirements
    const requiredMargin = notional / leverage;
    if (requiredMargin < 0.5) {
      errors.push(`Required margin ${requiredMargin.toFixed(2)} too low`);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors,
      notional: notional,
      requiredMargin: requiredMargin
    };
  }

  isRealPosition(position) {
    const posAmt = parseFloat(position.positionAmt || 0);
    const entryPrice = parseFloat(position.entryPrice || 0);
    const notional = parseFloat(position.notional || 0);
    return (Math.abs(posAmt) > 0.0000001 && entryPrice > 0) || Math.abs(notional) > 0.001;
  }

  async validateEntryWithDeepSeek(symbol, side, price, opportunity, marketData) {
    try {
      console.log(`${this.config.colors.cyan}🤖 VALIDATING ENTRY WITH DEEPSEEK...${this.config.colors.reset}\n`);
      
      // Get market data for different timeframes
      const tf24h = marketData[symbol]?.timeframes?.['24h'];
      const tf4h = marketData[symbol]?.timeframes?.['4h'];
      const tf1h = marketData[symbol]?.timeframes?.['1h'];
      
      // Prepare validation prompt
      const validationPrompt = `You are a professional crypto trader. Validate this entry:

Symbol: ${symbol}
Side: ${side}
Current Price: ${price}

24H Range: ${tf24h?.low?.toFixed(6)} - ${tf24h?.high?.toFixed(6)}
4H Range: ${tf4h?.low?.toFixed(6)} - ${tf4h?.high?.toFixed(6)}
1H Range: ${tf1h?.low?.toFixed(6)} - ${tf1h?.high?.toFixed(6)}

Opportunity Score: ${opportunity?.score || 'N/A'}
RSI: ${opportunity?.rsi?.toFixed(2) || 'N/A'}
VWAP: ${opportunity?.vwap?.toFixed(6) || 'N/A'}
MACD: ${opportunity?.macdCross ? 'Bullish' : 'Bearish'}

Rules:
- For LONG entries, price should be cheap (bottom 30% of 24h range)
- For SHORT entries, price should be expensive (top 30% of 24h range)
- VWAP should confirm the direction
- MACD should confirm the direction
- RSI should not be overextended

Respond ONLY with a JSON object:
{
  \"validated\": boolean,
  \"confidence\": number (0-1),
  \"reasoning\": \"brief explanation\",
  \"priceQuality\": \"excellent|good|fair|poor\",
  \"recommendation\": \"enter|wait|avoid\"
}`;

      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: this.config.deepseekModel,
          messages: [{ role: 'user', content: validationPrompt }],
          temperature: 0.3,
          max_tokens: 300
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.deepseekApiKey}`
          },
          timeout: 15000
        }
      );

      const aiResponse = response.data.choices[0].message.content.trim();
      console.log(`${this.config.colors.cyan}🤖 DeepSeek Validation Response:${this.config.colors.reset}`);
      console.log(aiResponse);
      console.log();

      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`${this.config.colors.red}❌ Failed to parse DeepSeek response${this.config.colors.reset}\n`);
        return { validated: false, reasoning: 'Invalid response format' };
      }

      const validationResult = JSON.parse(jsonMatch[0]);
      
      // ✅ LOG AI DECISION
      this.dashboardExporter.logAIDecision({
        type: 'entry_validation',
        coin: symbol.replace('USDT', ''),
        action: side.toUpperCase(),
        confidence: validationResult.confidence || 0,
        reasoning: validationResult.reasoning || '',
        result: validationResult.validated && validationResult.recommendation === 'enter' ? 'approved' : 'rejected',
        price: price,
        priceQuality: validationResult.priceQuality || 'unknown',
        scannerScore: opportunity?.score || 0
      });
      
      // Log validation result
      if (validationResult.validated && validationResult.recommendation === 'enter') {
        console.log(`${this.config.colors.green}✅ DEEPSEEK VALIDATION: GREEN FLAG${this.config.colors.reset}`);
        console.log(`   Confidence: ${(validationResult.confidence * 100).toFixed(0)}%`);
        console.log(`   Price Quality: ${validationResult.priceQuality.toUpperCase()}`);
        console.log(`   ${validationResult.reasoning}`);
        console.log();
      } else {
        console.log(`${this.config.colors.red}🚫 DEEPSEEK VALIDATION: RED FLAG${this.config.colors.reset}`);
        console.log(`   Recommendation: ${validationResult.recommendation.toUpperCase()}`);
        console.log(`   ${validationResult.reasoning}`);
        console.log();
      }
      
      return validationResult;

    } catch (error) {
      console.log(`${this.config.colors.red}❌ DeepSeek validation error: ${error.message}${this.config.colors.reset}\n`);
      
      // ✅ LOG ERROR
      this.dashboardExporter.logAIDecision({
        type: 'entry_validation',
        coin: symbol.replace('USDT', ''),
        action: side.toUpperCase(),
        confidence: 0,
        reasoning: `Validation service error: ${error.message}`,
        result: 'error',
        price: price
      });
      
      // ✅ LOG DEEPSEEK ERROR
      this.dashboardExporter.logDeepSeekConversation(
        validationPrompt,
        null,
        null,
        `DeepSeek validation error: ${error.message}`
      );
      
      // On error, be conservative and reject the trade
      return { validated: false, reasoning: 'Validation service error' };
    }
  }

  async loadHistoricalTrades() {
    console.log(`${this.config.colors.cyan}📜 Loading historical trades from Asterdex...${this.config.colors.reset}`);
    
    try {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // Last 7 days
      
      let totalLoaded = 0;
      
      // Extended list: main trading pairs + other common symbols
      const allSymbols = [
        ...this.config.tradingPairs,  // Main 8 coins
        'APTUSDT', 'NEARUSDT', 'ARBUSDT', 'OPUSDT', 'DOTUSDT',  // Additional coins
        'LINKUSDT', 'MATICUSDT', 'AVAXUSDT', 'UNIUSDT', 'LTCUSDT'  // More common ones
      ];
      
      // Remove duplicates
      const uniqueSymbols = [...new Set(allSymbols)];

      // Fetch trades for each symbol
      for (const symbol of uniqueSymbols) {
        try {
          console.log(`  🔍 Checking ${symbol}...`);
          
          // Get account trades from Asterdex using raw API request
          // Asterdex follows Binance Futures API: /fapi/v1/userTrades
          const response = await this.client.request('GET', '/fapi/v1/userTrades', {
            symbol: symbol,
            startTime: sevenDaysAgo,
            limit: 500
          }, true);
          
          if (!response.data || !Array.isArray(response.data)) {
            console.log(`     ℹ️  No trades found for ${symbol}`);
            continue;
          }
          
          const trades = response.data;
          console.log(`     📊 Found ${trades.length} raw trades`);
          
          if (trades.length === 0) {
            continue;
          }
          
          // Group trades by BUY/SELL pairs to calculate PnL
          // Asterdex uses 'buyer' field: true = BUY, false = SELL
          const buyTrades = trades.filter(t => t.buyer === true);
          const sellTrades = trades.filter(t => t.buyer === false);
          
          console.log(`     ${buyTrades.length} BUYs, ${sellTrades.length} SELLs`);
          
          // Match BUY with SELL to create completed trades
          const minLength = Math.min(buyTrades.length, sellTrades.length);
          
          if (minLength === 0) {
            console.log(`     ⚠️  Can't pair trades (need both BUY and SELL)`);
            continue;
          }
          
          for (let i = 0; i < minLength; i++) {
            const buy = buyTrades[i];
            const sell = sellTrades[i];
            
            // Parse trade data (handle both formats)
            const entryPrice = parseFloat(buy.price);
            const exitPrice = parseFloat(sell.price);
            const quantity = parseFloat(buy.qty || buy.quantity || 0);
            
            // Commission handling
            const entryFee = parseFloat(buy.commission || 0);
            const exitFee = parseFloat(sell.commission || 0);
            const totalFee = entryFee + exitFee;
            
            // Calculate PnL (assuming LONG positions from history)
            const pnlUSDT = (exitPrice - entryPrice) * quantity - totalFee;
            const profitPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
            const isProfit = pnlUSDT > 0;
            
            // Time handling (Asterdex uses 'time' field in milliseconds)
            const buyTime = parseInt(buy.time || buy.timestamp || Date.now());
            const sellTime = parseInt(sell.time || sell.timestamp || Date.now());
            const holdTime = Math.abs(sellTime - buyTime) / 60000; // minutes
            
            const coin = this.config.coinMapping[symbol] || symbol.replace('USDT', '');
            
            // Log to dashboard
            this.dashboardExporter.logCompletedTrade({
              symbol: symbol,
              side: 'LONG',
              coin: coin,
              entryPrice: entryPrice,
              exitPrice: exitPrice,
              quantity: quantity,
              pnlUSDT: pnlUSDT,
              profitPercent: profitPercent,
              leverage: 1, // Historical trades don't have leverage info
              holdTime: holdTime,
              openedAt: buyTime,
              reason: 'Historical trade',
              isProfit: isProfit
            });
            
            totalLoaded++;
          }
          
          console.log(`     ✅ Loaded ${minLength} completed trade(s) for ${symbol}`);
          
        } catch (symbolError) {
          console.error(`     ❌ Error loading ${symbol} trades: ${symbolError.message}`);
        }
      }
      
      if (totalLoaded > 0) {
        console.log(`${this.config.colors.green}✅ Loaded ${totalLoaded} total completed trades from history${this.config.colors.reset}\n`);
      } else {
        console.log(`${this.config.colors.yellow}⚠️  No historical trades found (this is normal for new accounts)${this.config.colors.reset}\n`);
      }
      
    } catch (error) {
      console.error(`${this.config.colors.red}❌ Error loading historical trades: ${error.message}${this.config.colors.reset}\n`);
    }
  }

  async run() {
    console.log(`${this.config.colors.cyan}${this.config.colors.bright}`);
    console.log('================================================================================');
    console.log('🚀 ADVANCED TRADING BOT - WITH TOKEN SCANNER (50+ TOKENS)');
    console.log('================================================================================');
    console.log(this.config.colors.reset);
    
    // ✅ Display system information
    console.log(`${this.config.colors.bright}💻 SYSTEM INFORMATION${this.config.colors.reset}`);
    console.log(`   OS: ${SYSTEM_INFO.osType} (${SYSTEM_INFO.platform})`);
    console.log(`   Node.js: ${SYSTEM_INFO.nodeVersion}`);
    console.log(`   CPU Cores: ${SYSTEM_INFO.cpuCount}`);
    console.log(`   Total RAM: ${SYSTEM_INFO.totalMemoryGB} GB`);
    console.log(`   Free RAM: ${SYSTEM_INFO.freeMemoryGB} GB (${100 - parseFloat(SYSTEM_INFO.memoryUsagePercent)}% free)`);
    console.log(`   Heap Used: ${SYSTEM_INFO.heapUsedMB} MB / ${SYSTEM_INFO.heapTotalMB} MB`);
    
    // Performance recommendations
    if (SYSTEM_INFO.isLinux) {
      console.log(`   ${this.config.colors.green}✅ Linux detected - Optimal for trading bots${this.config.colors.reset}`);
    } else if (SYSTEM_INFO.isWindows) {
      console.log(`   ${this.config.colors.cyan}ℹ️  Windows detected - Consider WSL2 for better performance${this.config.colors.reset}`);
    }
    
    if (SYSTEM_INFO.cpuCount < 4) {
      console.log(`   ${this.config.colors.yellow}⚠️  Low CPU count detected (${SYSTEM_INFO.cpuCount} cores)${this.config.colors.reset}`);
    }
    
    if (parseFloat(SYSTEM_INFO.freeMemoryGB) < 1) {
      console.log(`   ${this.config.colors.yellow}⚠️  Low free memory (${SYSTEM_INFO.freeMemoryGB} GB)${this.config.colors.reset}`);
    }
    
    console.log();
    console.log(`Start: ${new Date().toLocaleString()}`);
    console.log(`Interval: ${this.config.loopInterval / 1000}s`);
    console.log(`Max Positions: ${this.config.maxPositions}`);
    console.log(`\n${this.config.colors.magenta}${this.config.colors.bright}🔍 TOKEN SCANNER: ${this.config.scannerEnabled ? 'ENABLED' : 'DISABLED'}${this.config.colors.reset}`);
    if (this.config.scannerEnabled) {
      console.log(`  Scans ${this.scanner.scanTokens.length} tokens every ${this.config.scannerInterval} loops (${this.config.scannerInterval * this.config.loopInterval / 60000} mins)`);
      console.log(`  Shows top ${this.config.scannerTopResults} opportunities to AI`);
    }
    console.log(`\n${this.config.colors.green}Break-Even SL: ${this.config.breakEvenEnabled ? 'ENABLED' : 'DISABLED'}${this.config.colors.reset}`);
    if (this.config.breakEvenEnabled) {
      console.log(`  Trigger: ${this.config.breakEvenProfitTrigger}% profit OR 60+ mins in profit`);
    }
    console.log(`\n${this.config.colors.green}Dynamic TP: ${this.config.dynamicTPEnabled ? 'ENABLED' : 'DISABLED'}${this.config.colors.reset}`);
    console.log(`\n${this.config.colors.green}Trailing SL: ${this.config.trailingStopEnabled ? 'ENABLED' : 'DISABLED'}${this.config.colors.reset}`);
    console.log(`\n${this.config.colors.cyan}Orphan Order Cleanup: ENABLED${this.config.colors.reset}\n`);

    // ✅ Load historical trades on startup
    await this.loadHistoricalTrades();

    await this.tradingLoop();
    this.scheduleNextLoop(); // ✅ Dynamic scheduling based on positions
  }
  
  /**
   * Schedule next loop with dynamic interval based on open positions
   */
  scheduleNextLoop() {
    // Clear existing timer if any
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
    }
    
    // Determine interval based on whether we have positions
    const hasPositions = this.activePositions.size > 0;
    const interval = hasPositions 
      ? this.config.loopIntervalWithPositions  // 15 seconds when positions open
      : this.config.loopInterval;              // 60 seconds when no positions
    
    // Log interval change if it's different
    if (interval !== this.currentInterval) {
      const oldSeconds = this.currentInterval / 1000;
      const newSeconds = interval / 1000;
      console.log(`${this.config.colors.cyan}⏱️  Loop interval changed: ${oldSeconds}s → ${newSeconds}s (${hasPositions ? 'positions open' : 'no positions'})${this.config.colors.reset}`);
      this.currentInterval = interval;
    }
    
    // Schedule next loop
    this.loopTimer = setTimeout(() => this.tradingLoop(), interval);
  }

  async tradingLoop() {
    this.loopCount++;
    const mins = Math.floor((Date.now() - this.startTime) / 60000);

    console.log(`\n${this.config.colors.cyan}${this.config.colors.bright}`);
    console.log('================================================================================');
    console.log(`🔄 LOOP #${this.loopCount} (${mins} minutes)`);
    console.log('================================================================================');
    console.log(this.config.colors.reset);
    
    // ✅ Show system performance every 10 loops
    if (this.loopCount % 10 === 0) {
      const memUsage = process.memoryUsage();
      const heapUsedMB = (memUsage.heapUsed / (1024 ** 2)).toFixed(2);
      const heapTotalMB = (memUsage.heapTotal / (1024 ** 2)).toFixed(2);
      const rss = (memUsage.rss / (1024 ** 2)).toFixed(2);
      const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
      
      console.log(`${this.config.colors.blue}📊 System Status: Heap ${heapUsedMB}/${heapTotalMB} MB | RSS ${rss} MB | Free RAM ${freeMemGB} GB${this.config.colors.reset}`);
      
      // Suggest GC if heap is high
      if (parseFloat(heapUsedMB) > parseFloat(heapTotalMB) * 0.85) {
        console.log(`${this.config.colors.yellow}⚠️  High memory usage detected - Consider running with --expose-gc flag${this.config.colors.reset}`);
      }
    }

    try {
      // ✅ Check if we should attempt to reconnect to DeepSeek
      if (this.scannerOnlyMode && Date.now() - this.lastDeepSeekAttempt > 300000) { // 5 minutes
        console.log(`${this.config.colors.cyan}📡 Attempting to reconnect to DeepSeek API...${this.config.colors.reset}`);
        try {
          // Test API connectivity
          const testPrompt = "Return only: {\"action\":\"hold\",\"coin\":\"BTC\",\"reasoning\":\"Test connection\",\"confidence\":0.5,\"quantity\":0,\"leverage\":0}";
          await this.callDeepSeekAPIWithRetry(testPrompt);
          
          // If successful, exit fallback mode
          console.log(`${this.config.colors.green}✅ DeepSeek API reconnected - EXITING SCANNER-ONLY MODE${this.config.colors.reset}`);
          this.scannerOnlyMode = false;
          this.apiFailureCount = 0;
          this.lastDeepSeekAttempt = Date.now();
          
          // Update dashboard to show normal mode
          this.dashboardExporter.updateAIRecommendation(
            '🤖 AI MODE RESTORED',
            'DeepSeek API reconnected - Normal trading mode active'
          );
        } catch (testError) {
          console.log(`${this.config.colors.yellow}⚠️  DeepSeek API still unavailable${this.config.colors.reset}`);
          this.lastDeepSeekAttempt = Date.now();
        }
      }
      
      // ✅ If in scanner-only mode, make decisions without AI
      if (this.scannerOnlyMode) {
        console.log(`${this.config.colors.yellow}📡 Operating in SCANNER-ONLY MODE due to API issues${this.config.colors.reset}`);
        
        // Get account info
        const accountInfo = await this.client.getAccount();
        
        let balance = 0;
        let totalBalance = 0;
        
        if (accountInfo.data) {
          balance = parseFloat(
            accountInfo.data.availableBalance || 
            accountInfo.data.available_balance ||
            accountInfo.data.availBalance ||
            accountInfo.data.balance ||
            0
          );
          
          totalBalance = parseFloat(
            accountInfo.data.totalWalletBalance || 
            accountInfo.data.total_wallet_balance ||
            accountInfo.data.totalBalance ||
            accountInfo.data.total ||
            balance
          );
        }
        
        console.log(`📊 Balance: ${balance.toFixed(2)} USDT (Total: ${totalBalance.toFixed(2)})`);
        
        const canOpenNewPositions = balance >= this.config.minBalancePerPosition;
        
        // Get current positions
        const positionsResult = await this.client.getPositions();
        
        let positionsData = [];
        if (Array.isArray(positionsResult.data)) {
          positionsData = positionsResult.data;
        } else if (positionsResult.data && Array.isArray(positionsResult.data.positions)) {
          positionsData = positionsResult.data.positions;
        } else if (positionsResult.data && typeof positionsResult.data === 'object') {
          positionsData = Object.values(positionsResult.data);
        } else {
          positionsData = [];
        }
        
        const openPositions = positionsData.filter(p => this.isRealPosition(p));
        
        console.log(`📊 Positions: ${openPositions.length}/${this.config.maxPositions} open`);
        
        // ✅ MANAGE EXISTING POSITIONS (break-even, trailing SL, auto-close)
        if (openPositions.length > 0) {
          await this.checkAndManagePositions(openPositions);
        }
        
        // Check if we can open more positions
        const canOpenMore = openPositions.length < this.config.maxPositions && canOpenNewPositions;
        
        // Make scanner-only decision
        const scannerDecision = await this.makeScannerOnlyDecision(openPositions, balance, canOpenMore);
        
        if (scannerDecision) {
          await this.executeDecision(scannerDecision, balance, openPositions, {});
        }
        
        // Export dashboard data in scanner-only mode
        try {
          const balanceData = await this.client.getBalance();
          const account = await this.client.getAccount();
          
          const availableBalance = Array.isArray(balanceData.data)
            ? parseFloat(balanceData.data.find(b => b.asset === 'USDT')?.availableBalance || 0)
            : 0;
          
          const totalWalletBalance = parseFloat(account.data?.totalWalletBalance || 0);
          const totalMarginBalance = parseFloat(account.data?.totalMarginBalance || 0);
          const totalUnrealizedProfit = parseFloat(account.data?.totalUnrealizedProfit || 0);
          
          // Prepare positions data
          const dashboardPositions = Array.from(this.activePositions.values()).map(pos => ({
            symbol: pos.symbol,
            coin: this.config.coinMapping[pos.symbol],
            positionAmt: pos.side === 'long' ? pos.quantity : -pos.quantity,
            side: pos.side,
            entryPrice: pos.entryPrice,
            markPrice: pos.currentPrice || pos.entryPrice,
            leverage: pos.leverage,
            notional: Math.abs(pos.quantity * (pos.currentPrice || pos.entryPrice)),
            unrealizedPnL: pos.unrealizedPnL || 0,
            openTime: pos.openTime,
            stopLoss: pos.stopLoss,
            takeProfit: pos.takeProfit
          }));
          
          // Calculate trade statistics from completed trades
          const completedTrades = this.dashboardExporter.completedTradesLog || [];
          const totalRealizedPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
          const totalFees = completedTrades.reduce((sum, trade) => sum + (trade.fee || 0), 0);
          const winningTrades = completedTrades.filter(t => t.isProfit).length;
          const losingTrades = completedTrades.filter(t => !t.isProfit).length;
          const totalTrades = completedTrades.length;
          const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
          
          // Account summary with trade stats
          const accountSummary = {
            totalUnrealizedPnL: totalUnrealizedProfit,
            availableCash: availableBalance,
            totalWalletBalance: totalWalletBalance,
            totalMarginBalance: totalMarginBalance,
            
            // Trade statistics
            totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
            totalFees: parseFloat(totalFees.toFixed(2)),
            netPnL: parseFloat((totalRealizedPnL - totalFees).toFixed(2)),
            totalTrades: totalTrades,
            winningTrades: winningTrades,
            losingTrades: losingTrades,
            winRate: parseFloat(winRate.toFixed(1)),
            
            timestamp: Date.now(),
            fallbackMode: true, // ✅ Indicate fallback mode in dashboard
            apiFailures: this.apiFailureCount
          };
          
          // Export to dashboard
          this.dashboardExporter.exportData(
            dashboardPositions,
            accountSummary,
            this.scannerResults || []
          );
          
          console.log(`${this.config.colors.green}✅ Scanner-only loop completed${this.config.colors.reset}\n`);
          
          // ✅ Schedule next loop and return early
          this.scheduleNextLoop();
          return;
        } catch (exportError) {
          console.error('⚠️  Dashboard export error in scanner-only mode:', exportError.message);
        }
        
        console.log(`${this.config.colors.green}✅ Scanner-only loop completed${this.config.colors.reset}\n`);
        
        // ✅ Schedule next loop and return early
        this.scheduleNextLoop();
        return;
      }
      
      // Step 1: Account
      const accountInfo = await this.client.getAccount();
      
      let balance = 0;
      let totalBalance = 0;
      
      if (accountInfo.data) {
        balance = parseFloat(
          accountInfo.data.availableBalance || 
          accountInfo.data.available_balance ||
          accountInfo.data.availBalance ||
          accountInfo.data.balance ||
          0
        );
        
        totalBalance = parseFloat(
          accountInfo.data.totalWalletBalance || 
          accountInfo.data.total_wallet_balance ||
          accountInfo.data.totalBalance ||
          accountInfo.data.total ||
          balance
        );
      }
      
      console.log(`📊 Balance: ${balance.toFixed(2)} USDT (Total: ${totalBalance.toFixed(2)})`);
      if (this.totalFeesPaid > 0) {
        console.log(`   Fees: ${this.totalFeesPaid.toFixed(4)}`);
      }
      
      const canOpenNewPositions = balance >= this.config.minBalancePerPosition;
      
      if (!canOpenNewPositions) {
        console.log(`${this.config.colors.yellow}⚠️  LOW AVAILABLE BALANCE${this.config.colors.reset}`);
        console.log(`   Available: ${balance.toFixed(2)} USDT (Required: ${this.config.minBalancePerPosition.toFixed(2)} USDT)`);
        console.log(`   ${this.config.colors.cyan}📊 Will manage existing positions only${this.config.colors.reset}\n`);
      }

      // Step 2: Get current positions
      const positionsResult = await this.client.getPositions();
      
      let positionsData = [];
      if (Array.isArray(positionsResult.data)) {
        positionsData = positionsResult.data;
      } else if (positionsResult.data && Array.isArray(positionsResult.data.positions)) {
        positionsData = positionsResult.data.positions;
      } else if (positionsResult.data && typeof positionsResult.data === 'object') {
        positionsData = Object.values(positionsResult.data);
      } else {
        positionsData = [];
      }
      
      const openPositions = positionsData.filter(p => this.isRealPosition(p));
      
      console.log(`📊 Positions: ${openPositions.length}/${this.config.maxPositions} open`);
      
      const hasUntrackedPositions = openPositions.some(p => !this.activePositions.has(p.symbol));
      
      if (this.activePositions.size > 0) {
        console.log(`📊 Tracked: ${this.activePositions.size} position(s) in memory`);
      }
      
      if (hasUntrackedPositions) {
        console.log(`${this.config.colors.yellow}⚠️  UNTRACKED POSITIONS DETECTED${this.config.colors.reset}`);
      }
      console.log();

      // Step 3: TOKEN SCANNER (runs every N loops)
      if (this.config.scannerEnabled && this.loopCount % this.config.scannerInterval === 0) {
        console.log(`${this.config.colors.magenta}${this.config.colors.bright}┌─────────────────────────────────────────────────────────┐${this.config.colors.reset}`);
        console.log(`${this.config.colors.magenta}${this.config.colors.bright}🔍 RUNNING TOKEN SCANNER${this.config.colors.reset}`);
        console.log(`${this.config.colors.magenta}${this.config.colors.bright}└─────────────────────────────────────────────────────────┘${this.config.colors.reset}`);
        
        const scanResults = await this.scanner.scanAllTokens();
        const topOpportunities = this.scanner.getTopOpportunities(scanResults, this.config.scannerTopResults);
        this.scannerResults = topOpportunities;
        
        this.scanner.formatOpportunities(topOpportunities);
        
        console.log(`${this.config.colors.magenta}${this.config.colors.bright}└─────────────────────────────────────────────────────────┘${this.config.colors.reset}\n`);
      }

      // Step 4: Clean up orphan orders
      await this.cleanupOrphanOrders(openPositions);

      // Step 5: Check positions for break-even, trailing SL, and SL/TP hits
      await this.checkAndManagePositions(openPositions);

      // Step 6: Display current positions
      if (openPositions.length > 0) {
        openPositions.forEach(pos => {
          const coin = this.config.coinMapping[pos.symbol] || pos.symbol.replace('USDT', '');
          const amt = parseFloat(pos.positionAmt);
          const entry = parseFloat(pos.entryPrice);
          const mark = parseFloat(pos.markPrice || entry);
          const pnl = parseFloat(pos.unRealizedProfit || 0);
          const tracked = this.activePositions.get(pos.symbol);
          
          const status = tracked ? '✓ TRACKED' : '⚠️  UNTRACKED';
          const breakEvenActive = this.breakEvenActive.get(pos.symbol);
          const trailingActive = this.trailingStopActive.get(pos.symbol);
          
          console.log(`  ${coin} [${status}]: ${amt > 0 ? 'LONG' : 'SHORT'} ${Math.abs(amt)} @ ${entry.toFixed(4)}`);
          console.log(`    Mark: ${mark.toFixed(4)}, PnL: ${pnl.toFixed(2)} USDT`);
          
          if (tracked) {
            const holdTime = (Date.now() - tracked.openTime) / 60000;
            const leverage = tracked.leverage || 1;
            const priceChangePercent = amt > 0 
              ? ((mark - entry) / entry) * 100
              : ((entry - mark) / entry) * 100;
            const actualProfitPercent = priceChangePercent * leverage;
            
            // ✅ FIX: Sync tracked entry with exchange entry
            if (tracked && Math.abs(tracked.entryPrice - entry) > 0.0001) {
              console.log(`    ${this.config.colors.yellow}⚠️  Syncing entry: ${tracked.entryPrice.toFixed(4)} → ${entry.toFixed(4)}${this.config.colors.reset}`);
              tracked.entryPrice = entry;
              this.activePositions.set(pos.symbol, tracked);
            }
            
            console.log(`    Leverage: ${leverage}x | Actual Profit: ${actualProfitPercent.toFixed(2)}%`);
            console.log(`    Hold Time: ${holdTime.toFixed(1)} mins`);
            console.log(`    SL: ${tracked.stopLoss.toFixed(4)}, TP: ${tracked.takeProfit.toFixed(4)}`);
            
            if (trailingActive) {
              console.log(`    ${this.config.colors.green}🔒 TRAILING SL ACTIVE (Profit Protected)${this.config.colors.reset}`);
            } else if (breakEvenActive) {
              console.log(`    ${this.config.colors.cyan}⚖️  BREAK-EVEN ACTIVE (Zero-Loss Protection)${this.config.colors.reset}`);
            }
            
            const side = amt > 0 ? 'LONG' : 'SHORT';
            if (side === 'LONG') {
              const slDist = ((mark - tracked.stopLoss) / mark * 100).toFixed(2);
              const tpDist = ((tracked.takeProfit - mark) / mark * 100).toFixed(2);
              console.log(`    Distance: SL -${slDist}%, TP +${tpDist}%`);
            } else {
              const slDist = ((tracked.stopLoss - mark) / mark * 100).toFixed(2);
              const tpDist = ((mark - tracked.takeProfit) / mark * 100).toFixed(2);
              console.log(`    Distance: SL +${slDist}%, TP +${tpDist}%`);
            }
          } else {
            console.log(`    ${this.config.colors.yellow}⚠️  No SL/TP set - AI will decide${this.config.colors.reset}`);
          }
        });
        console.log();
      }

      // Step 7: Fetch market data
      console.log(`📊 Fetching market data...\n`);
      const marketData = await this.fetchAllMarketData();

      if (Object.keys(marketData).length === 0) {
        console.log(`${this.config.colors.red}❌ No market data available${this.config.colors.reset}\n`);
        return;
      }

      // Step 8: Get AI decision
      const canOpenMore = openPositions.length < this.config.maxPositions && canOpenNewPositions;
      
      const prompt = this.generatePrompt(marketData, balance, openPositions, mins, canOpenMore);
      console.log(`📝 AI PROMPT (${prompt.length} chars)`);
      console.log(prompt.substring(0, 400) + '...\n');

      console.log(`🤖 Calling DeepSeek AI...\n`);
      const aiResponse = await this.callDeepSeekAPIWithRetry(prompt);
      
      this.apiFailureCount = 0;
      
      console.log(`${this.config.colors.cyan}🤖 AI RESPONSE:${this.config.colors.reset}`);
      console.log(aiResponse + '\n');

      const decision = this.parseAIResponse(aiResponse);
      
      // ✅ LOG DEEPSEEK CONVERSATION TO responses.json
      this.dashboardExporter.logDeepSeekConversation(
        prompt,
        aiResponse,
        decision,
        null
      );
      
      if (decision) {
        await this.executeDecision(decision, balance, openPositions, marketData);
      } else {
        console.log(`${this.config.colors.red}❌ Failed to parse AI response${this.config.colors.reset}\n`);
      }

      console.log(`${this.config.colors.green}✅ Loop #${this.loopCount} completed${this.config.colors.reset}\n`);
      
      // ==========================================
      // EXPORT DATA TO DASHBOARD
      // ==========================================
      try {
        const balance = await this.client.getBalance();
        const account = await this.client.getAccount();
        
        const availableBalance = Array.isArray(balance.data)
          ? parseFloat(balance.data.find(b => b.asset === 'USDT')?.availableBalance || 0)
          : 0;
        
        const totalWalletBalance = parseFloat(account.data?.totalWalletBalance || 0);
        const totalMarginBalance = parseFloat(account.data?.totalMarginBalance || 0);
        const totalUnrealizedProfit = parseFloat(account.data?.totalUnrealizedProfit || 0);
        
        // Prepare positions data
        const dashboardPositions = Array.from(this.activePositions.values()).map(pos => ({
          symbol: pos.symbol,
          coin: this.config.coinMapping[pos.symbol],
          positionAmt: pos.side === 'long' ? pos.quantity : -pos.quantity,
          side: pos.side,
          entryPrice: pos.entryPrice,
          markPrice: pos.currentPrice || pos.entryPrice,
          leverage: pos.leverage,
          notional: Math.abs(pos.quantity * (pos.currentPrice || pos.entryPrice)),
          unrealizedPnL: pos.unrealizedPnL || 0,
          openTime: pos.openTime,
          stopLoss: pos.stopLoss,
          takeProfit: pos.takeProfit
        }));
        
        // Calculate trade statistics from completed trades
        const completedTrades = this.dashboardExporter.completedTradesLog || [];
        const totalRealizedPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const totalFees = completedTrades.reduce((sum, trade) => sum + (trade.fee || 0), 0);
        const winningTrades = completedTrades.filter(t => t.isProfit).length;
        const losingTrades = completedTrades.filter(t => !t.isProfit).length;
        const totalTrades = completedTrades.length;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
        
        // Account summary with trade stats
        const accountSummary = {
          totalUnrealizedPnL: totalUnrealizedProfit,
          availableCash: availableBalance,
          totalWalletBalance: totalWalletBalance,  // ✅ Safe Balance (locked display)
          totalMarginBalance: totalMarginBalance,
          
          // ✅ Trade statistics (for dashboard stats display)
          totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
          totalFees: parseFloat(totalFees.toFixed(2)),
          netPnL: parseFloat((totalRealizedPnL - totalFees).toFixed(2)),
          totalTrades: totalTrades,
          winningTrades: winningTrades,
          losingTrades: losingTrades,
          winRate: parseFloat(winRate.toFixed(1)),
          
          timestamp: Date.now()
        };
        
        // Export to dashboard
        this.dashboardExporter.exportData(
          dashboardPositions,
          accountSummary,
          this.scannerResults || []
        );
        
      } catch (exportError) {
        console.error('⚠️  Dashboard export error:', exportError.message);
      }
      // ==========================================

      // ✅ Schedule next loop dynamically
      this.scheduleNextLoop();

    } catch (error) {
      console.error(`${this.config.colors.red}❌ Loop error: ${error.message}${this.config.colors.reset}`);
      console.error(error.stack);
      
      if (error.message.includes('DeepSeek') || error.message.includes('API')) {
        this.apiFailureCount++;
        
        // ✅ LOG DEEPSEEK ERROR
        this.dashboardExporter.logDeepSeekConversation(
          'Error - Prompt not available',
          null,
          null,
          error.message
        );
        
        // ✅ Activate fallback mode after 3 consecutive failures
        if (this.apiFailureCount >= 3) {
          console.log(`${this.config.colors.red}🚨 ${this.apiFailureCount} consecutive API failures - ACTIVATING SCANNER-ONLY MODE${this.config.colors.reset}`);
          this.scannerOnlyMode = true;
          this.lastDeepSeekAttempt = Date.now();
          
          // Continue trading in scanner-only mode
          try {
            // Get account info
            const accountInfo = await this.client.getAccount();
            let balance = 0;
            if (accountInfo.data) {
              balance = parseFloat(
                accountInfo.data.availableBalance || 
                accountInfo.data.available_balance ||
                accountInfo.data.availBalance ||
                accountInfo.data.balance ||
                0
              );
            }
            
            // Get positions
            const positionsResult = await this.client.getPositions();
            let positionsData = [];
            if (Array.isArray(positionsResult.data)) {
              positionsData = positionsResult.data;
            } else if (positionsResult.data && Array.isArray(positionsResult.data.positions)) {
              positionsData = positionsResult.data.positions;
            }
            const openPositions = positionsData.filter(p => this.isRealPosition(p));
            
            // Check if we can open more positions
            const canOpenNewPositions = balance >= this.config.minBalancePerPosition;
            const canOpenMore = openPositions.length < this.config.maxPositions && canOpenNewPositions;
            
            // Make scanner-only decision
            const scannerDecision = await this.makeScannerOnlyDecision(openPositions, balance, canOpenMore);
            
            if (scannerDecision) {
              await this.executeDecision(scannerDecision, balance, openPositions, {});
            }
            
            // Export dashboard data even in fallback mode
            try {
              const balanceData = await this.client.getBalance();
              const account = await this.client.getAccount();
              
              const availableBalance = Array.isArray(balanceData.data)
                ? parseFloat(balanceData.data.find(b => b.asset === 'USDT')?.availableBalance || 0)
                : 0;
              
              const totalWalletBalance = parseFloat(account.data?.totalWalletBalance || 0);
              const totalMarginBalance = parseFloat(account.data?.totalMarginBalance || 0);
              const totalUnrealizedProfit = parseFloat(account.data?.totalUnrealizedProfit || 0);
              
              // Prepare positions data
              const dashboardPositions = Array.from(this.activePositions.values()).map(pos => ({
                symbol: pos.symbol,
                coin: this.config.coinMapping[pos.symbol],
                positionAmt: pos.side === 'long' ? pos.quantity : -pos.quantity,
                side: pos.side,
                entryPrice: pos.entryPrice,
                markPrice: pos.currentPrice || pos.entryPrice,
                leverage: pos.leverage,
                notional: Math.abs(pos.quantity * (pos.currentPrice || pos.entryPrice)),
                unrealizedPnL: pos.unrealizedPnL || 0,
                openTime: pos.openTime,
                stopLoss: pos.stopLoss,
                takeProfit: pos.takeProfit
              }));
              
              // Calculate trade statistics from completed trades
              const completedTrades = this.dashboardExporter.completedTradesLog || [];
              const totalRealizedPnL = completedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
              const totalFees = completedTrades.reduce((sum, trade) => sum + (trade.fee || 0), 0);
              const winningTrades = completedTrades.filter(t => t.isProfit).length;
              const losingTrades = completedTrades.filter(t => !t.isProfit).length;
              const totalTrades = completedTrades.length;
              const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100) : 0;
              
              // Account summary with trade stats
              const accountSummary = {
                totalUnrealizedPnL: totalUnrealizedProfit,
                availableCash: availableBalance,
                totalWalletBalance: totalWalletBalance,
                totalMarginBalance: totalMarginBalance,
                
                // Trade statistics
                totalRealizedPnL: parseFloat(totalRealizedPnL.toFixed(2)),
                totalFees: parseFloat(totalFees.toFixed(2)),
                netPnL: parseFloat((totalRealizedPnL - totalFees).toFixed(2)),
                totalTrades: totalTrades,
                winningTrades: winningTrades,
                losingTrades: losingTrades,
                winRate: parseFloat(winRate.toFixed(1)),
                
                timestamp: Date.now(),
                fallbackMode: true, // ✅ Indicate fallback mode in dashboard
                apiFailures: this.apiFailureCount
              };
              
              // Export to dashboard
              this.dashboardExporter.exportData(
                dashboardPositions,
                accountSummary,
                this.scannerResults || []
              );
              
              // Update AI recommendation to show fallback mode
              this.dashboardExporter.updateAIRecommendation(
                '📡 SCANNER-ONLY MODE',
                `DeepSeek API unavailable (${this.apiFailureCount} failures) - Trading with token scanner only`
              );
              
            } catch (exportError) {
              console.error('⚠️  Dashboard export error in fallback mode:', exportError.message);
            }
          } catch (fallbackError) {
            console.error(`${this.config.colors.red}❌ Fallback mode error: ${fallbackError.message}${this.config.colors.reset}`);
          }
        } else if (this.apiFailureCount >= 5) {
          console.log(`${this.config.colors.red}🚨 CRITICAL: ${this.apiFailureCount} consecutive API failures!${this.config.colors.reset}`);
        }
      }
      
      // ✅ Schedule next loop even after error
      this.scheduleNextLoop();
    }
    
    // ✅ Periodic cleanup - every 50 loops
    if (this.loopCount % 50 === 0 && global.gc) {
      console.log(`${this.config.colors.blue}🧹 Running garbage collection...${this.config.colors.reset}`);
      global.gc();
    }
  }

  /**
   * ✅ SCANNER-ONLY MODE: Make trading decisions without DeepSeek AI
   * Uses token scanner opportunities with basic risk management
   */
  async makeScannerOnlyDecision(openPositions, balance, canOpenMore) {
    console.log(`${this.config.colors.yellow}📡 SCANNER-ONLY MODE: Using token scanner without AI${this.config.colors.reset}\n`);
    
    // If no scanner results, return HOLD
    if (!this.scannerResults || this.scannerResults.length === 0) {
      console.log(`${this.config.colors.cyan}⏸️  No scanner opportunities - HOLDING${this.config.colors.reset}\n`);
      return {
        action: 'hold',
        coin: 'BTC',
        reasoning: 'Scanner-only mode: No high-confidence opportunities detected',
        confidence: 0.5,
        quantity: 0,
        leverage: 0
      };
    }
    
    // Check for untracked positions first
    for (const pos of openPositions) {
      const tracked = this.activePositions.get(pos.symbol);
      if (!tracked) {
        const coin = this.config.coinMapping[pos.symbol] || pos.symbol.replace('USDT', '');
        console.log(`${this.config.colors.red}⚠️  UNTRACKED POSITION: ${coin} - Setting SL/TP${this.config.colors.reset}\n`);
        
        return {
          action: `set_sltp_${coin}`,
          coin: coin,
          reasoning: 'Scanner-only mode: Protecting untracked position',
          confidence: 0.9,
          quantity: 0,
          leverage: 0,
          stop_loss: 0, // Will be calculated by executeDecision
          profit_target: 0
        };
      }
    }
    
    // Get best scanner opportunity
    const bestOpp = this.scannerResults[0];
    
    // Check if we already have a position in this token
    const existingPosition = openPositions.find(p => 
      (this.config.coinMapping[p.symbol] || p.symbol.replace('USDT', '')) === bestOpp.symbol
    );
    
    if (existingPosition) {
      console.log(`${this.config.colors.cyan}⏸️  Already in ${bestOpp.symbol} - HOLDING${this.config.colors.reset}\n`);
      return {
        action: 'hold',
        coin: bestOpp.symbol,
        reasoning: `Scanner-only mode: Already holding ${bestOpp.symbol} position`,
        confidence: 0.7,
        quantity: 0,
        leverage: 0
      };
    }
    
    // Check if we can open more positions
    if (!canOpenMore) {
      console.log(`${this.config.colors.yellow}⏸️  Position limit reached - HOLDING${this.config.colors.reset}\n`);
      return {
        action: 'hold',
        coin: bestOpp.symbol,
        reasoning: 'Scanner-only mode: Maximum positions reached',
        confidence: 0.6,
        quantity: 0,
        leverage: 0
      };
    }
    
    // Only enter if opportunity score is high enough and RSI is oversold
    if (bestOpp.score >= 75 && bestOpp.rsi < 35) {
      const riskAmount = balance * this.config.riskPerTrade;
      const quantity = riskAmount / bestOpp.price;
      
      console.log(`${this.config.colors.green}🎯 SCANNER ENTRY: ${bestOpp.symbol}${this.config.colors.reset}`);
      console.log(`   Score: ${bestOpp.score}/100 | RSI: ${bestOpp.rsi} | Price: $${bestOpp.price.toFixed(4)}`);
      console.log(`   Confidence: ${bestOpp.confidence}%\n`);
      
      return {
        action: bestOpp.action.toLowerCase(), // 'long' or 'short'
        coin: bestOpp.symbol,
        reasoning: `Scanner-only mode: High score (${bestOpp.score}/100), oversold RSI (${bestOpp.rsi}), strong buy signal`,
        confidence: bestOpp.confidence / 100,
        quantity: quantity,
        leverage: 10, // Conservative leverage in fallback mode
        stop_loss: 0, // Will be calculated by executeDecision
        profit_target: 0
      };
    }
    
    // Default: HOLD
    console.log(`${this.config.colors.cyan}⏸️  Best opportunity score too low (${bestOpp.score}/100) - HOLDING${this.config.colors.reset}\n`);
    return {
      action: 'hold',
      coin: bestOpp.symbol,
      reasoning: `Scanner-only mode: Waiting for better entry (current score: ${bestOpp.score}/100)`,
      confidence: 0.5,
      quantity: 0,
      leverage: 0
    };
  }

  async cleanupOrphanOrders(openPositions) {
    try {
      console.log(`${this.config.colors.blue}🧹 Checking for orphan orders...${this.config.colors.reset}`);
      
      let totalOrders = 0;
      let orphanCount = 0;
      let cleanedCount = 0;

      for (const symbol of this.config.tradingPairs) {
        try {
          const openOrdersResult = await this.client.getOpenOrders(symbol);
          
          let orders = [];
          if (Array.isArray(openOrdersResult.data)) {
            orders = openOrdersResult.data;
          } else if (openOrdersResult.data && Array.isArray(openOrdersResult.data.orders)) {
            orders = openOrdersResult.data.orders;
          }

          if (orders.length === 0) continue;

          totalOrders += orders.length;

          for (const order of orders) {
            const orderId = order.orderId;
            const orderType = order.type;
            
            const isStopOrder = orderType === 'STOP_MARKET' || orderType === 'TAKE_PROFIT_MARKET';
            
            if (!isStopOrder) continue;

            const hasPosition = openPositions.some(p => p.symbol === symbol && this.isRealPosition(p));

            if (!hasPosition) {
              orphanCount++;
              const coin = this.config.coinMapping[symbol] || symbol;
              
              console.log(`${this.config.colors.yellow}⚠️  ORPHAN ${orderType}: ${coin} (ID: ${orderId})${this.config.colors.reset}`);

              try {
                await this.client.cancelOrder(symbol, orderId);
                cleanedCount++;
                console.log(`${this.config.colors.green}  ✅ Cancelled orphan order${this.config.colors.reset}\n`);
                
                this.slTpOrders.delete(symbol);
                this.activePositions.delete(symbol);
                this.trailingStopActive.delete(symbol);
                this.breakEvenActive.delete(symbol);
                this.lastTPUpdate.delete(symbol);
                
              } catch (cancelError) {
                console.log(`${this.config.colors.red}  ❌ Failed to cancel: ${cancelError.message}${this.config.colors.reset}\n`);
              }

              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          continue;
        }
      }

      if (orphanCount > 0) {
        console.log(`${this.config.colors.green}✅ Orphan cleanup: ${cleanedCount}/${orphanCount} orders cancelled${this.config.colors.reset}\n`);
      } else if (totalOrders > 0) {
        console.log(`${this.config.colors.green}✅ All orders have valid positions${this.config.colors.reset}\n`);
      } else {
        console.log(`${this.config.colors.green}✅ No open orders found${this.config.colors.reset}\n`);
      }

    } catch (error) {
      console.log(`${this.config.colors.yellow}⚠️ Error checking orphan orders: ${error.message}${this.config.colors.reset}\n`);
    }
  }

  async checkProfitProtection(position, tracked) {
    if (!this.config.profitProtectionEnabled) return;
    if (this.breakEvenActive.get(position.symbol)) return; // Already break-even
    if (this.trailingStopActive.get(position.symbol)) return; // Already trailing
    
    let mark = parseFloat(position.markPrice || 0);
    
    if (mark <= 0 || mark === parseFloat(position.entryPrice)) {
      try {
        const ticker = await this.client.getTicker(position.symbol);
        mark = parseFloat(ticker.data.price);
      } catch (error) {
        return;
      }
    }
    
    // ✅ FIX: Always use EXCHANGE entry price (source of truth)
    const entry = parseFloat(position.entryPrice);
    const side = tracked.side;
    const currentSL = tracked.stopLoss;
    const leverage = tracked.leverage || 1;
    const coin = this.config.coinMapping[position.symbol] || position.symbol.replace('USDT', '');
    
    // Update tracked entry price if different (exchange is source of truth)
    if (Math.abs(tracked.entryPrice - entry) > 0.0001) {
      tracked.entryPrice = entry;
      this.activePositions.set(position.symbol, tracked);
    }
    
    // Calculate current profit percentage
    let priceChangePercent = 0;
    if (side === 'long') {
      priceChangePercent = ((mark - entry) / entry) * 100;
    } else {
      priceChangePercent = ((entry - mark) / entry) * 100;
    }
    
    const actualProfitPercent = priceChangePercent * leverage;
    
    // Check if profit threshold reached
    if (actualProfitPercent >= this.config.profitProtectionTrigger) {
      // Calculate distance from current SL
      let slDistance = 0;
      if (side === 'long') {
        slDistance = ((mark - currentSL) / mark) * 100;
      } else {
        slDistance = ((currentSL - mark) / mark) * 100;
      }
      
      // Only move SL if it's far enough away
      if (slDistance > this.config.profitProtectionMinDistance) {
        // Calculate new SL to lock in partial profit
        const profitToLock = (this.config.profitProtectionLockPercent / 100) * actualProfitPercent;
        const priceMoveToCover = profitToLock / leverage / 100;
        
        let newSL;
        if (side === 'long') {
          newSL = entry * (1 + priceMoveToCover);
          // Ensure new SL is better than current
          if (newSL <= currentSL) return;
        } else {
          newSL = entry * (1 - priceMoveToCover);
          // Ensure new SL is better than current
          if (newSL >= currentSL) return;
        }
        
        newSL = this.roundPrice(position.symbol, newSL);
        
        console.log(`${this.config.colors.cyan}🛡️  ${coin}: +${actualProfitPercent.toFixed(2)}% profit - ACTIVATING PROFIT PROTECTION${this.config.colors.reset}`);
        console.log(`  Current SL: ${currentSL.toFixed(4)}`);
        console.log(`  New SL: ${newSL.toFixed(4)} (locks ${profitToLock.toFixed(2)}% profit)`);
        console.log();
        
        await this.cancelSLOrder(position.symbol);
        
        const quantity = Math.abs(parseFloat(position.positionAmt));
        
        const slSuccess = await this.updateStopLoss(
          position.symbol,
          side,
          quantity,
          newSL
        );
        
        if (slSuccess) {
          tracked.stopLoss = newSL;
          this.activePositions.set(position.symbol, tracked);
          
          console.log(`${this.config.colors.green}✅ Profit protection activated! Secured ${profitToLock.toFixed(2)}%${this.config.colors.reset}\n`);
        }
      }
    }
  }

  async checkBreakEvenStopLoss(position, tracked) {
    if (!this.config.breakEvenEnabled) return;
    if (this.breakEvenActive.get(position.symbol)) return;
    if (this.trailingStopActive.get(position.symbol)) return;

    let mark = parseFloat(position.markPrice || 0);
    
    if (mark <= 0 || mark === parseFloat(position.entryPrice)) {
      try {
        const ticker = await this.client.getTicker(position.symbol);
        mark = parseFloat(ticker.data.price);
      } catch (error) {
        return;
      }
    }
    
    // ✅ FIX: Always use EXCHANGE entry price (source of truth)
    const entry = parseFloat(position.entryPrice);
    
    // Update tracked entry price if different
    if (Math.abs(tracked.entryPrice - entry) > 0.0001) {
      tracked.entryPrice = entry;
      this.activePositions.set(position.symbol, tracked);
    }

    const side = tracked.side;
    const leverage = tracked.leverage || 1;
    const coin = this.config.coinMapping[position.symbol] || position.symbol.replace('USDT', '');
    const holdTime = Date.now() - tracked.openTime;

    let priceChangePercent = 0;
    if (side === 'long') {
      priceChangePercent = ((mark - entry) / entry) * 100;
    } else {
      priceChangePercent = ((entry - mark) / entry) * 100;
    }
    
    const actualProfitPercent = priceChangePercent * leverage;
    
    // ✅ Calculate actual profit in USDT
    const quantity = Math.abs(parseFloat(position.positionAmt));
    const pnlUSDT = side === 'long' ? 
      (mark - entry) * quantity :
      (entry - mark) * quantity;
    
    const profitConditionMet = actualProfitPercent >= this.config.breakEvenProfitTrigger;
    const timeConditionMet = actualProfitPercent > 0 && holdTime >= this.config.breakEvenTimeInProfit;
    
    // ✅ CHECK: Minimum profit in USDT must be reached
    if (pnlUSDT < this.config.breakEvenMinProfitUSDT) {
      // Profit too small - don't activate break-even yet
      return;
    }

    if (profitConditionMet || timeConditionMet) {
      const reason = profitConditionMet 
        ? `${actualProfitPercent.toFixed(2)}% profit reached`
        : `${(holdTime / 60000).toFixed(1)} mins in profit`;
      
      // IMPROVED: After 1 hour with profit, lock HALF of current profit (not just break-even)
      let newSL;
      let lockType;
      
      if (timeConditionMet && !profitConditionMet) {
        // Time-based trigger: Lock 50% of current profit
        const profitToLock = actualProfitPercent * 0.5; // Half of actual profit
        const priceMoveToCover = profitToLock / leverage / 100;
        
        if (side === 'long') {
          newSL = entry * (1 + priceMoveToCover);
        } else {
          newSL = entry * (1 - priceMoveToCover);
        }
        
        lockType = `HALF PROFIT (${profitToLock.toFixed(2)}%)`;
        console.log(`${this.config.colors.cyan}⚖️  ${coin}: ${reason} - LOCKING HALF PROFIT (+${pnlUSDT.toFixed(2)} USDT)${this.config.colors.reset}`);
      } else {
        // Profit-based trigger: Standard break-even
        newSL = entry;
        lockType = 'BREAK-EVEN';
        console.log(`${this.config.colors.cyan}⚖️  ${coin}: ${reason} - ACTIVATING BREAK-EVEN SL (+${pnlUSDT.toFixed(2)} USDT)${this.config.colors.reset}`);
      }
      
      newSL = this.roundPrice(position.symbol, newSL);
      
      console.log(`  Old SL: ${tracked.stopLoss.toFixed(4)}`);
      console.log(`  New SL: ${newSL.toFixed(4)} (${this.config.colors.green}${lockType}${this.config.colors.reset})`);
      console.log();

      await this.cancelSLOrder(position.symbol);
      
      const slSuccess = await this.updateStopLoss(
        position.symbol, 
        side, 
        quantity, 
        newSL
      );
      
      if (slSuccess) {
        tracked.stopLoss = newSL;
        this.activePositions.set(position.symbol, tracked);
        this.breakEvenActive.set(position.symbol, true);
        
        console.log(`${this.config.colors.green}✅ Break-even SL activated!${this.config.colors.reset}\n`);
      }
    }
  }

  async checkTrailingStopLoss(position, tracked) {
    if (!this.config.trailingStopEnabled) return;
    if (this.trailingStopActive.get(position.symbol)) return;
    if (!this.breakEvenActive.get(position.symbol)) return;

    let mark = parseFloat(position.markPrice || 0);
    
    if (mark <= 0 || mark === parseFloat(position.entryPrice)) {
      try {
        const ticker = await this.client.getTicker(position.symbol);
        mark = parseFloat(ticker.data.price);
      } catch (error) {
        return;
      }
    }
    
    // ✅ FIX: Always use EXCHANGE entry price (source of truth)
    const entry = parseFloat(position.entryPrice);
    
    // Update tracked entry price if different
    if (Math.abs(tracked.entryPrice - entry) > 0.0001) {
      tracked.entryPrice = entry;
      this.activePositions.set(position.symbol, tracked);
    }

    const side = tracked.side;
    const leverage = tracked.leverage || 1;
    const coin = this.config.coinMapping[position.symbol] || position.symbol.replace('USDT', '');

    let priceChangePercent = 0;
    if (side === 'long') {
      priceChangePercent = ((mark - entry) / entry) * 100;
    } else {
      priceChangePercent = ((entry - mark) / entry) * 100;
    }
    
    const actualProfitPercent = priceChangePercent * leverage;
    const targetProfitPercent = this.config.trailingStopTrigger * 100;

    if (actualProfitPercent >= targetProfitPercent) {
      console.log(`${this.config.colors.green}🎯 ${coin}: ${actualProfitPercent.toFixed(2)}% profit - ACTIVATING TRAILING SL${this.config.colors.reset}`);
      
      const profitLockPercent = this.config.trailingStopProfitLock;
      const priceMoveToCover = (profitLockPercent * actualProfitPercent) / leverage / 100;
      
      let newSL;
      if (side === 'long') {
        newSL = entry * (1 + priceMoveToCover);
      } else {
        newSL = entry * (1 - priceMoveToCover);
      }
      
      newSL = this.roundPrice(position.symbol, newSL);
      
      const lockedProfitPercent = profitLockPercent * actualProfitPercent;
      
      console.log(`  New SL: ${newSL.toFixed(4)} (locks in ${lockedProfitPercent.toFixed(2)}% profit)`);
      console.log();

      await this.cancelSLOrder(position.symbol);
      
      const quantity = Math.abs(parseFloat(position.positionAmt));
      
      const slSuccess = await this.updateStopLoss(
        position.symbol, 
        side, 
        quantity, 
        newSL
      );
      
      if (slSuccess) {
        tracked.stopLoss = newSL;
        this.activePositions.set(position.symbol, tracked);
        this.trailingStopActive.set(position.symbol, true);
        
        console.log(`${this.config.colors.green}✅ Trailing SL activated!${this.config.colors.reset}\n`);
      }
    }
  }

  async checkAndManagePositions(openPositions) {
    const trackedSymbols = Array.from(this.activePositions.keys());
    
    if (trackedSymbols.length > 0) {
      console.log(`${this.config.colors.blue}🔍 Checking ${trackedSymbols.length} tracked position(s)...${this.config.colors.reset}`);
    }
    
    for (const symbol of trackedSymbols) {
      const stillOpen = openPositions.find(p => p.symbol === symbol);
      const tracked = this.activePositions.get(symbol);
      
      if (!stillOpen || !this.isRealPosition(stillOpen)) {
        await this.handleExternalClose(symbol, tracked);
        continue;
      }
      
      await this.checkProfitProtection(stillOpen, tracked);
      await this.checkBreakEvenStopLoss(stillOpen, tracked);
      await this.checkTrailingStopLoss(stillOpen, tracked);
      await this.checkStopLossTakeProfit(stillOpen, tracked);
    }
  }

  async handleExternalClose(symbol, tracked) {
    const coin = this.config.coinMapping[symbol] || symbol.replace('USDT', '');
    const holdTime = tracked ? (Date.now() - tracked.openTime) / 1000 : 0;
    
    console.log(`${this.config.colors.red}⚠️ ${coin} position closed externally!${this.config.colors.reset}`);
    
    // ✅ Log manually closed trade
    try {
      const ticker = await this.client.getTicker(symbol);
      const exitPrice = parseFloat(ticker.data?.lastPrice || tracked.entryPrice);
      const entryPrice = tracked.entryPrice;
      const quantity = tracked.quantity;
      const isLong = tracked.side === 'long';
      
      let pnlUSDT = 0;
      if (isLong) {
        pnlUSDT = (exitPrice - entryPrice) * quantity * tracked.leverage;
      } else {
        pnlUSDT = (entryPrice - exitPrice) * quantity * tracked.leverage;
      }
      
      const profitPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * tracked.leverage * (isLong ? 1 : -1);
      const isProfit = pnlUSDT > 0;
      
      this.dashboardExporter.logCompletedTrade({
        symbol: symbol,
        side: tracked.side.toUpperCase(),
        coin: coin,
        entryPrice: entryPrice,
        exitPrice: exitPrice,
        quantity: quantity,
        pnlUSDT: pnlUSDT,
        profitPercent: profitPercent,
        leverage: tracked.leverage,
        holdTime: (Date.now() - tracked.openTime) / 60000,
        openedAt: tracked.openTime,
        reason: 'Manual close',
        isProfit: isProfit
      });
      
      console.log(`${this.config.colors.cyan}📊 Trade logged: ${isProfit ? '✅' : '❌'} PnL: ${pnlUSDT.toFixed(2)} USDT${this.config.colors.reset}`);
    } catch (error) {
      console.error(`⚠️ Could not log manual trade: ${error.message}`);
    }
    
    await this.cancelSLTPOrders(symbol);
    
    this.activePositions.delete(symbol);
    this.trailingStopActive.delete(symbol);
    this.breakEvenActive.delete(symbol);
    this.lastTPUpdate.delete(symbol);
    
    console.log(`${this.config.colors.green}✅ Cleanup completed for ${coin}${this.config.colors.reset}\n`);
  }

  async checkStopLossTakeProfit(position, tracked) {
    const mark = parseFloat(position.markPrice || position.entryPrice);
    const side = tracked.side;
    const holdTime = Date.now() - tracked.openTime;
    const coin = this.config.coinMapping[position.symbol] || position.symbol.replace('USDT', '');

    // CHECK: Position open >4 hours and in profit - AUTO CLOSE
    if (holdTime > this.config.maxPositionHoldTime) {
      const entry = tracked.entryPrice;
      const mark = parseFloat(position.markPrice || entry);
      const side = tracked.side;
      const quantity = Math.abs(parseFloat(position.positionAmt));
      const leverage = tracked.leverage || 1;
      
      const priceChangePercent = side === 'long' 
        ? ((mark - entry) / entry) * 100
        : ((entry - mark) / entry) * 100;
      const actualProfitPercent = priceChangePercent * leverage;
      
      // ✅ Calculate actual profit in USDT
      const pnlUSDT = side === 'long' ? 
        (mark - entry) * quantity :
        (entry - mark) * quantity;
      
      // ✅ CHECK: Minimum profit in USDT must be reached
      if (actualProfitPercent > 0 && pnlUSDT >= this.config.breakEvenMinProfitUSDT) {
        console.log(`${this.config.colors.yellow}⏰ ${coin}: Open 4+ hours with profit${this.config.colors.reset}`);
        console.log(`   Hold time: ${(holdTime / 3600000).toFixed(1)} hours`);
        console.log(`   Profit: ${actualProfitPercent.toFixed(2)}% (+${pnlUSDT.toFixed(2)} USDT)`);
        console.log(`${this.config.colors.cyan}💰 Auto-closing to lock in gains (TP not yet reached)${this.config.colors.reset}\n`);
        
        await this.closePosition(position, '4-hour time limit + profit');
        return;
      } else if (actualProfitPercent > 0 && pnlUSDT < this.config.breakEvenMinProfitUSDT) {
        console.log(`${this.config.colors.yellow}⏰ ${coin}: Open 4+ hours but profit too small${this.config.colors.reset}`);
        console.log(`   Hold time: ${(holdTime / 3600000).toFixed(1)} hours`);
        console.log(`   Profit: ${actualProfitPercent.toFixed(2)}% (+${pnlUSDT.toFixed(2)} USDT < ${this.config.breakEvenMinProfitUSDT} USDT minimum)`);
        console.log(`   ${this.config.colors.cyan}⏳ Keeping position open (profit below minimum threshold)${this.config.colors.reset}\n`);
        // Don't close - profit too small
      }
    }

    if (holdTime < this.config.minPositionHoldTime) {
      return;
    }

    let shouldClose = false;
    let reason = '';

    if (side === 'long') {
      if (mark <= tracked.stopLoss) {
        shouldClose = true;
        reason = `STOP LOSS HIT`;
      } else if (mark >= tracked.takeProfit) {
        shouldClose = true;
        reason = `TAKE PROFIT HIT`;
      }
    } else {
      if (mark >= tracked.stopLoss) {
        shouldClose = true;
        reason = `STOP LOSS HIT`;
      } else if (mark <= tracked.takeProfit) {
        shouldClose = true;
        reason = `TAKE PROFIT HIT`;
      }
    }

    if (shouldClose) {
      console.log(`${this.config.colors.magenta}🚨 ${coin} ${reason}${this.config.colors.reset}\n`);
      await this.closePosition(position, reason);
    }
  }

  generatePrompt(marketData, balance, positions, mins, canOpenMore) {
    const coins = Object.keys(marketData);
    
    if (this.initialBalance === null) {
      this.initialBalance = balance;
    }
    
    const currentValue = balance + positions.reduce((sum, p) => sum + parseFloat(p.unRealizedProfit || 0), 0);
    const totalReturn = ((currentValue / this.initialBalance - 1) * 100).toFixed(2);
    
    let prompt = `Professional crypto trader. Time: ${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString()}. Trading ${mins}min.

MARKET DATA:
`;
    
    for (const coin of coins) {
      const data = marketData[coin];
      const tech = this.technicalData[coin] || {};
      const tf4h = data.timeframe4h;
      
      prompt += `${coin}: ${data.price.toFixed(4)}`;
      if (tech.ema20) prompt += ` | EMA20=${tech.ema20.toFixed(2)}`;
      if (tech.macd) prompt += ` | MACD=${tech.macd > 0 ? '+' : ''}${tech.macd.toFixed(3)}`;
      if (tech.rsi14) prompt += ` | RSI=${tech.rsi14.toFixed(1)}`;
      
      // NEW: Add 4-hour timeframe analysis
      if (tf4h) {
        prompt += `\n   4H: ${tf4h.priceChange4h >= 0 ? '+' : ''}${tf4h.priceChange4h.toFixed(2)}% vs 4h ago (${tf4h.price4hAgo.toFixed(4)})`;
        prompt += ` | 24h High: ${tf4h.high24h.toFixed(4)} (-${tf4h.distanceFromHigh24h.toFixed(2)}%)`;
        prompt += ` | 24h Low: ${tf4h.low24h.toFixed(4)} (+${tf4h.distanceFromLow24h.toFixed(2)}%)`;
      }
      prompt += `\n`;
    }
    
    prompt += `\nACCOUNT: Balance=${balance.toFixed(2)}, Return=${totalReturn}%\n`;
    prompt += `CAPACITY: ${positions.length}/${this.config.maxPositions} positions, ${canOpenMore ? `CAN OPEN ${this.config.maxPositions - positions.length} MORE` : 'CANNOT OPEN MORE'}\n`;
    
    if (positions.length > 0) {
      prompt += `\nCURRENT POSITIONS:\n`;
      positions.forEach(pos => {
        const coin = this.config.coinMapping[pos.symbol] || pos.symbol.replace('USDT', '');
        const amt = parseFloat(pos.positionAmt);
        const entry = parseFloat(pos.entryPrice);
        const mark = parseFloat(pos.markPrice || entry);
        const pnl = parseFloat(pos.unRealizedProfit || 0);
        const tracked = this.activePositions.get(pos.symbol);
        
        prompt += `${coin}: ${amt > 0 ? 'LONG' : 'SHORT'} ${Math.abs(amt)} @ ${entry.toFixed(4)}\n`;
        prompt += `  Current: ${mark.toFixed(4)}, PnL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDT\n`;
        
        if (tracked) {
          prompt += `  [TRACKED with SL: ${tracked.stopLoss.toFixed(4)}, TP: ${tracked.takeProfit.toFixed(4)}]\n`;
        } else {
          prompt += `  [⚠️ UNTRACKED - NO SL/TP PROTECTION! URGENT: Use action "set_sltp_${coin}" to protect this position]\n`;
        }
      });
    }
    
    // ADD SCANNER RESULTS TO PROMPT
    if (this.config.scannerEnabled && this.scannerResults.length > 0) {
      prompt += this.scanner.generateScannerPrompt(this.scannerResults, positions, this.config.coinMapping);
    }
    
    prompt += `\nSTRATEGY: Multi-position with break-even + dynamic TP + trailing SL.\n`;
    prompt += `Risk: 10% per trade, 5-15x leverage, min confidence 68%.\n\n`;
    prompt += `⚠️ CRITICAL ENTRY RULES FOR LONG POSITIONS:\n`;
    prompt += `- PRIORITIZE entering LONG on PULLBACKS or OVERSOLD conditions (RSI < 40)\n`;
    prompt += `- DO NOT chase pumps or enter LONG when price is rallying strongly\n`;
    prompt += `- WAIT for price to retrace or consolidate before entering LONG\n`;
    prompt += `- Best LONG entries: After healthy pullbacks, at support levels, low RSI\n`;
    prompt += `- AVOID entering LONG on strong upward momentum (wait for better price)\n\n`;
    
    prompt += `⚠️ 4-HOUR TIMEFRAME ANALYSIS (CRITICAL):\n`;
    prompt += `The 4H timeframe is ONE OF THE MOST IMPORTANT indicators for entry timing.\n`;
    prompt += `For each token, you can see:\n`;
    prompt += `  - 4H price change: How much price moved vs 4 hours ago\n`;
    prompt += `  - Distance from 24h high/low: Current position in recent range\n\n`;
    prompt += `BEFORE ENTERING LONG, EVALUATE:\n`;
    prompt += `1. If price is UP significantly vs 4h ago (+3% or more):\n`;
    prompt += `   → ASK: Is this a good entry or should I wait for retracement?\n`;
    prompt += `   → If near 24h HIGH (within 2%): WAIT for pullback\n`;
    prompt += `   → If mid-range with strong momentum: Consider entry with caution\n\n`;
    prompt += `2. If price is DOWN vs 4h ago (negative %):\n`;
    prompt += `   → ASK: Is this a healthy pullback or a reversal?\n`;
    prompt += `   → If near 24h LOW with oversold RSI: GOOD ENTRY\n`;
    prompt += `   → If falling with weak volume: WAIT for stabilization\n\n`;
    prompt += `3. If price is near 24h HIGH (-0% to -2% from high):\n`;
    prompt += `   → HIGH RISK ENTRY - Price at resistance\n`;
    prompt += `   → RECOMMENDED: WAIT for 3-5% pullback for better entry\n\n`;
    prompt += `4. If price is near 24h LOW (+0% to +3% from low):\n`;
    prompt += `   → GOOD ENTRY ZONE - Price at support\n`;
    prompt += `   → RECOMMENDED: Enter if RSI confirms oversold\n\n`;
    prompt += `GOLDEN RULE: If current price is >5% above 4h-ago price AND near 24h high,\n`;
    prompt += `you must explicitly state: "Price too high vs 4H, waiting for better entry"\n\n`;
    
    // SCALPER MODE INSTRUCTIONS
    if (this.config.scalperEnabled) {
      const scalperCount = this.scalperPositions.size;
      prompt += `🎯 SCALPER MODE ENABLED:\n`;
      prompt += `The scanner identifies perfect SCALP opportunities - quick pullback trades.\n`;
      prompt += `Current scalper positions: ${scalperCount}/${this.config.scalperMaxPositions}\n\n`;
      prompt += `SCALPER CRITERIA:\n`;
      prompt += `- Pullback: 2-6% from recent high (not too deep = reversal risk)\n`;
      prompt += `- RSI: 30-45 (oversold but not extreme)\n`;
      prompt += `- Volume: Declining (no panic selling)\n`;
      prompt += `- 4H Check: Must be >2% below 24h high\n`;
      prompt += `- Perfect Scalp: Bouncing from support + RSI <35 + 3-5% pullback\n\n`;
      prompt += `SCALPER SETTINGS:\n`;
      prompt += `- Leverage: UP TO 25x (higher than normal trades)\n`;
      prompt += `- Profit Target: ${this.config.scalperProfitTarget}% (quick exit)\n`;
      prompt += `- Stop Loss: ${this.config.scalperStopLoss}% (tight protection)\n`;
      prompt += `- Max Positions: ${this.config.scalperMaxPositions} concurrent scalps\n\n`;
      prompt += `WHEN YOU SEE "⚡💎 PERFECT SCALP ENTRY" in scanner:\n`;
      prompt += `- Use action "scalp_long" instead of "long"\n`;
      prompt += `- Bot will automatically use 25x leverage\n`;
      prompt += `- Bot will set tight SL (${this.config.scalperStopLoss}%) and TP (${this.config.scalperProfitTarget}%)\n`;
      prompt += `- These are QUICK TRADES - expect fast exit\n\n`;
    }

    prompt += `\n⚠️ UNTRACKED POSITIONS PRIORITY:\n`;
    prompt += `If you see positions marked [UNTRACKED], these are at RISK with NO protection!\n`;
    prompt += `IMMEDIATELY use action "set_sltp_<COIN>" to set stop loss and take profit.\n\n`;
    prompt += `🎯 SL/TP DIRECTION RULES (CRITICAL):\n`;
    prompt += `For LONG positions:\n`;
    prompt += `  - Stop Loss (SL) must be BELOW entry price (lower price = stop loss)\n`;
    prompt += `  - Take Profit (TP) must be ABOVE entry price (higher price = profit)\n`;
    prompt += `  - Example: LONG @ 3.18 → SL: 3.00 (below), TP: 3.50 (above)\n\n`;
    prompt += `For SHORT positions:\n`;
    prompt += `  - Stop Loss (SL) must be ABOVE entry price (higher price = stop loss)\n`;
    prompt += `  - Take Profit (TP) must be BELOW entry price (lower price = profit)\n`;
    prompt += `  - Example: SHORT @ 3.18 → SL: 3.50 (above), TP: 3.00 (below)\n\n`;
    
    prompt += `JSON FORMAT:
{
  "action": "long|short|hold|close_<COIN>|set_sltp_<COIN>|update_tp_<COIN>",
  "coin": "BTC|ETH|SOL|XRP|DOGE|BNB|ASTER|WLD|...",
  "reasoning": "brief analysis",
  "quantity": <amount or 0>,
  "leverage": <5-15 or 0>,
  "confidence": <0.68-1.0>,
  "stop_loss": <price>,
  "profit_target": <price>
}`;

    return prompt;
  }

  async callDeepSeekAPIWithRetry(prompt, attempt = 1) {
    try {
      return await this.callDeepSeekAPI(prompt);
    } catch (error) {
      const errorMsg = error.message;
      
      const isRateLimit = errorMsg.includes('429') || 
                         errorMsg.includes('rate limit') || 
                         errorMsg.includes('too many requests');
      
      const isAuthError = errorMsg.includes('401') || 
                         errorMsg.includes('403') || 
                         errorMsg.includes('authentication') ||
                         errorMsg.includes('invalid api key');
      
      console.log(`${this.config.colors.yellow}⚠️ API attempt ${attempt} failed: ${errorMsg.substring(0, 150)}${this.config.colors.reset}`);
      
      // ✅ LOG DEEPSEEK ERROR
      this.dashboardExporter.logDeepSeekConversation(
        prompt,
        null,
        null,
        `API attempt ${attempt} failed: ${errorMsg}`
      );
      
      if (isAuthError) {
        console.log(`${this.config.colors.red}🚨 AUTHENTICATION ERROR${this.config.colors.reset}`);
        throw new Error(`DeepSeek authentication failed`);
      }
      
      if (attempt >= this.config.maxRetries) {
        throw new Error(`DeepSeek API failed after ${this.config.maxRetries} attempts`);
      }
      
      const baseWait = isRateLimit ? 5000 : 1000;
      const wait = Math.min(baseWait * Math.pow(2, attempt - 1), 30000);
      
      console.log(`${this.config.colors.yellow}   Retrying in ${wait}ms...${this.config.colors.reset}\n`);
      
      await new Promise(resolve => setTimeout(resolve, wait));
      return this.callDeepSeekAPIWithRetry(prompt, attempt + 1);
    }
  }

  async callDeepSeekAPI(prompt) {
    return new Promise((resolve, reject) => {
      // Clean prompt of problematic characters
      const cleanedPrompt = prompt
        .replace(/[\u2018\u2019]/g, "'")  // Smart quotes to regular quotes
        .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
        .replace(/[\u2013\u2014]/g, '-')  // Em/en dashes to hyphens
        .replace(/[\u2026]/g, '...')      // Ellipsis
        .replace(/[^\x20-\x7E\n\r\t]/g, ''); // Remove non-ASCII except newlines/tabs
      
      const data = JSON.stringify({
        model: this.config.deepseekModel,
        messages: [
          { role: 'system', content: 'You are a professional crypto trader. Return ONLY valid JSON, no markdown.' },
          { role: 'user', content: cleanedPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const options = {
        hostname: 'api.deepseek.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.deepseekApiKey}`,
          'Content-Length': data.length
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              // ✅ LOG DEEPSEEK ERROR
              this.dashboardExporter.logDeepSeekConversation(
                cleanedPrompt,
                null,
                null,
                `HTTP ${res.statusCode}: ${responseData.substring(0, 200)}`
              );
              reject(new Error(`HTTP ${res.statusCode}: ${responseData.substring(0, 200)}`));
              return;
            }
            
            const response = JSON.parse(responseData);
            
            if (response.error) {
              const errorMsg = response.error.message || JSON.stringify(response.error);
              // ✅ LOG DEEPSEEK ERROR
              this.dashboardExporter.logDeepSeekConversation(
                cleanedPrompt,
                null,
                null,
                `DeepSeek API error: ${errorMsg}`
              );
              reject(new Error(`DeepSeek API error: ${errorMsg}`));
              return;
            }
            
            if (!response.choices || !response.choices[0] || !response.choices[0].message) {
              // ✅ LOG DEEPSEEK ERROR
              this.dashboardExporter.logDeepSeekConversation(
                cleanedPrompt,
                null,
                null,
                `Invalid API response structure`
              );
              reject(new Error(`Invalid API response structure`));
              return;
            }
            
            resolve(response.choices[0].message.content);
            
          } catch (error) {
            // ✅ LOG DEEPSEEK ERROR
            this.dashboardExporter.logDeepSeekConversation(
              cleanedPrompt,
              null,
              null,
              `JSON parse error: ${error.message}`
            );
            reject(new Error(`JSON parse error: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        // ✅ LOG DEEPSEEK ERROR
        this.dashboardExporter.logDeepSeekConversation(
          cleanedPrompt,
          null,
          null,
          `Request error: ${error.message}`
        );
        reject(new Error(`Request error: ${error.message}`));
      });
      
      req.on('timeout', () => {
        req.destroy();
        // ✅ LOG DEEPSEEK ERROR
        this.dashboardExporter.logDeepSeekConversation(
          cleanedPrompt,
          null,
          null,
          'API request timeout (30s)'
        );
        reject(new Error('API request timeout (30s)'));
      });
      
      req.write(data);
      req.end();
    });
  }

  parseAIResponse(response) {
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      return JSON.parse(cleaned);
    } catch (error) {
      console.error(`${this.config.colors.red}Parse error: ${error.message}${this.config.colors.reset}`);
      return null;
    }
  }

  async fetchKlines(symbol, interval = '3m', limit = 100) {
    // CHECK CACHE FIRST
    const cacheKey = `${symbol}_${interval}_${limit}`;
    const is4h = interval === '4h';
    
    // Use different cache for 4H data (longer TTL)
    const cacheMap = is4h ? this.cache.klines4h : this.cache.marketData;
    const expiryMap = is4h ? this.cache.klines4hExpiry : this.cache.marketDataExpiry;
    const ttl = is4h ? this.cacheTTL.klines4h : this.cacheTTL.marketData;
    
    const cached = this.getCachedData(cacheMap, expiryMap, cacheKey);
    if (cached) {
      this.perfMetrics.cachedApiCalls++;
      return cached;
    }
    
    // Cache miss - fetch from API
    return new Promise((resolve, reject) => {
      const url = `https://fapi.asterdex.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      
      const req = https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const klines = JSON.parse(data);
            
            // Cache the result
            this.setCachedData(cacheMap, expiryMap, cacheKey, klines, ttl);
            this.perfMetrics.apiCalls++;
            
            resolve(klines);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Klines request timeout'));
      });
    });
  }

  async fetchAllMarketData() {
    const marketData = {};
    let successCount = 0;
    
    for (const symbol of this.config.tradingPairs) {
      try {
        const ticker = await this.client.getTicker(symbol);
        const klines = await this.fetchKlines(symbol, '3m', 100);
        const klines4h = await this.fetchKlines(symbol, '4h', 24); // NEW: Fetch 4-hour candles (24 = 4 days)
        
        const coin = this.config.coinMapping[symbol] || symbol.replace('USDT', '');
        const price = parseFloat(ticker.data.price);
        const closes = klines.map(k => parseFloat(k[4]));
        const closes4h = klines4h.map(k => parseFloat(k[4]));
        
        // Calculate 4-hour price change
        const price4hAgo = closes4h[closes4h.length - 2]; // Last completed 4h candle
        const priceChange4h = ((price - price4hAgo) / price4hAgo) * 100;
        
        // Calculate 4h high/low
        const highs4h = klines4h.slice(-6).map(k => parseFloat(k[2])); // Last 24h (6 x 4h candles)
        const lows4h = klines4h.slice(-6).map(k => parseFloat(k[3]));
        const high24h = Math.max(...highs4h);
        const low24h = Math.min(...lows4h);
        const distanceFromHigh24h = ((high24h - price) / high24h) * 100;
        const distanceFromLow24h = ((price - low24h) / low24h) * 100;
        
        marketData[coin] = {
          symbol: symbol,
          price: price,
          historical: { closes: closes },
          timeframe4h: { // NEW: 4-hour timeframe data
            price4hAgo: price4hAgo,
            priceChange4h: priceChange4h,
            high24h: high24h,
            low24h: low24h,
            distanceFromHigh24h: distanceFromHigh24h,
            distanceFromLow24h: distanceFromLow24h,
            closes: closes4h
          }
        };

        this.priceHistory[coin] = closes;
        if (closes.length >= 20) {
          this.technicalData[coin] = this.calculateTechnicalIndicators(coin, closes);
        }
        
        successCount++;

      } catch (error) {
        console.log(`  ${this.config.colors.yellow}⚠️ Error fetching ${symbol}: ${error.message}${this.config.colors.reset}`);
      }
    }
    
    console.log(`  ${this.config.colors.green}✓ Fetched ${successCount}/${this.config.tradingPairs.length} pairs${this.config.colors.reset}\n`);
    
    return marketData;
  }

  async executeDecision(decision, balance, openPositions, marketData) {
    console.log(`${this.config.colors.bright}AI Decision:${this.config.colors.reset}`);
    console.log(`  Action: ${decision.action.toUpperCase()}`);
    console.log(`  Coin: ${decision.coin || 'N/A'}`);
    console.log(`  Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
    console.log();

    // Handle TP update
    if (decision.action.startsWith('update_tp_')) {
      const coinToUpdate = decision.action.replace('update_tp_', '');
      const symbol = Object.keys(this.config.coinMapping).find(k => this.config.coinMapping[k] === coinToUpdate);
      const position = openPositions.find(p => p.symbol === symbol);
      
      if (position && this.activePositions.has(symbol)) {
        const tracked = this.activePositions.get(symbol);
        const newTP = this.roundPrice(symbol, decision.profit_target);
        
        await this.cancelTPOrder(symbol);
        const quantity = Math.abs(parseFloat(position.positionAmt));
        const tpSuccess = await this.updateTakeProfit(symbol, tracked.side, quantity, newTP);
        
        if (tpSuccess) {
          tracked.takeProfit = newTP;
          this.activePositions.set(symbol, tracked);
          this.lastTPUpdate.set(symbol, this.loopCount);
          console.log(`${this.config.colors.green}✅ TP updated for ${coinToUpdate}${this.config.colors.reset}\n`);
        }
      }
      return;
    }

    // Handle close
    if (decision.action.startsWith('close_')) {
      const coinToClose = decision.action.replace('close_', '');
      const symbol = Object.keys(this.config.coinMapping).find(k => this.config.coinMapping[k] === coinToClose);
      const position = openPositions.find(p => p.symbol === symbol);
      
      if (position) {
        await this.closePosition(position, 'AI recommendation');
      }
      return;
    }

    // Handle set SL/TP
    if (decision.action.startsWith('set_sltp_')) {
      const coinToSet = decision.action.replace('set_sltp_', '');
      const symbol = Object.keys(this.config.coinMapping).find(k => this.config.coinMapping[k] === coinToSet);
      const position = openPositions.find(p => p.symbol === symbol);
      
      if (position && !this.activePositions.has(symbol)) {
        const entry = parseFloat(position.entryPrice);
        const positionAmt = parseFloat(position.positionAmt);
        const isLong = positionAmt > 0;
        const side = isLong ? 'long' : 'short';
        
        // CRITICAL: Cancel ALL existing orders for this symbol BEFORE setting new SL/TP
        console.log(`${this.config.colors.cyan}🧹 Cleaning up existing orders for ${coinToSet}...${this.config.colors.reset}`);
        try {
          const openOrdersResult = await this.client.getOpenOrders(symbol);
          let existingOrders = [];
          
          if (Array.isArray(openOrdersResult.data)) {
            existingOrders = openOrdersResult.data;
          } else if (openOrdersResult.data && Array.isArray(openOrdersResult.data.orders)) {
            existingOrders = openOrdersResult.data.orders;
          }
          
          if (existingOrders.length > 0) {
            console.log(`  Found ${existingOrders.length} existing orders, cancelling...`);
            for (const order of existingOrders) {
              try {
                await this.client.cancelOrder(symbol, order.orderId);
                console.log(`  ✓ Cancelled order ${order.orderId} (${order.type})`);
              } catch (e) {
                console.log(`  ⚠️  Could not cancel order ${order.orderId}: ${e.message}`);
              }
            }
          } else {
            console.log(`  No existing orders found`);
          }
        } catch (error) {
          console.log(`  ${this.config.colors.yellow}⚠️  Could not fetch existing orders: ${error.message}${this.config.colors.reset}`);
        }
        console.log();
        
        // VALIDATE SL/TP DIRECTION
        const sl = decision.stop_loss;
        const tp = decision.profit_target;
        
        // For LONG: SL < Entry < TP
        if (isLong) {
          if (sl >= entry) {
            console.log(`${this.config.colors.red}❌ INVALID SL for LONG: ${sl} must be BELOW entry ${entry}${this.config.colors.reset}\n`);
            return;
          }
          if (tp <= entry) {
            console.log(`${this.config.colors.red}❌ INVALID TP for LONG: ${tp} must be ABOVE entry ${entry}${this.config.colors.reset}\n`);
            return;
          }
        } else {
          // For SHORT: TP < Entry < SL
          if (sl <= entry) {
            console.log(`${this.config.colors.red}❌ INVALID SL for SHORT: ${sl} must be ABOVE entry ${entry}${this.config.colors.reset}\n`);
            return;
          }
          if (tp >= entry) {
            console.log(`${this.config.colors.red}❌ INVALID TP for SHORT: ${tp} must be BELOW entry ${entry}${this.config.colors.reset}\n`);
            return;
          }
        }
        
        console.log(`${this.config.colors.green}✅ Setting SL/TP for ${coinToSet}${this.config.colors.reset}`);
        console.log(`  Entry: ${entry.toFixed(4)}`);
        console.log(`  SL: ${sl.toFixed(4)} ${isLong ? '(below entry ✓)' : '(above entry ✓)'}`);
        console.log(`  TP: ${tp.toFixed(4)} ${isLong ? '(above entry ✓)' : '(below entry ✓)'}\n`);
        
        this.activePositions.set(symbol, {
          symbol: symbol,
          side: side,
          amount: positionAmt,
          entryPrice: entry,
          stopLoss: decision.stop_loss,
          takeProfit: decision.profit_target,
          openTime: Date.now(),
          leverage: parseFloat(position.leverage || 10),
          reconstructed: true
        });
        
        await this.placeSLTPOrders(symbol, side, Math.abs(positionAmt), decision.stop_loss, decision.profit_target);
        console.log(`${this.config.colors.green}✅ ${coinToSet} now tracked${this.config.colors.reset}\n`);
      }
      return;
    }

    if (decision.confidence < this.config.minConfidence) {
      console.log(`${this.config.colors.yellow}⏸️ Confidence too low${this.config.colors.reset}\n`);
      return;
    }

    if (decision.action === 'hold') {
      console.log(`${this.config.colors.blue}✅ HOLDING${this.config.colors.reset}\n`);
      return;
    }

    // HANDLE SCALPER MODE
    const isScalperTrade = decision.action === 'scalp_long' || decision.action === 'scalp_short';
    
    if (isScalperTrade) {
      // Check scalper position limits
      if (this.scalperPositions.size >= this.config.scalperMaxPositions) {
        console.log(`${this.config.colors.yellow}⚠️ Max scalper positions reached (${this.config.scalperMaxPositions})${this.config.colors.reset}\n`);
        return;
      }
      
      console.log(`${this.config.colors.bright}${this.config.colors.green}⚡ SCALPER MODE ACTIVATED${this.config.colors.reset}`);
      console.log(`  Quick pullback trade with 25x leverage`);
      console.log(`  Tight SL/TP for rapid profit capture\n`);
    }
    
    if (decision.action === 'long' || decision.action === 'short' || isScalperTrade) {
      
      // ✅ CHECK MINIMUM SCORE REQUIREMENT (99/100)
      const scannerOpportunity = this.scannerResults.find(s => 
        s.symbol.replace('USDT', '') === decision.coin
      );
      
      if (scannerOpportunity && scannerOpportunity.score < 79) {
        console.log(`${this.config.colors.yellow}❌ Score too low: ${scannerOpportunity.score}/100 (Minimum: 99/100)${this.config.colors.reset}`);
        console.log(`   ${decision.coin} does not meet minimum quality threshold`);
        console.log(`   ${this.config.colors.cyan}💡 Waiting for higher-quality opportunity${this.config.colors.reset}\n`);
        return;
      }
      
      if (scannerOpportunity) {
        console.log(`${this.config.colors.green}✅ Score check passed: ${scannerOpportunity.score}/100${this.config.colors.reset}\n`);
      }
      
      if (openPositions.length >= this.config.maxPositions) {
        console.log(`${this.config.colors.yellow}⚠️ Max positions reached${this.config.colors.reset}\n`);
        return;
      }

      // ENHANCED MINIMUM BALANCE CHECK
      // For safety, require at least 1 USDT or 3x the minimum per-position requirement
      const safetyMinBalance = 1; // Minimum 1 USDT for futures trading
      
      // Check if this is a high-scoring opportunity and we should rotate positions
      // Respect the positionRotationEnabled config option
      const topScanner = this.scannerResults.length > 0 ? this.scannerResults[0] : null;
      const isTopOpportunity = topScanner && 
        topScanner.symbol.replace('USDT', '') === decision.coin && 
        topScanner.score >= this.config.rotationMinScoreRequired &&
        this.config.positionRotationEnabled;
      
      if (isTopOpportunity && balance < safetyMinBalance && openPositions.length > 0) {
        // Find and close the worst performing position to make room for this high-scoring opportunity
        const { position: worstPos, profitPercent } = await this.findWorstPerformingPosition(openPositions);
        
        if (worstPos && profitPercent <= this.config.rotationMaxProfitThreshold) { // Only close if profit <= configured threshold
          const coin = this.config.coinMapping[worstPos.symbol] || worstPos.symbol.replace('USDT', '');
          
          // ✅ CHECK: Position must be open for at least 60 minutes before rotation
          const tracked = this.activePositions.get(worstPos.symbol);
          if (tracked && tracked.openTime) {
            const holdTimeMs = Date.now() - tracked.openTime;
            const holdTimeMinutes = Math.floor(holdTimeMs / 60000);
            const requiredMinutes = Math.floor(this.config.minRotationHoldTime / 60000);
            
            if (holdTimeMs < this.config.minRotationHoldTime) {
              const remainingMinutes = requiredMinutes - holdTimeMinutes;
              console.log(`${this.config.colors.yellow}⏳ ROTATION BLOCKED: ${coin} opened only ${holdTimeMinutes} min ago${this.config.colors.reset}`);
              console.log(`   Required hold time: ${requiredMinutes} minutes`);
              console.log(`   Remaining wait: ${remainingMinutes} minute(s)`);
              console.log(`   ${this.config.colors.cyan}💡 High-score opportunity (${decision.coin}) will be skipped${this.config.colors.reset}\n`);
              return;
            }
          }
          
          console.log(`${this.config.colors.red}📉 Closing underperformer: ${coin} (${profitPercent.toFixed(2)}% profit)${this.config.colors.reset}`);
          console.log(`${this.config.colors.green}📈 To seize HIGH-SCORING opportunity: ${decision.coin} (Score: ${topScanner.score}/${this.config.rotationMinScoreRequired})${this.config.colors.reset}\n`);
          
          // Close the position
          await this.closePosition(worstPos, `Rotation: Closing for better opportunity (${decision.coin} Score: ${topScanner.score}/${this.config.rotationMinScoreRequired})`);
          
          // Wait for balance to update
          console.log(`${this.config.colors.cyan}⏳ Waiting 3 seconds for balance update...${this.config.colors.reset}\n`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Refresh balance
          const accountInfo = await this.client.getAccount();
          if (accountInfo.data) {
            balance = parseFloat(
              accountInfo.data.availableBalance || 
              accountInfo.data.available_balance ||
              accountInfo.data.availBalance ||
              accountInfo.data.balance ||
              0
            );
            console.log(`${this.config.colors.green}✅ Balance updated: ${balance.toFixed(2)} USDT${this.config.colors.reset}`);
            console.log(`${this.config.colors.bright}${this.config.colors.green}🎯 Proceeding with HIGH-SCORING opportunity!${this.config.colors.reset}\n`);
          }
        } else if (worstPos) {
          console.log(`${this.config.colors.yellow}⚠️ Worst position (${this.config.coinMapping[worstPos.symbol]}) has ${profitPercent.toFixed(2)}% profit${this.config.colors.reset}`);
          console.log(`${this.config.colors.cyan}💡 Keeping profitable positions, skipping opportunity${this.config.colors.reset}\n`);
          return;
        }
      }
      
      if (balance < safetyMinBalance) {
        console.log(`${this.config.colors.yellow}⚠️ Insufficient balance for safe trading${this.config.colors.reset}`);
        console.log(`  Current balance: ${balance.toFixed(2)} USDT`);
        console.log(`  Required minimum: ${safetyMinBalance.toFixed(2)} USDT\n`);
        return;
      }

      // Find symbol - check both coinMapping and scanner results
      let symbol = Object.keys(this.config.coinMapping).find(k => this.config.coinMapping[k] === decision.coin);
      
      // If not in default pairs, check if it's from scanner
      if (!symbol) {
        symbol = decision.coin + 'USDT';
        console.log(`${this.config.colors.cyan}📡 Using scanner token: ${symbol}${this.config.colors.reset}`);
      }
      
      const existingPosition = openPositions.find(p => p.symbol === symbol);
      if (existingPosition) {
        console.log(`${this.config.colors.yellow}⚠️ Already have position${this.config.colors.reset}\n`);
        return;
      }

      // COOLDOWN CHECK - Don't re-enter recently closed positions
      const recentlyClosed = this.recentlyClosed.get(symbol);
      if (recentlyClosed) {
        const loopsSinceClosed = this.loopCount - recentlyClosed.closeLoop;
        if (loopsSinceClosed < 10) {
          const waitMore = 1 - loopsSinceClosed;
          console.log(`${this.config.colors.yellow}⏳ COOLDOWN ACTIVE for ${decision.coin}${this.config.colors.reset}`);
          console.log(`   Recently closed ${loopsSinceClosed} loop(s) ago`);
          console.log(`   Wait ${waitMore} more loop(s) for better entry price`);
          console.log(`   ${this.config.colors.cyan}💡 Avoiding chasing the price${this.config.colors.reset}\n`);
          return;
        } else {
          // Cooldown expired, remove from map
          this.recentlyClosed.delete(symbol);
        }
      }

      // CRITICAL FIX: Get price properly - if not in marketData, fetch from scanner or exchange
      let price = marketData[decision.coin]?.price;
      
      if (!price) {
        // Price not in marketData - fetch current price from exchange
        console.log(`${this.config.colors.yellow}⚠️  ${decision.coin} not in default pairs, fetching current price...${this.config.colors.reset}`);
        try {
          const ticker = await this.client.getTicker(symbol);
          price = parseFloat(ticker.data.price);
          console.log(`${this.config.colors.green}✓ Price fetched: ${price}${this.config.colors.reset}\n`);
        } catch (error) {
          console.log(`${this.config.colors.red}❌ Failed to fetch price for ${symbol}: ${error.message}${this.config.colors.reset}\n`);
          return;
        }
      }
      
      // HIGH CONFIDENCE LEVERAGE BOOST
      let maxAllowedLeverage = this.config.maxLeverage;
      if (decision.confidence >= this.config.highConfidenceThreshold) {
        maxAllowedLeverage = this.config.highConfidenceMaxLeverage;
        console.log(`${this.config.colors.green}🔥 HIGH CONFIDENCE (${(decision.confidence * 100).toFixed(0)}%) - Leverage cap increased to ${maxAllowedLeverage}x!${this.config.colors.reset}`);
      }
      
      let leverage = Math.min(decision.leverage || 10, maxAllowedLeverage);
      
      // SCALPER OVERRIDE: Force 25x leverage and calculate tight SL/TP
      if (isScalperTrade) {
        leverage = this.config.scalperMaxLeverage;
        console.log(`${this.config.colors.green}⚡ SCALPER: Using ${leverage}x leverage${this.config.colors.reset}`);
        
        // Override SL/TP with scalper settings
        const isLong = decision.action === 'scalp_long';
        if (isLong) {
          decision.stop_loss = price * (1 - this.config.scalperStopLoss / 100);
          decision.profit_target = price * (1 + this.config.scalperProfitTarget / 100);
        } else {
          decision.stop_loss = price * (1 + this.config.scalperStopLoss / 100);
          decision.profit_target = price * (1 - this.config.scalperProfitTarget / 100);
        }
        
        console.log(`${this.config.colors.green}⚡ SCALPER SL/TP: ${decision.stop_loss.toFixed(4)} / ${decision.profit_target.toFixed(4)}${this.config.colors.reset}`);
        console.log(`${this.config.colors.green}   (${this.config.scalperStopLoss}% SL / ${this.config.scalperProfitTarget}% TP)${this.config.colors.reset}\n`);
      }
      
      // HIGH CONFIDENCE BALANCE ALLOCATION
      let balanceUsagePercent = this.config.riskPerTrade; // Default 10%
      if (decision.confidence >= this.config.highConfidenceThreshold) {
        balanceUsagePercent = this.config.highConfidenceBalanceUsage; // 80% for high confidence
        console.log(`${this.config.colors.green}💰 HIGH CONFIDENCE - Using ${(balanceUsagePercent * 100).toFixed(0)}% of balance!${this.config.colors.reset}`);
      }
      
      const maxMargin = balance * 0.95;
      const riskAmount = balance * balanceUsagePercent;
      let targetNotional = riskAmount * leverage;
      
      if (targetNotional < this.config.minNotionalValue) {
        targetNotional = this.config.minNotionalValue;
      }
      
      let quantity = targetNotional / price;
      quantity = this.roundQuantity(symbol, quantity);
      
      const actualNotional = quantity * price;
      const requiredMargin = actualNotional / leverage;
      
      console.log(`${this.config.colors.blue}📊 Position Calculation:${this.config.colors.reset}`);
      console.log(`  Leverage: ${leverage}x`);
      console.log(`  Notional: ${actualNotional.toFixed(2)} USDT`);
      console.log(`  Quantity: ${quantity}`);
      console.log();
      
      // PRE-ORDER VALIDATION
      const validation = this.validateOrderParameters(symbol, quantity, leverage, price);
      if (!validation.valid) {
        console.log(`${this.config.colors.red}❌ PRE-ORDER VALIDATION FAILED:${this.config.colors.reset}`);
        validation.errors.forEach(err => console.log(`  - ${err}`));
        console.log();
        return;
      }
      
      console.log(`${this.config.colors.green}✅ Pre-order validation passed${this.config.colors.reset}`);
      console.log(`  Notional: ${validation.notional.toFixed(2)} USDT`);
      console.log(`  Required Margin: ${validation.requiredMargin.toFixed(2)} USDT`);
      console.log();
      
      if (requiredMargin > balance) {
        console.log(`${this.config.colors.red}❌ Insufficient balance${this.config.colors.reset}\n`);
        return;
      }

      // CRITICAL FIX: Extract actual side from action (handles scalp_long/scalp_short)
      const actualSide = decision.action.includes('long') ? 'long' : 
                        decision.action.includes('short') ? 'short' : 
                        decision.action;
      
      // ✅ CHECK IF HIGH SCORE (>= 1) OR SCALPER WITH SKIP ENABLED - NO DEEPSEEK API CALL
      const scannerScore = scannerOpportunity ? scannerOpportunity.score : 0;
      const skipValidation = scannerScore >= 1 || (isScalperTrade && this.config.scalperSkipDeepSeekValidation);
      
      if (skipValidation) {
        if (isScalperTrade && this.config.scalperSkipDeepSeekValidation) {
          console.log(`${this.config.colors.green}⚡ SCALPER MODE - NO DEEPSEEK VALIDATION (Token Saving Enabled)${this.config.colors.reset}`);
          console.log(`   ${this.config.colors.cyan}✓ Fast entry based on scanner technical analysis only${this.config.colors.reset}`);
          console.log(`   ${this.config.colors.cyan}✓ No API call - Zero DeepSeek tokens used${this.config.colors.reset}\n`);
        } else {
          console.log(`${this.config.colors.green}⚡ HIGH SCORE (${scannerScore}/100) - SKIPPING DEEPSEEK VALIDATION${this.config.colors.reset}`);
          console.log(`   ${this.config.colors.cyan}Score >= 69: Direct entry approved${this.config.colors.reset}\n`);
        }
      } else {
        // ✅ DEEPSEEK VALIDATION FOR SCORES < 79 (NON-SCALPER OR SCALPER WITH VALIDATION ENABLED)
        console.log(`${this.config.colors.bright}═══════════════════════════════════════${this.config.colors.reset}`);
        console.log(`${this.config.colors.bright}  🛡️  ENTRY VALIDATION CHECKPOINT${this.config.colors.reset}`);
        console.log(`${this.config.colors.bright}═══════════════════════════════════════${this.config.colors.reset}\n`);
        
        const deepSeekValidation = await this.validateEntryWithDeepSeek(
          symbol, 
          actualSide, 
          price, 
          scannerOpportunity || {}, 
          marketData
        );
        
        if (!deepSeekValidation.validated || deepSeekValidation.recommendation !== 'enter') {
          // Check if this is a scalper trade
          const isScalperTrade = decision.action === 'scalp_long' || decision.action === 'scalp_short';
          
          if (isScalperTrade && !this.config.scalperSkipDeepSeekValidation) {
            console.log(`${this.config.colors.yellow}⚠️  SCALPER REJECTED BY DEEPSEEK${this.config.colors.reset}`);
            console.log(`   Reason: ${deepSeekValidation.reasoning}`);
            console.log(`   ${this.config.colors.cyan}🔄 Converting to REGULAR trade with 15x leverage${this.config.colors.reset}\n`);
            
            // Convert scalper to regular trade
            leverage = 15; // Reduce from 25x to 15x
            
            // Recalculate position with new leverage
            const riskAmount = balance * balanceUsagePercent;
            let targetNotional = riskAmount * leverage;
            
            if (targetNotional < this.config.minNotionalValue) {
              targetNotional = this.config.minNotionalValue;
            }
            
            quantity = targetNotional / price;
            quantity = this.roundQuantity(symbol, quantity);
            
            const actualNotional = quantity * price;
            const requiredMargin = actualNotional / leverage;
            
            console.log(`${this.config.colors.blue}📊 Adjusted Position (Regular Trade):${this.config.colors.reset}`);
            console.log(`  Leverage: ${leverage}x (reduced from 25x)`);
            console.log(`  Notional: ${actualNotional.toFixed(2)} USDT`);
            console.log(`  Quantity: ${quantity}`);
            console.log(`  Required Margin: ${requiredMargin.toFixed(2)} USDT`);
            console.log();
            
            // Update decision to regular trade type
            decision.action = actualSide; // Remove 'scalp_' prefix
            
            console.log(`${this.config.colors.green}✅ FALLBACK APPROVED - Proceeding as regular trade${this.config.colors.reset}`);
            console.log(`${this.config.colors.bright}═══════════════════════════════════════${this.config.colors.reset}\n`);
            
            // Continue to position opening (don't return)
          } else {
            // Regular trade rejection - stop here
            console.log(`${this.config.colors.yellow}⛔ TRADE REJECTED BY DEEPSEEK VALIDATION${this.config.colors.reset}`);
            console.log(`   Symbol: ${symbol}`);
            console.log(`   Side: ${actualSide.toUpperCase()}`);
            console.log(`   Reason: ${deepSeekValidation.reasoning}`);
            console.log(`   ${this.config.colors.cyan}💡 Waiting for better entry confirmation${this.config.colors.reset}\n`);
            return;
          }
        } else {
          console.log(`${this.config.colors.green}✅ VALIDATION PASSED - Proceeding with trade${this.config.colors.reset}`);
          console.log(`${this.config.colors.bright}═══════════════════════════════════════${this.config.colors.reset}\n`);
        }
      }  // ← ADDED: Closing brace for the else block that contains DeepSeek validation
      
      await this.openPosition(symbol, actualSide, quantity, leverage, decision);
    }
  }

  async openPosition(symbol, side, quantity, leverage, decision) {
    try {
      // Get coin name for display
      const coin = this.config.coinMapping[symbol] || symbol;
      const sideEmoji = side === 'long' ? '🟢' : '🔴';
      const sideText = side === 'long' ? 'LONG' : 'SHORT';
      
      // Display random motivational phrase
      const motivationalPhrase = getRandomOpeningPhrase();
      console.log();
      console.log(`${this.config.colors.bright}╔════════════════════════════════════════════════════════╗${this.config.colors.reset}`);
      console.log(`${this.config.colors.bright}║  ${motivationalPhrase}${' '.repeat(Math.max(0, 52 - motivationalPhrase.length))}║${this.config.colors.reset}`);
      console.log(`${this.config.colors.bright}╚════════════════════════════════════════════════════════╝${this.config.colors.reset}`);
      console.log();
      console.log(`${this.config.colors.blue}[OPENING ${sideEmoji} ${sideText} POSITION - ${coin}]${this.config.colors.reset}`);
      console.log();
      
      // Determine if this is a scalper trade
      const isScalperTrade = decision.action === 'scalp_long' || decision.action === 'scalp_short';
      
      // Get current balance for margin calculation
      const accountInfo = await this.client.getAccount();
      let availableBalance = 0;
      if (accountInfo.data) {
        availableBalance = parseFloat(
          accountInfo.data.availableBalance || 
          accountInfo.data.available_balance ||
          accountInfo.data.availBalance ||
          accountInfo.data.balance ||
          0
        );
      }
      
      try {
        await this.client.setLeverage(symbol, leverage);
        console.log(`✅ Leverage set to ${leverage}x\n`);
      } catch (e) {
        console.log(`⚠️ ${e.message}\n`);
      }
      
      try {
        await this.client.setMarginType(symbol, 'CROSSED');
        console.log(`✅ Margin type set\n`);
      } catch (e) {
        console.log(`⚠️ ${e.message}\n`);
      }
      
      console.log(`📤 Placing market order...`);
      const orderParams = {
        symbol: symbol,
        side: (side === 'long' || side.includes('long')) ? 'BUY' : 'SELL',
        type: 'MARKET',
        quantity: quantity.toString(),
        positionSide: 'BOTH'
      };

      let result = await this.client.placeOrder(orderParams);
      
      // ENHANCED ERROR LOGGING
      console.log(`🔥 Order Response:`, JSON.stringify(result, null, 2));
      
      // Handle precision error with automatic adjustment
      if (result.statusCode === 400 && result.data && result.data.code === -1111) {
        console.log(`${this.config.colors.yellow}⚠️ PRECISION ERROR - Attempting auto-adjustment...${this.config.colors.reset}\n`);
        
        // Try to fetch symbol info for exact precision, or use conservative rounding
        let adjustedQuantity = quantity;
        
        // If we don't have precision rules, try conservative rounding
        if (!this.config.precisionRules[symbol]) {
          console.log(`${this.config.colors.cyan}📊 No precision rules for ${symbol}, using conservative rounding${this.config.colors.reset}`);
          // Try rounding to different decimal places
          for (let decimals = 2; decimals >= 0; decimals--) {
            adjustedQuantity = parseFloat(quantity.toFixed(decimals));
            console.log(`  Trying ${decimals} decimals: ${adjustedQuantity}`);
            
            if (adjustedQuantity >= 0.01) break; // Stop at reasonable minimum
          }
        } else {
          // Re-round with precision rules
          adjustedQuantity = this.roundQuantity(symbol, quantity);
          console.log(`${this.config.colors.cyan}📊 Re-rounded with precision rules: ${adjustedQuantity}${this.config.colors.reset}`);
        }
        
        console.log(`  Original: ${quantity}`);
        console.log(`  Adjusted: ${adjustedQuantity}`);
        console.log();
        
        // Retry with adjusted quantity
        console.log(`📤 Retrying with adjusted precision...`);
        orderParams.quantity = adjustedQuantity.toString();
        result = await this.client.placeOrder(orderParams);
        console.log(`🔥 Retry Response:`, JSON.stringify(result, null, 2));
        
        // NEW: Handle second retry with leverage boost if still failing
        if (result.statusCode === 400 && result.data && result.data.code === -1111) {
          console.log(`${this.config.colors.yellow}⚠️ Still failing - Attempting 2nd retry with INCREASED LEVERAGE...${this.config.colors.reset}\n`);
          
          // Increase leverage by 25% (e.g., 8x → 10x)
          const boostedLeverage = Math.min(Math.ceil(leverage * 1.25), this.config.maxLeverage);
          
          if (boostedLeverage > leverage) {
            console.log(`${this.config.colors.cyan}📈 Boosting leverage: ${leverage}x → ${boostedLeverage}x${this.config.colors.reset}`);
            
            try {
              await this.client.setLeverage(symbol, boostedLeverage);
              
              // Keep same notional but with higher leverage = lower margin requirement
              // OR slightly increase notional by using more of available balance
              const ticker = await this.client.getTicker(symbol);
              const currentPrice = parseFloat(ticker.data.price);
              
              // Original approach: Keep same notional, just different leverage
              // But for fixing precision errors, we want slightly LARGER quantity
              // So we use the original quantity but round UP instead of DOWN
              let boostedQuantity = Math.ceil(adjustedQuantity);
              
              // If that's still the same, try increasing by 1 unit
              if (boostedQuantity === adjustedQuantity) {
                boostedQuantity = adjustedQuantity + 1;
              }
              
              boostedQuantity = this.roundQuantity(symbol, boostedQuantity);
              const boostedNotional = boostedQuantity * currentPrice;
              const requiredMargin = boostedNotional / boostedLeverage;
              
              console.log(`  Strategy: Round UP quantity to whole number`);
              console.log(`  New Quantity: ${boostedQuantity}`);
              console.log(`  New Notional: ${boostedNotional.toFixed(2)} USDT`);
              console.log(`  Required Margin: ${requiredMargin.toFixed(2)} USDT (was ${(boostedNotional / leverage).toFixed(2)} USDT)`);
              console.log();
              
              // Retry with boosted parameters
              orderParams.quantity = boostedQuantity.toString();
              result = await this.client.placeOrder(orderParams);
              console.log(`🔥 2nd Retry Response:`, JSON.stringify(result, null, 2));
              
              // Update tracking variables
              quantity = boostedQuantity;
              leverage = boostedLeverage;
              
            } catch (leverageError) {
              console.log(`${this.config.colors.red}❌ Failed to boost leverage: ${leverageError.message}${this.config.colors.reset}\n`);
            }
          } else {
            console.log(`${this.config.colors.yellow}⚠️ Already at max leverage (${leverage}x), cannot boost further${this.config.colors.reset}\n`);
          }
        }
        
        // Update quantity for tracking
        quantity = adjustedQuantity;
      }
      
      // Handle insufficient margin error with automatic adjustment
      if (result.statusCode === 400 && result.data && result.data.code === -2019) {
        console.log(`${this.config.colors.yellow}⚠️ INSUFFICIENT MARGIN - Attempting auto-adjustment...${this.config.colors.reset}\n`);
        
        // Get current price
        const ticker = await this.client.getTicker(symbol);
        const price = parseFloat(ticker.data.price);
        
        // Calculate maximum safe position with 95% of available balance
        const maxSafeMargin = availableBalance * 0.95;
        const maxNotional = maxSafeMargin * leverage;
        let adjustedQuantity = maxNotional / price;
        
        // Round to precision
        adjustedQuantity = this.roundQuantity(symbol, adjustedQuantity);
        const adjustedNotional = adjustedQuantity * price;
        const adjustedMargin = adjustedNotional / leverage;
        
        console.log(`${this.config.colors.cyan}📊 ADJUSTED POSITION:${this.config.colors.reset}`);
        console.log(`  Available Balance: ${availableBalance.toFixed(2)} USDT`);
        console.log(`  Max Safe Margin: ${maxSafeMargin.toFixed(2)} USDT (95%)`);
        console.log(`  Original Quantity: ${quantity}`);
        console.log(`  Adjusted Quantity: ${adjustedQuantity}`);
        console.log(`  Adjusted Notional: ${adjustedNotional.toFixed(2)} USDT`);
        console.log(`  Required Margin: ${adjustedMargin.toFixed(2)} USDT`);
        console.log();
        
        // Verify we can afford this
        if (adjustedMargin > availableBalance || adjustedNotional < this.config.minNotionalValue) {
          console.log(`${this.config.colors.red}❌ Cannot adjust position - balance too low${this.config.colors.reset}\n`);
          return;
        }
        
        // Retry with adjusted quantity
        console.log(`📤 Retrying with adjusted quantity...`);
        orderParams.quantity = adjustedQuantity.toString();
        result = await this.client.placeOrder(orderParams);
        console.log(`🔥 Retry Response:`, JSON.stringify(result, null, 2));
        
        // Update quantity for tracking
        quantity = adjustedQuantity;
      }
      
      if (result.statusCode === 200) {
        console.log(`${this.config.colors.green}✅ Order placed! ID: ${result.data.orderId}${this.config.colors.reset}\n`);
        
        // IMPROVED: Try multiple times with longer delays
        console.log(`⏳ Waiting for position confirmation...`);
        let newPos = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts && !newPos) {
          attempts++;
          const waitTime = attempts * 2000; // 2s, 4s, 6s
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          console.log(`  Attempt ${attempts}/${maxAttempts}...`);
          
          const positionsCheck = await this.client.getPositions();
          let positionsData = [];
          if (Array.isArray(positionsCheck.data)) {
            positionsData = positionsCheck.data;
          } else if (positionsCheck.data && Array.isArray(positionsCheck.data.positions)) {
            positionsData = positionsCheck.data.positions;
          }
          
          const checkPos = positionsData.find(p => p.symbol === symbol);
          if (checkPos && this.isRealPosition(checkPos)) {
            newPos = checkPos;
            break;
          }
        }
        
        if (newPos && this.isRealPosition(newPos)) {
          const entryPrice = parseFloat(newPos.entryPrice);
          
          // Get coin name for display
          const coin = this.config.coinMapping[symbol] || symbol;
          const sideEmoji = side === 'long' ? '🟢' : '🔴';
          const sideText = side === 'long' ? 'LONG' : 'SHORT';
          
          // Beautiful success banner
          console.log();
          console.log(`${this.config.colors.bright}╔════════════════════════════════════════════════════════╗${this.config.colors.reset}`);
          console.log(`${this.config.colors.bright}║       ${sideEmoji} POSITION OPENED - ${coin} ${sideText}${' '.repeat(Math.max(0, 30 - coin.length))}║${this.config.colors.reset}`);
          console.log(`${this.config.colors.bright}╚════════════════════════════════════════════════════════╝${this.config.colors.reset}`);
          console.log();
          console.log(`  ${this.config.colors.cyan}Entry Price:${this.config.colors.reset}  $${entryPrice.toFixed(4)}`);
          console.log(`  ${this.config.colors.cyan}Quantity:${this.config.colors.reset}     ${Math.abs(parseFloat(newPos.positionAmt))}`);
          console.log(`  ${this.config.colors.cyan}Leverage:${this.config.colors.reset}     ${leverage}x`);
          console.log(`  ${this.config.colors.cyan}Stop Loss:${this.config.colors.reset}    $${decision.stop_loss.toFixed(4)}`);
          console.log(`  ${this.config.colors.cyan}Take Profit:${this.config.colors.reset}  $${decision.profit_target.toFixed(4)}`);
          console.log();
          console.log(`${this.config.colors.bright}══════════════════════════════════════════════════════════${this.config.colors.reset}`);
          console.log(`${this.config.colors.green}${this.config.colors.bright}  ✅ CONFIRMED AFTER ${attempts} ATTEMPT(S)${this.config.colors.reset}`);
          console.log(`${this.config.colors.bright}══════════════════════════════════════════════════════════${this.config.colors.reset}`);
          console.log();
          
          // ✅ Update AI recommendation for dashboard
          dashboardExporter.updateAIRecommendation(
            `${sideEmoji} ${sideText} ${coin}`,
            `Entry: $${entryPrice.toFixed(4)} | ${leverage}x leverage | SL: $${decision.stop_loss.toFixed(4)} | TP: $${decision.profit_target.toFixed(4)}`
          );
          
          this.activePositions.set(symbol, {
            symbol: symbol,
            side: side,
            amount: parseFloat(newPos.positionAmt),
            entryPrice: entryPrice,
            stopLoss: decision.stop_loss,
            takeProfit: decision.profit_target,
            openTime: Date.now(),
            leverage: leverage,
            isScalper: isScalperTrade
          });
          
          if (isScalperTrade) {
            this.scalperPositions.set(symbol, {
              openTime: Date.now(),
              targetProfit: this.config.scalperProfitTarget
            });
            console.log(`${this.config.colors.green}⚡ SCALPER POSITION TRACKED (${this.scalperPositions.size}/${this.config.scalperMaxPositions})${this.config.colors.reset}\n`);
          }
          
          this.lastTPUpdate.set(symbol, this.loopCount);
          
          // Enhanced SL/TP placement with proper error handling
          try {
            console.log(`${this.config.colors.cyan}📋 SL/TP Parameters:${this.config.colors.reset}`);
            console.log(`  Symbol: ${symbol}`);
            console.log(`  Side: ${side}`);
            console.log(`  Quantity: ${quantity}`);
            console.log(`  Stop Loss: ${decision.stop_loss}`);
            console.log(`  Take Profit: ${decision.profit_target}`);
            console.log();
            
            await this.placeSLTPOrders(symbol, side, quantity, decision.stop_loss, decision.profit_target);
            
            // Verify orders were placed
            await new Promise(resolve => setTimeout(resolve, 1000));
            const orders = await this.client.getOpenOrders(symbol);
            const slOrder = orders.data?.find(o => o.type === 'STOP_MARKET');
            const tpOrder = orders.data?.find(o => o.type === 'TAKE_PROFIT_MARKET');
            
            console.log(`${this.config.colors.cyan}🔍 SL/TP Verification:${this.config.colors.reset}`);
            if (slOrder) {
              console.log(`  ${this.config.colors.green}✅ Stop Loss confirmed: ${slOrder.orderId}${this.config.colors.reset}`);
            } else {
              console.log(`  ${this.config.colors.red}❌ Stop Loss NOT found in open orders${this.config.colors.reset}`);
            }
            
            if (tpOrder) {
              console.log(`  ${this.config.colors.green}✅ Take Profit confirmed: ${tpOrder.orderId}${this.config.colors.reset}`);
            } else {
              console.log(`  ${this.config.colors.red}❌ Take Profit NOT found in open orders${this.config.colors.reset}`);
            }
            console.log();
            
          } catch (sltpError) {
            console.log(`${this.config.colors.red}❌ CRITICAL ERROR placing SL/TP: ${sltpError.message}${this.config.colors.reset}`);
            console.log(`   Stack:`, sltpError.stack);
            console.log();
          }
          
        } else {
          console.log(`${this.config.colors.red}❌ Position NOT detected after ${attempts} attempts${this.config.colors.reset}`);
          console.log(`${this.config.colors.yellow}⚠️  Possible causes:${this.config.colors.reset}`);
          console.log(`  - Order partially filled (position too small)`);
          console.log(`  - Exchange rejected order after initial acceptance`);
          console.log(`  - Position size below exchange minimum`);
          console.log(`${this.config.colors.cyan}💡 Solution: Increase position size for ${symbol}${this.config.colors.reset}\n`);
        }
      } else {
        console.log(`${this.config.colors.red}❌ Order FAILED: Status ${result.statusCode}${this.config.colors.reset}`);
        console.log(`Response:`, JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error(`${this.config.colors.red}❌ Error: ${error.message}${this.config.colors.reset}`);
      console.error(`Stack:`, error.stack);
    }
  }

  async placeSLTPOrders(symbol, side, quantity, stopLoss, takeProfit) {
    console.log(`${this.config.colors.blue}[PLACING SL/TP ORDERS]${this.config.colors.reset}`);
    console.log(`  Symbol: ${symbol}`);
    console.log(`  Side: ${side} (SL/TP: ${side === 'long' ? 'SELL' : 'BUY'})`);
    
    // Quantity rounding
    const roundedQty = this.roundQuantity(symbol, quantity);
    console.log(`  Quantity: ${quantity} → ${roundedQty}`);
    
    // Price rounding
    const roundedSL = this.roundPrice(symbol, stopLoss);
    const roundedTP = this.roundPrice(symbol, takeProfit);
    console.log(`  Stop Loss: ${stopLoss} → ${roundedSL}`);
    console.log(`  Take Profit: ${takeProfit} → ${roundedTP}`);
    
    // FIRST: Cancel ALL existing orders to ensure clean slate
    try {
      await this.cancelSLTPOrders(symbol);
    } catch (e) {
      console.log(`${this.config.colors.yellow}  ⚠️  Error cancelling old orders: ${e.message}${this.config.colors.reset}`);
    }
    
    const slSide = side === 'long' ? 'SELL' : 'BUY';
    const tpSide = side === 'long' ? 'SELL' : 'BUY';
    
    if (!this.slTpOrders.has(symbol)) {
      this.slTpOrders.set(symbol, { stopLossOrderId: null, takeProfitOrderId: null });
    }
    
    console.log();
    
    // Place Stop Loss
    try {
      console.log(`${this.config.colors.yellow}📤 Placing Stop Loss order...${this.config.colors.reset}`);
      const slParams = {
        symbol: symbol,
        side: slSide,
        type: 'STOP_MARKET',
        stopPrice: roundedSL.toString(),
        quantity: roundedQty.toString(),
        positionSide: 'BOTH',
        reduceOnly: 'true'
      };
      
      console.log(`  Params:`, JSON.stringify(slParams, null, 2));
      
      const slResult = await this.client.placeOrder(slParams);
      
      console.log(`  Response:`, JSON.stringify(slResult, null, 2));
      
      if (slResult.statusCode === 200 && slResult.data && slResult.data.orderId) {
        console.log(`${this.config.colors.green}  ✅ Stop Loss: ${slResult.data.orderId}${this.config.colors.reset}`);
        this.slTpOrders.get(symbol).stopLossOrderId = slResult.data.orderId;
      } else {
        console.log(`${this.config.colors.red}  ❌ Stop Loss placement failed - unexpected response${this.config.colors.reset}`);
      }
    } catch (error) {
      console.log(`${this.config.colors.red}  ❌ SL failed: ${error.message}${this.config.colors.reset}`);
      if (error.response) {
        console.log(`  API Response:`, JSON.stringify(error.response, null, 2));
      }
      if (error.data) {
        console.log(`  Error Data:`, JSON.stringify(error.data, null, 2));
      }
    }
    
    console.log();
    
    // Place Take Profit
    try {
      console.log(`${this.config.colors.yellow}📤 Placing Take Profit order...${this.config.colors.reset}`);
      const tpParams = {
        symbol: symbol,
        side: tpSide,
        type: 'TAKE_PROFIT_MARKET',
        stopPrice: roundedTP.toString(),
        quantity: roundedQty.toString(),
        positionSide: 'BOTH',
        reduceOnly: 'true'
      };
      
      console.log(`  Params:`, JSON.stringify(tpParams, null, 2));
      
      const tpResult = await this.client.placeOrder(tpParams);
      
      console.log(`  Response:`, JSON.stringify(tpResult, null, 2));
      
      if (tpResult.statusCode === 200 && tpResult.data && tpResult.data.orderId) {
        console.log(`${this.config.colors.green}  ✅ Take Profit: ${tpResult.data.orderId}${this.config.colors.reset}`);
        this.slTpOrders.get(symbol).takeProfitOrderId = tpResult.data.orderId;
      } else {
        console.log(`${this.config.colors.red}  ❌ Take Profit placement failed - unexpected response${this.config.colors.reset}`);
      }
    } catch (error) {
      console.log(`${this.config.colors.red}  ❌ TP failed: ${error.message}${this.config.colors.reset}`);
      if (error.response) {
        console.log(`  API Response:`, JSON.stringify(error.response, null, 2));
      }
      if (error.data) {
        console.log(`  Error Data:`, JSON.stringify(error.data, null, 2));
      }
    }
    
    console.log();
  }

  async updateStopLoss(symbol, side, quantity, stopLoss) {
    const slSide = side === 'long' ? 'SELL' : 'BUY';
    const roundedSL = this.roundPrice(symbol, stopLoss);
    try {
      const slParams = {
        symbol: symbol, side: slSide, type: 'STOP_MARKET',
        stopPrice: roundedSL.toString(), quantity: quantity.toString(),
        positionSide: 'BOTH', reduceOnly: 'true'
      };
      const slResult = await this.client.placeOrder(slParams);
      if (slResult.statusCode === 200) {
        if (!this.slTpOrders.has(symbol)) {
          this.slTpOrders.set(symbol, { stopLossOrderId: null, takeProfitOrderId: null });
        }
        this.slTpOrders.get(symbol).stopLossOrderId = slResult.data.orderId;
        return true;
      }
    } catch (error) {
      console.log(`${this.config.colors.red}  ❌ SL update failed${this.config.colors.reset}`);
    }
    return false;
  }

  async updateTakeProfit(symbol, side, quantity, takeProfit) {
    const tpSide = side === 'long' ? 'SELL' : 'BUY';
    const roundedTP = this.roundPrice(symbol, takeProfit);
    try {
      const tpParams = {
        symbol: symbol, side: tpSide, type: 'TAKE_PROFIT_MARKET',
        stopPrice: roundedTP.toString(), quantity: quantity.toString(),
        positionSide: 'BOTH', reduceOnly: 'true'
      };
      const tpResult = await this.client.placeOrder(tpParams);
      if (tpResult.statusCode === 200) {
        if (!this.slTpOrders.has(symbol)) {
          this.slTpOrders.set(symbol, { stopLossOrderId: null, takeProfitOrderId: null });
        }
        this.slTpOrders.get(symbol).takeProfitOrderId = tpResult.data.orderId;
        return true;
      }
    } catch (error) {
      console.log(`${this.config.colors.red}  ❌ TP update failed${this.config.colors.reset}`);
    }
    return false;
  }

  async cancelSLOrder(symbol) {
    const orders = this.slTpOrders.get(symbol);
    if (orders && orders.stopLossOrderId) {
      try {
        await this.client.cancelOrder(symbol, orders.stopLossOrderId);
        orders.stopLossOrderId = null;
      } catch (e) {}
    }
  }

  async cancelTPOrder(symbol) {
    const orders = this.slTpOrders.get(symbol);
    if (orders && orders.takeProfitOrderId) {
      try {
        await this.client.cancelOrder(symbol, orders.takeProfitOrderId);
        orders.takeProfitOrderId = null;
      } catch (e) {}
    }
  }

  async cancelSLTPOrders(symbol) {
    // First, try to cancel tracked orders
    const orders = this.slTpOrders.get(symbol);
    if (orders) {
      if (orders.stopLossOrderId) {
        try {
          await this.client.cancelOrder(symbol, orders.stopLossOrderId);
        } catch (e) {}
      }
      if (orders.takeProfitOrderId) {
        try {
          await this.client.cancelOrder(symbol, orders.takeProfitOrderId);
        } catch (e) {}
      }
    }
    
    // IMPORTANT: Also fetch and cancel ALL orders for this symbol (catches untracked orders)
    try {
      const openOrdersResult = await this.client.getOpenOrders(symbol);
      let existingOrders = [];
      
      if (Array.isArray(openOrdersResult.data)) {
        existingOrders = openOrdersResult.data;
      } else if (openOrdersResult.data && Array.isArray(openOrdersResult.data.orders)) {
        existingOrders = openOrdersResult.data.orders;
      }
      
      for (const order of existingOrders) {
        try {
          await this.client.cancelOrder(symbol, order.orderId);
        } catch (e) {}
      }
    } catch (e) {}
    
    this.slTpOrders.delete(symbol);
  }

  async findWorstPerformingPosition(openPositions) {
    // Find the position with the worst profit % (prioritize losing/neutral positions)
    let worstPosition = null;
    let worstProfitPercent = Infinity;
    
    for (const pos of openPositions) {
      const tracked = this.activePositions.get(pos.symbol);
      if (!tracked) continue;
      
      const mark = parseFloat(pos.markPrice);
      const entry = tracked.entryPrice;
      const side = tracked.side;
      const leverage = tracked.leverage || 1;
      
      let priceChangePercent = 0;
      if (side === 'long') {
        priceChangePercent = ((mark - entry) / entry) * 100;
      } else {
        priceChangePercent = ((entry - mark) / entry) * 100;
      }
      
      const actualProfitPercent = priceChangePercent * leverage;
      
      // Prioritize worst performers
      if (actualProfitPercent < worstProfitPercent) {
        worstProfitPercent = actualProfitPercent;
        worstPosition = pos;
      }
    }
    
    return { position: worstPosition, profitPercent: worstProfitPercent };
  }

  /**
   * Tweet trade results to Twitter/X
   * @param {Object} tradeData - Trade information
   */
  async tweetTradeResult(tradeData) {
    try {
      // Check if Twitter is enabled
      if (!this.config.twitterEnabled || !this.twitterClient) {
        return;
      }
      
      const { coin, side, entryPrice, exitPrice, quantity, leverage, pnlUSDT, profitPercent, holdTime, isProfit } = tradeData;
      
      // Check if only profitable trades should be tweeted
      if (this.config.twitterOnlyProfits && profitPercent < this.config.twitterMinProfit) {
        console.log(`${this.config.colors.cyan}🐦 Tweet skipped: Profit ${profitPercent.toFixed(2)}% < ${this.config.twitterMinProfit}% minimum${this.config.colors.reset}`);
        return;
      }
      
      // Format the tweet
      const emoji = isProfit ? '🟢' : '🔴';
      const resultEmoji = isProfit ? '💰' : '📉';
      const pnlSign = pnlUSDT >= 0 ? '+' : '';
      const profitSign = profitPercent >= 0 ? '+' : '';
      
      // Calculate ROI on margin used
      const marginUsed = (quantity * entryPrice) / leverage;
      const roi = (pnlUSDT / marginUsed) * 100;
      
      let tweet = `${emoji} ${side.toUpperCase()} $${coin} CLOSED ${resultEmoji}\n\n`;
      tweet += `📊 Entry: $${entryPrice.toFixed(4)}\n`;
      tweet += `📊 Exit: $${exitPrice.toFixed(4)}\n`;
      tweet += `⚡ Leverage: ${leverage}x\n`;
      tweet += `⏱️ Duration: ${holdTime.toFixed(1)}m\n\n`;
      tweet += `💵 P&L: ${pnlSign}${pnlUSDT.toFixed(2)} USDT\n`;
      tweet += `📈 ROI: ${profitSign}${roi.toFixed(2)}%\n`;
      tweet += `🎯 Total Return: ${profitSign}${profitPercent.toFixed(2)}%\n\n`;
      tweet += `🤖 Automated by AI Trading Bot\n`;
      tweet += `#CryptoTrading #${coin} #AlgoTrading`;
      
      // Post the tweet
      console.log(`${this.config.colors.blue}🐦 Posting trade to Twitter/X...${this.config.colors.reset}`);
      
      const result = await this.twitterClient.v2.tweet(tweet);
      
      if (result.data && result.data.id) {
        console.log(`${this.config.colors.green}✅ Tweet posted successfully!${this.config.colors.reset}`);
        console.log(`${this.config.colors.cyan}   Tweet ID: ${result.data.id}${this.config.colors.reset}`);
        console.log(`${this.config.colors.cyan}   URL: https://twitter.com/i/web/status/${result.data.id}${this.config.colors.reset}\n`);
      }
      
    } catch (error) {
      console.log(`${this.config.colors.yellow}⚠️  Failed to post tweet: ${error.message}${this.config.colors.reset}`);
      
      // If rate limited, disable temporarily
      if (error.code === 429 || error.message.includes('rate limit')) {
        console.log(`${this.config.colors.yellow}   Twitter rate limit reached - tweets disabled for this session${this.config.colors.reset}\n`);
        this.config.twitterEnabled = false;
      }
    }
  }

  async closePosition(position, reason = 'Manual close') {
    try {
      const quantity = Math.abs(parseFloat(position.positionAmt));
      const side = parseFloat(position.positionAmt) > 0 ? 'SELL' : 'BUY';
      const coin = this.config.coinMapping[position.symbol] || position.symbol.replace('USDT', '');
      const isLong = parseFloat(position.positionAmt) > 0;
      const tracked = this.activePositions.get(position.symbol);
      const entryPrice = tracked ? tracked.entryPrice : parseFloat(position.entryPrice);
      const leverage = tracked ? tracked.leverage : parseFloat(position.leverage || 1);
      let markPrice = parseFloat(position.markPrice || position.entryPrice);
      try {
        const ticker = await this.client.getTicker(position.symbol);
        markPrice = parseFloat(ticker.data.price);
      } catch (e) {}
      console.log(`${this.config.colors.blue}[CLOSING POSITION]${this.config.colors.reset}`);
      console.log(`  Reason: ${reason}\n`);
      await this.cancelSLTPOrders(position.symbol);
      const orderParams = {
        symbol: position.symbol, side: side, type: 'MARKET',
        quantity: quantity.toString(), positionSide: 'BOTH', reduceOnly: 'true'
      };
      const result = await this.client.placeOrder(orderParams);
      if (result.statusCode === 200) {
        let priceChange = 0;
        let pnlUSDT = 0;
        if (isLong) {
          priceChange = ((markPrice - entryPrice) / entryPrice) * 100;
          pnlUSDT = (markPrice - entryPrice) * quantity;
        } else {
          priceChange = ((entryPrice - markPrice) / entryPrice) * 100;
          pnlUSDT = (entryPrice - markPrice) * quantity;
        }
        const actualProfitPercent = priceChange * leverage;
        const isProfit = pnlUSDT > 0;
        const resultColor = isProfit ? this.config.colors.green : this.config.colors.red;
        const resultEmoji = isProfit ? '💰' : '📉';
        const resultText = isProfit ? 'GAIN' : 'LOSS';
        const holdTime = tracked ? (Date.now() - tracked.openTime) / 60000 : 0;
        console.log(`${this.config.colors.bright}╔════════════════════════════════════════════════════════╗${this.config.colors.reset}`);
        console.log(`${this.config.colors.bright}║          ${resultEmoji} POSITION CLOSED - ${coin}${' '.repeat(Math.max(0, 25 - coin.length))}║${this.config.colors.reset}`);
        console.log(`${this.config.colors.bright}╚════════════════════════════════════════════════════════╝${this.config.colors.reset}`);
        console.log();
        console.log(`  ${this.config.colors.cyan}Entry Price:${this.config.colors.reset} ${entryPrice.toFixed(4)}`);
        console.log(`  ${this.config.colors.cyan}Exit Price:${this.config.colors.reset}  ${markPrice.toFixed(4)}`);
        console.log(`  ${this.config.colors.cyan}Quantity:${this.config.colors.reset}    ${quantity}`);
        console.log(`  ${this.config.colors.cyan}Leverage:${this.config.colors.reset}    ${leverage}x`);
        console.log(`  ${this.config.colors.cyan}Side:${this.config.colors.reset}        ${isLong ? 'LONG' : 'SHORT'}`);
        if (holdTime > 0) {
          console.log(`  ${this.config.colors.cyan}Hold Time:${this.config.colors.reset}   ${holdTime.toFixed(1)} minutes`);
        }
        console.log();
        console.log(`${this.config.colors.bright}═══════════════════════════════════════════════════════════${this.config.colors.reset}`);
        console.log(`${resultColor}${this.config.colors.bright}  RESULT: ${resultText} ${pnlUSDT >= 0 ? '+' : ''}${pnlUSDT.toFixed(2)} USDT (${actualProfitPercent >= 0 ? '+' : ''}${actualProfitPercent.toFixed(2)}%)${this.config.colors.reset}`);
        console.log(`${this.config.colors.bright}═══════════════════════════════════════════════════════════${this.config.colors.reset}`);
        console.log();
        
        // ✅ LOG COMPLETED TRADE
        this.dashboardExporter.logCompletedTrade({
          symbol: position.symbol,
          side: isLong ? 'LONG' : 'SHORT',
          coin: coin,
          entryPrice: entryPrice,
          exitPrice: markPrice,
          quantity: quantity,
          leverage: leverage,
          pnlUSDT: pnlUSDT,
          profitPercent: actualProfitPercent,
          holdTime: holdTime,
          reason: reason,
          isProfit: isProfit,
          openedAt: tracked?.openTime || (Date.now() - (holdTime * 60000))
        });
        
        // ✅ Update AI recommendation for closed position
        if (isProfit) {
          dashboardExporter.updateAIRecommendation(
            `💰 Closed ${coin} - PROFIT`,
            `Exit: $${markPrice.toFixed(4)} | PnL: +$${pnlUSDT.toFixed(2)} (+${actualProfitPercent.toFixed(2)}%) | Hold: ${holdTime.toFixed(1)}min`
          );
        } else {
          dashboardExporter.updateAIRecommendation(
            `📉 Closed ${coin} - LOSS`,
            `Exit: $${markPrice.toFixed(4)} | PnL: -$${Math.abs(pnlUSDT).toFixed(2)} (${actualProfitPercent.toFixed(2)}%) | Hold: ${holdTime.toFixed(1)}min`
          );
        }
        
        // ✅ LOG AI DECISION for exit
        this.dashboardExporter.logAIDecision({
          type: isLong ? 'long' : 'short',  // ✅ Changed to include side type
          coin: coin,
          action: 'CLOSE',
          confidence: 1.0,
          reasoning: reason,
          result: isProfit ? 'profit' : 'loss',
          price: markPrice,
          pnl: pnlUSDT,
          pnlPercent: actualProfitPercent
        });
        
        // ✅ Tweet the trade result
        await this.tweetTradeResult({
          coin: coin,
          side: isLong ? 'LONG' : 'SHORT',
          entryPrice: entryPrice,
          exitPrice: markPrice,
          quantity: quantity,
          leverage: leverage,
          pnlUSDT: pnlUSDT,
          profitPercent: actualProfitPercent,
          holdTime: holdTime,
          isProfit: isProfit
        });
        
        this.recentlyClosed.set(position.symbol, {
          closeTime: Date.now(),
          closeLoop: this.loopCount,
          coin: coin
        });
        console.log(`${this.config.colors.cyan}⏳ Cooldown activated for ${coin} (minimum 1 loop = ${this.config.loopInterval / 60000} minutes)${this.config.colors.reset}`);
        console.log(`${this.config.colors.cyan}💡 Will wait for better entry price before re-entering${this.config.colors.reset}`);
        console.log();
        this.activePositions.delete(position.symbol);
        this.trailingStopActive.delete(position.symbol);
        this.breakEvenActive.delete(position.symbol);
        this.lastTPUpdate.delete(position.symbol);
        this.scalperPositions.delete(position.symbol);
      }
    } catch (error) {
      console.error(`${this.config.colors.red}❌ Error: ${error.message}${this.config.colors.reset}`);
    }
  }
}

const bot = new AdvancedTradingBot(CONFIG);
bot.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
