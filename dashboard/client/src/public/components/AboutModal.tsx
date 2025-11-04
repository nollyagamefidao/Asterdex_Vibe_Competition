import React from 'react';

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)'
      }}
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)',
          border: '6px solid #D4AF37',
          boxShadow: `
            0 0 40px rgba(212, 175, 55, 0.6),
            inset 0 0 60px rgba(0, 0, 0, 0.5),
            0 20px 60px rgba(0, 0, 0, 0.8)
          `
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div 
          className="absolute top-0 left-0 right-0 h-3"
          style={{
            background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
            boxShadow: '0 2px 8px rgba(212, 175, 55, 0.6)'
          }}
        />

        {/* Corner ornaments */}
        <div className="absolute top-4 left-4 text-3xl opacity-50" style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212, 175, 55, 0.8)' }}>◈</div>
        <div className="absolute top-4 right-4 text-3xl opacity-50" style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212, 175, 55, 0.8)' }}>◈</div>
        <div className="absolute bottom-4 left-4 text-3xl opacity-50" style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212, 175, 55, 0.8)' }}>◈</div>
        <div className="absolute bottom-4 right-4 text-3xl opacity-50" style={{ color: '#D4AF37', textShadow: '0 0 15px rgba(212, 175, 55, 0.8)' }}>◈</div>

        {/* Content */}
        <div className="relative p-8 pt-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 
              className="text-5xl font-bold mb-3"
              style={{
                fontFamily: 'serif',
                color: '#D4AF37',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.8)',
                letterSpacing: '0.15em'
              }}
            >
              🐼 关于我们 🌙
            </h2>
            <p 
              className="text-xl"
              style={{
                fontFamily: 'monospace',
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
                letterSpacing: '0.2em'
              }}
            >
              ABOUT PANDA LOVE TRADING
            </p>
          </div>

          {/* Story Section */}
          <div 
            className="rounded-xl p-6 mb-6"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '3px solid #D4AF37'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4 flex items-center gap-3"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            >
              💕 The Love Story
            </h3>
            <div 
              className="space-y-4 text-lg leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
              }}
            >
              <p>
                This is the love story between the Panda and his beloved. She is on the moon, and to reach her, 
                our Panda needs to earn <span className="font-bold" style={{ color: '#00ff41', textShadow: '0 0 10px rgba(0, 255, 65, 0.8)' }}>$10 USD in net trading profit</span> to buy 
                the fuel for his rocket to the moon! 🚀
              </p>
              <p>
                Our Panda trades on <span className="font-bold" style={{ color: '#D4AF37' }}>Asterdex</span> using Nollya's referral code, 
                which helps him save on trading fees.
              </p>
              <p>
                Our beloved Panda on the moon sends crypto signals to the Panda on Earth using <span className="font-bold" style={{ color: '#00ff41' }}>DeepSeek AI</span> to 
                get better trading recommendations! 🤖
              </p>
            </div>
          </div>

          {/* Referral Section */}
          <div 
            className="rounded-xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 65, 0.15), rgba(0, 200, 50, 0.15))',
              border: '3px solid #00ff41'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4 flex items-center gap-3"
              style={{
                color: '#00ff41',
                textShadow: '0 0 10px rgba(0, 255, 65, 0.8)'
              }}
            >
              🎁 Asterdex Referral
            </h3>
            <div className="text-center">
              <p 
                className="mb-3 text-lg"
                style={{
                  color: '#ffffff',
                  textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
                }}
              >
                Trade on Asterdex and save on fees with our referral link:
              </p>
              <a
                href="https://www.asterdex.com/en/referral/bb1B47"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #00ff41, #00cc33)',
                  color: '#000000',
                  boxShadow: '0 0 20px rgba(0, 255, 65, 0.6)',
                  textShadow: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 65, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.6)';
                }}
              >
                🔗 asterdex.com/en/referral/bb1B47
              </a>
            </div>
          </div>

          {/* Project Info Section */}
          <div 
            className="rounded-xl p-6 mb-6"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '3px solid #D4AF37'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4 flex items-center gap-3"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            >
              🏆 Asterdex Vibe Coding Competition
            </h3>
            <div 
              className="space-y-4 text-lg leading-relaxed"
              style={{
                color: '#ffffff',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
              }}
            >
              <p>
                Once the Panda completes the <span className="font-bold" style={{ color: '#00ff41' }}>$10 USD profit</span>, he can reach the moon! 🌙
              </p>
              <p>
                This dashboard was created for the <span className="font-bold" style={{ color: '#D4AF37' }}>Asterdex Vibe Coding Competition</span>. 
                We built it in <span className="font-bold">4 days</span>, inspired by <span className="font-bold" style={{ color: '#D4AF37' }}>ancient Chinese culture</span> to 
                give it a unique local flavor.
              </p>
              <p>
                We are learning <span className="font-bold" style={{ color: '#00ff41' }}>React</span> and <span className="font-bold" style={{ color: '#00ff41' }}>UI design</span>, 
                and AI has helped us greatly to create this site!
              </p>
              <p className="font-bold" style={{ color: '#FFD700' }}>
                You are free to explore the site and you will surely have fun with it! 
                All the trading data is <span style={{ color: '#00ff41' }}>100% real</span>! 📊
              </p>
            </div>
          </div>

          {/* Social Links Section */}
          <div 
            className="rounded-xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(139, 69, 19, 0.3))',
              border: '3px solid #D4AF37'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4 text-center"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            >
              🌐 Follow Us
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://twitter.com/nollyacoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
                  color: '#ffffff',
                  boxShadow: '0 0 15px rgba(29, 161, 242, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(29, 161, 242, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(29, 161, 242, 0.5)';
                }}
              >
                <span className="text-2xl">🐦</span>
                <span>@nollyacoin</span>
              </a>

              <a
                href="https://t.me/NollyaCoin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #0088cc, #006699)',
                  color: '#ffffff',
                  boxShadow: '0 0 15px rgba(0, 136, 204, 0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 136, 204, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 136, 204, 0.5)';
                }}
              >
                <span className="text-2xl">✈️</span>
                <span>NollyaCoin</span>
              </a>
            </div>
          </div>

          {/* Donation Section */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '3px solid #D4AF37'
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4 text-center"
              style={{
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
              }}
            >
              💝 Support DeepSeek API Costs
            </h3>
            <div 
              className="space-y-3 text-center"
              style={{
                color: '#ffffff',
                textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'
              }}
            >
              <p className="text-lg">
                If you want to help us cover the DeepSeek AI API costs, you can send BNB or any coin to:
              </p>
              <div 
                className="p-4 rounded-lg font-mono text-sm break-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '2px solid #D4AF37',
                  color: '#00ff41',
                  textShadow: '0 0 8px rgba(0, 255, 65, 0.6)'
                }}
              >
                <div className="mb-2 font-bold" style={{ color: '#FFD700' }}>ENS: nollya.eth</div>
                <div>0x2FFFC3Fc7e9A9f7209555d7605aedC78Debb1B47</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p 
              className="text-xl font-bold"
              style={{
                fontFamily: 'serif',
                color: '#D4AF37',
                textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                letterSpacing: '0.1em'
              }}
            >
              Best Regards,
            </p>
            <p 
              className="text-2xl font-bold mt-2"
              style={{
                fontFamily: 'serif',
                color: '#FFD700',
                textShadow: '0 0 15px rgba(255, 215, 0, 0.8)',
                letterSpacing: '0.15em'
              }}
            >
              💎 Nollya Team 💎
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #8B4513, #654321)',
              border: '3px solid #D4AF37',
              color: '#FFD700',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.6)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Decorative bottom border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-3"
          style={{
            background: 'repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 12px, #8B4513 12px, #8B4513 24px)',
            boxShadow: '0 -2px 8px rgba(212, 175, 55, 0.6)'
          }}
        />
      </div>
    </div>
  );
};
