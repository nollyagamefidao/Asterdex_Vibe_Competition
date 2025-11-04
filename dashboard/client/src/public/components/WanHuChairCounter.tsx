import React from 'react';

interface WanHuChairCounterProps {
  currentProfit: number;
  targetProfit?: number;
  winningTrades: number;
}

export const WanHuChairCounter: React.FC<WanHuChairCounterProps> = ({
  currentProfit,
  targetProfit = 470, // 47 chairs × $10 = $470
  winningTrades,
}) => {
  const MAX_CHAIRS = 47; // Wan Hu legend: 47 chairs needed
  const PROFIT_PER_CHAIR = 10; // Each $10 profit = 1 chair
  
  // Calculate how many chairs we have (each $10 profit = 1 chair)
  const chairsObtained = Math.floor(currentProfit / PROFIT_PER_CHAIR);
  const chairsNeeded = Math.max(0, MAX_CHAIRS - chairsObtained);
  const percentage = Math.min((chairsObtained / MAX_CHAIRS) * 100, 100);
  const isComplete = chairsObtained >= MAX_CHAIRS;
  
  // Create array of all chairs (simple flat array)
  const allChairs = Array.from({ length: MAX_CHAIRS }, (_, i) => i);
  
  return (
    <div 
      className="rounded-2xl p-6 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
        border: '6px solid #D4AF37',
        boxShadow: `
          0 0 30px rgba(212, 175, 55, 0.6),
          inset 0 0 40px rgba(0, 0, 0, 0.5),
          0 15px 40px rgba(0, 0, 0, 0.7)
        `
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
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
            🪑 万户飞天
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
            WAN HU'S MOON ROCKET
          </p>
        </div>
        <div className="text-right">
          <div 
            className="text-sm"
            style={{
              color: '#FFD700',
              textShadow: '0 0 5px rgba(255, 215, 0, 0.6)'
            }}
          >
            PROGRESS
          </div>
          <div 
            className="text-3xl font-bold"
            style={{
              color: '#D4AF37',
              textShadow: '0 0 15px rgba(212, 175, 55, 0.8)'
            }}
          >
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Wan Hu's Rocket Setup Visualization */}
      <div className="relative">
        {/* Ancient Wan Hu (pixel art panda) on top */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10">
          <div 
            className="text-6xl"
            style={{
              transform: isComplete ? 'translateY(-30px) scale(1.2)' : 'none',
              transition: 'all 0.8s ease-out',
              filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))'
            }}
          >
            {isComplete ? '🚀' : '🐼'}
          </div>
        </div>

        {/* Chair Stack Container */}
        <div 
          className="relative rounded-lg p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '3px solid #D4AF37',
            minHeight: '320px'
          }}
        >
          {/* Chair Grid - Simple grid layout */}
          <div className="flex flex-wrap items-center justify-center min-h-[280px] gap-1 p-4">
            {allChairs.map((chairNumber) => {
              const isObtained = chairNumber < chairsObtained;
              
              return (
                <div
                  key={chairNumber}
                  className="transition-all duration-300"
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    filter: isObtained 
                      ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))' 
                      : 'grayscale(100%) opacity(0.3)',
                    transform: isObtained ? 'scale(1)' : 'scale(0.8)',
                    animation: isObtained && chairNumber === chairsObtained - 1 
                      ? 'chairPop 0.5s ease-out' 
                      : 'none'
                  }}
                >
                  🪑
                </div>
              );
            })}
          </div>

          {/* Fireworks/Rockets Base */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-2">
            {[...Array(Math.min(chairsObtained, 10))].map((_, i) => (
              <span 
                key={i} 
                className="text-xl animate-pulse"
                style={{
                  opacity: 0.6 + (i * 0.04),
                  animationDelay: `${i * 0.1}s`
                }}
              >
                🎆
              </span>
            ))}
          </div>
        </div>

        {/* Stats Display */}
        <div 
          className="mt-4 p-4 rounded-lg"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid #D4AF37'
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div 
                className="text-3xl font-bold"
                style={{
                  color: '#00ff41',
                  textShadow: '0 0 15px rgba(0, 255, 65, 0.8)'
                }}
              >
                {chairsObtained}
              </div>
              <div 
                className="text-xs mt-1"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace',
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.6)'
                }}
              >
                CHAIRS READY
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-3xl font-bold"
                style={{
                  color: '#ff006e',
                  textShadow: '0 0 15px rgba(255, 0, 110, 0.8)'
                }}
              >
                {chairsNeeded}
              </div>
              <div 
                className="text-xs mt-1"
                style={{
                  color: '#FFD700',
                  fontFamily: 'monospace',
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.6)'
                }}
              >
                MORE NEEDED
              </div>
            </div>
          </div>

          <div 
            className="mt-3 text-center text-sm"
            style={{
              color: '#D4AF37',
              fontFamily: 'monospace'
            }}
          >
            ${currentProfit.toFixed(2)} / ${targetProfit.toFixed(2)} • 🏆 {winningTrades}W
          </div>
        </div>
      </div>

      {/* Mission Status */}
      <div 
        className="mt-4 p-4 rounded-lg"
        style={{
          background: isComplete 
            ? 'linear-gradient(135deg, rgba(0, 255, 65, 0.2), rgba(0, 200, 50, 0.3))' 
            : 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(139, 69, 19, 0.3))',
          border: `2px solid ${isComplete ? '#00ff41' : '#D4AF37'}`
        }}
      >
        {isComplete ? (
          <div className="text-center">
            <div className="text-4xl mb-2">🎉🚀✨</div>
            <div 
              className="font-bold text-lg mb-1"
              style={{
                color: '#00ff41',
                textShadow: '0 0 15px rgba(0, 255, 65, 0.8)'
              }}
            >
              万户成功！LIFTOFF!
            </div>
            <div 
              className="text-sm"
              style={{
                color: '#FFD700',
                fontFamily: 'monospace'
              }}
            >
              All 47 chairs assembled! Ready for moon! 🌙
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div 
              className="font-semibold mb-2"
              style={{
                color: '#FFD700',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
              }}
            >
              {percentage < 25 && '🔨 Gathering chairs for the journey...'}
              {percentage >= 25 && percentage < 50 && '🪑 Quarter of chairs ready!'}
              {percentage >= 50 && percentage < 75 && '⚡ Halfway to launch!'}
              {percentage >= 75 && percentage < 100 && '🔥 Almost enough chairs!'}
            </div>
            <div 
              className="text-xs mt-2"
              style={{
                color: '#D4AF37',
                fontFamily: 'monospace'
              }}
            >
              {chairsNeeded} more chairs (${(chairsNeeded * PROFIT_PER_CHAIR).toFixed(0)}) to reach the moon
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div 
        className="mt-3 p-3 rounded-lg text-xs text-center"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          color: '#D4AF37',
          fontFamily: 'monospace',
          lineHeight: '1.5'
        }}
      >
        📜 Wan Hu Legend: Chinese official tried to reach moon with 47 chairs + 47 rockets in 16th century 🚀<br/>
        Each $10 profit = 1 chair • Collect 47 chairs to launch! 🌙
      </div>

      <style>{`
        @keyframes chairPop {
          0% {
            transform: scale(0);
            filter: drop-shadow(0 0 0px rgba(212, 175, 55, 0));
          }
          50% {
            transform: scale(1.3);
            filter: drop-shadow(0 0 15px rgba(212, 175, 55, 1));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.8));
          }
        }
      `}</style>
    </div>
  );
};
