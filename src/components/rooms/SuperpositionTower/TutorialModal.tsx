import React from "react";

interface TutorialModalProps {
  onStart: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-green-500 max-w-3xl w-full p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎓</div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            Quantum Superposition Tutorial
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
            <h3 className="font-semibold text-green-300 mb-2">
              🔬 The Science
            </h3>
            <p className="text-green-200 text-sm">
              Quantum superposition allows particles to exist in multiple
              states simultaneously. The Hadamard gate creates
              superposition: H|0⟩ = (|0⟩ + |1⟩)/√2. When superposition
              states interfere constructively, they create stable quantum
              bridges. Destructive interference causes decoherence and
              collapse.
            </p>
          </div>

          <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
            <h3 className="font-semibold text-purple-300 mb-2">
              🎮 Step-by-Step Process
            </h3>
            <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
              <li>
                Apply Hadamard gates (H) to transform classical states
                into superposition
              </li>
              <li>
                Step only on superposition pads - they glow when part of
                the correct pattern
              </li>
              <li>
                Follow the exact sequence to maintain quantum coherence
              </li>
              <li>
                Watch for constructive interference - wrong steps cause
                decoherence
              </li>
              <li>Complete the pattern to advance to the next floor</li>
            </ol>
          </div>

          <div className="bg-blue-900 border border-blue-700 rounded-xl p-4">
            <h3 className="font-semibold text-blue-600 mb-2">
              ⚠️ Decoherence Warning
            </h3>
            <p className="text-blue-600 text-sm">
              Wrong steps trigger decoherence - the quantum state becomes
              unstable and you have 10 seconds before complete collapse.
              Environmental factors and measurement errors destroy
              superposition!
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500
                   hover:from-green-400 hover:to-emerald-400 rounded-xl font-semibold text-lg
                   transition-all duration-300 transform hover:scale-105"
        >
          Begin Quantum Escape!
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;