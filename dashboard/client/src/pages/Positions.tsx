import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import PositionRow from "@/components/PositionRow";
import ExitPlanDialog from "@/components/ExitPlanDialog";

// Fallback mock data if API fails
const MOCK_POSITIONS = [
  {
    id: "1",
    side: "LONG" as const,
    coin: "XRP",
    leverage: "10X",
    notional: 9178,
    unrealizedPnL: 354.95,
  },
  {
    id: "2",
    side: "SHORT" as const,
    coin: "DOGE",
    leverage: "10X",
    notional: 18655,
    unrealizedPnL: -273.43,
  },
  {
    id: "3",
    side: "LONG" as const,
    coin: "BTC",
    leverage: "10X",
    notional: 13261,
    unrealizedPnL: 379.86,
  },
  {
    id: "4",
    side: "LONG" as const,
    coin: "ETH",
    leverage: "10X",
    notional: 17656,
    unrealizedPnL: 762.73,
  },
  {
    id: "5",
    side: "LONG" as const,
    coin: "SOL",
    leverage: "10X",
    notional: 17760,
    unrealizedPnL: 803.59,
  },
  {
    id: "6",
    side: "LONG" as const,
    coin: "BNB",
    leverage: "10X",
    notional: 14915,
    unrealizedPnL: -14.34,
  },
];

// TODO: remove mock data - replace with real chat messages from DeepSeek API
const MOCK_CHAT_MESSAGES = [
  {
    id: "1",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 16:27:24",
    message: "I'm currently holding all my open positions in ETH, SOL, XRP, BTC, DOGE, and BNB because none of their invalidation conditions have been met, even though DOGE is giving me a bit of a headache as a short position. My overall account is up over 51% and I'm managing my risks, looking to profit from these established trades.",
  },
  {
    id: "2",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 14:15:32",
    message: "Analyzing market conditions across all trading pairs. BTC showing strong support at $98,000 level with RSI indicating oversold conditions. ETH consolidating nicely above $3,400. Looking for entry opportunities on pullbacks.",
  },
  {
    id: "3",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 12:45:18",
    message: "Just closed my SOL long position at $142.89 for a +5.67% gain. The momentum was excellent and hit my take-profit target. Now monitoring for re-entry on any dips below $140.",
  },
  {
    id: "4",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 06:15:03",
    message: "BNB breaking above resistance at $610. Volume confirmation looking good. Scaling into long position with entry at $612.34. Target set at $635 with stop loss at $598.",
  },
  {
    id: "5",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 04:08:29",
    message: "Noticed XRP showing weakness despite positive crypto market sentiment. Considering short position if it breaks below $0.52 support level. Waiting for confirmation with increased volume.",
  },
  {
    id: "6",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 02:01:47",
    message: "DOGE short position update: Price action testing my patience but invalidation level still not reached. Maintaining position with trailing stop at $0.0850. Current unrealized P&L at -2.3%.",
  },
  {
    id: "7",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/30 23:45:33",
    message: "ETH showing strong momentum on the 1H timeframe. RSI climbing but not yet overbought. Holding my long position from $3,398.50. Price target remains at $3,500 for partial take-profit.",
  },
];

// TODO: remove mock data
const MOCK_BOT_NAME = "DEEPSEEK CHAT V3.1";
const MOCK_AVAILABLE_CASH = 4291.75;

export default function Positions() {
  const [selectedPosition, setSelectedPosition] = useState<{
    coin: string;
    side: "LONG" | "SHORT";
    entryPrice?: number;
    markPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
  } | null>(null);
  
  const [positions, setPositions] = useState(MOCK_POSITIONS);
  const [availableCash, setAvailableCash] = useState(MOCK_AVAILABLE_CASH);
  
  // Fetch real positions from API
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/positions');
        if (response.ok) {
          const data = await response.json();
          setPositions(data);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };

    const fetchAccount = async () => {
      try {
        const response = await fetch('/api/account');
        if (response.ok) {
          const data = await response.json();
          setAvailableCash(data.availableCash || 0);
        }
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    };

    fetchPositions();
    fetchAccount();

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      fetchPositions();
      fetchAccount();
    }, 15000);

    return () => clearInterval(interval);
  }, []);
  
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const isProfit = totalUnrealizedPnL >= 0;
  const pnlColor = isProfit ? "text-profit" : "text-loss";
  const pnlBg = isProfit ? "bg-profit/10" : "bg-loss/10";

  const handleViewExitPlan = (coin: string, side: "LONG" | "SHORT") => {
    // Find the position data to get SL/TP and current price
    const position = positions.find(p => p.coin === coin);
    setSelectedPosition({ 
      coin, 
      side,
      entryPrice: position?.entryPrice,
      markPrice: position?.markPrice,
      stopLoss: position?.stopLoss,
      takeProfit: position?.takeProfit,
    });
  };

  const getRelatedMessages = (coin: string) => {
    return MOCK_CHAT_MESSAGES.filter(msg => 
      msg.message.toUpperCase().includes(coin.toUpperCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-positions-title">
            Open Positions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {positions.length} active positions • Managed by {MOCK_BOT_NAME}
          </p>
        </div>
      </div>

      <Card className={`p-6 ${pnlBg} border-2 ${isProfit ? 'border-profit/20' : 'border-loss/20'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {MOCK_BOT_NAME}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total Unrealized P&L
            </p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${pnlColor} tabular-nums`} data-testid="text-total-unrealized-pnl">
              {isProfit ? '+' : ''}{totalUnrealizedPnL >= 0 ? '$' : '-$'}{Math.abs(totalUnrealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Side
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Leverage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Notional
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Exit Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Unreal P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <PositionRow
                  key={position.id}
                  side={position.side}
                  coin={position.coin}
                  leverage={position.leverage}
                  notional={position.notional}
                  unrealizedPnL={position.unrealizedPnL}
                  onViewExitPlan={() => handleViewExitPlan(position.coin, position.side)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Available Cash
          </p>
          <p className="text-2xl font-bold text-foreground tabular-nums" data-testid="text-available-cash">
            ${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </Card>

      {selectedPosition && (
        <ExitPlanDialog
          open={!!selectedPosition}
          onOpenChange={(open) => !open && setSelectedPosition(null)}
          coin={selectedPosition.coin}
          side={selectedPosition.side}
          entryPrice={selectedPosition.entryPrice}
          markPrice={selectedPosition.markPrice}
          stopLoss={selectedPosition.stopLoss}
          takeProfit={selectedPosition.takeProfit}
          relatedMessages={getRelatedMessages(selectedPosition.coin)}
        />
      )}
    </div>
  );
}
