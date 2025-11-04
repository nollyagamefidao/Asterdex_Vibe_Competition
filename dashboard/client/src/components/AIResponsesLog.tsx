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

interface AIResponsesLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AIResponsesLog: React.FC<AIResponsesLogProps> = ({ open, onOpenChange }) => {
  const [responses, setResponses] = useState<DeepSeekResponse[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (open) {
      fetchResponses();
      const interval = setInterval(fetchResponses, 10000);
      return () => clearInterval(interval);
    }
  }, [open]);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/responses');
      if (response.ok) {
        const data = await response.json();
        setResponses(data.reverse()); // Newest first
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch AI responses:', error);
      setIsLoading(false);
    }
  };

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
    const actionLower = action?.toLowerCase() || '';
    
    if (actionLower === 'long' || actionLower === 'buy' || actionLower === 'scalp_long') {
      return '#00ff41';
    }
    
    if (actionLower === 'short' || actionLower === 'sell' || actionLower === 'scalp_short') {
      return '#ff006e';
    }
    
    if (actionLower === 'close' || actionLower === 'exit' || actionLower.startsWith('close_')) {
      return '#ffd700';
    }
    
    if (actionLower === 'hold') {
      return '#ffaa00';
    }
    
    if (actionLower.includes('sltp') || actionLower.includes('set_sltp')) {
      return '#00d4ff';
    }
    
    return '#ffffff';
  };

  const formatActionDisplay = (action: string, coin: string) => {
    const actionLower = action?.toLowerCase() || '';
    const coinUpper = coin?.toUpperCase() || '';
    
    // SET_SLTP_ATOM → SET STOP LOSS ATOM
    if (actionLower.includes('set_sltp') || actionLower.includes('sltp')) {
      return `SET STOP LOSS ${coinUpper}`;
    }
    
    // HOLD N/A → HOLD
    // HOLD NONE → HOLD POSITIONS
    if (actionLower === 'hold') {
      if (coinUpper === 'N/A' || !coinUpper) {
        return 'HOLD';
      }
      if (coinUpper === 'NONE') {
        return 'HOLD POSITIONS';
      }
      return `HOLD ${coinUpper}`;
    }
    
    // Default: ACTION COIN
    return `${action.toUpperCase()} ${coinUpper}`.trim();
  };

  if (!open) return null;

  // Pagination calculations
  const totalPages = Math.ceil(responses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedResponses = responses.slice(startIndex, endIndex);

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
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
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
              🤖 AI响应日志
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
              DEEPSEEK AI RESPONSES LOG
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
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔄</div>
              <p className="text-xl text-yellow-400">Loading AI responses...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-xl text-yellow-400">No AI responses yet</p>
              <p className="text-sm text-yellow-600 mt-2">Waiting for DeepSeek AI decisions...</p>
            </div>
          ) : (
            <div>
              {/* Pagination Info */}
              {totalPages > 1 && (
                <div 
                  className="mb-4 text-center text-sm"
                  style={{
                    color: '#FFD700',
                    fontFamily: 'monospace'
                  }}
                >
                  Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, responses.length)} of {responses.length} responses
                </div>
              )}

              <div className="space-y-4">
                {paginatedResponses.map((response) => (
                <div 
                  key={response.id}
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(212, 175, 55, 0.15))',
                    border: '2px solid #D4AF37',
                    boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {/* Response Header */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderBottom: expandedId === response.id ? '2px solid #D4AF37' : 'none'
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* Action Badge */}
                          {response.decision && (
                            <div 
                              className="px-3 py-1 rounded-lg text-sm font-bold"
                              style={{
                                background: 'rgba(0, 0, 0, 0.7)',
                                border: `2px solid ${getActionColor(response.decision.action)}`,
                                color: getActionColor(response.decision.action),
                                textShadow: `0 0 8px ${getActionColor(response.decision.action)}`
                              }}
                            >
                              {formatActionDisplay(response.decision.action, response.decision.coin)}
                            </div>
                          )}
                          
                          {/* Success/Error Badge */}
                          <div 
                            className="px-2 py-1 rounded text-xs font-bold"
                            style={{
                              background: response.response.success ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 0, 110, 0.2)',
                              border: `1px solid ${response.response.success ? '#00ff41' : '#ff006e'}`,
                              color: response.response.success ? '#00ff41' : '#ff006e'
                            }}
                          >
                            {response.response.success ? '✓ SUCCESS' : '✗ ERROR'}
                          </div>
                        </div>
                        
                        {/* Reasoning */}
                        {response.decision && (
                          <p 
                            className="text-sm mb-2"
                            style={{
                              color: '#ffffff',
                              textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                            }}
                          >
                            {response.decision.reasoning}
                          </p>
                        )}
                        
                        {/* Decision Details */}
                        {response.decision && (
                          <div className="flex gap-4 text-xs">
                            <span style={{ color: '#FFD700' }}>
                              Confidence: <strong>{Math.round(response.decision.confidence * 100)}%</strong>
                            </span>
                            {response.decision.leverage > 0 && (
                              <span style={{ color: '#FFD700' }}>
                                Leverage: <strong>{response.decision.leverage}x</strong>
                              </span>
                            )}
                            {response.decision.quantity > 0 && (
                              <span style={{ color: '#FFD700' }}>
                                Qty: <strong>{response.decision.quantity}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp and Expand Icon */}
                      <div className="flex flex-col items-end gap-2">
                        <span 
                          className="text-xs"
                          style={{
                            fontFamily: 'monospace',
                            color: '#D4AF37',
                            textShadow: '0 0 5px rgba(212, 175, 55, 0.5)'
                          }}
                        >
                          {formatTimestamp(response.timestamp)}
                        </span>
                        <span 
                          className="text-2xl"
                          style={{
                            color: '#D4AF37',
                            transition: 'transform 0.2s',
                            transform: expandedId === response.id ? 'rotate(180deg)' : 'rotate(0)'
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedId === response.id && (
                    <div 
                      className="p-4 space-y-3"
                      style={{
                        background: 'rgba(0, 0, 0, 0.7)'
                      }}
                    >
                      {/* Full Prompt */}
                      <div>
                        <div 
                          className="text-sm font-bold mb-2"
                          style={{
                            color: '#FFD700',
                            textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                          }}
                        >
                          📝 PROMPT TO DEEPSEEK:
                        </div>
                        <pre 
                          className="text-xs p-3 rounded overflow-x-auto"
                          style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid #D4AF37',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            maxHeight: '300px',
                            overflowY: 'auto'
                          }}
                        >
                          {response.prompt.full}
                        </pre>
                        <div 
                          className="text-xs mt-1"
                          style={{ color: '#D4AF37', opacity: 0.7 }}
                        >
                          Length: {response.prompt.length} characters
                        </div>
                      </div>
                      
                      {/* Full Response */}
                      <div>
                        <div 
                          className="text-sm font-bold mb-2"
                          style={{
                            color: '#FFD700',
                            textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                          }}
                        >
                          🤖 AI RESPONSE:
                        </div>
                        <pre 
                          className="text-xs p-3 rounded overflow-x-auto"
                          style={{
                            background: 'rgba(0, 0, 0, 0.8)',
                            border: `1px solid ${response.response.success ? '#00ff41' : '#ff006e'}`,
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            maxHeight: '300px',
                            overflowY: 'auto'
                          }}
                        >
                          {response.response.raw || response.response.error || 'No response'}
                        </pre>
                      </div>
                      
                      {/* Parsed Decision (if available) */}
                      {response.response.parsed && (
                        <div>
                          <div 
                            className="text-sm font-bold mb-2"
                            style={{
                              color: '#FFD700',
                              textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                            }}
                          >
                            ⚙️ PARSED DECISION:
                          </div>
                          <pre 
                            className="text-xs p-3 rounded overflow-x-auto"
                            style={{
                              background: 'rgba(0, 0, 0, 0.8)',
                              border: '1px solid #00ff41',
                              color: '#00ff41',
                              fontFamily: 'monospace'
                            }}
                          >
                            {JSON.stringify(response.response.parsed, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center gap-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg font-bold text-sm"
                    style={{
                      background: currentPage === 1 ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                      border: '2px solid #D4AF37',
                      color: currentPage === 1 ? '#8B4513' : '#FFD700',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: currentPage === 1 ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.8)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ◀ Previous
                  </button>

                  {/* Page Numbers */}
                  <div 
                    className="flex gap-2"
                    style={{
                      fontFamily: 'monospace',
                      color: '#FFD700'
                    }}
                  >
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10 rounded-lg font-bold text-sm"
                          style={{
                            background: currentPage === pageNum 
                              ? 'linear-gradient(135deg, #FFD700, #D4AF37)'
                              : 'rgba(212, 175, 55, 0.2)',
                            border: `2px solid ${currentPage === pageNum ? '#FFD700' : '#D4AF37'}`,
                            color: currentPage === pageNum ? '#000' : '#FFD700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.4)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNum) {
                              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                            }
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg font-bold text-sm"
                    style={{
                      background: currentPage === totalPages ? 'rgba(139, 69, 19, 0.5)' : 'linear-gradient(135deg, #CD7F32, #8B6914)',
                      border: '2px solid #D4AF37',
                      color: currentPage === totalPages ? '#8B4513' : '#FFD700',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: currentPage === totalPages ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.8)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div 
          className="p-4 flex justify-center gap-6 text-sm"
          style={{
            background: 'linear-gradient(to top, rgba(139, 69, 19, 0.9), rgba(101, 67, 33, 0.7))',
            borderTop: '3px solid #D4AF37',
            fontFamily: 'monospace'
          }}
        >
          <div style={{ color: '#FFD700' }}>
            Total Responses: <strong>{responses.length}</strong>
          </div>
          <div style={{ color: '#00ff41' }}>
            Successful: <strong>{responses.filter(r => r.response.success).length}</strong>
          </div>
          <div style={{ color: '#ff006e' }}>
            Errors: <strong>{responses.filter(r => !r.response.success).length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
