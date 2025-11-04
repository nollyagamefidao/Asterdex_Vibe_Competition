import { useState, useEffect, useRef } from 'react';

interface AIRecommendation {
  title?: string;
  message: string;
  timestamp: number;
  cycle?: number;
}

export function useAIRecommendation() {
  const [recommendation, setRecommendation] = useState<AIRecommendation>({
    message: 'Waiting for trading signals...',
    timestamp: Date.now(),
  });
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [playGong, setPlayGong] = useState(false);
  const lastTimestampRef = useRef<number>(0);
  const cycleCountRef = useRef<number>(0);
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const response = await fetch('/api/ai-recommendation');
        const data: AIRecommendation = await response.json();

        // Check if this is a new recommendation
        if (data.timestamp && data.timestamp !== lastTimestampRef.current) {
          lastTimestampRef.current = data.timestamp;
          cycleCountRef.current += 1;

          // Show every new recommendation
          setRecommendation(data);
          setShowRecommendation(true);
          setPlayGong(true);

          // Clear any existing timer
          if (displayTimerRef.current) {
            clearTimeout(displayTimerRef.current);
          }

          // Hide after 30 seconds
          displayTimerRef.current = setTimeout(() => {
            setShowRecommendation(false);
          }, 30000);

          // Reset gong flag after playing
          setTimeout(() => setPlayGong(false), 100);
        }
      } catch (error) {
        console.error('Error fetching AI recommendation:', error);
      }
    };

    // Initial fetch
    fetchRecommendation();

    // Poll every 5 seconds
    const interval = setInterval(fetchRecommendation, 5000);

    return () => {
      clearInterval(interval);
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
      }
    };
  }, []);

  return { recommendation, showRecommendation, playGong };
}
