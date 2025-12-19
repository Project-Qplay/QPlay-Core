import React from 'react';

interface AchievementsProps {
  onClose: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onClose }) => {
  // Mock achievements data
  const achievements = [
    {
      id: 1,
      title: "Quantum Pioneer",
      description: "Complete your first quantum puzzle",
      icon: "🚀",
      unlocked: true,
      progress: 100,
    },
    {
      id: 2,
      title: "Superposition Master",
      description: "Solve the Superposition Tower in under 5 minutes",
      icon: "⏱️",
      unlocked: true,
      progress: 100,
    },
    {
      id: 3,
      title: "Entanglement Expert",
      description: "Successfully entangle 10 qubit pairs",
      icon: "🔗",
      unlocked: true,
      progress: 100,
    },
    {
      id: 4,
      title: "Quantum Speedster",
      description: "Complete all rooms in under 30 minutes",
      icon: "⚡",
      unlocked: false,
      progress: 65,
    },
    {
      id: 5,
      title: "Tunneling Technician",
      description: "Use quantum tunneling 20 times",
      icon: "🌀",
      unlocked: false,
      progress: 70,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full p-6 mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close Achievements"
        >
          ×
        </button>
        <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Quantum Achievements
        </h2>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <div className="space-y-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border ${
                  achievement.unlocked
                    ? "bg-purple-900/30 border-purple-500"
                    : "bg-gray-800/30 border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold ${
                        achievement.unlocked ? "text-purple-300" : "text-gray-400"
                      }`}
                    >
                      {achievement.title}
                    </h3>
                    <p
                      className={
                        achievement.unlocked ? "text-gray-300" : "text-gray-500"
                      }
                    >
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Progress: {achievement.progress}%
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <div className="text-green-400 text-sm font-bold">
                      UNLOCKED
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeInModal 0.4s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Achievements;
