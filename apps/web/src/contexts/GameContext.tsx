import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameState, Room } from '../types/game';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameState: GameState;
  currentRoom: Room;
  currentSessionId: string | null;
  isLoadingSession: boolean;
  setCurrentRoom: (room: Room) => void;
  completeRoom: (room: Room, completionData?: { time: number; attempts: number; score: number }) => Promise<void>;
  resetGame: () => void;
  logQuantumMeasurement: (roomId: string, measurementType: string, measurementData: any) => Promise<void>;
  startNewSession: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialGameState: GameState = {
  completedRooms: [],
  currentProgress: 0,
  achievements: [],
  totalScore: 0
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentRoom, setCurrentRoom] = useState<Room>('probability-bay');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [roomStartTime, setRoomStartTime] = useState<number | null>(null);
  const [roomAttempts, setRoomAttempts] = useState<Record<string, number>>({});

  // Load game state from localStorage or Supabase on mount
  useEffect(() => {
    if (user) {
      // User is authenticated, load from Supabase
      loadGameStateFromSupabase();
    } else {
      // User not authenticated, use localStorage
      loadGameStateFromLocalStorage();
    }
  }, [user]);

  // Save game state to localStorage whenever it changes (backup)
  useEffect(() => {
    localStorage.setItem('quantumQuestGameState', JSON.stringify(gameState));
  }, [gameState]);

  // Save current room to localStorage whenever it changes (backup)
  useEffect(() => {
    localStorage.setItem('quantumQuestCurrentRoom', currentRoom);
  }, [currentRoom]);

  // Track room start time when room changes
  useEffect(() => {
    setRoomStartTime(Date.now());
    setRoomAttempts(prev => ({
      ...prev,
      [currentRoom]: (prev[currentRoom] || 0) + 1
    }));
  }, [currentRoom]);

  const loadGameStateFromLocalStorage = () => {
    const savedGameState = localStorage.getItem('quantumQuestGameState');
    const savedCurrentRoom = localStorage.getItem('quantumQuestCurrentRoom');
    
    if (savedGameState) {
      setGameState(JSON.parse(savedGameState));
    }
    
    if (savedCurrentRoom) {
      setCurrentRoom(savedCurrentRoom as Room);
    }
  };

  const loadGameStateFromSupabase = async () => {
    try {
      setIsLoadingSession(true);
      
      // Get the user's most recent session using updated API
      const sessions = await apiService.getGameSessions(user?.id);
      const currentSession = sessions?.find((session: any) => !session.is_completed);
      
      if (currentSession) {
        // Resume existing session
        setCurrentSessionId(currentSession.id);
        setCurrentRoom(currentSession.current_room || 'probability-bay');
        setGameState({
          completedRooms: currentSession.completed_rooms || [],
          currentProgress: (currentSession.completed_rooms || []).length,
          achievements: [], // Will be loaded separately
          totalScore: currentSession.total_score || 0
        });
      } else {
        // No active session, keep localStorage data or defaults
        loadGameStateFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load game state from Supabase:', error);
      // Fallback to localStorage
      loadGameStateFromLocalStorage();
    } finally {
      setIsLoadingSession(false);
    }
  };

  const startNewSession = async () => {
    if (!user) return;
    
    try {
      const response = await apiService.startGameSession(user.id);
      if (response.success && response.session) {
        setCurrentSessionId(response.session.id);
        setGameState(initialGameState);
        setCurrentRoom('probability-bay');
      }
    } catch (error) {
      console.error('Failed to start new session:', error);
    }
  };

  const completeRoom = async (room: Room, completionData?: { time: number; attempts: number; score: number }) => {
    const roomTime = completionData?.time || (roomStartTime ? Date.now() - roomStartTime : 0);
    const attempts = completionData?.attempts || roomAttempts[room] || 1;
    const score = completionData?.score || 100;

    // Update local state
    setGameState(prev => ({
      ...prev,
      completedRooms: prev.completedRooms.includes(room) 
        ? prev.completedRooms 
        : [...prev.completedRooms, room],
      currentProgress: Math.max(prev.currentProgress, prev.completedRooms.length + 1),
      totalScore: prev.totalScore + score
    }));

    // Update Supabase session if user is authenticated
    if (user && currentSessionId) {
      try {
        const updatedRooms = gameState.completedRooms.includes(room) 
          ? gameState.completedRooms 
          : [...gameState.completedRooms, room];

        const roomTimesData = {
          [room]: roomTime
        };
        
        const roomAttemptsData = {
          [room]: attempts
        };
        
        const roomScoresData = {
          [room]: score
        };

        // Save progress using the correct backend endpoint
        await apiService.saveGameProgress(
          currentSessionId,
          room,
          roomTimesData,
          roomAttemptsData,
          roomScoresData
        );
        
        // Check for achievements
        await checkAndUnlockAchievements(updatedRooms, gameState.totalScore + score);
        
        // If this was the last room, complete the session and submit to leaderboard
        if (updatedRooms.length >= 6) { // Assuming 6 total rooms
          await completeSession(updatedRooms.length, gameState.totalScore + score, roomTime);
        }
      } catch (error) {
        console.error('Failed to update session in Supabase:', error);
      }
    }
  };

  const completeSession = async (roomsCompleted: number, totalScore: number, totalTime: number) => {
    if (!user || !currentSessionId) return;
    
    try {
      await apiService.completeGameSession(
        currentSessionId,
        user.id,
        totalTime,
        totalScore,
        roomsCompleted,
        0, // hints used - could be tracked separately
        'easy' // difficulty - could be stored in session
      );
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  const checkAndUnlockAchievements = async (completedRooms: Room[], totalScore: number) => {
    try {
      // Define achievement conditions
      const achievementChecks = [
        { id: 'first_superposition', condition: completedRooms.includes('superposition-tower') },
        { id: 'entanglement_master', condition: completedRooms.includes('entanglement-bridge') },
        { id: 'tunneling_expert', condition: completedRooms.includes('tunneling-vault') },
        { id: 'quantum_master', condition: completedRooms.length >= 6 },
        { id: 'speed_demon', condition: totalScore >= 1000 },
        { id: 'persistent_player', condition: Object.values(roomAttempts).some(attempts => attempts >= 3) }
      ];

      // Check and unlock new achievements
      for (const check of achievementChecks) {
        if (check.condition && !gameState.achievements.includes(check.id)) {
          setGameState(prev => ({
            ...prev,
            achievements: [...prev.achievements, check.id]
          }));
          
          // Save achievement to Supabase
          try {
            await apiService.unlockAchievement(check.id, currentSessionId || undefined, user?.id);
          } catch (error) {
            console.error(`Failed to unlock achievement ${check.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  const logQuantumMeasurement = async (roomId: string, measurementType: string, measurementData: any) => {
    if (!user || !currentSessionId) return;

    try {
      await apiService.logQuantumMeasurement(currentSessionId, roomId, measurementType, measurementData);
    } catch (error) {
      console.error('Failed to log quantum measurement:', error);
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setCurrentRoom('probability-bay');
    setCurrentSessionId(null);
    setRoomAttempts({});
    localStorage.removeItem('quantumQuestGameState');
    localStorage.removeItem('quantumQuestCurrentRoom');
  };

  // Auto-start session when user enters first room and no session exists
  const handleSetCurrentRoom = async (room: Room) => {
    setCurrentRoom(room);
    
    if (user && !currentSessionId && room === 'probability-bay') {
      await startNewSession();
    }
  };

  return (
    <GameContext.Provider value={{
      gameState,
      currentRoom,
      currentSessionId,
      isLoadingSession,
      setCurrentRoom: handleSetCurrentRoom,
      completeRoom,
      resetGame,
      logQuantumMeasurement,
      startNewSession
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};