import React from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { QuantumPad as QuantumPadType, getPadColor, getQuantumStateLabel } from "../../../utils/quantumLogic";

interface QuantumPadProps {
  pad: QuantumPadType;
  playerPosition: number;
  quantumStateCollapsed: boolean;
  showHints: boolean;
  onStepOn: (padId: number) => void;
  onApplyHadamard: (padId: number) => void;
}

const getPadIcon = (state: string) => {
  switch (state) {
    case "up":
      return <ArrowUp className="w-6 h-6" />;
    case "down":
      return <ArrowDown className="w-6 h-6" />;
    case "superposition":
      return <RefreshCw className="w-6 h-6 animate-spin" />;
    default:
      return null;
  }
};

const QuantumPad: React.FC<QuantumPadProps> = ({
  pad,
  playerPosition,
  quantumStateCollapsed,
  showHints,
  onStepOn,
  onApplyHadamard,
}) => {
  const isPlayerHere = playerPosition === pad.id;
  const isGlowing = pad.glowing && showHints;
  const isHighlighted = isPlayerHere || isGlowing;

  return (
    <div className="relative bg-transparent">
      {/* Quantum Pad */}
      <button
        onClick={() => onStepOn(pad.id)}
        disabled={
          pad.locked ||
          pad.state !== "superposition" ||
          quantumStateCollapsed
        }
        className={
          isHighlighted
            ? `w-full h-full rounded-xl flex flex-col items-center justify-center relative overflow-hidden hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg`
            : `w-full h-full rounded-xl flex flex-col items-center justify-center relative overflow-hidden hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed bg-gradient-to-br ${getPadColor(pad, quantumStateCollapsed)}`
        }
        style={
          isHighlighted
            ? {
                background:
                  "linear-gradient(135deg, #ffd700 0%, #ffb700 100%)",
                boxShadow: "0 0 16px 4px #ffe066",
              }
            : {}
        }
      >
        {getPadIcon(pad.state)}
        <div
          className="text-xs font-mono mt-1"
          style={{
            color: isHighlighted ? "#232946" : "inherit",
          }}
        >
          {getQuantumStateLabel(pad.state)}
        </div>
        
        {/* Superposition animation effect */}
        {pad.state === "superposition" &&
          !pad.locked &&
          !quantumStateCollapsed &&
          !isHighlighted && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          )}
        
        {/* Locked indicator */}
        {pad.locked && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
            ✓
          </div>
        )}
        
        {/* Collapsed state overlay */}
        {quantumStateCollapsed && (
          <div className="absolute inset-0 bg-red-500/50 animate-pulse flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              COLLAPSED
            </span>
          </div>
        )}
      </button>

      {/* Hadamard Gate Button */}
      <button
        onClick={() => onApplyHadamard(pad.id)}
        disabled={pad.locked || quantumStateCollapsed}
        className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 hover:bg-purple-400
                 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-sm
                 flex items-center justify-center transition-all duration-200 font-bold
                 border-2 border-white shadow-lg"
        title={`Apply Hadamard Gate to Pad ${pad.id + 1}`}
      >
        H
      </button>

      {/* Pad Label */}
      <div className="text-center mt-2 text-sm text-gray-400">
        Pad {pad.id + 1}
      </div>

      {/* Phase Indicator */}
      {pad.state === "superposition" && (
        <div className="text-center mt-1 text-xs text-purple-400">
          φ = {(pad.phase / Math.PI).toFixed(1)}π
        </div>
      )}
    </div>
  );
};

export default QuantumPad;