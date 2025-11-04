import React from 'react';

interface FuelMeterProps {
  currentProfit: number;
  targetProfit?: number;
  winningTrades: number;
}

export const FuelMeter: React.FC<FuelMeterProps> = ({
  currentProfit,
  targetProfit = 1000,
  winningTrades,
}) => {
  const percentage = Math.min(Math.max((currentProfit / targetProfit) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const getFuelColor = () => {
    if (percentage >= 75) return 'from-green-400 to-green-600';
    if (percentage >= 50) return 'from-yellow-400 to-orange-500';
    if (percentage >= 25) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-4 border-purple-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
          🚀 Rocket Fuel
        </h2>
        <div className="text-right">
          <div className="text-sm text-gray-600">Mission Progress</div>
          <div className="text-2xl font-bold text-purple-600">{percentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* Fuel Tank Visualization */}
      <div className="relative">
        {/* Rocket */}
        <div className="absolute -top-12 right-4 text-6xl transform rotate-45" style={{ 
          transform: isComplete ? 'translateY(-20px) rotate(45deg) scale(1.2)' : 'rotate(45deg)',
          transition: 'all 0.5s ease-out'
        }}>
          🚀
        </div>

        {/* Fuel Tank */}
        <div className="relative h-64 w-24 mx-auto bg-gray-200 rounded-full border-4 border-gray-400 overflow-hidden shadow-inner">
          {/* Fuel Level */}
          <div
            className={`absolute bottom-0 w-full bg-gradient-to-t ${getFuelColor()} fuel-bar transition-all duration-500`}
            style={{ height: `${percentage}%` }}
          >
            {/* Fuel shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>

          {/* Tank markings */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 px-1 pointer-events-none">
            {[100, 75, 50, 25, 0].map((mark) => (
              <div key={mark} className="flex items-center">
                <div className="w-2 h-0.5 bg-gray-600"></div>
                <span className="text-[10px] text-gray-700 font-bold ml-1">{mark}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Labels */}
        <div className="text-center mt-4">
          <div className="text-lg font-bold text-gray-700">
            ${currentProfit.toFixed(2)} / ${targetProfit.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            🏆 {winningTrades} winning trades
          </div>
        </div>
      </div>

      {/* Mission Status */}
      <div className="mt-6 p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
        {isComplete ? (
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="font-bold text-green-600 text-lg">MISSION COMPLETE!</div>
            <div className="text-sm text-gray-600 mt-1">Ready to reach the moon! 🌙</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="font-semibold text-purple-700">
              {percentage < 25 && '📊 Just getting started...'}
              {percentage >= 25 && percentage < 50 && '💪 Making progress!'}
              {percentage >= 50 && percentage < 75 && '🔥 Halfway there!'}
              {percentage >= 75 && percentage < 100 && '🌟 Almost ready!'}
            </div>
            <div className="text-xs text-gray-600 mt-2">
              ${(targetProfit - currentProfit).toFixed(2)} more to reach the moon
            </div>
          </div>
        )}
      </div>

      {/* Fuel drops animation when winning */}
      {winningTrades > 0 && (
        <div className="absolute top-4 left-4">
          <div className="text-2xl animate-bounce">⛽</div>
        </div>
      )}
    </div>
  );
};
