import React, { useState, useRef, useEffect } from 'react';

interface SafeBoxProps {
  balance: number;
}

export const SafeBox: React.FC<SafeBoxProps> = ({ balance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [combination, setCombination] = useState<number[]>([0, 0, 0]);
  const [targetCombination, setTargetCombination] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Chinese numbers (0-9)
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  useEffect(() => {
    // Create ancient Chinese chest opening sound - wooden creak + bronze lock clink
    const createChestSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      return () => {
        const now = audioContext.currentTime;
        
        // Bronze lock clink (metallic sound)
        const lockOscillator = audioContext.createOscillator();
        const lockGain = audioContext.createGain();
        lockOscillator.type = 'sine';
        lockOscillator.frequency.setValueAtTime(1200, now);
        lockOscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        lockGain.gain.setValueAtTime(0.2, now);
        lockGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        lockOscillator.connect(lockGain);
        lockGain.connect(audioContext.destination);
        lockOscillator.start(now);
        lockOscillator.stop(now + 0.2);
        
        // Wooden chest creak
        const woodOscillator = audioContext.createOscillator();
        const woodGain = audioContext.createGain();
        woodOscillator.type = 'sawtooth';
        woodOscillator.frequency.setValueAtTime(180, now + 0.1);
        woodOscillator.frequency.linearRampToValueAtTime(140, now + 0.5);
        woodGain.gain.setValueAtTime(0, now + 0.1);
        woodGain.gain.linearRampToValueAtTime(0.15, now + 0.15);
        woodGain.gain.linearRampToValueAtTime(0, now + 0.5);
        woodOscillator.connect(woodGain);
        woodGain.connect(audioContext.destination);
        woodOscillator.start(now + 0.1);
        woodOscillator.stop(now + 0.6);
      };
    };

    const playSound = createChestSound();
    audioRef.current = { play: playSound } as any;
  }, []);

  // Generate random combination when puzzle is shown
  useEffect(() => {
    if (showPuzzle && targetCombination.length === 0) {
      const randomCombo = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
      ];
      setTargetCombination(randomCombo);
    }
  }, [showPuzzle, targetCombination.length]);

  const handleClick = () => {
    if (isOpen) {
      // Close chest
      setIsOpen(false);
      setShowPuzzle(false);
      setCombination([0, 0, 0]);
      setTargetCombination([]);
    } else {
      // Show puzzle to unlock
      setShowPuzzle(true);
    }
  };

  const handleDialRotate = (dialIndex: number, direction: 'up' | 'down') => {
    // Play click sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    const clickOsc = audioContext.createOscillator();
    const clickGain = audioContext.createGain();
    clickOsc.type = 'sine';
    clickOsc.frequency.value = 800;
    clickGain.gain.setValueAtTime(0.1, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(audioContext.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    const newCombination = [...combination];
    if (direction === 'up') {
      newCombination[dialIndex] = (newCombination[dialIndex] + 1) % 10;
    } else {
      newCombination[dialIndex] = (newCombination[dialIndex] - 1 + 10) % 10;
    }
    setCombination(newCombination);

    // Check if combination is correct
    if (
      newCombination[0] === targetCombination[0] &&
      newCombination[1] === targetCombination[1] &&
      newCombination[2] === targetCombination[2]
    ) {
      // Play inspirational success sound - ascending chime melody
      const successAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = successAudioContext.currentTime;
      
      // Success chime melody (ascending major chord)
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = successAudioContext.createOscillator();
        const gain = successAudioContext.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.5);
        osc.connect(gain);
        gain.connect(successAudioContext.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.6);
      });

      // Add sparkle sounds
      for (let i = 0; i < 8; i++) {
        const sparkOsc = successAudioContext.createOscillator();
        const sparkGain = successAudioContext.createGain();
        sparkOsc.type = 'sine';
        sparkOsc.frequency.value = 2000 + Math.random() * 1000;
        sparkGain.gain.setValueAtTime(0.08, now + 0.6 + i * 0.08);
        sparkGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + i * 0.08 + 0.15);
        sparkOsc.connect(sparkGain);
        sparkGain.connect(successAudioContext.destination);
        sparkOsc.start(now + 0.6 + i * 0.08);
        sparkOsc.stop(now + 0.6 + i * 0.08 + 0.2);
      }
      
      // Correct! Open chest
      setTimeout(() => {
        setIsOpen(true);
        setShowPuzzle(false);
        // Play chest unlock sound
        if (audioRef.current && (audioRef.current as any).play) {
          (audioRef.current as any).play();
        }
      }, 800);
    }
  };

  return (
    <div 
      className="relative w-full"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
        border: '4px solid #D4AF37',
        borderRadius: '12px',
        boxShadow: `
          0 0 20px rgba(212, 175, 55, 0.4),
          inset 0 0 30px rgba(0, 0, 0, 0.4),
          0 10px 30px rgba(0, 0, 0, 0.6)
        `,
        overflow: 'hidden'
      }}
    >
      {/* Decorative top border - matching ChineseCard */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
          boxShadow: '0 1px 6px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Title Header */}
      <div 
        className="pt-5 pb-3 px-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.6))',
          borderBottom: '2px solid #D4AF37'
        }}
      >
        <h4 
          className="text-lg font-bold text-center mb-1"
          style={{
            fontFamily: 'serif',
            color: '#D4AF37',
            textShadow: `
              0 0 12px rgba(212, 175, 55, 0.8),
              0 0 24px rgba(212, 175, 55, 0.4),
              1px 1px 3px rgba(0, 0, 0, 0.8)
            `,
            letterSpacing: '0.15em'
          }}
        >
          百宝箱
        </h4>
        <p 
          className="text-xs text-center"
          style={{
            fontFamily: 'monospace',
            color: '#FFD700',
            textShadow: '0 0 8px rgba(255, 215, 0, 0.7)',
            letterSpacing: '0.2em'
          }}
        >
          TREASURE CHEST
        </p>
      </div>
      
      {/* Content - Wooden Chest with Bronze Lock */}
      <div 
        className="p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.5), rgba(101, 67, 33, 0.3))'
        }}
      >
        <div 
          className="relative cursor-pointer select-none"
          onClick={handleClick}
        >
          {/* Wooden chest body */}
          <div 
            className="relative rounded-lg p-6 min-h-[180px]"
            style={{
              background: 'linear-gradient(135deg, #654321 0%, #8B4513 50%, #654321 100%)',
              border: '3px solid #D4AF37',
              boxShadow: `
                inset 0 0 20px rgba(0, 0, 0, 0.5),
                0 4px 15px rgba(0, 0, 0, 0.6)
              `
            }}
          >
            {/* Wood grain texture */}
            <div 
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 3px,
                    rgba(101, 67, 33, 0.3) 3px,
                    rgba(101, 67, 33, 0.3) 6px
                  )
                `
              }}
            />

            {/* Bronze lock mechanism - center */}
            <div 
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
                isOpen ? 'opacity-0 scale-0 rotate-90' : 'opacity-100 scale-100 rotate-0'
              }`}
            >
              <div 
                className="w-20 h-24 flex flex-col items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #CD7F32 0%, #8B6914 50%, #CD7F32 100%)',
                  border: '2px solid #8B6914',
                  borderRadius: '8px',
                  boxShadow: `
                    0 4px 15px rgba(0, 0, 0, 0.6),
                    inset 0 2px 10px rgba(255, 255, 255, 0.2)
                  `
                }}
              >
                {/* Lock decoration - Chinese characters */}
                <div 
                  className="text-xs font-bold mb-1"
                  style={{
                    fontFamily: 'serif',
                    color: '#8B4513',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  锁
                </div>
                {/* Keyhole */}
                <div 
                  className="w-4 h-6 relative"
                  style={{
                    background: '#1a1a1a',
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                    boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2"
                    style={{ background: '#1a1a1a' }}
                  />
                </div>
                {/* Lock text */}
                <div 
                  className="text-[8px] font-bold mt-1"
                  style={{
                    fontFamily: 'serif',
                    color: '#8B4513',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  LOCK
                </div>
              </div>
            </div>

            {/* Bronze corner decorations */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
              const positions = {
                'top-left': 'top-2 left-2',
                'top-right': 'top-2 right-2',
                'bottom-left': 'bottom-2 left-2',
                'bottom-right': 'bottom-2 right-2'
              };
              return (
                <div 
                  key={corner}
                  className={`absolute ${positions[corner as keyof typeof positions]} w-6 h-6`}
                  style={{
                    background: 'radial-gradient(circle, #CD7F32, #8B6914)',
                    border: '1px solid #8B6914',
                    borderRadius: '50%',
                    boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <div 
                    className="absolute inset-1 rounded-full"
                    style={{
                      border: '1px solid #8B4513',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                </div>
              );
            })}

            {/* Balance inside chest - revealed when opened */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'
              }`}
            >
              <div 
                className="text-center p-6 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.85)',
                  border: '3px solid #D4AF37',
                  boxShadow: `
                    0 0 30px rgba(212, 175, 55, 0.6),
                    inset 0 0 20px rgba(212, 175, 55, 0.2)
                  `
                }}
              >
                <div 
                  className="text-xs font-semibold mb-2"
                  style={{
                    fontFamily: 'serif',
                    color: '#D4AF37',
                    textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                    letterSpacing: '0.15em'
                  }}
                >
                  宝藏
                </div>
                <div 
                  className="text-4xl font-bold mb-1"
                  style={{
                    color: '#FFD700',
                    textShadow: `
                      0 0 15px rgba(255, 215, 0, 0.8),
                      0 0 30px rgba(255, 215, 0, 0.4)
                    `
                  }}
                >
                  ${balance.toFixed(2)}
                </div>
                <div 
                  className="text-xs"
                  style={{
                    fontFamily: 'monospace',
                    color: '#FFD700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                    letterSpacing: '0.2em'
                  }}
                >
                  💰 USDT
                </div>
              </div>
            </div>

            {/* Chinese Combination Lock Puzzle - Compact */}
            {showPuzzle && !isOpen && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center z-20"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(0, 0, 0, 0.92)',
                  backdropFilter: 'blur(5px)'
                }}
              >
                {/* Puzzle title - Smaller */}
                <div 
                  className="text-center mb-2"
                  style={{
                    fontFamily: 'serif',
                    fontSize: '11px',
                    color: '#D4AF37',
                    textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
                    letterSpacing: '0.12em'
                  }}
                >
                  解锁密码
                </div>

                {/* Target hint - Compact */}
                <div 
                  className="mb-3 px-2 py-1 rounded"
                  style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid #D4AF37'
                  }}
                >
                  <div 
                    className="text-[7px] mb-1"
                    style={{
                      fontFamily: 'monospace',
                      color: '#FFD700',
                      textAlign: 'center',
                      letterSpacing: '0.08em'
                    }}
                  >
                    MATCH:
                  </div>
                  <div className="flex gap-1 justify-center">
                    {targetCombination.map((num, idx) => (
                      <div 
                        key={idx}
                        className="w-7 h-8 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #CD7F32, #8B6914)',
                          border: '2px solid #D4AF37',
                          borderRadius: '4px',
                          fontFamily: 'serif',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#FFD700',
                          textShadow: '0 0 12px rgba(255, 215, 0, 1), 0 0 20px rgba(255, 215, 0, 0.6)'
                        }}
                      >
                        {chineseNumbers[num]}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Combination dials - Smaller */}
                <div className="flex gap-2">
                  {[0, 1, 2].map((dialIndex) => (
                    <div key={dialIndex} className="flex flex-col items-center">
                      {/* Up arrow - Compact */}
                      <button
                        onClick={() => handleDialRotate(dialIndex, 'up')}
                        className="mb-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #CD7F32, #8B6914)',
                          border: '1px solid #D4AF37',
                          borderRadius: '3px',
                          width: '24px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#FFD700',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ▲
                      </button>

                      {/* Dial display - Compact */}
                      <div 
                        className="w-10 h-14 flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #654321, #8B4513)',
                          border: '2px solid #D4AF37',
                          borderRadius: '4px',
                          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.6)',
                          fontFamily: 'serif',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          color: '#FFD700',
                          textShadow: '0 0 15px rgba(255, 215, 0, 1), 0 0 25px rgba(255, 215, 0, 0.6)',
                          position: 'relative'
                        }}
                      >
                        {chineseNumbers[combination[dialIndex]]}
                        {/* Dial notches - Smaller */}
                        <div 
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0.5 h-3"
                          style={{ background: '#D4AF37' }}
                        />
                        <div 
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0.5 h-3"
                          style={{ background: '#D4AF37' }}
                        />
                      </div>

                      {/* Down arrow - Compact */}
                      <button
                        onClick={() => handleDialRotate(dialIndex, 'down')}
                        className="mt-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #CD7F32, #8B6914)',
                          border: '1px solid #D4AF37',
                          borderRadius: '3px',
                          width: '24px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#FFD700',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.8)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  ))}
                </div>

                {/* Hint text - Compact */}
                <div 
                  className="mt-2 text-[7px]"
                  style={{
                    fontFamily: 'monospace',
                    color: '#D4AF37',
                    opacity: 0.7,
                    letterSpacing: '0.05em',
                    textAlign: 'center'
                  }}
                >
                  🔢 Rotate to match
                </div>
              </div>
            )}

            {/* Lock indicator text */}
            <div 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                isOpen || showPuzzle ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <div 
                className="text-center mt-16"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#D4AF37',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
                  letterSpacing: '0.1em'
                }}
              >
                🔒 CLICK TO UNLOCK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom border - matching ChineseCard */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
          boxShadow: '0 -1px 6px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Scanline effect - matching ChineseCard */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.05) 2px, rgba(0, 0, 0, 0.05) 4px)',
          borderRadius: '12px'
        }}
      />

      {/* Corner ornaments - matching ChineseCard */}
      <div 
        className="absolute top-3 left-3 text-yellow-500 opacity-30"
        style={{ fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
      >
        ◈
      </div>
      <div 
        className="absolute top-3 right-3 text-yellow-500 opacity-30"
        style={{ fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
      >
        ◈
      </div>
      <div 
        className="absolute bottom-3 left-3 text-yellow-500 opacity-30"
        style={{ fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
      >
        ◈
      </div>
      <div 
        className="absolute bottom-3 right-3 text-yellow-500 opacity-30"
        style={{ fontSize: '1.5rem', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
      >
        ◈
      </div>
    </div>
  );
};
