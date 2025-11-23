import React from 'react';
import { X, Lock, CheckCircle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { Room } from '../types/game';

interface RoomSelectorProps {
  onClose: () => void;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ onClose }) => {
  const { gameState, setCurrentRoom } = useGame();

  const rooms: Array<{
    id: Room;
    name: string;
    description: string;
    concept: string;
    color: string;
    icon: string;
  }> = [
    {
      id: 'probability-bay',
      name: 'Probability Bay',
      description: 'Unravel the mysteries of quantum probabilities',
      concept: 'Quantum vs Classical Probability',
      color: 'from-blue-500 to-cyan-500',
      icon: '🎲'
    },
       {
      id: 'superposition-tower',
      name: 'Superposition Tower',
      description: 'Master superposition and interference',
      concept: 'Wave Function Superposition',
      color: 'from-green-500 to-emerald-500',
      icon: '🗼'
    },
    {
      id: 'state-chamber',
      name: 'State Chamber',
      description: 'Navigate quantum states with the Bloch sphere',
      concept: 'Quantum State Reconstruction',
      color: 'from-purple-500 to-violet-500',
      icon: '🔮'
    },
    {
      id: 'entanglement-bridge',
      name: 'Entanglement Bridge',
      description: 'Conquer nonlocal quantum correlations',
      concept: 'Bell Inequality & Entanglement',
      color: 'from-red-500 to-pink-500',
      icon: '🌉'
    },
    {
      id: 'tunneling-vault',
      name: 'Tunneling Vault',
      description: 'Brave quantum tunneling through barriers',
      concept: 'Quantum Tunneling Effect',
      color: 'from-yellow-500 to-orange-500',
      icon: '🏛️'
    },
    {
      id: 'quantum-archive',
      name: 'Quantum Archive',
      description: 'Synthesize all quantum knowledge',
      concept: 'Quantum Synthesis Challenge',
      color: 'from-indigo-500 to-purple-500',
      icon: '📚'
    }
  ];

  const handleRoomSelect = (roomId: Room) => {
    setCurrentRoom(roomId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-orbitron font-semibold">Room Navigator</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-4">
          {rooms.map((room, index) => {
            const isCompleted = gameState.completedRooms.includes(room.id);
            const isLocked = index > 0 && !gameState.completedRooms.includes(rooms[index - 1].id);
            
            return (
              <div
                key={room.id}
                className={`relative p-6 rounded-xl border transition-all duration-300 ${
                  isLocked
                    ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                    : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer hover:scale-105'
                }`}
                onClick={() => !isLocked && handleRoomSelect(room.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-4xl p-3 rounded-lg bg-gradient-to-r ${room.color} bg-opacity-20`}>
                    {room.icon}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
                <p className="text-gray-400 text-sm mb-3">{room.description}</p>
                <div className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full inline-block">
                  {room.concept}
                </div>

                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Complete previous room to unlock</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;
