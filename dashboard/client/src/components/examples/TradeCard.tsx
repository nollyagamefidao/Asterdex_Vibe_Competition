import TradeCard from '../TradeCard'

export default function TradeCardExample() {
  return (
    <div className="p-6 space-y-4">
      <TradeCard
        botName="DeepSeek Chat V3.1"
        tradeType="LONG"
        token="DOGE"
        date="10/31, 1:03 AM"
        entryPrice={0.1784}
        exitPrice={0.18261}
        quantity={49103.00}
        entryNotional={8760}
        exitNotional={8967}
        holdingTime="4H 53M"
        netPnL={200.02}
      />
      <TradeCard
        botName="DeepSeek Chat V3.1"
        tradeType="SHORT"
        token="BTC"
        date="10/30, 8:15 PM"
        entryPrice={98500.00}
        exitPrice={97800.00}
        quantity={0.05}
        entryNotional={4925}
        exitNotional={4890}
        holdingTime="2H 15M"
        netPnL={-35.00}
      />
    </div>
  )
}
