import { useState, useEffect } from 'react';

export interface Position {
  symbol: string;
  coin: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  leverage: string;
}

export interface RecentTrade {
  coin: string;
  pnl: number;
  closedAt: number;
}

export interface TradingActivity {
  currentPositions: Position[];
  recentTrade: RecentTrade | null;
}

// Degen-style phrases for open positions
const LONG_PHRASES = [
  "Hoping {coin} to breakout",
  "Waiting for {coin} moon shot",
  "Expecting {coin} to pump",
  "{coin} bulls better show up",
  "Praying for {coin} to fly",
  "Riding {coin} to the moon",
  "Betting on {coin} pump",
  "{coin} is about to go brr",
  "Manifesting {coin} gains",
  "Holding {coin} for Valhalla"
];

const SHORT_PHRASES = [
  "Finding a floor for {coin}",
  "Waiting for {coin} to dump",
  "Expecting {coin} crash",
  "{coin} bears are hungry",
  "Shorting {coin} to the core",
  "Riding {coin} down",
  "{coin} is overcooked",
  "Fading {coin} pump",
  "{coin} needs correction",
  "Betting against {coin} hype"
];

const PROFIT_PHRASES = [
  "Panda happy with ${amount} profit from {coin}! 🐼💕",
  "Ez ${amount} from {coin}! LFG! 🚀",
  "{coin} paid the rent! +${amount} 💰",
  "Panda ate good today! +${amount} from {coin} 🎉",
  "{coin} was generous! +${amount} secured 💎",
  "Another W! +${amount} from {coin} 🏆",
  "Panda's pockets heavier! +${amount} {coin} gains 💵",
  "{coin} delivered! +${amount} in the bag 🎯",
  "Stack growing! +${amount} from {coin} trade 📈",
  "Blessed by {coin}! +${amount} profit 🙏"
];

const LOSS_PHRASES = [
  "Panda sad... lost ${amount} on {coin} 😢",
  "{coin} wasn't the one... -${amount} 💔",
  "Took an L on {coin}... -${amount} 😭",
  "Panda needs a hug... -${amount} from {coin} 🐼",
  "{coin} betrayed us... -${amount} gone 😔",
  "Not our day on {coin}... -${amount} 😞",
  "Learning experience: -{$amount} on {coin} 📚",
  "{coin} wasn't it... -${amount} 🥺",
  "Panda taking a break after -{$amount} {coin} loss 💤",
  "We'll get 'em next time... -{$amount} on {coin} 🎯"
];

const ENTRY_PHRASES = [
  "Panda going all in on {coin} {side}! 🎲",
  "Let's ride {coin} {side}! 🏄",
  "{coin} {side} position opened! Moon mission started 🚀",
  "Panda believes in {coin} {side}! 💪",
  "{coin} {side} - this is the one! ✨",
  "Entering {coin} {side} - wish us luck! 🍀",
  "{coin} {side} loaded! Time to print! 💵",
  "Panda's instincts say {coin} {side}! 🐼",
  "Full send on {coin} {side}! YOLO! 🎯",
  "{coin} {side} - let's make some magic! ✨"
];

function getRandomPhrase(phrases: string[], replacements: Record<string, string>): string {
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  let result = phrase;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

export function useTradingActivity(): TradingActivity & {
  getPositionPhrase: () => string;
  getRecentTradePhrase: () => string;
  getEntryPhrase: (coin: string, side: string) => string;
} {
  const [positions, setPositions] = useState<Position[]>([]);
  const [recentTrade, setRecentTrade] = useState<RecentTrade | null>(null);
  const [lastTradeId, setLastTradeId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch positions
        const posRes = await fetch('/api/positions');
        if (posRes.ok) {
          const posData = await posRes.json();
          if (Array.isArray(posData) && posData.length > 0) {
            setPositions(posData);
          } else {
            setPositions([]);
          }
        }

        // Fetch trades
        const tradesRes = await fetch('/api/trades');
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          if (Array.isArray(tradesData) && tradesData.length > 0) {
            // Get the most recent trade
            const latest = tradesData[0];
            const tradeId = latest.id || latest.closedAt;
            
            // Only update if it's a new trade
            if (tradeId !== lastTradeId) {
              setRecentTrade({
                coin: latest.coin || latest.symbol?.replace('USDT', ''),
                pnl: latest.pnl || 0,
                closedAt: latest.closedAt || Date.now()
              });
              setLastTradeId(tradeId);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching trading activity:', error);
      }
    };

    // Fetch immediately
    fetchData();

    // Refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [lastTradeId]);

  const getPositionPhrase = (): string => {
    if (positions.length === 0) {
      return "Panda waiting for the perfect setup... 🐼👀";
    }

    // Get a random position to talk about
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    // ✅ FIX: Ensure proper comparison with case-insensitive check
    const side = position.side?.toUpperCase();
    const phrases = side === 'LONG' ? LONG_PHRASES : SHORT_PHRASES;
    
    console.log('🐼 Position Debug:', {
      symbol: position.symbol,
      side: position.side,
      normalizedSide: side,
      phrasesUsed: side === 'LONG' ? 'LONG_PHRASES' : 'SHORT_PHRASES'
    });
    
    return getRandomPhrase(phrases, {
      coin: position.coin || position.symbol?.replace('USDT', '')
    });
  };

  const getRecentTradePhrase = (): string => {
    if (!recentTrade) {
      return "";
    }

    // Only show if trade was closed in the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    if (recentTrade.closedAt < fiveMinutesAgo) {
      return "";
    }

    const isProfit = recentTrade.pnl > 0;
    const amount = Math.abs(recentTrade.pnl).toFixed(2);
    const phrases = isProfit ? PROFIT_PHRASES : LOSS_PHRASES;
    
    return getRandomPhrase(phrases, {
      coin: recentTrade.coin,
      amount: amount
    });
  };

  const getEntryPhrase = (coin: string, side: string): string => {
    return getRandomPhrase(ENTRY_PHRASES, {
      coin: coin,
      side: side.toLowerCase()
    });
  };

  return {
    currentPositions: positions,
    recentTrade,
    getPositionPhrase,
    getRecentTradePhrase,
    getEntryPhrase
  };
}
