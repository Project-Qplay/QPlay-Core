import React, { useState } from 'react';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  // Mock settings state
  const [volume, setVolume] = useState(70);
  const [musicVolume, setMusicVolume] = useState(60);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [difficulty, setDifficulty] = useState("normal");
  const [theme, setTheme] = useState("dark");
  const [enableParticles, setEnableParticles] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full p-6 mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close Settings"
        >
          ×
        </button>
        <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Game Settings
        </h2>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <div className="space-y-8">
            {/* Audio Settings */}
            <div>
              <h3 className="text-xl font-bold text-cyan-300 mb-4">Audio</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Master Volume</span>
                    <span className="text-gray-400 text-sm">{volume}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Music Volume</span>
                    <span className="text-gray-400 text-sm">{musicVolume}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Sound Effects</span>
                    <span className="text-gray-400 text-sm">{sfxVolume}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Game Settings */}
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-4">Gameplay</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 block mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-2 w-full text-gray-300"
                  >
                    <option value="easy">Easy - More hints, longer time limits</option>
                    <option value="normal">Normal - Balanced experience</option>
                    <option value="hard">Hard - Fewer hints, strict time limits</option>
                    <option value="quantum">Quantum - Expert mode, no hints</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Settings */}
            <div>
              <h3 className="text-xl font-bold text-green-300 mb-4">Visual</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 block mb-2">Theme</label>
                  <div className="flex space-x-4">
                    <button
                      className={`px-4 py-2 rounded-lg border ${
                        theme === "dark"
                          ? "bg-purple-900 border-purple-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg border ${
                        theme === "light"
                          ? "bg-purple-900 border-purple-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Particle Effects</span>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="toggle"
                      id="toggle-particles"
                      className="sr-only"
                      checked={enableParticles}
                      onChange={() => setEnableParticles(!enableParticles)}
                    />
                    <label
                      htmlFor="toggle-particles"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        enableParticles ? "bg-purple-600" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                          enableParticles ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Animations</span>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="toggle-animations"
                      id="toggle-animations"
                      className="sr-only"
                      checked={enableAnimations}
                      onChange={() => setEnableAnimations(!enableAnimations)}
                    />
                    <label
                      htmlFor="toggle-animations"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        enableAnimations ? "bg-purple-600" : "bg-gray-600"
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                          enableAnimations ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors"
            >
              Save Settings
            </button>
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

export default Settings;
