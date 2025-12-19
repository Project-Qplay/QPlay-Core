import React, { useState } from 'react';
import { Home, Info, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import ProbabilityBay from './rooms/ProbabilityBay';
import StateChambrer from './rooms/StateChambrer';
import SuperpositionTower from './rooms/SuperpositionTower';
import EntanglementBridge from './rooms/EntanglementBridge';
import TunnelingVault from './rooms/TunnelingVault';
import QuantumArchive from './rooms/QuantumArchive';
import RoomSelector from './RoomSelector';
import { Room } from '../types/game';
import PortalTransition from './ui/PortalTransition';

interface GameControllerProps {
  onBackToMenu: () => void;
}

const GameController: React.FC<GameControllerProps> = ({ onBackToMenu }) => {
  const { currentRoom, gameState, setCurrentRoom } = useGame();
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<Room | null>(null);

  const rooms: Room[] = [
    'probability-bay',
    'superposition-tower',
    'state-chamber', 
    'entanglement-bridge',
    'tunneling-vault',
    'quantum-archive'
  ];

  const roomNames = {
    'probability-bay': 'Probability Bay',
    'state-chamber': 'State Chamber',
    'superposition-tower': 'Superposition Tower',
    'entanglement-bridge': 'Entanglement Bridge',
    'tunneling-vault': 'Tunneling Vault',
    'quantum-archive': 'Quantum Archive'
  };

  const currentRoomIndex = rooms.indexOf(currentRoom);
  const canGoNext = currentRoomIndex < rooms.length - 1 && gameState.completedRooms.includes(currentRoom);
  const canGoPrevious = currentRoomIndex > 0;

  const goToNextRoom = () => {
    if (canGoNext) {
      setPendingRoom(rooms[currentRoomIndex + 1]);
      setShowPortal(true);
    }
  };

  const goToPreviousRoom = () => {
    if (canGoPrevious) {
      setPendingRoom(rooms[currentRoomIndex - 1]);
      setShowPortal(true);
    }
  };

  const handlePortalEnd = () => {
    if (pendingRoom) {
      setCurrentRoom(pendingRoom);
      setPendingRoom(null);
    }
    setShowPortal(false);
  };

  const renderCurrentRoom = () => {
    switch (currentRoom) {
      case 'probability-bay':
        return <ProbabilityBay />;
      case 'state-chamber':
        return <StateChambrer />;
      case 'superposition-tower':
        return <SuperpositionTower />;
      case 'entanglement-bridge':
        return <EntanglementBridge />;
      case 'tunneling-vault':
        return <TunnelingVault />;
      case 'quantum-archive':
        return <QuantumArchive />;
      default:
        return <ProbabilityBay />;
    }
  };

  return (
    <div className="min-h-screen">
      <PortalTransition show={showPortal} onEnd={handlePortalEnd} />
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <Home className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-orbitron font-semibold">Quantum Quest</h1>
            <div className="text-sm text-gray-400">
              {roomNames[currentRoom]}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Navigation Arrows */}
            <button
              onClick={goToPreviousRoom}
              disabled={!canGoPrevious}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors duration-200"
              title="Previous Room"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={goToNextRoom}
              disabled={!canGoNext}
              className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors duration-200"
              title={canGoNext ? "Next Room" : "Complete current room to proceed"}
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowRoomSelector(!showRoomSelector)}
              className="px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
            >
              Room Navigator
            </button>
            
            <div className="text-sm text-gray-400">
              Progress: {gameState.completedRooms.length}/6 Rooms
            </div>
          </div>
        </div>
      </header>

      {/* Room Selector Overlay */}
      {showRoomSelector && (
        <RoomSelector onClose={() => setShowRoomSelector(false)} />
      )}

      {/* Current Room */}
      <main className="flex-1">
        {renderCurrentRoom()}
      </main>

      {/* Room Completion Notification */}
      {gameState.completedRooms.includes(currentRoom) && currentRoomIndex < rooms.length - 1 && (
        <div className="fixed bottom-6 right-6 bg-green-900/90 border border-green-500 rounded-xl p-4 max-w-sm">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎉</div>
            <div>
              <p className="text-green-300 font-semibold">Room Completed!</p>
              <p className="text-green-200 text-sm">Ready to proceed to the next challenge?</p>
            </div>
          </div>
          <button
            onClick={goToNextRoom}
            className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg 
                     font-semibold transition-colors duration-200"
          >
            Continue to {roomNames[rooms[currentRoomIndex + 1]]}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameController;
