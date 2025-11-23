import React, { useState } from 'react';
import { BookOpen, Lock, CheckCircle, Zap, Network, AlertTriangle, RotateCcw } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { Room } from '../../types/game';

interface QuantumConcept {
  id: string;
  name: string;
  room: string;
  description: string;
  formula: string;
  connected: boolean;
}

const QuantumArchive: React.FC = () => {
  const { gameState, completeRoom } = useGame();
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showAdvancedQuests, setShowAdvancedQuests] = useState(false);
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastAttemptFeedback, setLastAttemptFeedback] = useState<string>('');
  const [maxAttempts] = useState(5);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const quantumConcepts: QuantumConcept[] = [
    {
      id: 'probability',
      name: 'Quantum Probability',
      room: 'Probability Bay',
      description: 'Probabilistic nature of quantum measurements',
      formula: 'P(|ψ⟩) = |⟨φ|ψ⟩|²',
      connected: false
    },
    {
      id: 'state',
      name: 'Quantum States',
      room: 'State Chamber',
      description: 'Pure and mixed quantum states on the Bloch sphere',
      formula: '|ψ⟩ = α|0⟩ + β|1⟩',
      connected: false
    },
    {
      id: 'superposition',
      name: 'Superposition',
      room: 'Superposition Tower',
      description: 'Linear combination of quantum states',
      formula: 'H|0⟩ = (|0⟩ + |1⟩)/√2',
      connected: false
    },
    {
      id: 'entanglement',
      name: 'Quantum Entanglement',
      room: 'Entanglement Bridge',
      description: 'Non-local correlations and Bell inequalities',
      formula: '|Φ⁺⟩ = (|00⟩ + |11⟩)/√2',
      connected: false
    },
    {
      id: 'tunneling',
      name: 'Quantum Tunneling',
      room: 'Tunneling Vault',
      description: 'Particle transmission through energy barriers',
      formula: 'T ≈ e^(-2κa)',
      connected: false
    }
  ];

  const advancedQuests = [
    {
      title: 'Quantum Teleportation',
      description: 'Master the art of transferring quantum information across space',
      difficulty: 'Advanced',
      concepts: ['entanglement', 'measurement', 'classical communication']
    },
    {
      title: "Grover's Search Algorithm",
      description: 'Accelerate database searches with quantum advantage',
      difficulty: 'Expert',
      concepts: ['superposition', 'amplitude amplification', 'oracle queries']
    },
    {
      title: 'Quantum Error Correction',
      description: 'Protect fragile quantum states from decoherence',
      difficulty: 'Master',
      concepts: ['redundancy', 'syndrome detection', 'stabilizer codes']
    },
    {
      title: 'Quantum Cryptography',
      description: 'Secure communication using quantum key distribution',
      difficulty: 'Expert',
      concepts: ['no-cloning theorem', 'eavesdropping detection', 'BB84 protocol']
    }
  ];

  // Cooldown effect
React.useEffect(() => {
  let interval: ReturnType<typeof setInterval>;
  if (isOnCooldown && cooldownTime > 0) {
    interval = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          setIsOnCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isOnCooldown, cooldownTime]);


  const toggleConceptSelection = (conceptId: string) => {
    if (isOnCooldown) return;
    
    setSelectedConcepts(prev => 
      prev.includes(conceptId)
        ? prev.filter(id => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const validateRequiredRooms = () => {
    const requiredRooms: Room[] = ['probability-bay', 'state-chamber', 'superposition-tower', 'entanglement-bridge', 'tunneling-vault'];
    return requiredRooms.every(room => gameState.completedRooms.includes(room));
  };

  const analyzeConnection = (selected: string[]) => {
    const correctConcepts = ['probability', 'state', 'superposition', 'entanglement', 'tunneling'];
    const missing = correctConcepts.filter(concept => !selected.includes(concept));
    const extra = selected.filter(concept => !correctConcepts.includes(concept));
    
    if (missing.length === 0 && extra.length === 0) {
      return { isCorrect: true, feedback: '' };
    }

    let feedback = 'Connection analysis: ';
    if (missing.length > 0) {
      feedback += `Missing concepts: ${missing.join(', ')}. `;
    }
    if (extra.length > 0) {
      feedback += `Unnecessary concepts: ${extra.join(', ')}. `;
    }
    if (selected.length < correctConcepts.length) {
      feedback += 'Remember: quantum mechanics is interconnected - all fundamental concepts must be unified. ';
    }
    
    return { isCorrect: false, feedback };
  };

  const attemptConnection = () => {
    if (isOnCooldown || attemptsRemaining <= 0) return;

    const attempts = connectionAttempts + 1;
    setConnectionAttempts(attempts);
    setAttemptsRemaining(prev => prev - 1);

    // Verify all prerequisite rooms are completed
    if (!validateRequiredRooms()) {
      setLastAttemptFeedback('Error: You must complete all quantum rooms before accessing the archive.');
      startCooldown(5);
      return;
    }

    // Analyze the current connection
    const analysis = analyzeConnection(selectedConcepts);
    
    if (analysis.isCorrect) {
      setArchiveUnlocked(true);
      setShowAdvancedQuests(true);
      setLastAttemptFeedback('Perfect! All quantum concepts successfully connected. Archive unlocked!');
      completeRoom('quantum-archive');
    } else {
      setLastAttemptFeedback(analysis.feedback);
      
      // Progressive cooldown based on attempt number
      const cooldownDuration = Math.min(10 + (attempts - 1) * 5, 30);
      startCooldown(cooldownDuration);
      
      // If max attempts reached, require reset
      if (attemptsRemaining <= 1) {
        setLastAttemptFeedback(
          'Maximum attempts reached. The quantum field is destabilized. Please reset to try again.'
        );
      }
    }
  };

  const startCooldown = (duration: number) => {
    setIsOnCooldown(true);
    setCooldownTime(duration);
  };

  const resetAttempts = () => {
    setConnectionAttempts(0);
    setAttemptsRemaining(maxAttempts);
    setSelectedConcepts([]);
    setLastAttemptFeedback('');
    setIsOnCooldown(false);
    setCooldownTime(0);
  };

  const getCompletedRoomsCount = () => {
    return gameState.completedRooms.length;
  };

  const isConceptAvailable = (conceptId: string) => {
    const roomMapping = {
      'probability': 'probability-bay',
      'state': 'state-chamber',
      'superposition': 'superposition-tower',
      'entanglement': 'entanglement-bridge',
      'tunneling': 'tunneling-vault'
    };
    
// Safely map concept ID to its corresponding room.
// If the concept doesn't exist in the mapping, return false to avoid passing undefined.
// This prevents TypeScript errors and runtime bugs when checking completedRooms.
const mappedRoom = roomMapping[conceptId as keyof typeof roomMapping];
if (!mappedRoom) return false;

return gameState.completedRooms.includes(mappedRoom as Room);

    // return gameState.completedRooms.includes(roomMapping[conceptId as keyof typeof roomMapping]); -- causing error : Argument of type 'string' is not assignable to parameter of type 'Room'.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            QUANTUM ARCHIVE
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            The final synthesis. Connect your quantum knowledge to unlock the archive and discover 
            that quantum mechanics is not linear but deeply interconnected across all phenomena.
          </p>
        </div>

        {/* Progress Summary */}
        <div className="mb-8 p-6 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
            Your Quantum Journey
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { name: 'Probability Bay', icon: '🎲', completed: gameState.completedRooms.includes('probability-bay') },
              { name: 'State Chamber', icon: '🔮', completed: gameState.completedRooms.includes('state-chamber') },
              { name: 'Superposition Tower', icon: '🗼', completed: gameState.completedRooms.includes('superposition-tower') },
              { name: 'Entanglement Bridge', icon: '🌉', completed: gameState.completedRooms.includes('entanglement-bridge') },
              { name: 'Tunneling Vault', icon: '🏛️', completed: gameState.completedRooms.includes('tunneling-vault') }
            ].map((room, index) => (
              <div key={index} className={`p-4 rounded-xl text-center ${
                room.completed ? 'bg-green-900/30 border border-green-500' : 'bg-gray-700/50 border border-gray-600'
              }`}>
                <div className="text-3xl mb-2">{room.icon}</div>
                <div className="text-sm font-medium">{room.name}</div>
                {room.completed && <CheckCircle className="w-4 h-4 text-green-400 mx-auto mt-2" />}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-lg font-semibold">
              Progress: {getCompletedRoomsCount()}/5 Rooms Completed
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quantum Synthesis Puzzle */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Network className="w-6 h-6 mr-3 text-purple-400" />
              Quantum Synthesis Console
            </h2>

            <p className="text-gray-300 mb-6">
              Connect the quantum concepts to unlock the archive. Remember: quantum mechanics is not 
              a collection of separate phenomena, but a unified framework where all concepts are 
              deeply interconnected.
            </p>

            <div className="space-y-4 mb-6">
              {quantumConcepts.map((concept) => (
                <div
                  key={concept.id}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    !isConceptAvailable(concept.id) || isOnCooldown
                      ? 'opacity-50 cursor-not-allowed border-gray-600 bg-gray-800/30'
                      : selectedConcepts.includes(concept.id)
                      ? 'border-purple-400 bg-purple-900/30'
                      : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                  onClick={() => isConceptAvailable(concept.id) && !isOnCooldown && toggleConceptSelection(concept.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-lg">{concept.name}</h3>
                        {!isConceptAvailable(concept.id) && <Lock className="w-4 h-4 ml-2 text-gray-500" />}
                        {selectedConcepts.includes(concept.id) && <CheckCircle className="w-4 h-4 ml-2 text-purple-400" />}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{concept.description}</p>
                      <div className="text-xs font-mono text-cyan-400 bg-gray-900/50 px-2 py-1 rounded">
                        {concept.formula}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">From: {concept.room}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Selected: {selectedConcepts.length}/5 concepts</span>
                <span className={attemptsRemaining <= 2 ? 'text-red-400' : 'text-gray-400'}>
                  Attempts remaining: {attemptsRemaining}/{maxAttempts}
                </span>
              </div>
              
              {isOnCooldown && (
                <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                    <span className="text-red-300 font-semibold">
                      Quantum Field Cooldown: {cooldownTime}s
                    </span>
                  </div>
                  <p className="text-red-200 text-sm mt-2">
                    The quantum field is destabilized. Please wait before attempting another connection.
                  </p>
                </div>
              )}

              {lastAttemptFeedback && !isOnCooldown && (
                <div className={`p-4 rounded-xl border ${
                  archiveUnlocked 
                    ? 'bg-green-900/30 border-green-500' 
                    : attemptsRemaining <= 0
                    ? 'bg-red-900/30 border-red-500'
                    : 'bg-yellow-900/30 border-yellow-500'
                }`}>
                  <p className={`font-semibold ${
                    archiveUnlocked 
                      ? 'text-green-300' 
                      : attemptsRemaining <= 0 
                      ? 'text-red-300'
                      : 'text-yellow-300'
                  }`}>
                    {archiveUnlocked ? 'Success!' : attemptsRemaining <= 0 ? 'Connection Failed' : 'Connection Analysis'}
                  </p>
                  <p className={`text-sm mt-2 ${
                    archiveUnlocked 
                      ? 'text-green-200' 
                      : attemptsRemaining <= 0 
                      ? 'text-red-200'
                      : 'text-yellow-200'
                  }`}>
                    {lastAttemptFeedback}
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={attemptConnection}
                  disabled={selectedConcepts.length === 0 || isOnCooldown || attemptsRemaining <= 0 || archiveUnlocked}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 
                           hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 
                           disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                           transition-all duration-300 transform hover:scale-105"
                >
                  {isOnCooldown ? `Cooldown (${cooldownTime}s)` : 'Connect Quantum Concepts'}
                </button>

                {(attemptsRemaining <= 0 || connectionAttempts > 0) && !archiveUnlocked && (
                  <button
                    onClick={resetAttempts}
                    disabled={isOnCooldown}
                    className="px-4 py-4 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold 
                             transition-all duration-300 flex items-center"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Archive Content */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-indigo-400" />
              Quantum Archive
            </h2>

            {!archiveUnlocked ? (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Archive Locked</p>
                <p className="text-sm text-gray-500">
                  Complete the quantum synthesis puzzle to unlock advanced content
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <p className="text-green-300 font-semibold">🎉 Archive Unlocked!</p>
                  <p className="text-green-200 text-sm mt-2">
                    Congratulations! You've completed all quantum rooms and demonstrated 
                    mastery of quantum mechanical principles. The archive is now yours to explore.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    Advanced Quantum Quests
                  </h3>
                  
                  <div className="space-y-4">
                    {advancedQuests.map((quest, index) => (
                      <div key={index} className="p-4 bg-gray-700/50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{quest.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            quest.difficulty === 'Advanced' ? 'bg-blue-900 text-blue-300' :
                            quest.difficulty === 'Expert' ? 'bg-orange-900 text-orange-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {quest.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{quest.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {quest.concepts.map((concept, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-900/50 text-purple-300 
                                                   rounded-full text-xs">
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-indigo-900/30 border border-indigo-500 rounded-xl">
                  <h3 className="font-semibold text-indigo-300 mb-2">Quantum Mastery Achieved</h3>
                  <p className="text-indigo-200 text-sm">
                    You've demonstrated understanding of the fundamental interconnectedness of quantum 
                    mechanics. From probability and superposition to entanglement and tunneling, these 
                    concepts form a unified quantum framework that describes the deepest workings of our universe.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumArchive;
