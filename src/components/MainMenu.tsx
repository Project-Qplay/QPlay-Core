import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  BookOpen,
  Play,
  Crown,
  Trophy,
  Settings as SettingsIcon,
  Info,
} from "lucide-react";
import { QuantumDashboard } from "./3d/QuantumScene";
import QuantumGuide from "./QuantumGuide";
import Achievements from "./Achievements";
import Settings from "./Settings";
import Leaderboard from "./Leaderboard";
import AuthModal from "./auth/AuthModal";
import { useAuth } from "../contexts/AuthContext";

// Mock user for development - replace with actual auth integration from useAuth()
const mockUser = {
  username: "QuantumPlayer",
  avatar_url: null,
  games_completed: 12,
  total_score: 8750,
  quantum_mastery_level: 4,
  best_completion_time: 340,
};

interface MainMenuProps {
  onStartGame: () => void;
  hide_title?: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  hide_title = false,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [showBackstory, setShowBackstory] = useState(false);
  // Using real auth instead of mock data
  const { user, signOut } = useAuth();

  // Tips to display in rotation
  const tips = [
    "⚛️ A qubit can exist in both 0 and 1 at once — that's superposition.",
    "🧩 Measuring a qubit collapses it to a definite state.",
    "🌐 Entangled particles affect each other instantly — even across space!",
    "🔒 Decoherence is the enemy of pure quantum states.",
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Tips update interval

  const handleAuthClick = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle navigation from 3D scene
  const handleNavigate = (destination: string) => {
    switch (destination) {
      case "play":
        onStartGame();
        break;
      case "leaderboard":
        setShowLeaderboard(true);
        break;
      case "guide":
        setShowGuide(true);
        break;
      case "achievements":
        setShowAchievements(true);
        break;
      case "settings":
        setShowSettings(true);
        break;
      default:
        if (destination.startsWith("room")) {
          onStartGame(); // Start the game with the specific room
        }
      // Navigate to destination
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D Dashboard */}
      <div className="absolute inset-0 z-0">
        <QuantumDashboard onNavigate={handleNavigate} />
      </div>

      {/* User info is now handled within the QuantumScene component */}

      {/* Game title overlay - only displayed when not loading */}
      {!hide_title && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 text-center main-menu-title">
          <h1 className="text-4xl font-orbitron font-bold mb-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            QUANTUM QUEST
          </h1>
          <h2 className="text-lg font-medium text-gray-300">
            The Entangled Escape
          </h2>
        </div>
      )}

      {/* Tips overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-center max-w-lg mx-auto">
        <p className="text-lg text-cyan-300 italic font-semibold tracking-wide drop-shadow-[0_0_8px_#22d3ee] bg-black bg-opacity-30 px-4 py-2 rounded-lg">
          {tips[currentTipIndex]}
        </p>
      </div>

      {/* Backstory Button - positioned in top-right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowBackstory(true)}
          className="bg-black bg-opacity-50 backdrop-blur-sm p-3 rounded-full border border-purple-700 hover:bg-purple-900 hover:bg-opacity-50 transition-colors"
          title="View Backstory"
        >
          <Info className="w-6 h-6 text-purple-400" />
        </button>
      </div>

      {/* Modals - these appear ddon top of the 3D scene */}
      {showGuide && <QuantumGuide onClose={() => setShowGuide(false)} />}
      {showAchievements && (
        <Achievements onClose={() => setShowAchievements(false)} />
      )}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      {/* Auth modal is now handled within the QuantumScene component */}

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
            <div className="mt-6 pt-4 border-t border-purple-800">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">
                How to Play
              </h3>
              <p className="text-gray-300 text-sm">
                Navigate the 3D quantum dashboard using the spaceship controls
                (WASD or Arrow keys, Space for up, Shift for down). Your spaceship will
                automatically orient toward your travel direction. To activate a
                portal: fly close to it and stop for 1 second, or press Enter
                when nearby. Each portal leads to a different section of your
                quantum adventure.
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
