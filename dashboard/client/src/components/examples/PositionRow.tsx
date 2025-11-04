import PositionRow from '../PositionRow'

export default function PositionRowExample() {
  return (
    <div className="p-6">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Side</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Coin</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Leverage</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Notional</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Exit Plan</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Unreal P&L</th>
          </tr>
        </thead>
        <tbody>
          <PositionRow
            side="LONG"
            coin="XRP"
            leverage="10X"
            notional={9178}
            unrealizedPnL={354.95}
            onViewExitPlan={() => console.log('View XRP exit plan')}
          />
          <PositionRow
            side="SHORT"
            coin="DOGE"
            leverage="10X"
            notional={18655}
            unrealizedPnL={-273.43}
            onViewExitPlan={() => console.log('View DOGE exit plan')}
          />
        </tbody>
      </table>
    </div>
  )
}
