import React, { useState, useEffect } from "react";
import { Play, Home, Settings, Trophy, Zap } from "lucide-react";
import MainMenu from "./components/MainMenu";
import GameController from "./components/GameController";
import { GameProvider } from "./contexts/GameContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { Room } from "./types/game";

function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "menu" | "game" | "settings"
  >("menu");
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>
      <SettingsProvider>
        <GameProvider>
          <ThemeProvider>
            <div
              className="min-h-screen font-rajdhani transition-colors duration-300 main-bg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {/* Animated background particles */}
              <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 25% 25%, rgba(120, 119, 198, var(--particle-opacity, 0.18)), transparent 50%)",
                  }}
                ></div>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 75% 75%, rgba(180, 210, 255, var(--particle-opacity, 0.13)), transparent 50%)",
                  }}
                ></div>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, rgba(120, 180, 255, var(--particle-opacity, 0.10)), transparent 50%)",
                  }}
                ></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {currentScreen === "menu" && (
                  <MainMenu
                    onStartGame={() => {
                      setCurrentScreen("game");
                      setGameStarted(true);
                    }}
                  />
                )}

                {currentScreen === "game" && gameStarted && (
                  <GameController
                    onBackToMenu={() => {
                      setCurrentScreen("menu");
                      setGameStarted(false);
                    }}
                  />
                )}
              </div>
            </div>
          </ThemeProvider>
        </GameProvider>
      </SettingsProvider>
    </AuthProvider>
   </GoogleOAuthProvider>
  );
}

export default App;
