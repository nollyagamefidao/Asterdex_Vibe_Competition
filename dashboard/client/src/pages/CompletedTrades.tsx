import { useState, useEffect } from "react";
import TradeCard from "@/components/TradeCard";

// Fallback mock data if API fails
const MOCK_TRADES = [
  {
    id: "1",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "DOGE",
    date: "10/31, 1:03 AM",
    entryPrice: 0.1784,
    exitPrice: 0.18261,
    quantity: 49103.00,
    entryNotional: 8760,
    exitNotional: 8967,
    holdingTime: "4H 53M",
    netPnL: 200.02,
    fee: 5.25,
  },
  {
    id: "2",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "SOL",
    date: "10/30, 11:45 PM",
    entryPrice: 138.45,
    exitPrice: 142.89,
    quantity: 125.50,
    entryNotional: 17376,
    exitNotional: 17933,
    holdingTime: "6H 22M",
    netPnL: 557.02,
  },
  {
    id: "3",
    botName: "DeepSeek Chat V3.1",
    tradeType: "SHORT" as const,
    token: "BTC",
    date: "10/30, 8:15 PM",
    entryPrice: 98500.00,
    exitPrice: 97800.00,
    quantity: 0.05,
    entryNotional: 4925,
    exitNotional: 4890,
    holdingTime: "2H 15M",
    netPnL: -35.00,
  },
  {
    id: "4",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "ETH",
    date: "10/30, 5:30 PM",
    entryPrice: 3398.50,
    exitPrice: 3456.78,
    quantity: 4.25,
    entryNotional: 14444,
    exitNotional: 14691,
    holdingTime: "3H 48M",
    netPnL: 247.69,
  },
  {
    id: "5",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "WLD",
    date: "10/30, 2:10 PM",
    entryPrice: 2.234,
    exitPrice: 2.345,
    quantity: 5800.00,
    entryNotional: 12957,
    exitNotional: 13601,
    holdingTime: "5H 12M",
    netPnL: 644.00,
  },
  {
    id: "6",
    botName: "DeepSeek Chat V3.1",
    tradeType: "SHORT" as const,
    token: "XRP",
    date: "10/30, 10:25 AM",
    entryPrice: 0.5312,
    exitPrice: 0.5189,
    quantity: 15200.00,
    entryNotional: 8074,
    exitNotional: 7887,
    holdingTime: "1H 35M",
    netPnL: -187.00,
  },
  {
    id: "7",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "BNB",
    date: "10/30, 7:50 AM",
    entryPrice: 598.20,
    exitPrice: 612.34,
    quantity: 22.00,
    entryNotional: 13160,
    exitNotional: 13471,
    holdingTime: "4H 05M",
    netPnL: 311.08,
  },
  {
    id: "8",
    botName: "DeepSeek Chat V3.1",
    tradeType: "LONG" as const,
    token: "ASTER",
    date: "10/30, 3:15 AM",
    entryPrice: 0.1189,
    exitPrice: 0.1234,
    quantity: 95000.00,
    entryNotional: 11296,
    exitNotional: 11723,
    holdingTime: "7H 30M",
    netPnL: 427.50,
  },
];

export default function CompletedTrades() {
  const [trades, setTrades] = useState(MOCK_TRADES);
  
  // Fetch real trades from API
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch('/api/trades');
        if (response.ok) {
          const data = await response.json();
          // Only update if we have data
          if (data && data.length > 0) {
            setTrades(data);
          }
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();

    // Refresh every 15 seconds
    const interval = setInterval(fetchTrades, 15000);
    return () => clearInterval(interval);
  }, []);
  
  const totalTrades = trades.length;
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.netPnL > 0 ? trade.netPnL : 0), 0);
  const totalLoss = trades.reduce((sum, trade) => sum + (trade.netPnL < 0 ? trade.netPnL : 0), 0);
  const netPnL = totalProfit + totalLoss;
  const winningTrades = trades.filter(t => t.netPnL > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalFees = trades.reduce((sum, trade) => sum + (trade.fee || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-completed-trades-title">
            Completed Trades
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalTrades} trades • {winningTrades} wins • {(totalTrades - winningTrades)} losses • {winRate.toFixed(1)}% win rate • ${totalFees.toFixed(2)} total fees
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Net from shown trades</p>
          <p className={`text-2xl font-bold ${netPnL >= 0 ? 'text-profit' : 'text-loss'} tabular-nums`}>
            {netPnL >= 0 ? '+' : ''}${netPnL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {trades.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No completed trades yet</p>
        ) : (
          trades.map((trade) => (
            <TradeCard key={trade.id} {...trade} />
          ))
        )}
      </div>
    </div>
  );
}
