import PriceCard from '../PriceCard'

export default function PriceCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <PriceCard symbol="BTC" name="Bitcoin" price={98234.56} change24h={2.45} />
      <PriceCard symbol="ETH" name="Ethereum" price={3456.78} change24h={-1.23} />
      <PriceCard symbol="SOL" name="Solana" price={142.89} change24h={5.67} />
      <PriceCard symbol="DOGE" name="Dogecoin" price={0.08234} change24h={0} />
    </div>
  )
}
