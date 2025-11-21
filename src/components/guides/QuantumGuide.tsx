import React from 'react';

interface QuantumGuideProps {
  onClose: () => void;
}

const QuantumGuide: React.FC<QuantumGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full p-6 mx-4 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close Quantum Guide"
        >
          ×
        </button>
        <h2 className="text-3xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Quantum Guide
        </h2>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-2">Quantum Superposition</h3>
              <p>
                Unlike classical bits that must be either 0 or 1, quantum bits (qubits) can exist
                in a state of superposition, meaning they can represent both 0 and 1 simultaneously.
                This property allows quantum computers to process vast amounts of information in parallel.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-cyan-300 mb-2">Quantum Entanglement</h3>
              <p>
                When qubits become entangled, the state of one qubit becomes directly related to the state
                of another, regardless of the distance separating them. Measuring one qubit instantly determines
                the state of its entangled partner.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-green-300 mb-2">Quantum Tunneling</h3>
              <p>
                Quantum tunneling is a phenomenon where particles pass through energy barriers that classical
                physics would deem impossible to traverse. This occurs because quantum particles behave like
                waves with a probability of being found on the other side of the barrier.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700 mt-6">
              <h3 className="text-xl font-bold text-yellow-300 mb-2">Game Controls</h3>
              <p>
                Navigate through the quantum dashboard using WASD or Arrow keys to control your cat.
                Approach interactive portals and slow down to activate them.
                Each portal will take you to a different aspect of your quantum adventure.
              </p>
            </div>
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

export default QuantumGuide;
