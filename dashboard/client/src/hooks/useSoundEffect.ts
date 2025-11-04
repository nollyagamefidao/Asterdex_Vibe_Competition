import { useRef, useCallback } from 'react';

/**
 * Custom hook for playing sound effects
 * Inspired by ancient Chinese production sounds:
 * - Hammering and clanking (metalwork)
 * - Wooden movements (carts, looms)
 * - Chinese coins jingling
 */
export const useSoundEffect = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first use
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('✅ AudioContext initialized');
      } catch (error) {
        console.error('❌ Failed to create AudioContext:', error);
        return null;
      }
    }
    
    // Resume AudioContext if it's suspended (browser autoplay policy)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log('🔊 AudioContext resumed');
      });
    }
    
    return audioContextRef.current;
  }, []);

  /**
   * Play ancient Chinese coin sound
   * Simulates brass/bronze coins jingling with metallic harmonics
   */
  const playCoinSound = useCallback(() => {
    console.log('🪙 Attempting to play coin sound...');
    try {
      const audioContext = getAudioContext();
      if (!audioContext) {
        console.error('❌ AudioContext not available');
        return;
      }
      console.log('✅ AudioContext state:', audioContext.state);
      const now = audioContext.currentTime;

      // Create multiple oscillators for a richer, metallic coin sound
      const frequencies = [800, 1200, 1600, 2400]; // Metallic harmonics
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Use sine wave for bell-like tones (ancient bronze)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        
        // Fast attack, medium decay (coin hitting surface)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15 / (index + 1), now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(now);
        oscillator.stop(now + 0.35);
      });

      // Add a subtle "clang" (hammer on bronze)
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.1;
      }
      
      const noise = audioContext.createBufferSource();
      noise.buffer = noiseBuffer;
      
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1000;
      
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0.1, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      
      noise.start(now);
      noise.stop(now + 0.1);
      
    } catch (error) {
      console.warn('Could not play sound effect:', error);
    }
  }, [getAudioContext]);

  /**
   * Play Chinese gong/bell sound
   * Deep, resonant bronze sound for important actions
   */
  const playGongSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;

      // Low frequency for deep gong sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.5);
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 1.5);
      
    } catch (error) {
      console.warn('Could not play gong sound:', error);
    }
  }, [getAudioContext]);

  /**
   * Play wooden clack sound (like bamboo strips or abacus beads)
   */
  const playWoodClackSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;
      const now = audioContext.currentTime;

      // Quick percussive sound (wood hitting wood)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
      
    } catch (error) {
      console.warn('Could not play wood clack sound:', error);
    }
  }, [getAudioContext]);

  /**
   * Play ancient Chinese workshop sound
   * Combination of coin jingle + wooden movement
   */
  const playWorkshopSound = useCallback(() => {
    playCoinSound();
    setTimeout(() => playWoodClackSound(), 50);
  }, [playCoinSound, playWoodClackSound]);

  return {
    playCoinSound,
    playGongSound,
    playWoodClackSound,
    playWorkshopSound
  };
};
