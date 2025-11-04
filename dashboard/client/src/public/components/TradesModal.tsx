import React, { useState } from 'react';

interface Trade {
  id?: string;
  symbol: string;
  side: string;
  entryPrice: number;
  exitPrice: number;
  pnl?: number;
  pnlPercent?: number;
  fee?: number;
  coin?: string;
  date?: string;
  closedAt?: number;
  openedAt?: number;
}

interface TradesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
}

const TRADES_PER_PAGE = 20;

export function TradesModal({ open, onOpenChange, trades }: TradesModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Multi-criteria sorting for stable, chronological order
  const filteredTrades = [...trades].sort((a, b) => {
    // 1. Primary: Most recently closed first
    const closedDiff = (b.closedAt || 0) - (a.closedAt || 0);
    if (closedDiff !== 0) return closedDiff;
    
    // 2. Secondary: If closed at same time, most recently opened first
    const openedDiff = (b.openedAt || 0) - (a.openedAt || 0);
    if (openedDiff !== 0) return openedDiff;
    
    // 3. Tertiary: Alphabetical by symbol for stable sort
    return (a.symbol || '').localeCompare(b.symbol || '');
  });

  const totalPages = Math.ceil(filteredTrades.length / TRADES_PER_PAGE);
  const startIndex = (currentPage - 1) * TRADES_PER_PAGE;
  const endIndex = startIndex + TRADES_PER_PAGE;
  const currentTrades = filteredTrades.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Calculate stats
  const winningTrades = filteredTrades.filter(t => (t.pnl || 0) > 0).length;
  const losingTrades = filteredTrades.filter(t => (t.pnl || 0) < 0).length;
  const totalPnL = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = filteredTrades.length > 0 ? (winningTrades / filteredTrades.length) * 100 : 0;

  // Count trades by coin
  const coinCounts = filteredTrades.reduce((acc, trade) => {
    const coin = trade.coin || trade.symbol.replace('USDT', '');
    acc[coin] = (acc[coin] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="w-full max-w-7xl max-h-[90vh] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
          border: '6px solid #D4AF37',
          borderRadius: '16px',
          boxShadow: `
            0 0 30px rgba(212, 175, 55, 0.6),
            inset 0 0 40px rgba(0, 0, 0, 0.5),
            0 15px 40px rgba(0, 0, 0, 0.7)
          `
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 flex justify-between items-center"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.7))',
            borderBottom: '3px solid #D4AF37'
          }}
        >
          <div>
            <h2 
              className="text-3xl font-bold mb-1"
              style={{
                fontFamily: 'serif',
                color: '#D4AF37',
                textShadow: '0 0 15px rgba(212, 175, 55, 0.8)',
                letterSpacing: '0.15em'
              }}
            >
              📊 交易记录
            </h2>
            <p 
              className="text-sm"
              style={{
                fontFamily: 'monospace',
                color: '#FFD700',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                letterSpacing: '0.2em'
              }}
            >
              COMPLETED TRADES HISTORY
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-4xl font-bold w-12 h-12 flex items-center justify-center rounded-lg"
            style={{
              color: '#D4AF37',
              background: 'rgba(0, 0, 0, 0.5)',
              border: '2px solid #D4AF37',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div 
          className="p-6 overflow-y-auto"
          style={{
            maxHeight: 'calc(90vh - 120px)',
            background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.6), rgba(101, 67, 33, 0.4))'
          }}
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div 
              className="p-4 rounded-lg text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '2px solid #D4AF37',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              <div 
                className="text-3xl font-bold mb-1"
                style={{
                  color: '#D4AF37',
                  textShadow: '0 0 15px rgba(212, 175, 55, 0.8)'
                }}
              >
                {filteredTrades.length}
              </div>
              <div 
                className="text-xs"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace'
                }}
              >
                Total Trades
              </div>
            </div>

            <div 
              className="p-4 rounded-lg text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: `2px solid ${totalPnL >= 0 ? '#00ff41' : '#ff006e'}`,
                boxShadow: `0 0 15px ${totalPnL >= 0 ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 0, 110, 0.3)'}`
              }}
            >
              <div 
                className="text-3xl font-bold mb-1"
                style={{
                  color: totalPnL >= 0 ? '#00ff41' : '#ff006e',
                  textShadow: `0 0 15px ${totalPnL >= 0 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                }}
              >
                ${totalPnL.toFixed(2)}
              </div>
              <div 
                className="text-xs"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace'
                }}
              >
                Total PnL
              </div>
            </div>

            <div 
              className="p-4 rounded-lg text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '2px solid #D4AF37',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              <div 
                className="text-3xl font-bold mb-1"
                style={{
                  color: winRate >= 50 ? '#00ff41' : '#ffaa00',
                  textShadow: `0 0 15px ${winRate >= 50 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 170, 0, 0.8)'}`
                }}
              >
                {winRate.toFixed(1)}%
              </div>
              <div 
                className="text-xs"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace'
                }}
              >
                Win Rate
              </div>
            </div>

            <div 
              className="p-4 rounded-lg text-center"
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                border: '2px solid #D4AF37',
                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              <div 
                className="text-3xl font-bold mb-1"
                style={{
                  color: '#D4AF37',
                  textShadow: '0 0 15px rgba(212, 175, 55, 0.8)'
                }}
              >
                {winningTrades}W / {losingTrades}L
              </div>
              <div 
                className="text-xs"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace'
                }}
              >
                W/L Ratio
              </div>
            </div>
          </div>

          {/* Coin Distribution */}
          <div 
            className="mb-6 p-4 rounded-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid #D4AF37'
            }}
          >
            <div 
              className="text-sm font-bold mb-3"
              style={{
                color: '#FFD700',
                fontFamily: 'monospace',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
              }}
            >
              📈 TRADES BY COIN:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(coinCounts).map(([coin, count]) => (
                <span 
                  key={coin}
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(139, 69, 19, 0.5))',
                    border: '1px solid #D4AF37',
                    color: '#FFD700',
                    textShadow: '0 0 5px rgba(255, 215, 0, 0.6)'
                  }}
                >
                  {coin}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div 
              className="mb-4 text-center text-sm"
              style={{
                color: '#FFD700',
                fontFamily: 'monospace'
              }}
            >
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredTrades.length)} of {filteredTrades.length} trades
            </div>
          )}

          {/* Trades Table */}
          <div 
            className="overflow-x-auto rounded-lg"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #D4AF37'
            }}
          >
            <table className="w-full">
              <thead>
                <tr 
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.6))',
                    borderBottom: '2px solid #D4AF37'
                  }}
                >
                  <th 
                    className="text-left p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    TIME
                  </th>
                  <th 
                    className="text-left p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    SYMBOL
                  </th>
                  <th 
                    className="text-left p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    SIDE
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    ENTRY
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    EXIT
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    PNL
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    %
                  </th>
                  <th 
                    className="text-right p-3 text-sm font-bold"
                    style={{
                      color: '#FFD700',
                      fontFamily: 'monospace',
                      textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    FEE
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTrades.map((trade, idx) => (
                  <tr 
                    key={startIndex + idx}
                    style={{
                      borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                      background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 69, 19, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 69, 19, 0.2)';
                    }}
                  >
                    <td 
                      className="p-3 text-xs"
                      style={{
                        color: '#D4AF37',
                        fontFamily: 'monospace'
                      }}
                    >
                      {formatTimestamp(trade.closedAt)}
                    </td>
                    <td 
                      className="p-3 font-bold"
                      style={{
                        color: '#ffffff',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      {trade.symbol}
                    </td>
                    <td className="p-3">
                      <span 
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{
                          background: trade.side === 'LONG' || trade.side === 'long' 
                            ? 'rgba(0, 255, 65, 0.2)' 
                            : 'rgba(255, 0, 110, 0.2)',
                          border: `1px solid ${trade.side === 'LONG' || trade.side === 'long' ? '#00ff41' : '#ff006e'}`,
                          color: trade.side === 'LONG' || trade.side === 'long' ? '#00ff41' : '#ff006e',
                          textShadow: `0 0 8px ${trade.side === 'LONG' || trade.side === 'long' ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                        }}
                      >
                        {trade.side.toUpperCase()}
                      </span>
                    </td>
                    <td 
                      className="p-3 text-right font-mono"
                      style={{
                        color: '#ffffff',
                        opacity: 0.9
                      }}
                    >
                      ${trade.entryPrice.toFixed(4)}
                    </td>
                    <td 
                      className="p-3 text-right font-mono"
                      style={{
                        color: '#ffffff',
                        opacity: 0.9
                      }}
                    >
                      ${trade.exitPrice.toFixed(4)}
                    </td>
                    <td 
                      className="p-3 text-right font-bold"
                      style={{
                        color: (trade.pnl || 0) >= 0 ? '#00ff41' : '#ff006e',
                        textShadow: `0 0 8px ${(trade.pnl || 0) >= 0 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                      }}
                    >
                      ${(trade.pnl || 0).toFixed(2)}
                    </td>
                    <td 
                      className="p-3 text-right font-bold"
                      style={{
                        color: (trade.pnlPercent || 0) >= 0 ? '#00ff41' : '#ff006e',
                        textShadow: `0 0 8px ${(trade.pnlPercent || 0) >= 0 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                      }}
                    >
                      {(trade.pnlPercent || 0) >= 0 ? '+' : ''}{(trade.pnlPercent || 0).toFixed(2)}%
                    </td>
                    <td 
                      className="p-3 text-right font-mono text-sm"
                      style={{
                        color: '#D4AF37',
                        opacity: 0.7
                      }}
                    >
                      ${(trade.fee || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{
                  background: currentPage === 1 ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                  border: '2px solid #D4AF37',
                  color: currentPage === 1 ? '#8B4513' : '#FFD700',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                First
              </button>

              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{
                  background: currentPage === 1 ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                  border: '2px solid #D4AF37',
                  color: currentPage === 1 ? '#8B4513' : '#FFD700',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ◀ Prev
              </button>

              <div 
                className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #D4AF37)',
                  border: '2px solid #FFD700',
                  color: '#000',
                  fontFamily: 'monospace'
                }}
              >
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{
                  background: currentPage === totalPages ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                  border: '2px solid #D4AF37',
                  color: currentPage === totalPages ? '#8B4513' : '#FFD700',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Next ▶
              </button>

              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-bold text-sm"
                style={{
                  background: currentPage === totalPages ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                  border: '2px solid #D4AF37',
                  color: currentPage === totalPages ? '#8B4513' : '#FFD700',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
