import { useEffect, useState } from "react";

export default function LiveIndicator() {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getTimeSince = () => {
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className="flex items-center gap-2" data-testid="live-indicator">
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-2 h-2 bg-profit rounded-full animate-ping opacity-75" />
          <div className="relative w-2 h-2 bg-profit rounded-full" />
        </div>
        <span className="text-sm font-medium text-profit">Live</span>
      </div>
      <span className="text-sm text-muted-foreground">• Updated {getTimeSince()}</span>
    </div>
  );
}
