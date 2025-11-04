import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface TradeCardProps {
  botName: string;
  tradeType: "LONG" | "SHORT";
  token: string;
  date: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  entryNotional: number;
  exitNotional: number;
  holdingTime: string;
  netPnL: number;
  fee?: number;
}

export default function TradeCard({
  botName,
  tradeType,
  token,
  date,
  entryPrice,
  exitPrice,
  quantity,
  entryNotional,
  exitNotional,
  holdingTime,
  netPnL,
  fee,
}: TradeCardProps) {
  const isProfit = netPnL >= 0;
  const pnlColor = isProfit ? "text-profit" : "text-loss";
  const pnlBg = isProfit ? "bg-profit/10" : "bg-loss/10";
  
  // Safety check for tradeType
  const safeTradeType = tradeType || "LONG";
  const TradeIcon = safeTradeType === "LONG" ? TrendingUp : TrendingDown;
  const tradeColor = safeTradeType === "LONG" ? "text-profit" : "text-loss";

  const formatPrice = (value: number) => {
    if (value >= 1) return `$${value.toFixed(5)}`;
    return `$${value.toFixed(8)}`;
  };

  const formatNotional = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <Card className="p-6 hover-elevate" data-testid="trade-card">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground" data-testid="text-bot-name">
                {botName}
              </h3>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${pnlBg}`}>
                <TradeIcon className={`w-3.5 h-3.5 ${tradeColor}`} />
                <span className={`text-xs font-medium ${tradeColor}`}>{safeTradeType}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              completed a {safeTradeType.toLowerCase()} trade on <span className="font-semibold text-foreground">{token}</span>
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg ${pnlBg}`}>
            <p className={`text-xl font-bold ${pnlColor} tabular-nums`} data-testid="text-net-pnl">
              {isProfit ? '+' : ''}{formatNotional(netPnL)}
            </p>
            {fee !== undefined && fee > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Fee: ${fee.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground" data-testid="text-date">
          {date}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-sm font-medium text-foreground tabular-nums" data-testid="text-price-range">
                {formatPrice(entryPrice)} → {formatPrice(exitPrice)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Notional</p>
              <p className="text-sm font-medium text-foreground tabular-nums" data-testid="text-notional-range">
                {formatNotional(entryNotional)} → {formatNotional(exitNotional)}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="text-sm font-medium text-foreground tabular-nums" data-testid="text-quantity">
                {quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Holding Time</p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground" data-testid="text-holding-time">
                  {holdingTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
