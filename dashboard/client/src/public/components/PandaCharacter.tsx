import React, { useEffect, useState } from 'react';

export type PandaEmotion = 'happy' | 'sad' | 'neutral' | 'excited' | 'love' | 'laser' | 'tears';

interface PandaCharacterProps {
  emotion: PandaEmotion;
  size?: number;
  isTrading?: boolean;
}

export const PandaCharacter: React.FC<PandaCharacterProps> = ({
  emotion,
  size = 300,
  isTrading = true,
}) => {
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [mousePosition, setMousePosition] = useState(0);
  const [isDrinkingTea, setIsDrinkingTea] = useState(false);
  const [teaStage, setTeaStage] = useState(0); // 0: lift cup, 1: drinking, 2: gulp, 3: satisfied

  // Show thought bubble about beloved periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShowThoughtBubble(true);
      setTimeout(() => setShowThoughtBubble(false), 3000);
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Animate mouse hand movement
  useEffect(() => {
    const interval = setInterval(() => {
      setMousePosition((prev) => (prev === 0 ? 5 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Random tea drinking animation
  useEffect(() => {
    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = []; // Track all timeouts
    
    const randomInterval = () => {
      const minTime = 15000; // 15 seconds
      const maxTime = 45000; // 45 seconds
      return Math.random() * (maxTime - minTime) + minTime;
    };

    const scheduleTea = () => {
      if (!isMounted) return;
      
      const mainTimeout = setTimeout(() => {
        if (!isMounted) return;
        
        setIsDrinkingTea(true);
        setTeaStage(0); // Start: lift cup
        
        // Stage 1: Drinking (after 2s)
        const t1 = setTimeout(() => {
          if (isMounted) setTeaStage(1);
        }, 2000);
        timeouts.push(t1);
        
        // Stage 2: Big gulp (after 5s)
        const t2 = setTimeout(() => {
          if (isMounted) setTeaStage(2);
        }, 5000);
        timeouts.push(t2);
        
        // Stage 3: Satisfied "Ahh!" (after 7s)
        const t3 = setTimeout(() => {
          if (isMounted) setTeaStage(3);
        }, 7000);
        timeouts.push(t3);
        
        // End tea break (after 10s)
        const t4 = setTimeout(() => {
          if (!isMounted) return;
          setIsDrinkingTea(false);
          setTeaStage(0);
          scheduleTea(); // Schedule next tea break
        }, 10000); // Drink for 10 seconds
        timeouts.push(t4);
      }, randomInterval());
      
      timeouts.push(mainTimeout);
    };

    scheduleTea();
    
    return () => {
      isMounted = false;
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  const animationClass = emotion === 'happy' || emotion === 'excited' ? 'panda-happy' : emotion === 'sad' ? 'panda-sad' : '';

  return (
    <div className="relative" style={{ width: size, height: size * 1.2, imageRendering: 'pixelated' }}>
      {/* 8-Bit Pixel Art Trading Panda */}
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 300 360"
        className={`${animationClass} transition-all duration-300`}
        style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      >
        {/* Desk */}
        <rect x="20" y="240" width="260" height="15" rx="3" fill="#8B4513" />
        <rect x="40" y="255" width="220" height="5" fill="#654321" />
        
        {/* Notebook/Papers on desk */}
        <rect x="180" y="200" width="70" height="45" rx="2" fill="#FFFACD" stroke="#DAA520" strokeWidth="1" />
        <line x1="190" y1="210" x2="240" y2="210" stroke="#DAA520" strokeWidth="1" />
        <line x1="190" y1="218" x2="240" y2="218" stroke="#DAA520" strokeWidth="1" />
        <line x1="190" y1="226" x2="235" y2="226" stroke="#DAA520" strokeWidth="1" />
        
        {/* Monitor/Screen */}
        <rect x="80" y="160" width="90" height="70" rx="4" fill="#2C3E50" />
        <rect x="85" y="165" width="80" height="60" fill="#52B788" />
        {/* Trading chart on screen */}
        <polyline points="90,210 100,200 110,205 120,190 130,195 140,185 150,190 160,180" 
          stroke="#27AE60" strokeWidth="2" fill="none" />
        <text x="92" y="180" fontSize="10" fill="#FFF">📈</text>
        
        {/* Monitor stand */}
        <rect x="120" y="230" width="20" height="10" fill="#34495E" />
        <rect x="110" y="240" width="40" height="5" fill="#2C3E50" />
        
        {/* Body (sitting position) */}
        <ellipse cx="150" cy="200" rx="45" ry="50" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
        
        {/* Legs (sitting) */}
        <ellipse cx="130" cy="240" rx="15" ry="25" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
        <ellipse cx="170" cy="240" rx="15" ry="25" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
        
        {/* Feet */}
        <ellipse cx="130" cy="265" rx="12" ry="8" fill="#2D3E50" />
        <ellipse cx="170" cy="265" rx="12" ry="8" fill="#2D3E50" />
        
        {/* Left arm (resting on desk) */}
        <ellipse cx="110" cy="210" rx="12" ry="35" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
          transform="rotate(-20 110 210)" />
        <ellipse cx="95" cy="230" rx="10" ry="8" fill="#2D3E50" />
        
        {/* Right arm (holding mouse) - animated */}
        <g className="transition-all duration-500">
          <ellipse cx="190" cy="210" rx="12" ry="35" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
            transform="rotate(15 190 210)" />
          <ellipse cx={205 + mousePosition} cy={230 + mousePosition} rx="10" ry="8" fill="#2D3E50" />
          {/* Mouse */}
          <ellipse cx={210 + mousePosition} cy={235 + mousePosition} rx="6" ry="8" fill="#95A5A6" stroke="#2D3E50" strokeWidth="1" />
        </g>
        
        {/* Head */}
        <circle cx="150" cy="120" r="50" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
        
        {/* Ears */}
        <circle cx="115" cy="85" r="22" fill="#2D3E50" />
        <circle cx="185" cy="85" r="22" fill="#2D3E50" />
        
        {/* Eye patches */}
        <ellipse cx="135" cy="115" rx="13" ry="16" fill="#2D3E50" />
        <ellipse cx="165" cy="115" rx="13" ry="16" fill="#2D3E50" />
        
        {/* Eyes based on emotion */}
        {emotion === 'love' ? (
          <>
            <text x="128" y="120" fontSize="16" fill="#E91E63">♥</text>
            <text x="158" y="120" fontSize="16" fill="#E91E63">♥</text>
          </>
        ) : emotion === 'laser' ? (
          <>
            {/* Laser eyes - glowing red with beams */}
            <circle cx="135" cy="115" r="8" fill="#FF0000" opacity="0.8" className="animate-pulse" />
            <circle cx="135" cy="115" r="6" fill="#FF3333" className="animate-pulse" />
            <circle cx="165" cy="115" r="8" fill="#FF0000" opacity="0.8" className="animate-pulse" />
            <circle cx="165" cy="115" r="6" fill="#FF3333" className="animate-pulse" />
            {/* Laser beams */}
            <line x1="135" y1="115" x2="135" y2="200" stroke="#FF0000" strokeWidth="3" opacity="0.6" className="animate-pulse" />
            <line x1="165" y1="115" x2="165" y2="200" stroke="#FF0000" strokeWidth="3" opacity="0.6" className="animate-pulse" />
            <circle cx="135" cy="115" r="4" fill="#FFFF00" />
            <circle cx="165" cy="115" r="4" fill="#FFFF00" />
          </>
        ) : emotion === 'tears' ? (
          <>
            {/* Sad eyes with tears */}
            <circle cx="135" cy="115" r="6" fill="#FFFFFF" />
            <circle cx="165" cy="115" r="6" fill="#FFFFFF" />
            <circle cx="137" cy="113" r="3" fill="#2D3E50" />
            <circle cx="167" cy="113" r="3" fill="#2D3E50" />
            {/* Tears */}
            <ellipse cx="135" cy="125" rx="2" ry="4" fill="#4A90E2" opacity="0.7" className="animate-pulse" />
            <ellipse cx="135" cy="132" rx="1.5" ry="3" fill="#4A90E2" opacity="0.5" />
            <ellipse cx="165" cy="125" rx="2" ry="4" fill="#4A90E2" opacity="0.7" className="animate-pulse" />
            <ellipse cx="165" cy="132" rx="1.5" ry="3" fill="#4A90E2" opacity="0.5" />
          </>
        ) : (
          <>
            <circle cx="135" cy="115" r="6" fill="#FFFFFF" />
            <circle cx="165" cy="115" r="6" fill="#FFFFFF" />
            <circle cx="137" cy="113" r="3" fill="#2D3E50" className="animate-pulse" />
            <circle cx="167" cy="113" r="3" fill="#2D3E50" className="animate-pulse" />
          </>
        )}
        
        {/* Nose */}
        <ellipse cx="150" cy="130" rx="6" ry="5" fill="#2D3E50" />
        
        {/* Mouth based on emotion */}
        {emotion === 'happy' || emotion === 'excited' ? (
          <path d="M 140 140 Q 150 148 160 140" stroke="#2D3E50" strokeWidth="2" fill="none" />
        ) : emotion === 'sad' ? (
          <path d="M 140 145 Q 150 138 160 145" stroke="#2D3E50" strokeWidth="2" fill="none" />
        ) : (
          <line x1="140" y1="142" x2="160" y2="142" stroke="#2D3E50" strokeWidth="2" />
        )}
        
        {/* Thinking lines when focused */}
        {(emotion === 'neutral' || emotion === 'love') && (
          <g opacity="0.6" className="animate-pulse">
            <text x="190" y="95" fontSize="18">💭</text>
          </g>
        )}

        {/* Tea cup when drinking - ANIMATED! */}
        {isDrinkingTea && (
          <g className="tea-animation">
            {/* Steam from tea - more steam when hot */}
            <g opacity={teaStage < 2 ? "0.7" : "0.3"} className="animate-pulse">
              <path d={`M 80 ${155 - teaStage * 10} Q 78 ${150 - teaStage * 10} 80 ${145 - teaStage * 10}`} stroke="#888" strokeWidth="1" fill="none" />
              <path d={`M 85 ${155 - teaStage * 10} Q 83 ${150 - teaStage * 10} 85 ${145 - teaStage * 10}`} stroke="#888" strokeWidth="1" fill="none" />
              <path d={`M 90 ${155 - teaStage * 10} Q 88 ${150 - teaStage * 10} 90 ${145 - teaStage * 10}`} stroke="#888" strokeWidth="1" fill="none" />
            </g>
            
            {/* Tea cup - moves up during drinking */}
            <g transform={`translate(${60 + teaStage * 15}, ${160 - teaStage * 30})`} 
               className="transition-all duration-1000">
              {/* Cup body */}
              <path 
                d="M 10 0 L 5 20 L 35 20 L 30 0 Z" 
                fill="#FFFFFF" 
                stroke="#8B4513" 
                strokeWidth="2"
              />
              {/* Tea inside - level goes down as panda drinks! */}
              <path 
                d={`M 11 ${5 + teaStage * 5} L 8 20 L 32 20 L 29 ${5 + teaStage * 5} Z`}
                fill="#CD853F" 
                className="transition-all duration-1000"
              />
              {/* Cup handle */}
              <path 
                d="M 35 5 Q 45 10 35 15" 
                fill="none" 
                stroke="#8B4513" 
                strokeWidth="2"
              />
              {/* Saucer */}
              <ellipse cx="20" cy="22" rx="20" ry="3" fill="#FFFFFF" stroke="#8B4513" strokeWidth="1" />
            </g>
            
            {/* Panda's arm reaching for cup - animated */}
            <g className="transition-all duration-1000">
              <ellipse 
                cx={85 + teaStage * 15} 
                cy={170 - teaStage * 30} 
                rx="12" 
                ry="18" 
                fill="#2D3E50" 
                transform={`rotate(-30 ${85 + teaStage * 15} ${170 - teaStage * 30})`}
              />
              <circle 
                cx={75 + teaStage * 15} 
                cy={175 - teaStage * 30} 
                r="8" 
                fill="#2D3E50" 
              />
            </g>
            
            {/* Gulp bubbles during stage 2 */}
            {teaStage === 2 && (
              <g className="animate-bounce">
                <circle cx="130" cy="135" r="3" fill="#4A90E2" opacity="0.6" />
                <circle cx="138" cy="132" r="2" fill="#4A90E2" opacity="0.5" />
                <circle cx="145" cy="135" r="3" fill="#4A90E2" opacity="0.6" />
                <text x="125" y="150" fontSize="14">💧</text>
              </g>
            )}
            
            {/* Satisfied sparkles during stage 3 */}
            {teaStage === 3 && (
              <g>
                <text x="175" y="100" fontSize="18" className="animate-ping">✨</text>
                <text x="105" y="100" fontSize="18" className="animate-ping">✨</text>
                <text x="140" y="85" fontSize="20" className="animate-bounce">😌</text>
              </g>
            )}
          </g>
        )}
      </svg>
      
      {/* Thought bubble about beloved */}
      {showThoughtBubble && (
        <div className="absolute -top-10 -right-10 animate-bounce z-10">
          <div className="bg-white rounded-3xl p-4 border-4 border-pink-200 shadow-lg relative">
            {/* Bubble tail */}
            <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-4 border-r-4 border-pink-200 transform rotate-45"></div>
            <div className="text-4xl">💕🌙🐼</div>
          </div>
        </div>
      )}

      {/* Tea time label - changes with stages */}
      {isDrinkingTea && (
        <div className="absolute -bottom-14 left-0 right-0 text-center animate-bounce">
          <div className="inline-block bg-amber-100 rounded-full px-3 py-1 border-2 border-amber-400 shadow-lg">
            <span className="text-xs font-bold text-amber-800">
              {teaStage === 0 && "☕ Lifting tea cup..."}
              {teaStage === 1 && "☕ Sip sip sip..."}
              {teaStage === 2 && "💧 GULP GULP GULP!"}
              {teaStage === 3 && "😌 Ahhhh! So refreshing!"}
            </span>
          </div>
        </div>
      )}
      
      {/* Label showing current mood */}
      <div className="absolute -bottom-6 left-0 right-0 text-center">
        <div className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-4 py-1 border-2 border-purple-300">
          <span className="text-xs font-bold text-purple-600 capitalize">{emotion}</span>
        </div>
      </div>
    </div>
  );
};
