import React, { useState, useEffect, useRef } from 'react';
import { useAIRecommendation } from '../hooks/useAIRecommendation';

interface BelovedPandaProps {
  size?: number;
  showWave?: boolean;
}

export const BelovedPanda: React.FC<BelovedPandaProps> = ({
  size = 280,
  showWave = true,
}) => {
  const [sendingKiss, setSendingKiss] = useState(false);
  const { recommendation, showRecommendation, playGong } = useAIRecommendation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Periodically send kisses (hearts)
  useEffect(() => {
    const interval = setInterval(() => {
      setSendingKiss(true);
      setTimeout(() => setSendingKiss(false), 1000);
    }, 3000); // Send kiss every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Play Chinese gong sound when new recommendation appears
  useEffect(() => {
    if (playGong) {
      // Create an authentic Chinese gong sound using Web Audio API
      const playChineseGong = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Create multiple oscillators for rich, inharmonic Chinese gong sound
          const fundamental = audioContext.createOscillator();
          const harmonic1 = audioContext.createOscillator();
          const harmonic2 = audioContext.createOscillator();
          const harmonic3 = audioContext.createOscillator();
          const harmonic4 = audioContext.createOscillator();
          const shimmer = audioContext.createOscillator();
          
          // Main gain for overall volume
          const mainGain = audioContext.createGain();
          
          // Individual gains for each component
          const fundGain = audioContext.createGain();
          const harm1Gain = audioContext.createGain();
          const harm2Gain = audioContext.createGain();
          const harm3Gain = audioContext.createGain();
          const harm4Gain = audioContext.createGain();
          const shimmerGain = audioContext.createGain();
          
          // Chinese gong frequencies (deep, inharmonic partials)
          fundamental.frequency.setValueAtTime(100, audioContext.currentTime); // Deep fundamental
          harmonic1.frequency.setValueAtTime(157, audioContext.currentTime);   // Not exact harmonic
          harmonic2.frequency.setValueAtTime(243, audioContext.currentTime);   // Inharmonic
          harmonic3.frequency.setValueAtTime(371, audioContext.currentTime);   // Metallic tone
          harmonic4.frequency.setValueAtTime(523, audioContext.currentTime);   // Upper shimmer
          shimmer.frequency.setValueAtTime(1200, audioContext.currentTime);    // High metallic shimmer
          
          // Use sine waves for smooth, resonant tone
          fundamental.type = 'sine';
          harmonic1.type = 'sine';
          harmonic2.type = 'sine';
          harmonic3.type = 'sine';
          harmonic4.type = 'sine';
          shimmer.type = 'triangle'; // Triangle for metallic shimmer
          
          // Connect oscillators through individual gains to main gain
          fundamental.connect(fundGain);
          harmonic1.connect(harm1Gain);
          harmonic2.connect(harm2Gain);
          harmonic3.connect(harm3Gain);
          harmonic4.connect(harm4Gain);
          shimmer.connect(shimmerGain);
          
          fundGain.connect(mainGain);
          harm1Gain.connect(mainGain);
          harm2Gain.connect(mainGain);
          harm3Gain.connect(mainGain);
          harm4Gain.connect(mainGain);
          shimmerGain.connect(mainGain);
          
          mainGain.connect(audioContext.destination);
          
          const now = audioContext.currentTime;
          const duration = 3.5;
          
          // Chinese gong envelope: Sharp attack with long, shimmering decay
          // Main envelope
          mainGain.gain.setValueAtTime(0, now);
          mainGain.gain.linearRampToValueAtTime(0.5, now + 0.005); // Very fast attack
          mainGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
          mainGain.gain.linearRampToValueAtTime(0, now + duration + 0.1);
          
          // Individual component envelopes for authentic gong character
          // Fundamental: strong, long sustain
          fundGain.gain.setValueAtTime(1.0, now);
          fundGain.gain.exponentialRampToValueAtTime(0.3, now + duration);
          
          // Lower harmonics: medium sustain
          harm1Gain.gain.setValueAtTime(0.7, now);
          harm1Gain.gain.exponentialRampToValueAtTime(0.2, now + duration);
          
          harm2Gain.gain.setValueAtTime(0.5, now);
          harm2Gain.gain.exponentialRampToValueAtTime(0.15, now + duration);
          
          // Upper harmonics: quick decay after initial strike
          harm3Gain.gain.setValueAtTime(0.4, now);
          harm3Gain.gain.exponentialRampToValueAtTime(0.05, now + duration * 0.6);
          
          harm4Gain.gain.setValueAtTime(0.3, now);
          harm4Gain.gain.exponentialRampToValueAtTime(0.03, now + duration * 0.5);
          
          // Shimmer: initial bright crash, then fades
          shimmerGain.gain.setValueAtTime(0.15, now);
          shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.3);
          
          // Start all oscillators
          fundamental.start(now);
          harmonic1.start(now);
          harmonic2.start(now);
          harmonic3.start(now);
          harmonic4.start(now);
          shimmer.start(now);
          
          // Stop all oscillators
          const stopTime = now + duration + 0.1;
          fundamental.stop(stopTime);
          harmonic1.stop(stopTime);
          harmonic2.stop(stopTime);
          harmonic3.stop(stopTime);
          harmonic4.stop(stopTime);
          shimmer.stop(stopTime);
          
          console.log('🥁 Chinese gong sound played!');
        } catch (err) {
          console.log('Could not play gong sound:', err);
        }
      };
      
      playChineseGong();
    }
  }, [playGong]);
  return (
    <div className="relative flex flex-col items-center">
      {/* Moon with glow effect */}
      <div className="relative">
        <div className="moon-glow absolute inset-0 rounded-full bg-yellow-200 blur-xl opacity-60"></div>
        <div className="relative bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full p-4 border-4 border-yellow-400">
          {/* 8-Bit Pixel Art Female Panda */}
          <div 
            className="animate-bounce"
            style={{ animationDuration: '4s', imageRendering: 'pixelated' }}
          >
            <svg
              width={size}
              height={size * 1.3}
              viewBox="0 0 300 390"
              style={{ imageRendering: 'pixelated' }}
            >
            {/* Moon surface details */}
            <ellipse cx="100" cy="320" rx="80" ry="15" fill="#F4D03F" opacity="0.3" />
            
            {/* Body (sitting on moon) */}
            <ellipse cx="150" cy="260" rx="50" ry="55" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
            
            {/* Legs (sitting position) */}
            <ellipse cx="125" cy="290" rx="20" ry="30" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
            <ellipse cx="175" cy="290" rx="20" ry="30" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
            
            {/* Feet */}
            <ellipse cx="125" cy="320" rx="18" ry="12" fill="#2D3E50" />
            <ellipse cx="175" cy="320" rx="18" ry="12" fill="#2D3E50" />
            
            {/* Arms - one waving, one sending kiss */}
            {sendingKiss ? (
              <>
                {/* Left arm reaching forward sending kiss */}
                <ellipse cx="110" cy="240" rx="15" ry="40" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
                  transform="rotate(-45 110 240)" />
                <ellipse cx="85" cy="210" rx="12" ry="10" fill="#2D3E50" />
                {/* Kiss emoji near hand */}
                <text x="70" y="205" fontSize="24" className="animate-pulse">💋</text>
                
                {/* Right arm at side */}
                <ellipse cx="190" cy="250" rx="15" ry="35" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
                  transform="rotate(25 190 250)" />
                <ellipse cx="205" cy="280" rx="12" ry="10" fill="#2D3E50" />
              </>
            ) : (
              <>
                {/* Left arm at side */}
                <ellipse cx="110" cy="250" rx="15" ry="35" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
                  transform="rotate(-25 110 250)" />
                <ellipse cx="95" cy="280" rx="12" ry="10" fill="#2D3E50" />
                
                {/* Right arm waving */}
                <ellipse cx="190" cy="230" rx="15" ry="40" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" 
                  transform="rotate(45 190 230)" className="animate-pulse" />
                <ellipse cx="215" cy="200" rx="12" ry="10" fill="#2D3E50" className="animate-pulse" />
              </>
            )}
            
            {/* Head */}
            <circle cx="150" cy="160" r="60" fill="#FFFFFF" stroke="#2D3E50" strokeWidth="2" />
            
            {/* Ears with bows */}
            <circle cx="110" cy="120" r="28" fill="#2D3E50" />
            <circle cx="190" cy="120" r="28" fill="#2D3E50" />
            
            {/* Pink bows on ears */}
            <g transform="translate(110, 115)">
              <path d="M -15 0 L -8 -8 L -8 8 Z" fill="#FF69B4" />
              <path d="M 8 -8 L 15 0 L 8 8 Z" fill="#FF69B4" />
              <circle cx="0" cy="0" r="6" fill="#FF1493" />
            </g>
            <g transform="translate(190, 115)">
              <path d="M -15 0 L -8 -8 L -8 8 Z" fill="#FF69B4" />
              <path d="M 8 -8 L 15 0 L 8 8 Z" fill="#FF69B4" />
              <circle cx="0" cy="0" r="6" fill="#FF1493" />
            </g>
            
            {/* Eye patches */}
            <ellipse cx="130" cy="155" rx="16" ry="20" fill="#2D3E50" />
            <ellipse cx="170" cy="155" rx="16" ry="20" fill="#2D3E50" />
            
            {/* Sad/longing eyes looking down and to the side */}
            <ellipse cx="128" cy="158" r="8" fill="#FFFFFF" />
            <ellipse cx="168" cy="158" r="8" fill="#FFFFFF" />
            <circle cx="126" cy="160" r="4" fill="#2D3E50" />
            <circle cx="166" cy="160" r="4" fill="#2D3E50" />
            
            {/* Long eyelashes */}
            <line x1="118" y1="150" x2="112" y2="145" stroke="#2D3E50" strokeWidth="2" />
            <line x1="122" y1="148" x2="118" y2="142" stroke="#2D3E50" strokeWidth="2" />
            <line x1="126" y1="147" x2="124" y2="140" stroke="#2D3E50" strokeWidth="2" />
            <line x1="160" y1="150" x2="156" y2="145" stroke="#2D3E50" strokeWidth="2" />
            <line x1="164" y1="148" x2="162" y2="142" stroke="#2D3E50" strokeWidth="2" />
            <line x1="168" y1="147" x2="170" y2="140" stroke="#2D3E50" strokeWidth="2" />
            
            {/* Nose */}
            <ellipse cx="150" cy="175" rx="7" ry="6" fill="#2D3E50" />
            
            {/* Sad mouth (slightly downturned) */}
            <path d="M 135 190 Q 150 187 165 190" stroke="#2D3E50" strokeWidth="2" fill="none" />
            
            {/* Blush (pink cheeks) */}
            <ellipse cx="110" cy="170" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
            <ellipse cx="190" cy="170" rx="12" ry="8" fill="#FFB6C1" opacity="0.6" />
            
            {/* Tear drop (showing sadness/longing) */}
            <ellipse cx="122" cy="168" rx="3" ry="5" fill="#87CEEB" opacity="0.7" className="animate-pulse" />
          </svg>
          </div>
        </div>
      </div>
      
      {/* AI Recommendation or "Waiting for you" text bubble */}
      {showRecommendation ? (
        <div className="mt-4 bg-gradient-to-r from-cyan-50 to-blue-50 backdrop-blur-sm rounded-2xl px-6 py-4 border-3 border-cyan-400 shadow-2xl max-w-md animate-pulse">
          <div className="flex items-start gap-2">
            <span className="text-2xl flex-shrink-0">🤖</span>
            <div className="flex-1">
              {recommendation.title && (
                <p className="text-sm font-bold text-cyan-800 mb-2">{recommendation.title}</p>
              )}
              <p className="text-sm text-gray-800 leading-relaxed">{recommendation.message}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-pink-300 shadow-lg">
          <p className="text-sm font-bold text-pink-600 whitespace-nowrap">💕 Waiting for you! 💕</p>
        </div>
      )}
      
      {/* Hidden audio element for gong sound */}
      <audio
        ref={audioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDKH0fDTgjMGHm7A7+OZSA0PVqzn7rdiFg9Cmdzm6ahZEw5Lltzm6rZbGg5HnN7i67leGg1Ei9vh5b1fHg1Ai9nc5L5iHg1BiNvc4r9iHQtBhNjb5MBhHQxBgtjb48FgHApAfdbZ4sJgHQs+fNXY4cJhHQs9etTY4MJhHQs7eNPX4MJgHQo6ddLW38FfHQo5c9HW38FgGwk4cc/V3r5fGwk2b8/U3r5fGwg0bc7U3b5fGggza87T3b1fGggya83S3L1eGQcxacvS3L1dGQcxaMrS27xdGAYwZ8nR27xcGAYvZsjQ2rxcGAUvZcfQ2rtcGAUuZMfP2rpcFwUtY8bP2bpcFwUsYsXO2LpcFwQrYcTO2LlcFwQqYcTN2LlbFwMqYMPM17pZFgMpX8LM1rpZFgIoXsHM1rlZFgMnXcDL1blYFQInXL/K1LlYFQEmW77K1LhYFQEmWr3J07hXFAIlWbzJ07dXFAEkWbvI0rdWFAEjWLrH0rZWEwEiV7nH0bZVEgEhVrjG0bVVEgAhVbeG0LRVEQAAVLZF0LNUEQAAU7ZFz7JUEAAATrVEzrJTEAAATbJEzrFTEAAAS7FDzLBSDwAASa9DzbBSDwAASK9DzbBSD"
        preload="auto"
      />
      
      {/* Stars around moon */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-2 left-2 text-yellow-300 animate-pulse">✨</div>
        <div className="absolute top-8 right-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute bottom-12 left-8 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-4 right-2 text-yellow-300 animate-pulse" style={{ animationDelay: '1.5s' }}>⭐</div>
      </div>
    </div>
  );
};
