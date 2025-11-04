import { Card } from "@/components/ui/card";
import StatCard from "./StatCard";
import { TrendingUp, Target, Percent, DollarSign, Wallet, Briefcase } from "lucide-react";

interface PNLPanelProps {
  totalPnL: number;
  totalTrades: number;
  winRate: number;
  avgProfit: number;
  availableCash?: number;
  totalBalance?: number;
  positionsCount?: number;
}

export default function PNLPanel({ 
  totalPnL, 
  totalTrades, 
  winRate, 
  avgProfit, 
  availableCash = 0,
  totalBalance = 0,
  positionsCount = 0 
}: PNLPanelProps) {
  const isProfit = totalPnL >= 0;
  const pnlColor = isProfit ? "text-profit" : "text-loss";
  const pnlBg = isProfit ? "bg-profit/10" : "bg-loss/10";
  
  // Calculate return percentage based on initial balance (if available)
  const returnPercentage = totalBalance > 0 
    ? ((totalPnL / totalBalance) * 100).toFixed(2)
    : totalPnL.toFixed(2);

  // Calculate wins and losses
  const wins = Math.round((winRate / 100) * totalTrades);
  const losses = totalTrades - wins;

  return (
    <div className="space-y-6">
      <Card className={`p-8 ${pnlBg} border-2 ${isProfit ? 'border-profit/20' : 'border-loss/20'}`} data-testid="pnl-panel">
        <div className="text-center space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">📊 Account</p>
            <div className="mt-2 space-y-1">
              <h1 className={`text-5xl font-bold tabular-nums text-foreground`} data-testid="text-total-balance">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <p className="text-sm text-muted-foreground">
                Balance
              </p>
            </div>
          </div>
          <div className="pt-2">
            <p className={`text-3xl font-bold ${pnlColor} tabular-nums`} data-testid="text-total-pnl">
              {isProfit ? '+' : ''}{totalPnL >= 0 ? '$' : '-$'}{Math.abs(totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground">
              Total PnL {totalBalance > 0 ? `(${returnPercentage}%)` : ''}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          label="Positions"
          value={`${positionsCount}/10`}
          icon={Briefcase}
          testId="stat-positions-count"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={Target}
          valueColor={winRate >= 50 ? "text-profit" : "text-loss"}
          testId="stat-win-rate"
        />
        <StatCard
          label="Trades"
          value={totalTrades > 0 ? `${wins}W / ${losses}L` : "0W / 0L"}
          icon={DollarSign}
          testId="stat-total-trades"
        />
        <StatCard
          label="Average Profit"
          value={`${avgProfit >= 0 ? '+' : ''}${avgProfit.toFixed(2)}%`}
          icon={Percent}
          valueColor={avgProfit >= 0 ? "text-profit" : "text-loss"}
          testId="stat-avg-profit"
        />
        <StatCard
          label="Available Cash"
          value={`$${availableCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          testId="stat-available-cash"
        />
      </div>
    </div>
  );
}
