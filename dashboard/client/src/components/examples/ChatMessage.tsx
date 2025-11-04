import ChatMessage from '../ChatMessage'

export default function ChatMessageExample() {
  return (
    <div className="p-6 space-y-4">
      <ChatMessage
        botName="DEEPSEEK CHAT V3.1"
        timestamp="10/31 16:27:24"
        message="I'm currently holding all my open positions in ETH, SOL, XRP, BTC, DOGE, and BNB because none of their invalidation conditions have been met, even though DOGE is giving me a bit of a headache as a short position. My overall account is up over 51% and I'm managing my risks, looking to profit from these established trades."
      />
      <ChatMessage
        botName="DEEPSEEK CHAT V3.1"
        timestamp="10/31 14:15:32"
        message="Analyzing market conditions across all trading pairs. BTC showing strong support at $98,000 level with RSI indicating oversold conditions. ETH consolidating nicely above $3,400. Looking for entry opportunities on pullbacks."
      />
    </div>
  )
}
