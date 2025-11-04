import React, { useEffect, useState } from 'react';

interface Heart {
  id: number;
  x: number;
  y: number;
  floatX: number;
  emoji: string;
  size: number;
}

interface HeartAnimationProps {
  heartRate: number; // Hearts per second (based on profit)
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  accountBalance: number; // Balance to determine heart size
}

export const HeartAnimation: React.FC<HeartAnimationProps> = ({
  heartRate,
  fromPosition,
  toPosition,
  accountBalance,
}) => {
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [heartId, setHeartId] = useState(0);

  useEffect(() => {
    if (heartRate <= 0) return;

    const interval = setInterval(() => {
      // Heart size increases with balance
      let heartSize = 24; // Base size
      if (accountBalance > 100) heartSize = 28;
      if (accountBalance > 250) heartSize = 32;
      if (accountBalance > 500) heartSize = 40;
      if (accountBalance > 750) heartSize = 48;
      if (accountBalance > 1000) heartSize = 56;

      const newHeart: Heart = {
        id: heartId,
        x: fromPosition.x,
        y: fromPosition.y,
        floatX: (Math.random() - 0.5) * 300, // Random horizontal movement
        emoji: Math.random() > 0.3 ? '❤️' : Math.random() > 0.5 ? '💕' : '💖',
        size: heartSize,
      };

      setHearts((prev) => [...prev, newHeart]);
      setHeartId((prev) => prev + 1);

      // Remove heart after animation completes
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 5000);
    }, 1000 / heartRate); // Interval based on heart rate

    return () => clearInterval(interval);
  }, [heartRate, fromPosition, accountBalance]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart absolute"
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: `${heart.size}px`,
            '--float-x': `${heart.floatX}px`,
          } as React.CSSProperties}
        >
          {heart.emoji}
        </div>
      ))}
    </div>
  );
};

// Hook to calculate heart rate based on account balance (not just profit)
export function useHeartRate(accountBalance: number, winRate: number) {
  const [heartRate, setHeartRate] = useState(1);

  useEffect(() => {
    // Base heart rate: 1 heart per second
    let rate = 1;

    // Increase based on balance (the more money, the more kisses she sends!)
    if (accountBalance > 50) rate = 2;
    if (accountBalance > 100) rate = 3;
    if (accountBalance > 250) rate = 4;
    if (accountBalance > 500) rate = 5;
    if (accountBalance > 750) rate = 6;
    if (accountBalance > 1000) rate = 8;

    // Bonus for high win rate
    if (winRate > 70) rate += 1;
    if (winRate > 85) rate += 2;

    setHeartRate(rate);
  }, [accountBalance, winRate]);

  return heartRate;
}
