import React, { useEffect, useState, useRef } from 'react';
import { PandaCharacter, PandaEmotion } from './components/PandaCharacter';
import { BelovedPanda } from './components/BelovedPanda';
import { FuelMeter } from './components/FuelMeter';
import { HeartAnimation, useHeartRate } from './components/HeartAnimation';
import { CloudPriceDisplay } from './components/CloudPriceDisplay';
import { SafeBox } from './components/SafeBox';
import { TradesModal } from './components/TradesModal';
import { OpenPositionsBoard } from './components/OpenPositionsBoard';
import { StreetBillboard } from './components/StreetBillboard';
import { AIResponsesLog } from './components/AIResponsesLog';
import { ChineseCard } from './components/ChineseCard';
import { MusicPlayer } from './components/MusicPlayer';
import { AboutModal } from './components/AboutModal';
import { useTradingData, useTotalProfit } from './hooks/useTradingData';
import { useTradingActivity } from './hooks/useTradingActivity';
import { useSoundEffect } from './hooks/useSoundEffect';

function App() {
  const { positions, trades, account, prices, isLoading, error } = useTradingData();
  const { totalProfit, totalFees, netProfit, winningTrades, losingTrades, winRate } = useTotalProfit(trades);
  const { getPositionPhrase, getRecentTradePhrase } = useTradingActivity();
  const { playCoinSound, playWorkshopSound } = useSoundEffect();
  const [pandaEmotion, setPandaEmotion] = useState<PandaEmotion>('neutral');
  const [lastTradeCount, setLastTradeCount] = useState(0);
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [showAIBillboard, setShowAIBillboard] = useState(false);
  const [showAIResponsesLog, setShowAIResponsesLog] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const pandaRef = useRef<HTMLDivElement>(null);
  const belovedRef = useRef<HTMLDivElement>(null);
  const [pandaPosition, setPandaPosition] = useState({ x: 0, y: 0 });
  const [belovedPosition, setBelovedPosition] = useState({ x: 0, y: 0 });

  // Calculate heart rate based on profit and win rate
  const heartRate = useHeartRate(totalProfit, winRate);

  // Update positions for heart animation
  useEffect(() => {
    if (pandaRef.current) {
      const rect = pandaRef.current.getBoundingClientRect();
      setPandaPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    if (belovedRef.current) {
      const rect = belovedRef.current.getBoundingClientRect();
      setBelovedPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  }, []);

  // Determine panda emotion based on recent trades and performance
  useEffect(() => {
    // Count LONG vs SHORT positions
    const longPositions = positions.filter(p => p.side && p.side.toUpperCase() === 'LONG').length;
    const shortPositions = positions.filter(p => p.side && p.side.toUpperCase() === 'SHORT').length;
    
    // Check for new trades
    if (trades.length > lastTradeCount) {
      const latestTrade = trades[0]; // Most recent trade
      
      if (latestTrade.pnl > 0) {
        // Winning trade!
        if (latestTrade.pnlPercent > 10) {
          setPandaEmotion('excited'); // Big win!
        } else {
          setPandaEmotion('happy'); // Normal win
        }
        
        // Return to appropriate emotion after celebration
        setTimeout(() => {
          if (longPositions > shortPositions) {
            setPandaEmotion('laser'); // More LONG = laser eyes
          } else if (shortPositions > longPositions) {
            setPandaEmotion('tears'); // More SHORT = tears
          } else if (totalProfit > 500) {
            setPandaEmotion('love');
          } else {
            setPandaEmotion('happy');
          }
        }, 3000);
      } else {
        // Losing trade
        setPandaEmotion('sad');
        
        // Recover to appropriate emotion
        setTimeout(() => {
          if (longPositions > shortPositions) {
            setPandaEmotion('laser'); // More LONG = laser eyes
          } else if (shortPositions > longPositions) {
            setPandaEmotion('tears'); // More SHORT = tears
          } else {
            setPandaEmotion('neutral');
          }
        }, 3000);
      }
      
      setLastTradeCount(trades.length);
    } else if (trades.length === lastTradeCount && trades.length > 0) {
      // No new trades, determine emotion based on position balance first
      if (longPositions > shortPositions) {
        setPandaEmotion('laser'); // More LONG positions = laser eyes (hodling!)
      } else if (shortPositions > longPositions) {
        setPandaEmotion('tears'); // More SHORT positions = tears (bearish)
      } else if (totalProfit > 750) {
        setPandaEmotion('love'); // Very close to goal
      } else if (totalProfit > 500) {
        setPandaEmotion('excited'); // Making great progress
      } else if (winRate > 70 && totalProfit > 0) {
        setPandaEmotion('happy'); // Good win rate
      } else if (totalProfit < 0) {
        setPandaEmotion('sad'); // Losing overall
      } else {
        setPandaEmotion('neutral'); // Neutral state
      }
    } else if (positions.length > 0) {
      // Has positions but no trades yet - check position balance
      if (longPositions > shortPositions) {
        setPandaEmotion('laser'); // More LONG = laser eyes
      } else if (shortPositions > longPositions) {
        setPandaEmotion('tears'); // More SHORT = tears
      } else {
        setPandaEmotion('neutral');
      }
    }
  }, [trades, totalProfit, winRate, lastTradeCount, positions]);

  // Generate stars for background
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl font-bold">
          <div className="text-6xl mb-4 animate-bounce">🐼</div>
          Loading Panda Love Story...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500 text-white p-8 rounded-lg shadow-2xl">
          <div className="text-6xl mb-4">😢</div>
          <div className="text-xl font-bold">Error: {error}</div>
          <div className="text-sm mt-2">Please check your connection</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Starry background */}
      <div className="fixed inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Heart animations - kisses from beloved to trading panda */}
      <HeartAnimation
        heartRate={heartRate}
        fromPosition={belovedPosition}
        toPosition={pandaPosition}
        accountBalance={account.availableCash}
      />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="text-center pt-8 pb-4 relative">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-2">
            🐼 Panda Love Trading 💕
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Help our Panda reach the moon to meet his beloved!
          </p>
          
          {/* Open Positions Button - Floating Left */}
          <button
            onClick={() => setShowAIBillboard(true)}
            className="absolute top-4 left-4 px-6 py-3 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #8B4513, #654321)',
              border: '3px solid #D4AF37',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.6), 0 0 50px rgba(212, 175, 55, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div className="flex flex-col items-start">
                <span 
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'serif',
                    color: '#D4AF37',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                    letterSpacing: '0.1em'
                  }}
                >
                  开放仓位
                </span>
                <span 
                  className="text-xs"
                  style={{
                    fontFamily: 'monospace',
                    color: '#FFD700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                    letterSpacing: '0.15em'
                  }}
                >
                  OPEN POSITIONS
                </span>
              </div>
            </div>
          </button>

          {/* About Button - Floating Left Below */}
          <button
            onClick={() => setShowAbout(true)}
            className="absolute left-4 px-6 py-3 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-200"
            style={{
              top: '7.5rem',
              background: 'linear-gradient(135deg, #8B4513, #654321)',
              border: '3px solid #D4AF37',
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.6), 0 0 50px rgba(212, 175, 55, 0.3)'
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">ℹ️</span>
              <div className="flex flex-col items-start">
                <span 
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'serif',
                    color: '#D4AF37',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                    letterSpacing: '0.1em'
                  }}
                >
                  关于我们
                </span>
                <span 
                  className="text-xs"
                  style={{
                    fontFamily: 'monospace',
                    color: '#FFD700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                    letterSpacing: '0.15em'
                  }}
                >
                  ABOUT
                </span>
              </div>
            </div>
          </button>
        </header>

        {/* Main grid layout */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left: Trading Panda */}
            <div className="flex flex-col items-center space-y-6">
              <ChineseCard chineseTitle="交易熊猫" title="TRADING PANDA">
                <div ref={pandaRef} className="flex flex-col items-center">
                  <PandaCharacter emotion={pandaEmotion} size={250} isTrading={true} />
                  <div className="mt-4 w-full space-y-3">
                    <div 
                      className="rounded-lg p-3"
                      style={{
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '2px solid rgba(212, 175, 55, 0.4)'
                      }}
                    >
                      <div 
                        className="text-xs font-semibold text-center"
                        style={{
                          color: '#FFD700',
                          textShadow: '0 0 8px rgba(255, 215, 0, 0.6)'
                        }}
                      >
                        CURRENT ACTIVITY
                      </div>
                      <div 
                        className="text-sm font-bold text-center mt-1"
                        style={{
                          color: '#ffffff',
                          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                        }}
                      >
                        {getPositionPhrase()}
                      </div>
                    </div>
                    {getRecentTradePhrase() && (
                      <div 
                        className="rounded-lg p-3 animate-bounce"
                        style={{
                          background: getRecentTradePhrase().includes('happy') || getRecentTradePhrase().includes('Ez') 
                            ? 'rgba(0, 255, 65, 0.2)' 
                            : 'rgba(255, 0, 110, 0.2)',
                          border: `2px solid ${getRecentTradePhrase().includes('happy') || getRecentTradePhrase().includes('Ez') ? '#00ff41' : '#ff006e'}`
                        }}
                      >
                        <div 
                          className="text-sm font-bold text-center"
                          style={{
                            color: getRecentTradePhrase().includes('happy') || getRecentTradePhrase().includes('Ez') ? '#00ff41' : '#ff006e',
                            textShadow: `0 0 10px ${getRecentTradePhrase().includes('happy') || getRecentTradePhrase().includes('Ez') ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                          }}
                        >
                          {getRecentTradePhrase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ancient Chinese Wealth Symbol Button - Below Panda's Feet */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => {
                        console.log('🎯 Button clicked! Playing workshop sound...');
                        playWorkshopSound(); // Ancient Chinese production sound
                        setShowAIBillboard(true);
                      }}
                      className="relative group"
                      style={{
                        width: '160px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
                        border: '4px solid #D4AF37',
                        borderRadius: '12px',
                        boxShadow: `
                          0 0 20px rgba(212, 175, 55, 0.4),
                          inset 0 0 30px rgba(0, 0, 0, 0.4),
                          0 10px 30px rgba(0, 0, 0, 0.6)
                        `,
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                        e.currentTarget.style.boxShadow = `
                          0 0 30px rgba(212, 175, 55, 0.6),
                          inset 0 0 40px rgba(0, 0, 0, 0.5),
                          0 15px 40px rgba(0, 0, 0, 0.7)
                        `;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = `
                          0 0 20px rgba(212, 175, 55, 0.4),
                          inset 0 0 30px rgba(0, 0, 0, 0.4),
                          0 10px 30px rgba(0, 0, 0, 0.6)
                        `;
                      }}
                    >
                      {/* Decorative top border - matching card */}
                      <div 
                        className="absolute top-0 left-0 right-0 h-1.5"
                        style={{
                          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 8px, #8B4513 8px, #8B4513 16px)',
                          boxShadow: '0 1px 6px rgba(212, 175, 55, 0.6)'
                        }}
                      />

                      {/* Corner ornaments - matching card style */}
                      <div 
                        className="absolute top-2 left-2 text-yellow-500 opacity-40"
                        style={{ fontSize: '0.8rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                      >
                        ◈
                      </div>
                      <div 
                        className="absolute top-2 right-2 text-yellow-500 opacity-40"
                        style={{ fontSize: '0.8rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                      >
                        ◈
                      </div>
                      <div 
                        className="absolute bottom-2 left-2 text-yellow-500 opacity-40"
                        style={{ fontSize: '0.8rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                      >
                        ◈
                      </div>
                      <div 
                        className="absolute bottom-2 right-2 text-yellow-500 opacity-40"
                        style={{ fontSize: '0.8rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                      >
                        ◈
                      </div>

                      {/* Main content */}
                      <div 
                        className="relative z-10 flex flex-col items-center justify-center h-full"
                        style={{
                          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.5), rgba(101, 67, 33, 0.3))'
                        }}
                      >
                        {/* Chinese coin with Pixiu symbol */}
                        <div 
                          className="text-2xl mb-0.5"
                          style={{
                            filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))'
                          }}
                        >
                          🪙
                        </div>
                        
                        {/* 招财进宝 - Attracts Wealth and Treasure */}
                        <div 
                          style={{
                            fontFamily: 'serif',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: '#D4AF37',
                            textShadow: `
                              0 0 12px rgba(212, 175, 55, 0.8),
                              0 0 24px rgba(212, 175, 55, 0.4),
                              1px 1px 3px rgba(0, 0, 0, 0.8)
                            `,
                            letterSpacing: '0.15em',
                            lineHeight: '1.2'
                          }}
                        >
                          招财进宝
                        </div>
                        
                        {/* English subtitle */}
                        <div 
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '7px',
                            color: '#FFD700',
                            textShadow: '0 0 8px rgba(255, 215, 0, 0.7)',
                            letterSpacing: '0.2em',
                            marginTop: '2px'
                          }}
                        >
                          VIEW POSITIONS
                        </div>
                      </div>

                      {/* Decorative bottom border - matching card */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-1.5"
                        style={{
                          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 8px, #8B4513 8px, #8B4513 16px)',
                          boxShadow: '0 -1px 6px rgba(212, 175, 55, 0.6)'
                        }}
                      />

                      {/* Scanline effect - matching card */}
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.05) 2px, rgba(0, 0, 0, 0.05) 4px)',
                          borderRadius: '12px'
                        }}
                      />

                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.8), transparent 60%)'
                        }}
                      />
                    </button>
                  </div>
                </div>
              </ChineseCard>

              {/* Safe Box for Balance */}
              <SafeBox balance={account.totalWalletBalance} />

              {/* Account stats */}
              <ChineseCard chineseTitle="交易统计" title="TRADING STATS" className="w-full">
                <div className="space-y-3">
                  <div 
                    className="flex justify-between p-2 rounded"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <span 
                      className="text-sm"
                      style={{
                        color: '#FFD700',
                        textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      Total PnL:
                    </span>
                    <span 
                      className="font-bold text-lg"
                      style={{
                        color: totalProfit >= 0 ? '#00ff41' : '#ff006e',
                        textShadow: `0 0 10px ${totalProfit >= 0 ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 110, 0.8)'}`
                      }}
                    >
                      ${totalProfit.toFixed(2)}
                    </span>
                  </div>
                  <div 
                    className="flex justify-between p-2 rounded"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <span 
                      className="text-sm"
                      style={{
                        color: '#FFD700',
                        textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      Positions:
                    </span>
                    <span 
                      className="font-bold"
                      style={{
                        color: '#ffffff',
                        textShadow: '0 0 8px rgba(255, 255, 255, 0.6)'
                      }}
                    >
                      {positions.length}/10
                    </span>
                  </div>
                  <div 
                    className="flex justify-between p-2 rounded"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <span 
                      className="text-sm"
                      style={{
                        color: '#FFD700',
                        textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      Win Rate:
                    </span>
                    <span 
                      className="font-bold"
                      style={{
                        color: winRate >= 50 ? '#00ff41' : '#ffaa00',
                        textShadow: `0 0 8px ${winRate >= 50 ? 'rgba(0, 255, 65, 0.6)' : 'rgba(255, 170, 0, 0.6)'}`
                      }}
                    >
                      {winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div 
                    className="flex justify-between p-2 rounded"
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <span 
                      className="text-sm"
                      style={{
                        color: '#FFD700',
                        textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
                      }}
                    >
                      Trades:
                    </span>
                    <span 
                      className="text-sm font-bold"
                      style={{
                        color: '#ffffff',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      {winningTrades}W / {losingTrades}L
                    </span>
                  </div>
                </div>
              </ChineseCard>
            </div>

            {/* Center: Rocket Fuel Meter */}
            <div className="flex justify-center">
              <FuelMeter
                currentProfit={netProfit}
                targetProfit={1000}
                winningTrades={winningTrades}
              />
            </div>

            {/* Right: Beloved Panda on Moon */}
            <div className="flex justify-center lg:justify-end">
              <div ref={belovedRef}>
                <BelovedPanda size={250} showWave={true} />
              </div>
            </div>
          </div>

          {/* AI Street Billboard - Below Rocket */}
          <div className="mt-8">
            <StreetBillboard onViewLog={() => setShowAIResponsesLog(true)} />
          </div>

          {/* Crypto Prices as Clouds */}
          <div className="mt-12">
            <CloudPriceDisplay prices={prices} />
          </div>

          {/* Recent Trades */}
          <div className="mt-12">
            <ChineseCard chineseTitle="最近交易" title="RECENT TRADES">
              <div className="p-2">
            <div 
              className="overflow-x-auto rounded-lg"
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
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
                  {[...trades].sort((a, b) => {
                    // Multi-criteria sorting for stable, chronological order
                    // 1. Primary: Most recently closed first
                    const closedDiff = (b.closedAt || 0) - (a.closedAt || 0);
                    if (closedDiff !== 0) return closedDiff;
                    
                    // 2. Secondary: If closed at same time, most recently opened first
                    const openedDiff = (b.openedAt || 0) - (a.openedAt || 0);
                    if (openedDiff !== 0) return openedDiff;
                    
                    // 3. Tertiary: Alphabetical by symbol for stable sort
                    return (a.symbol || '').localeCompare(b.symbol || '');
                  }).slice(0, 10).map((trade, idx) => (
                    <tr 
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                        background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 69, 19, 0.2)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(139, 69, 19, 0.2)';
                      }}
                    >
                      <td 
                        className="p-3 font-bold"
                        style={{
                          color: '#ffffff',
                          textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                          fontSize: '0.95rem'
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
                          opacity: 0.8
                        }}
                      >
                        ${(trade.fee || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trades.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No trades yet. Start trading to help Panda! 🐼
                </div>
              )}
            </div>
            
            {/* View All Trades Button */}
            {trades.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAllTrades(true)}
                  className="px-6 py-3 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #CD7F32 50%, #8B6914 100%)',
                    border: '3px solid #D4AF37',
                    color: '#FFD700',
                    fontFamily: 'serif',
                    letterSpacing: '0.1em',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.8), 0 6px 12px rgba(0, 0, 0, 0.4)';
                    e.currentTarget.style.textShadow = '0 0 15px rgba(255, 215, 0, 1), 0 2px 4px rgba(0, 0, 0, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.textShadow = '0 0 10px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.5)';
                  }}
                >
                  📊 交易记录 • View All {trades.length} Trades
                </button>
                <p 
                  className="text-xs mt-2"
                  style={{
                    color: '#D4AF37',
                    fontFamily: 'monospace',
                    textShadow: '0 0 5px rgba(212, 175, 55, 0.6)',
                    opacity: 0.8
                  }}
                >
                  Showing {Math.min(10, trades.length)} most recent • Click to see complete trading history
                </p>
              </div>
            )}
              </div>
            </ChineseCard>
          </div>
        </div>

        {/* Trades Modal */}
        <TradesModal 
          open={showAllTrades} 
          onOpenChange={setShowAllTrades} 
          trades={trades} 
        />

        {/* Open Positions Board Modal */}
        <OpenPositionsBoard 
          open={showAIBillboard} 
          onOpenChange={setShowAIBillboard} 
        />

        {/* AI Responses Log Modal */}
        <AIResponsesLog 
          open={showAIResponsesLog} 
          onOpenChange={setShowAIResponsesLog} 
        />

        {/* About Modal */}
        <AboutModal 
          open={showAbout} 
          onOpenChange={setShowAbout} 
        />

        {/* Footer */}
        <footer className="text-center py-8 text-white/80">
          <p className="text-sm">
            🚀 Mission: Reach $1000 profit to send Panda to the moon! 🌙
          </p>
          <p className="text-xs mt-2">
            Trading on Asterdex • Powered by DeepSeek AI
          </p>
        </footer>
      </div>

      {/* Floating Music Player */}
      <MusicPlayer />
    </div>
  );
}

export default App;
