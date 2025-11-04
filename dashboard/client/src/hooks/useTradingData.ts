import { useState, useEffect } from 'react';

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  liquidationPrice: number;
  stopLoss: number;
  takeProfit: number;
}

export interface Trade {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  fee?: number;
  closedAt: number;
  holdTimeSeconds: number;
}

export interface Account {
  totalUnrealizedPnL: number;
  availableCash: number;
  totalWalletBalance: number;
  totalMarginBalance: number;
}

export interface Price {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export function useTradingData() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [account, setAccount] = useState<Account>({
    totalUnrealizedPnL: 0,
    availableCash: 0,
    totalWalletBalance: 0,
    totalMarginBalance: 0,
  });
  const [prices, setPrices] = useState<Price[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Get API URL from environment (for Vercel deployment) or use local API
      const API_URL = import.meta.env.VITE_BOT_API_URL || '';
      
      const [positionsRes, tradesRes, accountRes, pricesRes] = await Promise.all([
        fetch(`${API_URL}/api/positions`),
        fetch(`${API_URL}/api/trades`),
        fetch(`${API_URL}/api/account`),
        fetch(`${API_URL}/api/prices`),
      ]);

      if (!positionsRes.ok || !tradesRes.ok || !accountRes.ok || !pricesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [positionsData, tradesData, accountData, pricesData] = await Promise.all([
        positionsRes.json(),
        tradesRes.json(),
        accountRes.json(),
        pricesRes.json(),
      ]);

      setPositions(positionsData);
      setTrades(tradesData);
      setAccount(accountData);
      setPrices(pricesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching trading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    positions,
    trades,
    account,
    prices,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Calculate total profit from completed trades (after fees)
export function useTotalProfit(trades: Trade[]) {
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [winningTrades, setWinningTrades] = useState(0);
  const [losingTrades, setLosingTrades] = useState(0);

  useEffect(() => {
    const profit = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const fees = trades.reduce((sum, trade) => sum + (trade.fee || 0), 0);
    const net = profit - fees;
    const wins = trades.filter(t => (t.pnl || 0) > 0).length;
    const losses = trades.filter(t => (t.pnl || 0) < 0).length;

    setTotalProfit(profit);
    setTotalFees(fees);
    setNetProfit(net);
    setWinningTrades(wins);
    setLosingTrades(losses);
  }, [trades]);

  return {
    totalProfit, // Gross profit (before fees)
    totalFees, // Total fees paid
    netProfit, // Net profit (after fees)
    winningTrades,
    losingTrades,
    totalTrades: trades.length,
    winRate: trades.length > 0 ? (winningTrades / trades.length) * 100 : 0,
  };
}
