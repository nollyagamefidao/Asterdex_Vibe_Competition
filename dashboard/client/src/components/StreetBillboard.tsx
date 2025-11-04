import React, { useState, useEffect } from 'react';

interface DeepSeekResponse {
  id: number;
  timestamp: number;
  date: string;
  prompt: {
    full: string;
    length: number;
    preview: string;
  };
  response: {
    raw: string;
    parsed: any;
    success: boolean;
    error: string | null;
  };
  decision: {
    action: string;
    coin: string;
    confidence: number;
    reasoning: string;
    leverage?: number;
    quantity?: number;
  } | null;
}

interface StreetBillboardProps {
  onViewLog?: () => void;
}

export const StreetBillboard: React.FC<StreetBillboardProps> = ({ onViewLog }) => {
  const [responses, setResponses] = useState<DeepSeekResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch DeepSeek responses from responses.json
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch('/api/responses');
        if (response.ok) {
          const data = await response.json();
          // Reverse to show newest first
          setResponses(data.reverse());
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch DeepSeek responses:', error);
        setIsLoading(false);
      }
    };

    fetchResponses();
    // Fetch every 10 seconds to match bot cycles with delay
    const interval = setInterval(fetchResponses, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate through responses
  useEffect(() => {
    if (responses.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % responses.length);
      }, 10000); // Change every 10 seconds
      return () => clearInterval(interval);
    }
  }, [responses.length]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    
    // Green for LONG/BUY actions
    if (actionLower === 'long' || actionLower === 'buy' || actionLower === 'scalp_long') {
      return '#00ff41';
    }
    
    // Red for SHORT/SELL actions
    if (actionLower === 'short' || actionLower === 'sell' || actionLower === 'scalp_short') {
      return '#ff006e';
    }
    
    // Yellow/Gold for CLOSE/EXIT
    if (actionLower === 'close' || actionLower === 'exit' || actionLower.startsWith('close_')) {
      return '#ffd700';
    }
    
    // Orange for HOLD
    if (actionLower === 'hold') {
      return '#ffaa00';
    }
    
    // Cyan for STOP LOSS / TAKE PROFIT updates
    if (actionLower.includes('sltp') || actionLower.includes('update_tp') || actionLower.includes('update_sl')) {
      return '#00d4ff';
    }
    
    // Default white
    return '#ffffff';
  };

  const formatActionDisplay = (action: string, coin: string) => {
    const actionLower = action.toLowerCase();
    
    // Extract coin from action if it includes coin (e.g., "set_sltp_BTC" -> "BTC")
    let extractedCoin = coin;
    const coinMatch = action.match(/_(BTC|ETH|SOL|XRP|DOGE|BNB|ASTER|WLD|DOT|ATOM|ARB|NEAR|ETC|AVAX|MATIC|LINK|UNI|AAVE|CRV|SUSHI|YFI|COMP|MKR|SNX|BAL|ZRX|KNC|LRC|BAND|REN|NMR|ANT|MLN|REP)$/i);
    if (coinMatch) {
      extractedCoin = coinMatch[1].toUpperCase();
    }
    
    // Format action based on type
    if (actionLower.startsWith('set_sltp') || actionLower.includes('sltp')) {
      return `🛡️ STOP LOSS ${extractedCoin}`;
    }
    
    if (actionLower.startsWith('update_tp') || actionLower.includes('update_tp')) {
      return `📈 UPDATE TP ${extractedCoin}`;
    }
    
    if (actionLower.startsWith('update_sl') || actionLower.includes('update_sl')) {
      return `🛡️ UPDATE SL ${extractedCoin}`;
    }
    
    if (actionLower.startsWith('close_')) {
      return `❌ CLOSE ${extractedCoin}`;
    }
    
    if (actionLower === 'scalp_long') {
      return `⚡ SCALP LONG ${extractedCoin}`;
    }
    
    if (actionLower === 'scalp_short') {
      return `⚡ SCALP SHORT ${extractedCoin}`;
    }
    
    if (actionLower === 'long') {
      return `🟢 LONG ${extractedCoin}`;
    }
    
    if (actionLower === 'short') {
      return `🔴 SHORT ${extractedCoin}`;
    }
    
    if (actionLower === 'hold') {
      // HOLD N/A → HOLD
      // HOLD NONE → HOLD POSITIONS
      if (extractedCoin === 'N/A' || !extractedCoin) {
        return '⏸️ HOLD';
      }
      if (extractedCoin === 'NONE') {
        return '⏸️ HOLD POSITIONS';
      }
      return `⏸️ HOLD ${extractedCoin}`;
    }
    
    if (actionLower === 'exit' || actionLower === 'close') {
      return `🚪 EXIT ${extractedCoin}`;
    }
    
    // Default: capitalize and show with coin
    return `${action.toUpperCase()} ${extractedCoin}`;
  };

  const currentResponse = responses[currentIndex];
  const currentDecision = currentResponse?.decision;

  return (
    <div 
      className="w-full max-w-4xl mx-auto"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
        border: '6px solid #D4AF37',
        borderRadius: '12px',
        boxShadow: `
          0 0 30px rgba(212, 175, 55, 0.6),
          inset 0 0 40px rgba(0, 0, 0, 0.5),
          0 15px 40px rgba(0, 0, 0, 0.7)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative top border */}
      <div 
        className="absolute top-0 left-0 right-0 h-3"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 15px, #8B4513 15px, #8B4513 30px)',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Header */}
      <div 
        className="pt-6 pb-4 px-6"
        style={{
          background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.7))',
          borderBottom: '3px solid #D4AF37'
        }}
      >
        <div className="flex items-center justify-center gap-4">
          <span className="text-3xl">🏮</span>
          <h3 
            className="text-2xl font-bold text-center"
            style={{
              fontFamily: 'serif',
              color: '#D4AF37',
              textShadow: `
                0 0 15px rgba(212, 175, 55, 0.8),
                0 0 30px rgba(212, 175, 55, 0.5),
                2px 2px 4px rgba(0, 0, 0, 0.8)
              `,
              letterSpacing: '0.2em'
            }}
          >
            深度算智告示牌
          </h3>
          <span className="text-3xl">🐉</span>
        </div>
        <p 
          className="text-xs text-center mt-1"
          style={{
            fontFamily: 'monospace',
            color: '#FFD700',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            letterSpacing: '0.3em'
          }}
        >
          AI TRADING BULLETIN
        </p>
      </div>

      {/* Content */}
      <div 
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.6), rgba(101, 67, 33, 0.4))',
          minHeight: '200px'
        }}
      >
        {isLoading ? (
          <div className="text-center py-8 text-yellow-400">
            <div className="text-4xl mb-2">🔄</div>
            <p>Loading AI decisions...</p>
          </div>
        ) : !currentDecision ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🤖</div>
            <p className="text-yellow-400 text-lg">No AI decisions yet</p>
            <p className="text-yellow-600 text-sm mt-2">Waiting for trading signals...</p>
          </div>
        ) : (
          <div>
            {/* Timestamp and indicator */}
            <div className="flex justify-between items-center mb-4">
              <div 
                className="text-xs"
                style={{
                  fontFamily: 'monospace',
                  color: '#D4AF37',
                  textShadow: '0 0 5px rgba(212, 175, 55, 0.5)'
                }}
              >
                📅 {formatTimestamp(currentResponse.timestamp)}
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="text-xs flex gap-1"
                  style={{
                    fontFamily: 'monospace',
                    color: '#D4AF37'
                  }}
                >
                  {responses.map((_, idx) => (
                    <div 
                      key={idx}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: idx === currentIndex ? '#FFD700' : '#654321',
                        boxShadow: idx === currentIndex ? '0 0 8px rgba(255, 215, 0, 0.8)' : 'none'
                      }}
                    />
                  ))}
                </div>
                {/* View Full Log Button */}
                {onViewLog && (
                  <button
                    onClick={onViewLog}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      fontFamily: 'monospace',
                      background: 'linear-gradient(135deg, #CD7F32, #8B6914)',
                      border: '1px solid #D4AF37',
                      color: '#FFD700',
                      textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.8)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    📜 FULL LOG
                  </button>
                )}
              </div>
            </div>

            {/* Action Header - Smaller, compact */}
            <div 
              className="text-lg font-bold mb-3 text-center px-4 py-2 rounded-lg inline-block"
              style={{
                color: getActionColor(currentDecision.action),
                background: 'rgba(0, 0, 0, 0.7)',
                border: `2px solid ${getActionColor(currentDecision.action)}`,
                textShadow: `
                  0 0 10px ${getActionColor(currentDecision.action)},
                  0 0 20px ${getActionColor(currentDecision.action)}
                `,
                boxShadow: `0 0 15px ${getActionColor(currentDecision.action)}40`,
                letterSpacing: '0.05em',
                margin: '0 auto',
                display: 'block',
                width: 'fit-content'
              }}
            >
              {formatActionDisplay(currentDecision.action, currentDecision.coin)}
            </div>

            {/* MAIN REASONING - Large and Prominent */}
            <div 
              className="p-6 rounded-lg mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(212, 175, 55, 0.15))',
                border: '3px solid #D4AF37',
                boxShadow: `
                  0 0 30px rgba(212, 175, 55, 0.4),
                  inset 0 0 30px rgba(212, 175, 55, 0.1)
                `,
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div 
                className="text-center text-sm font-bold mb-3"
                style={{
                  color: '#FFD700',
                  textShadow: `
                    0 0 15px rgba(255, 215, 0, 0.8),
                    0 0 30px rgba(255, 215, 0, 0.4)
                  `,
                  letterSpacing: '0.2em'
                }}
              >
                🤖 DEEPSEEK AI RECOMMENDATION
              </div>
              <p 
                className="text-lg leading-relaxed text-center px-4"
                style={{
                  color: '#ffffff',
                  textShadow: `
                    0 0 10px rgba(255, 255, 255, 0.6),
                    2px 2px 4px rgba(0, 0, 0, 0.8)
                  `,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '500',
                  lineHeight: '1.8',
                  fontSize: '1.1rem'
                }}
              >
                {currentDecision.reasoning}
              </p>
            </div>

            {/* Stats Row - Compact at bottom */}
            <div 
              className="grid gap-2"
              style={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                gridTemplateColumns: currentDecision.price && currentDecision.pnl !== undefined ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
              }}
            >
              <div 
                className="text-center p-2 rounded"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid #D4AF37'
                }}
              >
                <div className="text-yellow-400 text-xs">CONFIDENCE</div>
                <div 
                  className="text-base font-bold"
                  style={{
                    color: '#00ff41',
                    textShadow: '0 0 8px rgba(0, 255, 65, 0.6)'
                  }}
                >
                  {Math.round(currentDecision.confidence * 100)}%
                </div>
              </div>

              {currentDecision.price && (
                <div 
                  className="text-center p-2 rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #D4AF37'
                  }}
                >
                  <div className="text-yellow-400 text-xs">PRICE</div>
                  <div 
                    className="text-base font-bold"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                    }}
                  >
                    ${currentDecision.price.toFixed(4)}
                  </div>
                </div>
              )}

              {currentDecision.pnl !== undefined && (
                <div 
                  className="text-center p-2 rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid #D4AF37'
                  }}
                >
                  <div className="text-yellow-400 text-xs">PROFIT</div>
                  <div 
                    className="text-base font-bold"
                    style={{
                      color: currentDecision.pnl >= 0 ? '#00ff41' : '#ff006e',
                      textShadow: `0 0 8px ${currentDecision.pnl >= 0 ? 'rgba(0, 255, 65, 0.6)' : 'rgba(255, 0, 110, 0.6)'}`
                    }}
                  >
                    {currentDecision.pnl >= 0 ? '+' : ''}${Math.abs(currentDecision.pnl).toFixed(5)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Decorative bottom border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-3"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 15px, #8B4513 15px, #8B4513 30px)',
          boxShadow: '0 -2px 8px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
          borderRadius: '12px'
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};
