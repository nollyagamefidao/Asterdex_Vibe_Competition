import React, { ReactNode } from 'react';

interface ChineseCardProps {
  title?: string;
  chineseTitle?: string;
  children: ReactNode;
  className?: string;
}

export const ChineseCard: React.FC<ChineseCardProps> = ({ 
  title, 
  chineseTitle, 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`relative ${className}`}
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
      {/* Decorative top border */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
          boxShadow: '0 1px 6px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Title Header */}
      {(title || chineseTitle) && (
        <div 
          className="pt-4 pb-3 px-4"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.6))',
            borderBottom: '2px solid #D4AF37'
          }}
        >
          {chineseTitle && (
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
              {chineseTitle}
            </h4>
          )}
          {title && (
            <p 
              className="text-xs text-center"
              style={{
                fontFamily: 'monospace',
                color: '#FFD700',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.7)',
                letterSpacing: '0.2em'
              }}
            >
              {title}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div 
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(62, 39, 35, 0.5), rgba(101, 67, 33, 0.3))'
        }}
      >
        {children}
      </div>

      {/* Decorative bottom border */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
          boxShadow: '0 -1px 6px rgba(212, 175, 55, 0.6)'
        }}
      />

      {/* Scanline effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.05) 2px, rgba(0, 0, 0, 0.05) 4px)',
          borderRadius: '12px'
        }}
      />

      {/* Corner ornaments */}
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
