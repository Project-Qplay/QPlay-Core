import React from "react";
import { Zap, RefreshCw } from "lucide-react";
import { QuantumPad as QuantumPadType } from "../../../utils/quantumLogic";
import { FloorProgress, CurrentObjective } from "./FloorProgress";
import DecoherenceWarning from "./DecoherenceWarning";
import QuantumStateAnalysis from "./QuantumStateAnalysis";
import HintSystem from "./HintSystem";
import ImpossibleStateWarning from "./ImpossibleStateWarning";

interface ControlPanelProps {
  currentFloor: number;
  totalFloors: number;
  timeLeft: number;
  quantumPads: QuantumPadType[];
  pathStable: boolean;
  decoherenceTimer: number;
  interferencePattern: "constructive" | "destructive" | "none";
  attempts: number;
  showHints: boolean;
  onToggleHints: () => void;
  onReset: () => void;
  onGenerateSolvableState: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentFloor,
  totalFloors,
  timeLeft,
  quantumPads,
  pathStable,
  decoherenceTimer,
  interferencePattern,
  attempts,
  showHints,
  onToggleHints,
  onReset,
  onGenerateSolvableState,
}) => {
  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <Zap className="w-6 h-6 mr-3 text-yellow-400" />
        Quantum Control Panel
      </h2>

      <FloorProgress
        currentFloor={currentFloor}
        totalFloors={totalFloors}
        timeLeft={timeLeft}
      />

      <DecoherenceWarning
        decoherenceTimer={decoherenceTimer}
        isVisible={!pathStable}
      />

      <CurrentObjective currentFloor={currentFloor} />

      <QuantumStateAnalysis
        quantumPads={quantumPads}
        currentFloor={currentFloor}
        pathStable={pathStable}
        interferencePattern={interferencePattern}
        attempts={attempts}
      />

      <ImpossibleStateWarning
        quantumPads={quantumPads}
        currentFloor={currentFloor}
        onGenerateSolvableState={onGenerateSolvableState}
      />

      <HintSystem showHints={showHints} onToggleHints={onToggleHints} />

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl
                 font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reset to Solvable State</span>
      </button>
    </div>
  );
};

export default ControlPanel;