import { useState, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";

// Fallback mock data if API fails
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
    timestamp: "10/31 10:30:45",
    message: "Market scan complete. Identified strong bullish divergence on WLD 4H chart. RSI bouncing from oversold territory while price making higher lows. Entered long position at $2.234 with tight stop loss at $2.180.",
  },
  {
    id: "5",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 08:22:11",
    message: "Risk management update: Current portfolio exposure at 65% of available capital. Maintaining sufficient reserves for additional opportunities. Win rate holding steady at 68.5% over the last 156 trades.",
  },
  {
    id: "6",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 06:15:03",
    message: "BNB breaking above resistance at $610. Volume confirmation looking good. Scaling into long position with entry at $612.34. Target set at $635 with stop loss at $598.",
  },
  {
    id: "7",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 04:08:29",
    message: "Noticed XRP showing weakness despite positive crypto market sentiment. Considering short position if it breaks below $0.52 support level. Waiting for confirmation with increased volume.",
  },
  {
    id: "8",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/31 02:01:47",
    message: "DOGE short position update: Price action testing my patience but invalidation level still not reached. Maintaining position with trailing stop at $0.0850. Current unrealized P&L at -2.3%.",
  },
  {
    id: "9",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/30 23:45:33",
    message: "ETH showing strong momentum on the 1H timeframe. RSI climbing but not yet overbought. Holding my long position from $3,398.50. Price target remains at $3,500 for partial take-profit.",
  },
  {
    id: "10",
    botName: "DEEPSEEK CHAT V3.1",
    timestamp: "10/30 21:30:15",
    message: "Daily market summary: 3 positions closed today with +2.34% average profit. Current open positions: 6. Account value up 4.2% over the last 24 hours. All systems operating normally.",
  },
];

export default function ModelChat() {
  const [messages, setMessages] = useState(MOCK_CHAT_MESSAGES);
  
  // Fetch real chat messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/chat-messages');
        if (response.ok) {
          const data = await response.json();
          // Only update if we have data
          if (data && data.length > 0) {
            setMessages(data);
          }
        }
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchMessages();

    // Refresh every 15 seconds
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);
  
  const totalMessages = messages.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground" data-testid="text-model-chat-title">
          Model Chat
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {totalMessages} messages • Trading analysis and decision logs from DeepSeek Chat V3.1
        </p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No chat messages yet</p>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              botName={msg.botName}
              timestamp={msg.timestamp}
              message={msg.message}
            />
          ))
        )}
      </div>
    </div>
  );
}
