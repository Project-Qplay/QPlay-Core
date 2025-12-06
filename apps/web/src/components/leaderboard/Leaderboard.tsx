import React, { useState } from 'react';

interface LeaderboardProps {
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  // Mock leaderboard data
  const leaderboardData = [
    { id: 1, username: 'QuantumMaster', score: 9850, completionTime: 1320, level: 10 },
    { id: 2, username: 'SchrödingersCat', score: 9400, completionTime: 1440, level: 9 },
    { id: 3, username: 'HeisenbergUncertain', score: 9100, completionTime: 1500, level: 8 },
    { id: 4, username: 'QuantumPlayer', score: 8750, completionTime: 1620, level: 4 },
    { id: 5, username: 'WaveFunction', score: 8200, completionTime: 1680, level: 7 },
    { id: 6, username: 'SpookyAction', score: 7900, completionTime: 1740, level: 6 },
    { id: 7, username: 'DiracDelta', score: 7600, completionTime: 1800, level: 6 },
    { id: 8, username: 'PlanckConstant', score: 7300, completionTime: 1860, level: 5 },
    { id: 9, username: 'BohrModel', score: 7000, completionTime: 1920, level: 4 },
    { id: 10, username: 'EigenState', score: 6800, completionTime: 1980, level: 4 },
  ];

  const [activeTab, setActiveTab] = useState<'score' | 'time' | 'level'>('score');

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl max-w-4xl w-full p-6 mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close Leaderboard"
        >
          ×
        </button>
        <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Quantum Leaderboards
        </h2>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('score')}
            className={`px-6 py-2 font-bold ${
              activeTab === 'score'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Best Score
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-6 py-2 font-bold ${
              activeTab === 'time'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Fastest Time
          </button>
          <button
            onClick={() => setActiveTab('level')}
            className={`px-6 py-2 font-bold ${
              activeTab === 'level'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Highest Level
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-y-auto max-h-[60vh]">
          <table className="w-full text-gray-300">
            <thead className="text-left bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Rank</th>
                <th className="px-4 py-3">User</th>
                {activeTab === 'score' && <th className="px-4 py-3">Score</th>}
                {activeTab === 'time' && <th className="px-4 py-3">Time</th>}
                {activeTab === 'level' && <th className="px-4 py-3">Level</th>}
                <th className="px-4 py-3 rounded-tr-lg"></th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData
                .sort((a, b) => {
                  if (activeTab === 'score') return b.score - a.score;
                  if (activeTab === 'time') return a.completionTime - b.completionTime;
                  return b.level - a.level;
                })
                .map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-800/30' : 'bg-gray-800/10'
                    } ${
                      entry.username === 'QuantumPlayer' ? 'bg-purple-900/30 border-l-2 border-purple-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold">
                      {index + 1}
                      {index < 3 && (
                        <span className="ml-1">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-2">
                          {entry.username.charAt(0)}
                        </div>
                        {entry.username}
                      </div>
                    </td>
                    {activeTab === 'score' && (
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                        {entry.score.toLocaleString()}
                      </td>
                    )}
                    {activeTab === 'time' && (
                      <td className="px-4 py-3 font-mono font-bold text-green-400">
                        {formatTime(entry.completionTime)}
                      </td>
                    )}
                    {activeTab === 'level' && (
                      <td className="px-4 py-3 font-mono font-bold text-yellow-400">
                        {entry.level}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      {entry.username === 'QuantumPlayer' && (
                        <span className="text-xs font-bold text-purple-400">YOU</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
