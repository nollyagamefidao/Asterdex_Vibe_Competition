import React, { useEffect, useState } from 'react';

interface AIDecision {
  id: number;
  timestamp: number;
  type: string;
  coin: string;
  action: string;
  confidence: number;
  reasoning: string;
  result: string;
  price: number;
  scannerScore: number;
  pnl?: number;
  pnlPercent?: number;
}

interface PandaDiaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PandaDiary: React.FC<PandaDiaryProps> = ({ open, onOpenChange }) => {
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    if (open) {
      fetchDecisions();
    }
  }, [open]);

  const fetchDecisions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat-messages');
      const data = await response.json();
      setDecisions(data);
    } catch (error) {
      console.error('Failed to fetch AI decisions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const totalPages = Math.ceil(decisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDecisions = decisions.slice(startIndex, endIndex);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getActionText = (action: string, coin: string) => {
    switch (action.toUpperCase()) {
      case 'LONG':
        return `DeepSeek recommending to go LONG on ${coin}`;
      case 'SHORT':
        return `DeepSeek recommending to go SHORT on ${coin}`;
      case 'HOLD':
        return `DeepSeek recommending to HOLD positions`;
      case 'CLOSE':
        return `DeepSeek recommending to CLOSE ${coin} position`;
      default:
        return `DeepSeek recommending to ${action} ${coin}`;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LONG':
        return 'text-green-700 bg-green-50 border-green-300';
      case 'SHORT':
        return 'text-red-700 bg-red-50 border-red-300';
      case 'HOLD':
        return 'text-blue-700 bg-blue-50 border-blue-300';
      case 'CLOSE':
        return 'text-orange-700 bg-orange-50 border-orange-300';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         onClick={() => onOpenChange(false)}>
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border-4 border-amber-900"
           onClick={(e) => e.stopPropagation()}
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.7, 0 0 0 0 0.6, 0 0 0 0 0.5, 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
             backgroundSize: '200px 200px'
           }}>
        
        {/* Header with Chinese style */}
        <div className="relative bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white p-6 border-b-4 border-amber-900">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🐼</div>
              <div>
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'serif' }}>
                  熊猫日记
                </h2>
                <p className="text-lg text-yellow-200">Panda's Trading Diary</p>
                <p className="text-sm text-yellow-300 mt-1">📜 DeepSeek AI Wisdom Chronicle</p>
              </div>
            </div>
            
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-yellow-300 transition-colors text-3xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"></div>
        </div>

        {/* Content - Papyrus style */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" 
             style={{ 
               backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(139, 69, 19, .05) 25%, rgba(139, 69, 19, .05) 26%, transparent 27%, transparent 74%, rgba(139, 69, 19, .05) 75%, rgba(139, 69, 19, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(139, 69, 19, .05) 25%, rgba(139, 69, 19, .05) 26%, transparent 27%, transparent 74%, rgba(139, 69, 19, .05) 75%, rgba(139, 69, 19, .05) 76%, transparent 77%, transparent)',
               backgroundSize: '50px 50px'
             }}>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🐼</div>
              <p className="text-xl text-amber-900 font-bold">Loading diary entries...</p>
            </div>
          ) : decisions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-xl text-amber-900 font-bold">No entries yet</p>
              <p className="text-gray-600 mt-2">The panda is waiting for trading wisdom...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentDecisions.map((decision, index) => (
                <div key={decision.id} 
                     className="bg-amber-50/80 backdrop-blur-sm rounded-lg border-2 border-amber-800 shadow-lg overflow-hidden transform hover:scale-[1.02] transition-transform">
                  
                  {/* Entry number and date - Chinese style */}
                  <div className="bg-gradient-to-r from-red-800 to-red-900 px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-300 text-lg font-bold">
                        第 {startIndex + index + 1} 章
                      </span>
                      <span className="text-white text-sm">
                        Entry #{startIndex + index + 1}
                      </span>
                    </div>
                    <span className="text-yellow-200 text-sm">
                      🕐 {formatTimestamp(decision.timestamp)}
                    </span>
                  </div>

                  {/* Action recommendation - highlighted */}
                  <div className={`px-4 py-3 border-b-2 border-amber-200 ${getActionColor(decision.action)}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🤖</span>
                      <div>
                        <p className="text-lg font-bold">
                          {getActionText(decision.action, decision.coin)}
                        </p>
                        {/* Only show confidence if it's meaningful (not for position closes) */}
                        {decision.type !== 'position_close' && decision.confidence > 0 && decision.confidence < 1 ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold">Confidence:</span>
                            <div className="flex-1 bg-white/50 rounded-full h-2 w-32">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                style={{ width: `${decision.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold">{(decision.confidence * 100).toFixed(0)}%</span>
                          </div>
                        ) : decision.type === 'position_close' ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-gray-500 italic">No AI Confidence data</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💭</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Reasoning:</p>
                        <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'serif' }}>
                          {decision.reasoning}
                        </p>
                      </div>
                    </div>

                    {/* Additional details */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      {decision.price > 0 && (
                        <div className="bg-white/50 rounded p-2">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold ml-2">${decision.price.toFixed(2)}</span>
                        </div>
                      )}
                      {decision.scannerScore > 0 && (
                        <div className="bg-white/50 rounded p-2">
                          <span className="text-gray-600">Scanner Score:</span>
                          <span className="font-bold ml-2">{decision.scannerScore}/100</span>
                        </div>
                      )}
                      <div className="bg-white/50 rounded p-2">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-bold ml-2 capitalize">{decision.type}</span>
                      </div>
                      <div className="bg-white/50 rounded p-2">
                        <span className="text-gray-600">Result:</span>
                        {decision.pnl !== undefined ? (
                          <span className={`font-bold ml-2 capitalize ${decision.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {decision.result} ({decision.pnl >= 0 ? '+' : ''}${decision.pnl.toFixed(2)})
                          </span>
                        ) : (
                          <span className="font-bold ml-2 capitalize">{decision.result}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination - Chinese style */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 px-6 py-4 border-t-4 border-amber-900">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-yellow-300 font-bold text-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-white text-sm">
                  ({decisions.length} total entries)
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
