import { useState, useEffect } from "react";
import LiveIndicator from "@/components/LiveIndicator";
import PNLPanel from "@/components/PNLPanel";
import PriceCard from "@/components/PriceCard";
import CompletedTrades from "./CompletedTrades";
import ModelChat from "./ModelChat";
import Positions from "./Positions";

// TODO: remove mock data - replace with real API calls to Asterdex
const MOCK_CRYPTO_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 98234.56, change24h: 2.45 },
  { symbol: "ETH", name: "Ethereum", price: 3456.78, change24h: -1.23 },
  { symbol: "SOL", name: "Solana", price: 142.89, change24h: 5.67 },
  { symbol: "BNB", name: "BNB", price: 612.34, change24h: 1.89 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.08234, change24h: -3.45 },
  { symbol: "XRP", name: "Ripple", price: 0.5234, change24h: 0.89 },
  { symbol: "WLD", name: "Worldcoin", price: 2.345, change24h: 4.12 },
  { symbol: "ASTER", name: "Asterdex", price: 0.1234, change24h: 2.78 },
];

// TODO: remove mock PNL data - replace with real trading data
const MOCK_PNL_DATA = {
  totalPnL: 4523.67,
  totalTrades: 156,
  winRate: 68.5,
  avgProfit: 2.34,
};

type Tab = "dashboard" | "positions" | "trades" | "chat";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [cryptoData, setCryptoData] = useState(MOCK_CRYPTO_DATA);
  const [pnlData, setPnlData] = useState(MOCK_PNL_DATA);
  const [availableCash, setAvailableCash] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [positionsCount, setPositionsCount] = useState(0);
  const [updatingSymbols, setUpdatingSymbols] = useState<Set<string>>(new Set());

  // Fetch real prices from API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/prices');
        if (response.ok) {
          const prices = await response.json();
          setCryptoData(prices);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    // Fetch real account data, trades, and positions for calculations
    const fetchAccount = async () => {
      try {
        // Fetch account data
        const [accountRes, tradesRes, positionsRes] = await Promise.all([
          fetch('/api/account'),
          fetch('/api/trades'),
          fetch('/api/positions')
        ]);

        let totalPnL = 0;
        let totalTrades = 0;
        let wins = 0;
        let avgProfit = 0;
        let balance = 0;
        let availBalance = 0;
        let positions = 0;

        // Process account data
        if (accountRes.ok) {
          const account = await accountRes.json();
          balance = account.totalWalletBalance || account.totalMarginBalance || 0;
          availBalance = account.availableCash || 0;
          
          // ✅ Use bot-calculated trade stats if available (more accurate)
          if (account.totalTrades !== undefined) {
            totalPnL = account.totalRealizedPnL || account.netPnL || 0;
            totalTrades = account.totalTrades || 0;
            wins = account.winningTrades || 0;
            const winRate = account.winRate || 0;
            
            // Calculate average profit from trades
            if (totalTrades > 0 && tradesRes.ok) {
              const trades = await tradesRes.json();
              if (Array.isArray(trades) && trades.length > 0) {
                const totalProfitPercent = trades.reduce((sum: number, trade: any) => {
                  return sum + (trade.pnlPercent || 0);
                }, 0);
                avgProfit = totalProfitPercent / trades.length;
              }
            }
            
            setPnlData({
              totalPnL,
              totalTrades,
              winRate,
              avgProfit,
            });
            
            // Skip redundant trades processing since we have stats from bot
            return;
          }
        }

        // Fallback: Process trades data to calculate statistics (if bot stats unavailable)
        if (tradesRes.ok) {
          const trades = await tradesRes.json();
          if (Array.isArray(trades) && trades.length > 0) {
            totalTrades = trades.length;
            
            // Calculate total PnL from closed trades
            totalPnL = trades.reduce((sum: number, trade: any) => {
              return sum + (trade.pnl || 0);
            }, 0);

            // Calculate win rate
            wins = trades.filter((trade: any) => (trade.pnl || 0) > 0).length;
            const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

            // Calculate average profit percentage
            const totalProfitPercent = trades.reduce((sum: number, trade: any) => {
              return sum + (trade.pnlPercent || 0);
            }, 0);
            avgProfit = totalTrades > 0 ? totalProfitPercent / totalTrades : 0;

            setPnlData({
              totalPnL,
              totalTrades,
              winRate,
              avgProfit,
            });
          } else {
            // No trades yet
            setPnlData({
              totalPnL: 0,
              totalTrades: 0,
              winRate: 0,
              avgProfit: 0,
            });
          }
        }

        // Process positions count
        if (positionsRes.ok) {
          const positions = await positionsRes.json();
          if (Array.isArray(positions)) {
            setPositionsCount(positions.length);
          }
        }

        setTotalBalance(balance);
        setAvailableCash(availBalance);
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    };

    // Fetch initially
    fetchPrices();
    fetchAccount();

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      fetchPrices();
      fetchAccount();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Asterdex Trading Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time cryptocurrency prices and trading performance
              </p>
            </div>
            <LiveIndicator />
          </div>
          
          <nav className="mt-6 flex gap-1 border-b">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 text-sm font-medium transition-colors hover-elevate relative ${
                activeTab === "dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="tab-dashboard"
            >
              Dashboard
              {activeTab === "dashboard" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("positions")}
              className={`px-4 py-2 text-sm font-medium transition-colors hover-elevate relative ${
                activeTab === "positions"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="tab-positions"
            >
              Positions
              {activeTab === "positions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("trades")}
              className={`px-4 py-2 text-sm font-medium transition-colors hover-elevate relative ${
                activeTab === "trades"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="tab-completed-trades"
            >
              Completed Trades
              {activeTab === "trades" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 text-sm font-medium transition-colors hover-elevate relative ${
                activeTab === "chat"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              data-testid="tab-model-chat"
            >
              Model Chat
              {activeTab === "chat" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6">Trading Performance</h2>
              <PNLPanel
                totalPnL={pnlData.totalPnL}
                totalTrades={pnlData.totalTrades}
                winRate={pnlData.winRate}
                avgProfit={pnlData.avgProfit}
                availableCash={availableCash}
                totalBalance={totalBalance}
                positionsCount={positionsCount}
              />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-6">Market Prices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cryptoData.map((crypto) => (
                  <PriceCard
                    key={crypto.symbol}
                    symbol={crypto.symbol}
                    name={crypto.name}
                    price={crypto.price}
                    change24h={crypto.change24h}
                    isUpdating={updatingSymbols.has(crypto.symbol)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
        
        {activeTab === "positions" && <Positions />}
        
        {activeTab === "trades" && <CompletedTrades />}
        
        {activeTab === "chat" && <ModelChat />}
      </main>
    </div>
  );
}
