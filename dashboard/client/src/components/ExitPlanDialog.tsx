import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Bot, TrendingUp, TrendingDown } from "lucide-react";

interface ChatMessage {
  id: string;
  botName: string;
  timestamp: string;
  message: string;
}

interface ExitPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin: string;
  side: "LONG" | "SHORT";
  entryPrice?: number;
  markPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  relatedMessages: ChatMessage[];
}

export default function ExitPlanDialog({
  open,
  onOpenChange,
  coin,
  side,
  entryPrice,
  markPrice,
  stopLoss,
  takeProfit,
  relatedMessages,
}: ExitPlanDialogProps) {
  const isLong = side === "LONG";
  const sideColor = isLong ? "text-profit" : "text-loss";
  const sideBg = isLong ? "bg-profit/10" : "bg-loss/10";
  const SideIcon = isLong ? TrendingUp : TrendingDown;

  // Calculate percentage difference from current price
  const calculatePercentDiff = (targetPrice: number) => {
    if (!markPrice) return null;
    const diff = ((targetPrice - markPrice) / markPrice) * 100;
    return diff;
  };

  // Render price with percentage and arrow
  const renderPriceWithDiff = (price: number, label: string, colorClass: string) => {
    const percentDiff = calculatePercentDiff(price);
    const isAbove = percentDiff && percentDiff > 0;
    const Arrow = isAbove ? TrendingUp : TrendingDown;
    
    return (
      <div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-lg font-semibold ${colorClass} tabular-nums`}>${price}</p>
        {percentDiff !== null && (
          <div className="flex items-center gap-1 mt-1">
            <Arrow className={`w-3 h-3 ${isAbove ? 'text-profit' : 'text-loss'}`} />
            <span className={`text-xs ${isAbove ? 'text-profit' : 'text-loss'}`}>
              {Math.abs(percentDiff).toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid={`exit-plan-dialog-${coin.toLowerCase()}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${sideBg}`}>
              <SideIcon className={`w-4 h-4 ${sideColor}`} />
              <span className={`text-sm font-semibold ${sideColor}`}>{side}</span>
            </div>
            <span>{coin} Exit Plan & Analysis</span>
          </DialogTitle>
          <DialogDescription>
            DeepSeek's trading analysis and decision logs for {coin}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Exit Strategy */}
          {(entryPrice || stopLoss || takeProfit) && (
            <Card className="p-4 bg-muted/50">
              <h3 className="text-sm font-semibold text-foreground mb-3">Exit Strategy by DeepSeek</h3>
              <div className="grid grid-cols-3 gap-4">
                {entryPrice && renderPriceWithDiff(entryPrice, "Entry Price", "text-foreground")}
                {stopLoss && renderPriceWithDiff(stopLoss, "Stop Loss", "text-loss")}
                {takeProfit && renderPriceWithDiff(takeProfit, "Take Profit", "text-profit")}
              </div>
            </Card>
          )}

          {/* DeepSeek Messages */}
          {relatedMessages.length > 0 ? (
            relatedMessages.map((msg) => (
              <Card key={msg.id} className="p-4" data-testid={`chat-message-${msg.id}`}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h4 className="text-sm font-semibold text-foreground">
                          {msg.botName}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pl-11">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No analysis messages found for {coin}
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
