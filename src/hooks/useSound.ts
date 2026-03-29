'use client';

import { useCallback, useRef } from 'react';

// Generate simple beep sounds using Web Audio API
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.log('Audio not supported');
  }
}

export function useSound() {
  const soundsRef = useRef<Record<string, boolean>>({});

  const playDice = useCallback(() => {
    // Rolling dice sound - multiple quick tones
    if (soundsRef.current.dice) return;
    soundsRef.current.dice = true;
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        playTone(200 + Math.random() * 400, 0.1, 'square', 0.15);
      }, i * 50);
    }
    setTimeout(() => { soundsRef.current.dice = false; }, 500);
  }, []);

  const playWin = useCallback(() => {
    // Victory sound - ascending arpeggio
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => {
        playTone(note, 0.3, 'sine', 0.3);
      }, i * 150);
    });
  }, []);

  const playLose = useCallback(() => {
    // Lose sound - descending
    const notes = [400, 350, 300, 250];
    notes.forEach((note, i) => {
      setTimeout(() => {
        playTone(note, 0.3, 'sine', 0.2);
      }, i * 200);
    });
  }, []);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'sine', 0.1);
  }, []);

  const playCard = useCallback(() => {
    playTone(600, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(800, 0.1, 'sine', 0.1), 50);
  }, []);

  const playError = useCallback(() => {
    playTone(200, 0.2, 'square', 0.2);
  }, []);

  const playSuccess = useCallback(() => {
    playTone(800, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(1000, 0.15, 'sine', 0.2), 100);
  }, []);

  const playTurn = useCallback(() => {
    playTone(500, 0.15, 'sine', 0.2);
  }, []);

  return {
    playDice,
    playWin,
    playLose,
    playClick,
    playCard,
    playError,
    playSuccess,
    playTurn,
  };
}
