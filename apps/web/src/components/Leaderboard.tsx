import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Star, Zap, Medal, Crown, Award, X, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  completion_time?: number;
  total_score: number;
  difficulty: string;
  rooms_completed: number;
  hints_used: number;
  quantum_mastery_score: number;
  achieved_at: string;
  is_current_user: boolean;
}

interface LeaderboardData {
  category: string;
  entries: LeaderboardEntry[];
  total_entries: number;
  current_user_rank?: number;
  current_user_entry?: LeaderboardEntry;
}

interface LeaderboardProps {
  onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'speed' | 'score' | 'mastery'>('speed');
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, [activeCategory, timeFilter, difficultyFilter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: LeaderboardData;
      
      if (timeFilter === 'weekly') {
        data = await apiService.getWeeklyLeaderboard(activeCategory);
      } else {
        switch (activeCategory) {
          case 'speed':
            data = await apiService.getSpeedLeaderboard(50, difficultyFilter === 'all' ? undefined : difficultyFilter);
            break;
          case 'score':
            data = await apiService.getScoreLeaderboard(50, difficultyFilter === 'all' ? undefined : difficultyFilter);
            break;
          case 'mastery':
            data = await apiService.getMasteryLeaderboard(50);
            break;
          default:
            throw new Error('Invalid category');
        }
      }
      
      setLeaderboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'normal': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'speed': return <Clock className="w-5 h-5" />;
      case 'score': return <Star className="w-5 h-5" />;
      case 'mastery': return <Zap className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'speed': return 'Speed Champions';
      case 'score': return 'High Scorers';
      case 'mastery': return 'Quantum Masters';
      default: return 'Leaderboard';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'speed': return 'Fastest completion times for all 6 rooms';
      case 'score': return 'Highest total scores achieved';
      case 'mastery': return 'Best quantum physics understanding and execution';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-2xl font-orbitron font-semibold">Global Leaderboards</h2>
              <p className="text-sm text-gray-400">Compete with quantum physicists worldwide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          {/* Category Tabs */}
          <div className="flex space-x-2">
            {(['speed', 'score', 'mastery'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                {getCategoryIcon(category)}
                <span className="capitalize">{category}</span>
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <div className="flex items-center space-x-4">
            {/* Time Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as 'all' | 'weekly')}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="weekly">This Week</option>
              </select>
            </div>

            {/* Difficulty Filter (for speed and score) */}
            {(activeCategory === 'speed' || activeCategory === 'score') && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as any)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-sm text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-400">Loading leaderboard...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-400 mb-2">Failed to load leaderboard</p>
                <p className="text-gray-500 text-sm">{error}</p>
                <button
                  onClick={fetchLeaderboard}
                  className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg font-semibold transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : leaderboardData ? (
            <div className="p-6">
              {/* Category Info */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-center space-x-2">
                  {getCategoryIcon(activeCategory)}
                  <span>{getCategoryTitle(activeCategory)}</span>
                </h3>
                <p className="text-gray-400 text-sm">{getCategoryDescription(activeCategory)}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {leaderboardData.total_entries} total entries
                  {timeFilter === 'weekly' && ' this week'}
                </p>
              </div>

              {/* Current User Rank (if not in top 50) */}
              {user && leaderboardData.current_user_rank && leaderboardData.current_user_rank > 50 && leaderboardData.current_user_entry && (
                <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500 rounded-xl">
                  <h4 className="font-semibold text-purple-300 mb-2">Your Ranking</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-purple-400 font-bold">#{leaderboardData.current_user_rank}</span>
                      <span className="font-semibold">{leaderboardData.current_user_entry.username}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(leaderboardData.current_user_entry.difficulty)} bg-gray-800`}>
                        {leaderboardData.current_user_entry.difficulty}
                      </span>
                    </div>
                    <div className="text-right">
                      {activeCategory === 'speed' && leaderboardData.current_user_entry.completion_time && (
                        <div className="text-purple-400 font-mono">{formatTime(leaderboardData.current_user_entry.completion_time)}</div>
                      )}
                      {activeCategory === 'score' && (
                        <div className="text-purple-400 font-mono">{leaderboardData.current_user_entry.total_score.toLocaleString()}</div>
                      )}
                      {activeCategory === 'mastery' && (
                        <div className="text-purple-400 font-mono">{leaderboardData.current_user_entry.quantum_mastery_score.toFixed(1)}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Entries */}
              <div className="space-y-2">
                {leaderboardData.entries.map((entry) => (
                  <div
                    key={`${entry.user_id}-${entry.rank}`}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      entry.is_current_user
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center space-x-3">
                          {entry.avatar_url ? (
                            <img
                              src={entry.avatar_url}
                              alt={entry.username}
                              className="w-10 h-10 rounded-full border-2 border-gray-600"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${entry.is_current_user ? 'text-purple-300' : 'text-white'}`}>
                                {entry.username}
                              </span>
                              {entry.is_current_user && (
                                <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded-full">You</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              <span className={getDifficultyColor(entry.difficulty)}>{entry.difficulty}</span>
                              <span>•</span>
                              <span>{entry.rooms_completed}/6 rooms</span>
                              {entry.hints_used > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{entry.hints_used} hints</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="text-right">
                        {activeCategory === 'speed' && entry.completion_time && (
                          <div className="text-lg font-mono text-cyan-400">{formatTime(entry.completion_time)}</div>
                        )}
                        {activeCategory === 'score' && (
                          <div className="text-lg font-mono text-yellow-400">{entry.total_score.toLocaleString()}</div>
                        )}
                        {activeCategory === 'mastery' && (
                          <div className="text-lg font-mono text-purple-400">{entry.quantum_mastery_score.toFixed(1)}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(entry.achieved_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {leaderboardData.entries.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No entries found</p>
                  <p className="text-gray-500 text-sm">
                    {timeFilter === 'weekly' 
                      ? 'No one has completed the game this week yet. Be the first!'
                      : 'Complete the game to appear on the leaderboard!'
                    }
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Complete all 6 quantum rooms to submit your score to the leaderboards!
          </p>
          {!user && (
            <p className="text-purple-400 text-sm mt-2">
              Sign in to track your progress and compete with others
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;