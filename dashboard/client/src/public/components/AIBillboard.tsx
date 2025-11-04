import React, { useState, useEffect, useRef } from 'react';

interface AIDecision {
  id: number;
  timestamp: number;
  type: string;
  coin: string;
  action: string;
  confidence: number;
  reasoning: string;
  result?: string;
  price?: number;
  pnl?: number;
  pnlPercent?: number;
  quantity?: number;
  leverage?: number;
  stop_loss?: number;
  profit_target?: number;
}

interface AIBillboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIBillboard: React.FC<AIBillboardProps> = ({ open, onOpenChange }) => {
  const [aiDecisions, setAIDecisions] = useState<AIDecision[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch AI decisions
  useEffect(() => {
    const fetchAIDecisions = async () => {
      try {
        const response = await fetch('/api/chat-messages');
        if (response.ok) {
          const data = await response.json();
          setAIDecisions(data); // Already sorted by timestamp descending
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch AI decisions:', error);
        setIsLoading(false);
      }
    };

    if (open) {
      fetchAIDecisions();
      // Poll every 5 seconds for new data
      const interval = setInterval(fetchAIDecisions, 5000);
      return () => clearInterval(interval);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(aiDecisions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, aiDecisions.length]);

  // Auto-scroll to selected
  useEffect(() => {
    if (scrollContainerRef.current && aiDecisions.length > 0) {
      const selectedElement = scrollContainerRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedIndex, aiDecisions.length]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'BUY':
      case 'LONG':
        return '#00ff41'; // Matrix green
      case 'SELL':
      case 'SHORT':
        return '#ff006e'; // Hot pink
      case 'CLOSE':
        return '#ffd700'; // Gold
      case 'HOLD':
        return '#ffaa00'; // Orange
      default:
        return '#ffffff';
    }
  };

  const selectedDecision = aiDecisions[selectedIndex];

  if (!open) return null;

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
        {/* Decorative top border with Chinese patterns */}
        <div 
          className="absolute top-0 left-0 right-0 h-4"
          style={{
            background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 20px, #8B4513 20px, #8B4513 40px)',
            boxShadow: '0 2px 10px rgba(212, 175, 55, 0.6)'
          }}
        />

        {/* Header - Chinese Signboard Style */}
        <div 
          className="relative pt-8 pb-6 px-8"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.7))',
            borderBottom: '4px solid #D4AF37'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Left ornament */}
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' }}>
              🐉
            </div>

            {/* Title in Chinese calligraphy style */}
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
                深度算智告示牌
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
                DEEPSEEK AI BULLETIN BOARD
              </p>
            </div>

            {/* Right ornament */}
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))' }}>
              🏮
            </div>
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

        {/* Main content area */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Left sidebar - Message list */}
          <div 
            className="w-1/3 overflow-y-auto border-r-4"
            style={{
              background: 'linear-gradient(to bottom, rgba(62, 39, 35, 0.8), rgba(101, 67, 33, 0.6))',
              borderColor: '#D4AF37',
              scrollbarWidth: 'thin',
              scrollbarColor: '#D4AF37 #654321'
            }}
            ref={scrollContainerRef}
          >
            {isLoading ? (
              <div className="p-8 text-center text-yellow-400">
                Loading AI decisions...
              </div>
            ) : aiDecisions.length === 0 ? (
              <div className="p-8 text-center text-yellow-400">
                No AI decisions yet
              </div>
            ) : (
              aiDecisions.map((decision, index) => (
                <div
                  key={decision.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`p-4 cursor-pointer border-b-2 transition-all ${
                    index === selectedIndex ? 'bg-yellow-900/40' : 'hover:bg-yellow-900/20'
                  }`}
                  style={{
                    borderColor: '#8B4513',
                    background: index === selectedIndex ? 'rgba(212, 175, 55, 0.2)' : undefined
                  }}
                >
                  <div 
                    className="text-xs mb-1"
                    style={{
                      fontFamily: 'monospace',
                      color: '#D4AF37',
                      textShadow: '0 0 5px rgba(212, 175, 55, 0.5)'
                    }}
                  >
                    {formatTimestamp(decision.timestamp)}
                  </div>
                  <div 
                    className="font-bold text-lg mb-1"
                    style={{
                      fontFamily: 'monospace',
                      color: getActionColor(decision.action),
                      textShadow: `0 0 10px ${getActionColor(decision.action)}`
                    }}
                  >
                    {decision.action} {decision.coin}
                  </div>
                  <div 
                    className="text-sm"
                    style={{
                      fontFamily: 'monospace',
                      color: '#FFD700'
                    }}
                  >
                    Confidence: {Math.round(decision.confidence * 100)}%
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right panel - Detailed view */}
          <div 
            className="flex-1 overflow-y-auto p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.6), rgba(101, 67, 33, 0.4))',
              fontFamily: 'monospace'
            }}
          >
            {selectedDecision ? (
              <div>
                {/* Timestamp */}
                <div 
                  className="text-sm mb-4 pb-2 border-b-2"
                  style={{
                    color: '#D4AF37',
                    borderColor: '#8B4513',
                    textShadow: '0 0 5px rgba(212, 175, 55, 0.6)'
                  }}
                >
                  📅 {formatTimestamp(selectedDecision.timestamp)}
                </div>

                {/* Action Header */}
                <div 
                  className="text-4xl font-black mb-6"
                  style={{
                    color: getActionColor(selectedDecision.action),
                    textShadow: `
                      0 0 20px ${getActionColor(selectedDecision.action)},
                      0 0 40px ${getActionColor(selectedDecision.action)},
                      2px 2px 4px rgba(0, 0, 0, 1)
                    `,
                    letterSpacing: '0.1em',
                    animation: 'blink 1.5s ease-in-out infinite'
                  }}
                >
                  {selectedDecision.action} {selectedDecision.coin}
                </div>

                {/* JSON-style data display with demoscene effects */}
                <div 
                  className="p-6 rounded-lg mb-6"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid #D4AF37',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 30px rgba(212, 175, 55, 0.1)'
                  }}
                >
                  <pre 
                    className="text-sm"
                    style={{
                      color: '#00ff41',
                      textShadow: '0 0 5px rgba(0, 255, 65, 0.5)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
{`{
  "action": "${selectedDecision.action}",
  "coin": "${selectedDecision.coin}",
  "confidence": ${(selectedDecision.confidence * 100).toFixed(1)}%,${selectedDecision.quantity ? `\n  "quantity": ${selectedDecision.quantity},` : ''}${selectedDecision.leverage ? `\n  "leverage": ${selectedDecision.leverage}x,` : ''}${selectedDecision.stop_loss ? `\n  "stop_loss": ${selectedDecision.stop_loss},` : ''}${selectedDecision.profit_target ? `\n  "profit_target": ${selectedDecision.profit_target},` : ''}${selectedDecision.pnl !== undefined ? `\n  "pnl": ${selectedDecision.pnl.toFixed(2)} USDT,` : ''}${selectedDecision.pnlPercent !== undefined ? `\n  "pnl_percent": ${selectedDecision.pnlPercent.toFixed(2)}%,` : ''}${selectedDecision.result ? `\n  "result": "${selectedDecision.result}",` : ''}
  "type": "${selectedDecision.type}"
}`}
                  </pre>
                </div>

                {/* Reasoning section */}
                <div className="mb-6">
                  <h3 
                    className="text-xl font-bold mb-3"
                    style={{
                      color: '#FFD700',
                      textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                    }}
                  >
                    💭 REASONING:
                  </h3>
                  <p 
                    className="text-base leading-relaxed"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    {selectedDecision.reasoning}
                  </p>
                </div>

                {/* Navigation hint */}
                <div 
                  className="text-xs text-center pt-4 border-t-2"
                  style={{
                    color: '#D4AF37',
                    borderColor: '#8B4513',
                    opacity: 0.7
                  }}
                >
                  ↑↓ Use arrow keys to navigate • ESC to close
                </div>
              </div>
            ) : (
              <div className="text-center text-yellow-400 mt-20">
                Select an AI decision to view details
              </div>
            )}
          </div>
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
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        /* Custom scrollbar for wooden theme */
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
