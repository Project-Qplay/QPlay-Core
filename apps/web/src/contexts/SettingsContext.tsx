import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface GameSettings {
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  theme: 'dark' | 'light' | 'auto';
  animations: boolean;
  particles: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  autoSave: boolean;
  showHints: boolean;
}

interface SettingsContextType {
  settings: GameSettings;
  updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  resetToDefaults: () => void;
  playSound: (soundType: 'click' | 'success' | 'error' | 'measurement' | 'quantum') => void;
  playMusic: (track: 'ambient' | 'tension' | 'victory') => void;
  stopMusic: () => void;
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  musicVolume: 70,
  sfxVolume: 80,
  theme: 'dark',
  animations: true,
  particles: true,
  difficulty: 'normal',
  autoSave: true,
  showHints: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentMusic, setCurrentMusic] = useState<HTMLAudioElement | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const ctx = new AudioContext();
      setAudioContext(ctx);
    }
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('quantumQuestSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Failed to parse saved settings, using defaults');
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quantumQuestSettings', JSON.stringify(settings));
    
    // Apply theme changes
    applyTheme(settings.theme);
  }, [settings]);

  const applyTheme = (theme: 'dark' | 'light' | 'auto') => {
    const root = document.documentElement;
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  // Audio synthesis for sound effects
  const synthesizeSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContext || !settings.soundEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    const volume = (settings.sfxVolume / 100) * 0.1; // Scale down for comfort
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playSound = (soundType: 'click' | 'success' | 'error' | 'measurement' | 'quantum') => {
    if (!settings.soundEnabled) return;

    switch (soundType) {
      case 'click':
        synthesizeSound(800, 0.1, 'square');
        break;
      case 'success':
        // Success chord
        synthesizeSound(523, 0.2); // C
        setTimeout(() => synthesizeSound(659, 0.2), 100); // E
        setTimeout(() => synthesizeSound(784, 0.3), 200); // G
        break;
      case 'error':
        synthesizeSound(200, 0.3, 'sawtooth');
        break;
      case 'measurement':
        // Quantum measurement sound - random frequency
        const freq = 400 + Math.random() * 400;
        synthesizeSound(freq, 0.15, 'triangle');
        break;
      case 'quantum':
        // Ethereal quantum sound
        synthesizeSound(440, 0.5, 'sine');
        setTimeout(() => synthesizeSound(554, 0.5, 'sine'), 100);
        setTimeout(() => synthesizeSound(659, 0.5, 'sine'), 200);
        break;
    }
  };

  const playMusic = (track: 'ambient' | 'tension' | 'victory') => {
    if (!settings.soundEnabled) return;

    // Stop current music
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
    }

    // For now, we'll use synthesized ambient sounds
    // In a real app, you'd load actual audio files
    if (track === 'ambient') {
      // Create ambient drone
      if (audioContext) {
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(110, audioContext.currentTime); // Low A
        oscillator2.frequency.setValueAtTime(165, audioContext.currentTime); // Low E
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        const volume = (settings.musicVolume / 100) * 0.05;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        
        oscillator1.start();
        oscillator2.start();
        
        // Store reference for stopping
        setTimeout(() => {
          oscillator1.stop();
          oscillator2.stop();
        }, 30000); // 30 second ambient loop
      }
    }
  };

  const stopMusic = () => {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
      setCurrentMusic(null);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      resetToDefaults,
      playSound,
      playMusic,
      stopMusic
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};