import React, { useState, useRef, useEffect } from 'react';

interface MusicPlayerProps {
  audioUrl?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  audioUrl = '/music/moon-represents-my-heart-8bit.mp3' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Fixed volume at 30%
      audioRef.current.loop = true;
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log('Audio file not found or autoplay prevented:', error);
          setAudioError(true);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioError = () => {
    setAudioError(true);
    console.log('Audio file not found. Please add: /root/CryptoCompass/public/music/moon-represents-my-heart-8bit.mp3');
  };

  return (
    <>
      <audio ref={audioRef} src={audioUrl} onError={handleAudioError} />
      
      {/* Floating music player - Demoscene style */}
      <div 
        className="fixed bottom-6 right-6 z-50"
      >
        {/* Main play/pause button */}
        <button
          onClick={togglePlay}
          className="relative group"
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.1))',
            border: '3px solid #ffd700',
            boxShadow: `
              0 0 20px rgba(255, 215, 0, 0.6),
              inset 0 0 20px rgba(255, 215, 0, 0.3),
              0 4px 15px rgba(0, 0, 0, 0.4)
            `,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            animation: isPlaying ? 'spin 8s linear infinite, pulse 2s ease-in-out infinite' : 'pulse 2s ease-in-out infinite'
          }}
        >
          {/* Icon */}
          <div 
            className="absolute inset-0 flex items-center justify-center text-3xl"
            style={{
              color: '#ffd700',
              textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)',
              animation: isPlaying ? 'none' : 'blink 1.5s ease-in-out infinite'
            }}
          >
            {isPlaying ? '🎵' : '🎵'}
          </div>
          
          {/* Title label */}
          <div 
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #ffd700',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#ffd700',
              textShadow: '0 0 5px rgba(255, 215, 0, 0.8)',
              pointerEvents: 'none'
            }}
          >
            {isPlaying ? '🎶 PLAYING' : '🎵 CLICK TO PLAY'}
            <div style={{ fontSize: '10px', color: '#ffaa00', marginTop: '2px' }}>
              月亮代表我的心
            </div>
          </div>
        </button>

        {/* Scanline effect overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)'
          }}
        />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Custom range slider thumb */
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffd700;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5);
          border: 2px solid #ffaa00;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffd700;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5);
          border: 2px solid #ffaa00;
        }
      `}</style>
    </>
  );
};
