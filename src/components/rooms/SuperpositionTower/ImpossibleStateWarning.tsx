import React from "react";
import { AlertTriangle } from "lucide-react";
import { QuantumPad as QuantumPadType, isStateReachable, FLOOR_PATTERNS } from "../../../utils/quantumLogic";

interface ImpossibleStateWarningProps {
  quantumPads: QuantumPadType[];
  currentFloor: number;
  onGenerateSolvableState: () => void;
}

const ImpossibleStateWarning: React.FC<ImpossibleStateWarningProps> = ({
  quantumPads,
  currentFloor,
  onGenerateSolvableState,
}) => {
  const isImpossible = !isStateReachable(quantumPads, FLOOR_PATTERNS[currentFloor].required);

  if (!isImpossible) return null;

  return (
    <div className="mb-6 p-4 bg-orange-900/30 border border-orange-500 rounded-xl">
      <div className="flex items-center mb-2">
        <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
        <span className="text-orange-300 font-semibold">
          IMPOSSIBLE STATE DETECTED
        </span>
      </div>
      <p className="text-orange-200 text-sm mb-3">
        The current quantum phase configuration makes the required
        interference pattern impossible. The system needs to be reset
        to a solvable state.
      </p>
      <button
        onClick={onGenerateSolvableState}
        className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg
                 font-semibold transition-all duration-300 text-sm"
      >
        Generate Solvable State
      </button>
    </div>
  );
};

export default ImpossibleStateWarning;