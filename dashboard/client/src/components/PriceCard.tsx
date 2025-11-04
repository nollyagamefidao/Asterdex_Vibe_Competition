import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isUpdating?: boolean;
}

export default function PriceCard({ symbol, name, price, change24h, isUpdating }: PriceCardProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isUpdating, price]);

  const isPositive = change24h > 0;
  const isNegative = change24h < 0;
  const isNeutral = change24h === 0;

  const changeColor = isPositive ? "text-profit" : isNegative ? "text-loss" : "text-neutral";
  const changeBg = isPositive ? "bg-profit/10" : isNegative ? "bg-loss/10" : "bg-neutral/10";

  const ArrowIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  const formatPrice = (value: number) => {
    if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (value >= 1) return `$${value.toFixed(4)}`;
    if (value >= 0.01) return `$${value.toFixed(6)}`;
    return `$${value.toFixed(8)}`;
  };

  return (
    <Card
      className={`p-6 transition-all duration-300 hover-elevate ${pulse ? 'scale-[1.02]' : ''}`}
      data-testid={`price-card-${symbol.toLowerCase()}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground" data-testid={`text-symbol-${symbol.toLowerCase()}`}>
              {symbol}
            </h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className={`text-4xl font-bold text-foreground tabular-nums transition-all ${pulse ? 'text-primary' : ''}`} data-testid={`text-price-${symbol.toLowerCase()}`}>
            {formatPrice(price)}
          </div>

          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${changeBg}`}>
            <ArrowIcon className={`w-4 h-4 ${changeColor}`} data-testid={`icon-direction-${symbol.toLowerCase()}`} />
            <span className={`text-sm font-medium ${changeColor} tabular-nums`} data-testid={`text-change-${symbol.toLowerCase()}`}>
              {isNeutral ? '0.00' : Math.abs(change24h).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
