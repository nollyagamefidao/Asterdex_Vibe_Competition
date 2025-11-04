import PNLPanel from '../PNLPanel'

export default function PNLPanelExample() {
  return (
    <div className="p-6">
      <PNLPanel
        totalPnL={4523.67}
        totalTrades={156}
        winRate={68.5}
        avgProfit={2.34}
      />
    </div>
  )
}
