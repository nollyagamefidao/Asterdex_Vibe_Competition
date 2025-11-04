import StatCard from '../StatCard'
import { TrendingUp, Target, Percent } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <StatCard label="Total Trades" value="156" icon={TrendingUp} testId="stat-trades" />
      <StatCard label="Win Rate" value="68.5%" icon={Target} valueColor="text-profit" testId="stat-winrate" />
      <StatCard label="Avg Profit" value="+2.34%" icon={Percent} valueColor="text-profit" testId="stat-avgprofit" />
    </div>
  )
}
