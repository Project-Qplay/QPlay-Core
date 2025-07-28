import React, { useState, useEffect } from "react";
import {
  Play,
  BookOpen,
  Trophy,
  Settings as SettingsIcon,
  Atom,
  User,
  LogOut,
  Crown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import QuantumGuide from "./QuantumGuide";
import Achievements from "./Achievements";
import Settings from "./Settings";
import Leaderboard from "./Leaderboard";
import AuthModal from "./auth/AuthModal";

interface MainMenuProps {
  onStartGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showBackstory, setShowBackstory] = useState(false);

  // Tips to display in rotation
  const tips = [
    "⚛️ A qubit can exist in both 0 and 1 at once — that's superposition.",
    "🧩 Measuring a qubit collapses it to a definite state.",
    "🌐 Entangled particles affect each other instantly — even across space!",
    "🔒 Decoherence is the enemy of pure quantum states.",
  ];

  // For rotating tips
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // For showing rank title based on mastery level
  // const getQuantumRank = (level: number) => {
  //   if (level >= 10) return "Quantum Grandmaster";
  //   if (level >= 7) return "Quantum Pilot";
  //   if (level >= 4) return "Qubit Wrangler";
  //   return "Quantum Apprentice";
  // };

  const { user, signOut } = useAuth();

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  }, 6000); // Change every 6 seconds

  return () => clearInterval(interval);
}, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      aria-label="Main Menu"
      tabIndex={-1}
      role="main"
    >
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* User Status Bar */}
        {user ? (
          <div
            className="mb-8 flex items-center justify-between max-w-md mx-auto p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700"
            aria-label="User Status Bar"
            tabIndex={0}
          >
            <div className="flex items-center space-x-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  className="w-10 h-10 rounded-full border-2 border-purple-400"
                  aria-label="User Avatar"
                />
              ) : (
                <User
                  className="w-8 h-8 text-gray-400"
                  aria-label="Default User Icon"
                />
              )}
              <span
                className="font-semibold text-lg text-white"
                aria-label="Username"
              >
                {user?.username}
              </span>
              <Crown
                className="w-5 h-5 text-yellow-400"
                aria-label="User Rank"
              />
            </div>
            <button
              className="ml-4 px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm font-medium text-white flex items-center space-x-2"
              onClick={signOut}
              aria-label="Sign Out"
              tabIndex={0}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="mb-8 flex items-center justify-center max-w-md mx-auto p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700">
            <button
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors text-white font-semibold"
              onClick={() => handleAuthClick("signin")}
              aria-label="Sign In"
              tabIndex={0}
            >
              <User className="w-5 h-5 mr-2 inline" />
              Sign In
            </button>
            <button
              className="ml-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors text-white font-semibold"
              onClick={() => handleAuthClick("signup")}
              aria-label="Sign Up"
              tabIndex={0}
            >
              <User className="w-5 h-5 mr-2 inline" />
              Sign Up
            </button>
          </div>
        )}

        {/* Logo and Title */}
        <div className="mb-12">
          <div className="relative inline-block mb-6">
            <Atom className="w-20 h-20 text-cyan-400 mx-auto animate-spin-slow" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl"></div>
          </div>
          <h1 className="text-6xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            QUANTUM QUEST
          </h1>
          <h2 className="text-2xl font-medium text-gray-300 mb-2">
            The Entangled Escape
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Embark on an extraordinary journey through the quantum realm. Master
            the mysteries of quantum physics through immersive escape rooms that
            challenge your understanding of reality itself.
          </p>
         <p className="text-lg md:text-xl text-cyan-300 italic mt-6 font-semibold tracking-wide drop-shadow-[0_0_8px_#22d3ee]">
  {tips[currentTipIndex]}
</p>
        </div>

        {/* Main Menu Buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          {/* Backstory Button */}
          <button
            onClick={() => setShowBackstory(true)}
            title="Learn the story behind Quantum Quest"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg mb-2"
          >
            <BookOpen className="w-6 h-6" />
            <span>Backstory</span>
          </button>

          <button
            onClick={onStartGame}
            title="Begin or resume your quantum journey"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300
                     transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25
                     flex items-center justify-center space-x-3 text-lg"
          >
            <Play className="w-6 h-6" />
            <span>{user ? "Continue Quest" : "Start Quest"}</span>
          </button>

          <button
            onClick={() => setShowLeaderboard(true)}
            title="See the top quantum minds"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400
                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300
                     transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25
                     flex items-center justify-center space-x-3 text-lg"
          >
            <Crown className="w-6 h-6" />
            <span>Leaderboards</span>
          </button>

          <button
            onClick={() => setShowGuide(true)}
            title="Read about quantum concepts and game tips"
            className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600
                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300
                     transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
          >
            <BookOpen className="w-6 h-6" />
            <span>Quantum Guide</span>
          </button>

          <button
            onClick={() => setShowAchievements(true)}
            title="View your achievements and progress"
            className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600
                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300
                     transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
          >
            <Trophy className="w-6 h-6" />
            <span>Achievements</span>
          </button>

          <button
            onClick={() => setShowSettings(true)}
            title="Adjust game settings and preferences"
            className="w-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600
                     text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300
                     transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
          >
            <SettingsIcon className="w-6 h-6" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Stats Preview */}
        {user && (
          <div className="mt-12 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">
              Your Quantum Journey
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-2xl font-bold text-cyan-400">
                  {user.games_completed}
                </div>
                <div className="text-sm text-gray-400">Games Completed</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-2xl font-bold text-purple-400">
                  {user.total_score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Best Score</div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-2xl font-bold text-green-400">
                  {user.quantum_mastery_level}
                </div>
                <div className="text-sm text-gray-400">Mastery Level</div>
              </div>
{/*               <div className="text-xs text-yellow-400 italic mt-1">
  {getQuantumRank(user.quantum_mastery_level)}
</div> */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700">
                <div className="text-2xl font-bold text-yellow-400">
                  {user.best_completion_time
                    ? `${Math.floor(user.best_completion_time / 60)}m`
                    : "--"}
                </div>
                <div className="text-sm text-gray-400">Best Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Room Preview */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold mb-6 text-gray-300">
            Your Quantum Journey
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              {
                name: "Probability Bay",
                color: "from-blue-500 to-cyan-500",
                icon: "🎲",
              },
              {
                name: "Superposition Tower",
                color: "from-green-500 to-emerald-500",
                icon: "🗼",
              },
              {
                name: "State Chamber",
                color: "from-purple-500 to-violet-500",
                icon: "🔮",
              },
              {
                name: "Entanglement Bridge",
                color: "from-red-500 to-pink-500",
                icon: "🌉",
              },
              {
                name: "Tunneling Vault",
                color: "from-yellow-500 to-orange-500",
                icon: "🏛️",
              },
              {
                name: "Quantum Archive",
                color: "from-indigo-500 to-purple-500",
                icon: "📚",
              },
            ].map((room, index) => (
              <div key={index} className="relative group">
                <div
                  className={`w-full h-24 rounded-lg bg-gradient-to-br ${room.color}
                               opacity-30 group-hover:opacity-50 transition-opacity duration-300
                               flex items-center justify-center text-2xl`}
                >
                  {room.icon}
                </div>
                <div
                  className="absolute inset-0 rounded-lg border border-gray-600 group-hover:border-gray-400
                               transition-colors duration-300"
                ></div>
                <p className="text-xs mt-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {room.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGuide && <QuantumGuide onClose={() => setShowGuide(false)} />}
      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      {showAuth && (
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
        />
      )}

      {/* Backstory Modal */}
      {showBackstory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 border border-purple-700 rounded-2xl shadow-2xl max-w-lg w-full p-8 mx-4 animate-fade-in">
            <button
              onClick={() => setShowBackstory(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              aria-label="Close Backstory"
            >
              ×
            </button>
            <h2 className="text-3xl font-orbitron font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
              Quantum Quest: The Backstory
            </h2>
            <div className="text-gray-200 text-base leading-relaxed space-y-4">
              <p>
                <span className="font-semibold text-purple-300">
                  Dr. Schrödinger
                </span>
                , a brilliant but eccentric quantum physicist, has been
                conducting a series of daring experiments in his secret
                laboratory. His latest project: to entangle the minds of willing
                participants with the very fabric of quantum reality.
              </p>
              <p>
                But something has gone awry. The quantum lab is destabilizing,
                and the boundaries between probability and certainty are
                breaking down. You, a courageous explorer, have volunteered to
                enter the quantum maze and restore stability before the entire
                experiment collapses.
              </p>
              <p>
                <span className="font-semibold text-cyan-300">
                  Your mission:
                </span>{" "}
                Solve quantum puzzles, master the mysteries of entanglement, and
                escape each room before the quantum state decoheres forever. The
                fate of Dr. Schrödinger's experiment—and perhaps reality
                itself—rests in your hands.
              </p>
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
      )}
    </div>
  );
};

export default MainMenu;
