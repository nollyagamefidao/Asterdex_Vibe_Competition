import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface ChatMessageProps {
  botName: string;
  timestamp: string;
  message: string;
}

export default function ChatMessage({ botName, timestamp, message }: ChatMessageProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid="chat-message">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-foreground" data-testid="text-bot-name">
                {botName}
              </h3>
              <span className="text-sm text-muted-foreground" data-testid="text-timestamp">
                {timestamp}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pl-14">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap" data-testid="text-message">
            {message}
          </p>
        </div>
      </div>
    </Card>
  );
}
