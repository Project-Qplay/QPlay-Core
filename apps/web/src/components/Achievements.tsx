import React from 'react';
import { Trophy, Star, Lock, CheckCircle, X } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

interface AchievementsProps {
  onClose: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onClose }) => {
  const { gameState } = useGame();

  const achievements = [
    {
      id: 'first-measurement',
      title: 'First Quantum Measurement',
      description: 'Perform your first quantum measurement in Probability Bay',
      icon: '🎲',
      unlocked: gameState.completedRooms.length > 0,
      rarity: 'common'
    },
    {
      id: 'probability-master',
      title: 'Probability Master',
      description: 'Successfully decode the quantum probability pattern',
      icon: '📊',
      unlocked: gameState.completedRooms.includes('probability-bay'),
      rarity: 'common'
    },
    {
      id: 'state-reconstructor',
      title: 'State Reconstructor',
      description: 'Reconstruct a quantum state using the Bloch sphere',
      icon: '🔮',
      unlocked: gameState.completedRooms.includes('state-chamber'),
      rarity: 'common'
    },
    {
      id: 'superposition-walker',
      title: 'Superposition Walker',
      description: 'Navigate the Superposition Tower using quantum interference',
      icon: '🗼',
      unlocked: gameState.completedRooms.includes('superposition-tower'),
      rarity: 'uncommon'
    },
    {
      id: 'entanglement-prover',
      title: 'Entanglement Prover',
      description: 'Violate Bell inequalities and prove quantum entanglement',
      icon: '🌉',
      unlocked: gameState.completedRooms.includes('entanglement-bridge'),
      rarity: 'rare'
    },
    {
      id: 'quantum-tunneler',
      title: 'Quantum Tunneler',
      description: 'Successfully tunnel through a classically impossible barrier',
      icon: '🏛️',
      unlocked: gameState.completedRooms.includes('tunneling-vault'),
      rarity: 'rare'
    },
    {
      id: 'quantum-scholar',
      title: 'Quantum Scholar',
      description: 'Unlock the Quantum Archive and synthesize all knowledge',
      icon: '📚',
      unlocked: gameState.completedRooms.includes('quantum-archive'),
      rarity: 'epic'
    },
    {
      id: 'speed-runner',
      title: 'Quantum Speed Runner',
      description: 'Complete all rooms in under 30 minutes',
      icon: '⚡',
      unlocked: false, // This would need timer tracking
      rarity: 'legendary'
    },
    {
      id: 'perfectionist',
      title: 'Quantum Perfectionist',
      description: 'Complete all rooms without any failed attempts',
      icon: '💎',
      unlocked: false, // This would need attempt tracking
      rarity: 'legendary'
    },
    {
      id: 'einstein-challenger',
      title: 'Einstein Challenger',
      description: 'Prove that "God does play dice" by mastering quantum mechanics',
      icon: '🧠',
      unlocked: gameState.completedRooms.length === 6,
      rarity: 'mythic'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'uncommon': return 'from-green-500 to-green-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'mythic': return 'from-pink-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityText = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-orbitron font-semibold">Achievements</h2>
              <p className="text-sm text-gray-400">{unlockedCount}/{totalCount} Unlocked</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Overall Progress</span>
            <span className="text-sm text-gray-400">{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="p-6 grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative p-6 rounded-xl border transition-all duration-300 ${
                achievement.unlocked
                  ? 'border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/30'
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}
            >
              {/* Rarity Indicator */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                {getRarityText(achievement.rarity)}
              </div>

              <div className="flex items-start space-x-4">
                <div className={`text-4xl p-3 rounded-lg ${
                  achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-700/50'
                }`}>
                  {achievement.unlocked ? achievement.icon : '🔒'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold ${
                      achievement.unlocked ? 'text-white' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {!achievement.unlocked && <Lock className="w-4 h-4 text-gray-500" />}
                  </div>
                  
                  <p className={`text-sm ${
                    achievement.unlocked ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {achievement.description}
                  </p>

                  {achievement.unlocked && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-semibold">Unlocked!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Complete quantum challenges to unlock more achievements and prove your mastery of quantum mechanics!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Achievements;