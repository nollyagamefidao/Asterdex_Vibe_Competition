import React, { useState, useEffect } from 'react';

interface Position {
  symbol: string;
  side: string;
  positionAmt: number; // Quantity
  entryPrice: number;
  markPrice: number;
  unrealizedPnL: number; // PnL
  leverage: string | number; // "10X" or 10
  stopLoss?: number;
  takeProfit?: number; // Called profitTarget in some places
  openedAt: number; // Timestamp when opened
}

interface OpenPositionsBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OpenPositionsBoard: React.FC<OpenPositionsBoardProps> = ({ open, onOpenChange }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // Fetch positions
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('/api/positions');
        if (response.ok) {
          const data = await response.json();
          setPositions(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch positions:', error);
        setIsLoading(false);
      }
    };

    if (open) {
      fetchPositions();
      const interval = setInterval(fetchPositions, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [open]);

  // Fetch live prices from Asterdex API for all open positions
  useEffect(() => {
    const fetchLivePrices = async () => {
      if (positions.length === 0) return;
      
      try {
        const symbols = positions.map(p => p.symbol).join(',');
        const response = await fetch(`/api/live-prices?symbols=${symbols}`);
        if (response.ok) {
          const pricesMap = await response.json();
          setLivePrices(pricesMap);
        }
      } catch (error) {
        console.error('Failed to fetch live prices:', error);
      }
    };

    if (open && positions.length > 0) {
      fetchLivePrices();
      const interval = setInterval(fetchLivePrices, 2000); // Update every 2 seconds
      return () => clearInterval(interval);
    }
  }, [open, positions]);

  const getTimeIcon = (openedAt: number) => {
    const minutes = Math.floor((Date.now() - openedAt) / 60000);
    
    // Return ancient Chinese timekeeping icon based on duration
    if (minutes < 1) {
      return '⏳'; // Moment
    } else if (minutes < 5) {
      return '🔥'; // Incense
    } else if (minutes < 15) {
      return '💧'; // Water Drops
    } else if (minutes < 30) {
      return '🏺'; // Quarter Bowl
    } else if (minutes < 60) {
      return '⛲'; // Clepsydra (Water Clock)
    } else if (minutes < 120) {
      return '☀️'; // Sun Position (Sundial)
    } else if (minutes < 360) {
      return '⚙️'; // Wheel Turns (Mechanical)
    } else {
      return '🌙'; // Celestial Hours (Astronomical)
    }
  };

  const calculateHoldTime = (openedAt: number) => {
    const minutes = Math.floor((Date.now() - openedAt) / 60000);
    if (minutes < 60) {
      return `${minutes.toFixed(1)} mins`;
    }
    const hours = (minutes / 60).toFixed(1);
    return `${hours} hrs`;
  };

  const calculatePnlPercent = (pos: Position) => {
    const currentPrice = livePrices[pos.symbol] || pos.markPrice;
    const priceDiff = pos.side === 'LONG' 
      ? currentPrice - pos.entryPrice 
      : pos.entryPrice - currentPrice;
    const percentChange = (priceDiff / pos.entryPrice) * 100;
    // Parse leverage - could be "10X" or 10
    const leverageNum = typeof pos.leverage === 'string' 
      ? parseFloat(pos.leverage.replace('X', '')) 
      : pos.leverage;
    return percentChange * leverageNum;
  };

  const calculateRealPnL = (pos: Position) => {
    const currentPrice = livePrices[pos.symbol] || pos.markPrice;
    const priceDiff = pos.side === 'LONG' 
      ? currentPrice - pos.entryPrice 
      : pos.entryPrice - currentPrice;
    
    // If positionAmt is available, use it
    if (pos.positionAmt && pos.positionAmt !== null) {
      return priceDiff * Math.abs(pos.positionAmt);
    }
    
    // Otherwise calculate from percentage change
    // PnL% = (price change / entry price) * leverage * 100
    // For a typical position size, we can estimate based on common values
    // Using $0.55 USDT position size (from your positions)
    const priceChangePercent = (priceDiff / pos.entryPrice) * 100;
    const leverageNum = typeof pos.leverage === 'string' 
      ? parseFloat(pos.leverage.replace('X', '')) 
      : pos.leverage;
    const pnlPercent = priceChangePercent * leverageNum;
    
    // Estimate position size based on typical values (0.55 USDT notional)
    const estimatedPositionValue = 0.55;
    return (pnlPercent / 100) * estimatedPositionValue;
  };

  const calculateDistance = (current: number, target: number) => {
    const percent = ((target - current) / current) * 100;
    return percent;
  };

  const getPositionColor = (pnl: number) => {
    if (pnl > 0) return '#00ff41'; // Green for profit
    if (pnl < 0) return '#ff006e'; // Pink for loss
    return '#ffaa00'; // Orange for breakeven
  };

  const getSideColor = (side: string) => {
    return side === 'LONG' ? '#00ff41' : '#ff006e';
  };

  if (!open) return null;

  // Separate winning and losing positions based on LIVE PnL
  const winningPositions = positions.filter(p => calculateRealPnL(p) > 0);
  const losingPositions = positions.filter(p => calculateRealPnL(p) <= 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={() => onOpenChange(false)}
    >
      {/* Chinese Wooden Billboard */}
      <div 
        className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
          border: '8px solid #D4AF37',
          borderRadius: '16px',
          boxShadow: `
            0 0 40px rgba(212, 175, 55, 0.5),
            inset 0 0 60px rgba(0, 0, 0, 0.4),
            0 20px 60px rgba(0, 0, 0, 0.8)
          `
        }}
      >
        {/* Decorative top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-4"
          style={{
            background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 20px, #8B4513 20px, #8B4513 40px)',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.6)'
          }}
        />

        {/* Header */}
        <div 
          className="relative pt-8 pb-6 px-8"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.7))',
            borderBottom: '4px solid #D4AF37'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' }}>
              📊
            </div>

            <div className="text-center flex-1">
              <h2 
                className="text-4xl font-bold mb-2"
                style={{
                  fontFamily: 'serif',
                  color: '#D4AF37',
                  textShadow: `
                    0 0 20px rgba(212, 175, 55, 0.8),
                    0 0 40px rgba(212, 175, 55, 0.5),
                    2px 2px 4px rgba(0, 0, 0, 0.8)
                  `,
                  letterSpacing: '0.2em'
                }}
              >
                开放仓位
              </h2>
              <p 
                className="text-sm"
                style={{
                  fontFamily: 'monospace',
                  color: '#FFD700',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                  letterSpacing: '0.3em'
                }}
              >
                OPEN POSITIONS
              </p>
            </div>

            <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' }}>
              💹
            </div>
          </div>

          {/* Position count badge */}
          <div 
            className="absolute top-4 left-4 px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #D4AF37',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
            }}
          >
            <span 
              className="text-lg font-bold"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
              }}
            >
              {positions.length} ACTIVE
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full"
            style={{
              background: 'rgba(139, 69, 19, 0.9)',
              border: '2px solid #D4AF37',
              color: '#D4AF37',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div 
          className="overflow-y-auto p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.6), rgba(101, 67, 33, 0.4))',
            maxHeight: 'calc(90vh - 200px)',
            fontFamily: 'monospace'
          }}
        >
          {isLoading ? (
            <div className="text-center py-12 text-yellow-400">
              <div className="text-5xl mb-4 animate-spin">⚙️</div>
              <p className="text-lg">Loading positions...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐼</div>
              <p className="text-yellow-400 text-xl">No open positions</p>
              <p className="text-yellow-600 text-sm mt-2">Panda is waiting for trading signals...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Winning Positions - Fancy Display */}
              {winningPositions.length > 0 && (
                <div>
                  <h3 
                    className="text-3xl font-black mb-6 text-center"
                    style={{
                      color: '#00ff41',
                      textShadow: `
                        0 0 20px rgba(0, 255, 65, 1),
                        0 0 40px rgba(0, 255, 65, 0.8),
                        0 0 60px rgba(0, 255, 65, 0.6),
                        0 0 80px rgba(0, 255, 65, 0.4)
                      `,
                      animation: 'flashyPulse 1.5s ease-in-out infinite',
                      letterSpacing: '0.15em'
                    }}
                  >
                    🎉 WINNING POSITIONS 🎉
                  </h3>
                  {winningPositions.map((pos, idx) => {
                    const pnlPercent = calculatePnlPercent(pos);
                    return (
                      <div 
                        key={idx}
                        className="mb-6 p-6 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.25), rgba(0, 255, 65, 0.08), rgba(0, 200, 100, 0.15))',
                          border: '4px solid #00ff41',
                          boxShadow: `
                            0 0 40px rgba(0, 255, 65, 0.9),
                            0 0 80px rgba(0, 255, 65, 0.6),
                            inset 0 0 60px rgba(0, 255, 65, 0.15),
                            0 15px 40px rgba(0, 0, 0, 0.7)
                          `,
                          animation: 'neonGlow 2s ease-in-out infinite',
                          position: 'relative'
                        }}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span 
                              className="text-3xl font-black"
                              style={{
                                color: '#ffffff',
                                textShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              {pos.symbol.replace('USDT', '')}
                            </span>
                            <span className="text-2xl">✓</span>
                            <span 
                              className="px-3 py-1 rounded-lg text-sm font-bold"
                              style={{
                                background: `rgba(${pos.side === 'LONG' ? '0, 255, 65' : '255, 0, 110'}, 0.3)`,
                                color: getSideColor(pos.side),
                                border: `2px solid ${getSideColor(pos.side)}`,
                                textShadow: `0 0 10px ${getSideColor(pos.side)}`
                              }}
                            >
                              {pos.side}
                            </span>
                          </div>
                          <div 
                            className="text-3xl font-black"
                            style={{
                              color: calculateRealPnL(pos) > 0 ? '#00ff41' : calculateRealPnL(pos) < 0 ? '#ff006e' : '#ffaa00',
                              textShadow: calculateRealPnL(pos) > 0 ? `
                                0 0 25px rgba(0, 255, 65, 1),
                                0 0 50px rgba(0, 255, 65, 0.8),
                                0 0 75px rgba(0, 255, 65, 0.6)
                              ` : calculateRealPnL(pos) < 0 ? `
                                0 0 25px rgba(255, 0, 110, 1),
                                0 0 50px rgba(255, 0, 110, 0.8),
                                0 0 75px rgba(255, 0, 110, 0.6)
                              ` : '0 0 20px rgba(255, 170, 0, 0.8)',
                              animation: calculateRealPnL(pos) > 0 ? 'flashyPulse 1.5s ease-in-out infinite' : calculateRealPnL(pos) < 0 ? 'redPulse 1.5s ease-in-out infinite' : 'none'
                            }}
                          >
                            {calculateRealPnL(pos) >= 0 ? '+' : ''}${calculateRealPnL(pos).toFixed(2)}
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(0, 255, 65, 0.3)'
                            }}
                          >
                            <div className="text-xs text-green-300">Position</div>
                            <div 
                              className="text-lg font-bold"
                              style={{
                                color: '#ffffff',
                                textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                              }}
                            >
                              {pos.positionAmt} @ ${pos.entryPrice.toFixed(4)}
                            </div>
                          </div>
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(0, 255, 65, 0.3)'
                            }}
                          >
                            <div className="text-xs text-green-300">Mark Price</div>
                            <div 
                              className="text-lg font-bold"
                              style={{
                                color: '#00ff41',
                                textShadow: '0 0 10px rgba(0, 255, 65, 0.6)'
                              }}
                            >
                              ${(livePrices[pos.symbol] || pos.markPrice).toFixed(4)}
                            </div>
                          </div>
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(0, 255, 65, 0.3)'
                            }}
                          >
                            <div className="text-xs text-green-300">Leverage | Profit %</div>
                            <div 
                              className="text-lg font-bold"
                              style={{
                                color: '#00ff41',
                                textShadow: '0 0 10px rgba(0, 255, 65, 0.6)'
                              }}
                            >
                              {typeof pos.leverage === "string" ? pos.leverage : pos.leverage + "x"} | +{pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              background: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(0, 255, 65, 0.3)'
                            }}
                          >
                            <div className="text-xl text-green-300">{getTimeIcon(pos.openedAt)}</div>
                            <div 
                              className="text-lg font-bold"
                              style={{
                                color: '#ffffff',
                                textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                              }}
                            >
                              {calculateHoldTime(pos.openedAt)}
                            </div>
                          </div>
                        </div>

                        {/* SL/TP Row */}
                        {(pos.stopLoss || pos.takeProfit) && (
                          <div className="grid grid-cols-2 gap-4">
                            {pos.stopLoss && (
                              <div 
                                className="p-3 rounded-lg"
                                style={{
                                  background: 'rgba(255, 0, 110, 0.1)',
                                  border: '1px solid rgba(255, 0, 110, 0.3)'
                                }}
                              >
                                <div className="text-xs text-red-300">Stop Loss</div>
                                <div 
                                  className="text-sm font-bold"
                                  style={{
                                    color: '#ff006e'
                                  }}
                                >
                                  ${pos.stopLoss.toFixed(4)}
                                </div>
                                <div className="text-xs text-red-400">
                                  {calculateDistance(pos.markPrice, pos.stopLoss) > 0 ? '+' : ''}
                                  {calculateDistance(pos.markPrice, pos.stopLoss).toFixed(2)}%
                                </div>
                              </div>
                            )}
                            {pos.takeProfit && (
                              <div 
                                className="p-3 rounded-lg"
                                style={{
                                  background: 'rgba(0, 255, 65, 0.1)',
                                  border: '1px solid rgba(0, 255, 65, 0.3)'
                                }}
                              >
                                <div className="text-xs text-green-300">Take Profit</div>
                                <div 
                                  className="text-sm font-bold"
                                  style={{
                                    color: '#00ff41'
                                  }}
                                >
                                  ${pos.takeProfit.toFixed(4)}
                                </div>
                                <div className="text-xs text-green-400">
                                  {calculateDistance(pos.markPrice, pos.takeProfit) > 0 ? '+' : ''}
                                  {calculateDistance(pos.markPrice, pos.takeProfit).toFixed(2)}%
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Losing/Breakeven Positions - Standard Display */}
              {losingPositions.length > 0 && (
                <div>
                  {winningPositions.length > 0 && (
                    <h3 
                      className="text-xl font-bold mb-4 text-center mt-6"
                      style={{
                        color: '#ff006e',
                        textShadow: '0 0 15px rgba(255, 0, 110, 0.6)',
                        opacity: 0.8
                      }}
                    >
                      ⚠️ MONITORING
                    </h3>
                  )}
                  {losingPositions.map((pos, idx) => {
                    const pnlPercent = calculatePnlPercent(pos);
                    return (
                      <div 
                        key={idx}
                        className="mb-4 p-4 rounded-lg"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          border: `2px solid ${getPositionColor(pos.unrealizedPnL)}`,
                          boxShadow: `0 0 15px ${getPositionColor(pos.unrealizedPnL)}33`
                        }}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span 
                              className="text-xl font-bold"
                              style={{
                                color: '#ffffff',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                              }}
                            >
                              {pos.symbol.replace('USDT', '')}
                            </span>
                            <span className="text-lg">✓</span>
                            <span 
                              className="px-2 py-1 rounded text-xs font-bold"
                              style={{
                                background: `rgba(${pos.side === 'LONG' ? '0, 255, 65' : '255, 0, 110'}, 0.2)`,
                                color: getSideColor(pos.side),
                                border: `1px solid ${getSideColor(pos.side)}`
                              }}
                            >
                              {pos.side}
                            </span>
                          </div>
                          <div 
                            className="text-xl font-bold"
                            style={{
                              color: getPositionColor(calculateRealPnL(pos)),
                              textShadow: `0 0 10px ${getPositionColor(calculateRealPnL(pos))}`
                            }}
                          >
                            {calculateRealPnL(pos) >= 0 ? '+' : ''}${calculateRealPnL(pos).toFixed(2)}
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                          <div>
                            <div className="text-yellow-400 opacity-70">Entry</div>
                            <div className="text-white font-bold">${pos.entryPrice.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 opacity-70">Mark</div>
                            <div className="text-white font-bold">${(livePrices[pos.symbol] || pos.markPrice).toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 opacity-70">Leverage</div>
                            <div 
                              className="font-bold"
                              style={{
                                color: getPositionColor(calculateRealPnL(pos))
                              }}
                            >
                              {typeof pos.leverage === "string" ? pos.leverage : pos.leverage + "x"} | {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-lg">{getTimeIcon(pos.openedAt)}</div>
                            <div className="text-white font-bold">{calculateHoldTime(pos.openedAt)}</div>
                          </div>
                        </div>

                        {/* SL/TP Row */}
                        {(pos.stopLoss || pos.takeProfit) && (
                          <div className="flex gap-4 text-xs">
                            {pos.stopLoss && (
                              <div className="flex-1">
                                <span className="text-red-400">SL: ${pos.stopLoss.toFixed(4)}</span>
                                <span className="text-red-400 ml-2">
                                  ({calculateDistance(pos.markPrice, pos.stopLoss) > 0 ? '+' : ''}
                                  {calculateDistance(pos.markPrice, pos.stopLoss).toFixed(2)}%)
                                </span>
                              </div>
                            )}
                            {pos.takeProfit && (
                              <div className="flex-1">
                                <span className="text-green-400">TP: ${pos.takeProfit.toFixed(4)}</span>
                                <span className="text-green-400 ml-2">
                                  ({calculateDistance(pos.markPrice, pos.takeProfit) > 0 ? '+' : ''}
                                  {calculateDistance(pos.markPrice, pos.takeProfit).toFixed(2)}%)
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-4"
          style={{
            background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 20px, #8B4513 20px, #8B4513 40px)',
            boxShadow: '0 -2px 10px rgba(212, 175, 55, 0.6)'
          }}
        />

        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
            borderRadius: '16px'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes flashyPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            text-shadow: 
              0 0 20px rgba(0, 255, 65, 1),
              0 0 40px rgba(0, 255, 65, 0.8),
              0 0 60px rgba(0, 255, 65, 0.6),
              0 0 80px rgba(0, 255, 65, 0.4);
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.08);
            text-shadow: 
              0 0 30px rgba(0, 255, 65, 1),
              0 0 60px rgba(0, 255, 65, 1),
              0 0 90px rgba(0, 255, 65, 0.8),
              0 0 120px rgba(0, 255, 65, 0.6);
          }
        }

        @keyframes redPulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
            text-shadow: 
              0 0 20px rgba(255, 0, 110, 1),
              0 0 40px rgba(255, 0, 110, 0.8),
              0 0 60px rgba(255, 0, 110, 0.6),
              0 0 80px rgba(255, 0, 110, 0.4);
          }
          50% { 
            opacity: 0.9; 
            transform: scale(1.08);
            text-shadow: 
              0 0 30px rgba(255, 0, 110, 1),
              0 0 60px rgba(255, 0, 110, 1),
              0 0 90px rgba(255, 0, 110, 0.8),
              0 0 120px rgba(255, 0, 110, 0.6);
          }
        }

        @keyframes neonGlow {
          0%, 100% { 
            box-shadow: 
              0 0 40px rgba(0, 255, 65, 0.9),
              0 0 80px rgba(0, 255, 65, 0.6),
              inset 0 0 60px rgba(0, 255, 65, 0.15),
              0 15px 40px rgba(0, 0, 0, 0.7);
            border-color: #00ff41;
          }
          50% { 
            box-shadow: 
              0 0 60px rgba(0, 255, 65, 1),
              0 0 120px rgba(0, 255, 65, 0.8),
              inset 0 0 80px rgba(0, 255, 65, 0.25),
              0 20px 50px rgba(0, 0, 0, 0.8);
            border-color: #00ffaa;
          }
        }

        @keyframes glow {
          0%, 100% { 
            box-shadow: 
              0 0 30px rgba(0, 255, 65, 0.5),
              inset 0 0 40px rgba(0, 255, 65, 0.1),
              0 10px 30px rgba(0, 0, 0, 0.5);
          }
          50% { 
            box-shadow: 
              0 0 50px rgba(0, 255, 65, 0.8),
              inset 0 0 60px rgba(0, 255, 65, 0.2),
              0 10px 30px rgba(0, 0, 0, 0.5);
          }
        }

        /* Custom scrollbar */
        *::-webkit-scrollbar {
          width: 12px;
        }

        *::-webkit-scrollbar-track {
          background: #654321;
          border-radius: 6px;
        }

        *::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 6px;
          border: 2px solid #654321;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #FFD700;
        }
      `}</style>
    </div>
  );
};
