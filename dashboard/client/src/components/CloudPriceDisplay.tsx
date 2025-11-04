import React from 'react';
import { Price } from '../hooks/useTradingData';

interface CloudPriceDisplayProps {
  prices: Price[];
}

export const CloudPriceDisplay: React.FC<CloudPriceDisplayProps> = ({ prices }) => {
  // Demoscene-style glowing colors based on price change
  const getLanternColor = (change: number) => {
    if (change > 5) return { bg: '#00ff41', glow: 'rgba(0, 255, 65, 0.8)', border: '#00cc33' }; // Matrix green
    if (change > 0) return { bg: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)', border: '#ffaa00' }; // Gold
    if (change > -5) return { bg: '#ff6b35', glow: 'rgba(255, 107, 53, 0.8)', border: '#ff4500' }; // Orange
    return { bg: '#ff006e', glow: 'rgba(255, 0, 110, 0.8)', border: '#cc0055' }; // Hot pink
  };

  const getChineseSymbol = (symbol: string) => {
    const chineseMap: Record<string, string> = {
      'BTC': '币',
      'ETH': '坊',
      'SOL': '索',
      'BNB': '幣',
      'DOGE': '狗',
      'XRP': '瑞',
      'WLD': '界',
      'ASTER': '星',
    };
    return chineseMap[symbol] || '币';
  };

  const getCryptoLogoUrl = (symbol: string) => {
    // High-quality logos with transparent backgrounds
    const logoUrls: Record<string, string> = {
      'BTC': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
      'ETH': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
      'SOL': 'https://cryptologos.cc/logos/solana-sol-logo.svg',
      'BNB': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
      'DOGE': 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg',
      'XRP': 'https://cryptologos.cc/logos/xrp-xrp-logo.svg',
      'WLD': 'https://assets.coingecko.com/coins/images/31069/standard/worldcoin.jpeg',
      'ASTER': 'https://static.asterdex.com/assets/icon_ASTER.png',
    };
    
    return logoUrls[symbol] || `https://cryptologos.cc/logos/${symbol.toLowerCase()}-logo.svg`;
  };

  return (
    <div className="w-full py-12 overflow-hidden relative">
      {/* Demoscene-style title with scanlines */}
      <div className="relative mb-12">
        <h2 className="text-4xl font-bold text-center mb-2 relative z-10" 
            style={{ 
              fontFamily: 'monospace',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.3)',
              color: '#ffd700',
              letterSpacing: '0.1em'
            }}>
          🏮 天灯加密货币 🏮
        </h2>
        <p className="text-center text-yellow-200 text-sm" style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}>
          SKY LANTERN CRYPTO PRICES
        </p>
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none" 
             style={{
               background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)'
             }} />
      </div>
      
      {/* Simplified Chinese lanterns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
        {prices.map((price, index) => {
          const colors = getLanternColor(price.change24h);
          return (
            <div
              key={price.symbol}
              className="relative"
              style={{ 
                animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
                animationDelay: `${index * 0.3}s`
              }}
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-2xl opacity-50"
                style={{ 
                  background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
              
              {/* Lantern body - rounded balloon style */}
              <div 
                className="relative rounded-full aspect-square p-6 backdrop-blur-sm transform hover:scale-105 transition-all"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${colors.bg}30, ${colors.bg}15)`,
                  border: `3px solid ${colors.border}`,
                  boxShadow: `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}`
                }}
              >
                {/* Chinese character watermark */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl"
                  style={{ 
                    color: colors.bg,
                    filter: 'blur(2px)',
                    fontFamily: 'serif',
                    fontWeight: 'bold'
                  }}
                >
                  {getChineseSymbol(price.symbol)}
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center">
                  {/* Crypto logo */}
                  <img
                    src={getCryptoLogoUrl(price.symbol)}
                    alt={price.symbol}
                    className="w-20 h-20 mb-3 object-contain"
                    style={{
                      filter: `drop-shadow(0 0 15px ${colors.glow}) drop-shadow(0 0 30px ${colors.glow})`
                    }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  {/* Fallback text if image fails */}
                  <div 
                    className="text-6xl font-bold mb-3"
                    style={{ 
                      display: 'none',
                      color: colors.bg,
                      textShadow: `0 0 15px ${colors.glow}, 0 0 30px ${colors.glow}`,
                      fontFamily: 'serif'
                    }}
                  >
                    {getChineseSymbol(price.symbol)}
                  </div>
                  
                  {/* Symbol */}
                  <div 
                    className="text-xs font-bold mb-3"
                    style={{ 
                      fontFamily: 'monospace',
                      color: colors.bg,
                      textShadow: `0 0 5px ${colors.glow}`,
                      letterSpacing: '0.15em'
                    }}
                  >
                    {price.symbol}
                  </div>
                  
                  {/* Price - High contrast neon style */}
                  <div 
                    className="text-2xl font-black mb-2"
                    style={{ 
                      fontFamily: 'monospace',
                      color: '#FFFFFF',
                      textShadow: `
                        -2px -2px 0 #000,
                        2px -2px 0 #000,
                        -2px 2px 0 #000,
                        2px 2px 0 #000,
                        0 0 10px ${colors.glow},
                        0 0 20px ${colors.glow},
                        0 0 30px ${colors.glow},
                        0 0 40px ${colors.glow}
                      `,
                      letterSpacing: '0.05em',
                      filter: 'brightness(1.2)'
                    }}
                  >
                    ${price.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: price.price < 1 ? 4 : 2,
                    })}
                  </div>
                  
                  {/* Daily trend - High contrast */}
                  <div 
                    className="text-lg font-black"
                    style={{ 
                      fontFamily: 'monospace',
                      color: price.change24h >= 0 ? '#00ff41' : '#ff006e',
                      textShadow: `
                        -1px -1px 0 #000,
                        1px -1px 0 #000,
                        -1px 1px 0 #000,
                        1px 1px 0 #000,
                        0 0 10px ${price.change24h >= 0 ? 'rgba(0, 255, 65, 1)' : 'rgba(255, 0, 110, 1)'},
                        0 0 20px ${price.change24h >= 0 ? 'rgba(0, 255, 65, 1)' : 'rgba(255, 0, 110, 1)'},
                        0 0 30px ${price.change24h >= 0 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}
                      `,
                      animation: 'blink 1.5s ease-in-out infinite',
                      filter: 'brightness(1.3)'
                    }}
                  >
                    {price.change24h >= 0 ? '▲' : '▼'} {Math.abs(price.change24h).toFixed(2)}%
                  </div>
                </div>
              </div>
              
              {/* Hanging string */}
              <div 
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0.5 h-6"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${colors.bg})`,
                  boxShadow: `0 0 5px ${colors.glow}`
                }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
