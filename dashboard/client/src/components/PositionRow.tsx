import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PositionRowProps {
  side: "LONG" | "SHORT";
  coin: string;
  leverage: string;
  notional: number | null;
  unrealizedPnL: number;
  onViewExitPlan: () => void;
}

export default function PositionRow({
  side,
  coin,
  leverage,
  notional,
  unrealizedPnL,
  onViewExitPlan,
}: PositionRowProps) {
  const isLong = side === "LONG";
  const isProfit = unrealizedPnL >= 0;
  
  const sideColor = isLong ? "text-profit" : "text-loss";
  const sideBg = isLong ? "bg-profit/10" : "bg-loss/10";
  const pnlColor = isProfit ? "text-profit" : "text-loss";
  
  const SideIcon = isLong ? TrendingUp : TrendingDown;

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors" data-testid={`position-row-${coin.toLowerCase()}`}>
      <td className="px-4 py-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${sideBg}`}>
          <SideIcon className={`w-3.5 h-3.5 ${sideColor}`} />
          <span className={`text-sm font-semibold ${sideColor}`} data-testid={`text-side-${coin.toLowerCase()}`}>
            {side}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground" data-testid={`text-coin-${coin.toLowerCase()}`}>
            {coin}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-foreground tabular-nums" data-testid={`text-leverage-${coin.toLowerCase()}`}>
          {leverage}
        </span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-foreground tabular-nums" data-testid={`text-notional-${coin.toLowerCase()}`}>
          {notional !== null ? `$${notional.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
        </span>
      </td>
      <td className="px-4 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onViewExitPlan}
          className="gap-1.5"
          data-testid={`button-view-exit-${coin.toLowerCase()}`}
        >
          <Eye className="w-3.5 h-3.5" />
          VIEW
        </Button>
      </td>
      <td className="px-4 py-4">
        <span className={`text-sm font-semibold ${pnlColor} tabular-nums`} data-testid={`text-pnl-${coin.toLowerCase()}`}>
          {isProfit ? '+' : ''}{unrealizedPnL >= 0 ? '$' : '-$'}{Math.abs(unrealizedPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </td>
    </tr>
  );
}
