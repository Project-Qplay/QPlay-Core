import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Monitor,
  Moon,
  Sun,
  X,
  RotateCcw,
  Palette,
  Zap,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { Button } from "./ui/Button";

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { settings, updateSetting, resetToDefaults, playSound } = useSettings();

  const getThemeIcon = () => {
    switch (settings.theme) {
      case "light":
        return <Sun className="w-5 h-5" />;
      case "dark":
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const testSound = (
    soundType: "click" | "success" | "error" | "measurement" | "quantum",
  ) => {
    playSound(soundType);
  };

  // Add keyboard event listener for Escape key
  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Handle clicking outside modal
  const modalRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={handleClickOutside}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-orbitron font-semibold">Settings</h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Audio Settings */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 mr-2 text-green-400" />
              ) : (
                <VolumeX className="w-5 h-5 mr-2 text-red-400" />
              )}
              Audio
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Sound Enabled</label>
                <button
                  onClick={() =>
                    updateSetting("soundEnabled", !settings.soundEnabled)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.soundEnabled ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.soundEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">Music Volume</label>
                  <span className="text-sm text-gray-400">
                    {settings.musicVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    updateSetting("musicVolume", parseInt(e.target.value))
                  }
                  disabled={!settings.soundEnabled}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">SFX Volume</label>
                  <span className="text-sm text-gray-400">
                    {settings.sfxVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sfxVolume}
                  onChange={(e) =>
                    updateSetting("sfxVolume", parseInt(e.target.value))
                  }
                  disabled={!settings.soundEnabled}
                  className="w-full"
                />
              </div>

              {/* Sound Test Buttons */}
              <div className="grid grid-cols-5 gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => testSound("click")}
                  disabled={!settings.soundEnabled}
                >
                  Click
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => testSound("success")}
                  disabled={!settings.soundEnabled}
                >
                  Success
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => testSound("error")}
                  disabled={!settings.soundEnabled}
                >
                  Error
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => testSound("measurement")}
                  disabled={!settings.soundEnabled}
                >
                  Measure
                </Button>
                <Button
                  size="sm"
                  variant="quantum"
                  onClick={() => testSound("quantum")}
                  disabled={!settings.soundEnabled}
                >
                  Quantum
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Settings */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2 text-cyan-400" />
              Visual & Theme
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 flex items-center">
                  {getThemeIcon()}
                  <span className="ml-2">Theme</span>
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    updateSetting(
                      "theme",
                      e.target.value as "dark" | "light" | "auto",
                    )
                  }
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Animations</label>
                <button
                  onClick={() =>
                    updateSetting("animations", !settings.animations)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.animations ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.animations ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Particle Effects</label>
                <button
                  onClick={() =>
                    updateSetting("particles", !settings.particles)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.particles ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.particles ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Gameplay
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Difficulty</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) =>
                    updateSetting(
                      "difficulty",
                      e.target.value as "easy" | "normal" | "hard",
                    )
                  }
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Auto Save</label>
                <button
                  onClick={() => updateSetting("autoSave", !settings.autoSave)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.autoSave ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.autoSave ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-gray-300">Show Hints</label>
                <button
                  onClick={() =>
                    updateSetting("showHints", !settings.showHints)
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    settings.showHints ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      settings.showHints ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Difficulty Descriptions */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="font-semibold mb-2">Difficulty Levels</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-green-400 font-semibold">Easy:</span>
                <span className="text-gray-300">
                  Extended timers, more hints, simplified puzzles
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-400 font-semibold">Normal:</span>
                <span className="text-gray-300">
                  Balanced experience with standard timers and hints
                </span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-red-400 font-semibold">Hard:</span>
                <span className="text-gray-300">
                  Shorter timers, fewer hints, complex quantum mechanics
                </span>
              </div>
            </div>
          </div>

          {/* Theme Preview */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="font-semibold mb-3">Theme Preview</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-3 text-center text-white text-sm">
                Quantum Blue
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg p-3 text-center text-white text-sm">
                Quantum Purple
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-3 text-center text-white text-sm">
                Success Green
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={resetToDefaults}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </Button>

          <Button variant="quantum" onClick={onClose} soundType="success">
            Save & Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
