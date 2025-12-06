import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, X, Atom, Zap, Waves, Link, Mountain, Archive } from 'lucide-react';

interface QuantumGuideProps {
  onClose: () => void;
}

const QuantumGuide: React.FC<QuantumGuideProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const guidePages = [
    {
      title: "Welcome to Quantum Quest",
      icon: <Atom className="w-8 h-8 text-cyan-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-300">
            Embark on an extraordinary journey through the quantum realm, where the impossible becomes possible 
            and reality itself bends to the strange laws of quantum mechanics.
          </p>
          <div className="bg-cyan-900/30 border border-cyan-500 rounded-xl p-4">
            <h3 className="font-semibold text-cyan-300 mb-2">Your Mission</h3>
            <p className="text-cyan-200 text-sm">
              Navigate through six interconnected quantum chambers, each teaching fundamental principles 
              of quantum physics through hands-on experimentation and puzzle-solving.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-gray-400">Learn by Doing</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🧪</div>
              <p className="text-sm text-gray-400">Experiment Freely</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Probability Bay",
      icon: <div className="text-2xl">🎲</div>,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Your first challenge: distinguish quantum probabilities from classical randomness.
          </p>
          <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
            <h3 className="font-semibold text-blue-300 mb-2">Key Concepts</h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Quantum measurement statistics</li>
              <li>• Probability distributions</li>
              <li>• Quantum vs classical patterns</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Run the quantum dice simulator and analyze the histogram. Look for patterns that 
              deviate from uniform classical randomness - these reveal quantum interference effects.
            </p>
          </div>
        </div>
      )
    },
      {
      title: "Superposition Tower",
      icon: <Waves className="w-6 h-6 text-green-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Navigate using quantum superposition and constructive interference.
          </p>
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
            <h3 className="font-semibold text-green-300 mb-2">Key Concepts</h3>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• Quantum superposition</li>
              <li>• Hadamard transformations</li>
              <li>• Wave interference patterns</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Only superposition states can create stable paths. Use Hadamard gates (H) to transform 
              classical states into superposition. Wrong steps cause decoherence!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "State Chamber",
      icon: <div className="text-2xl">🔮</div>,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Master quantum state reconstruction using the holographic Bloch sphere.
          </p>
          <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
            <h3 className="font-semibold text-purple-300 mb-2">Key Concepts</h3>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Bloch sphere representation</li>
              <li>• Quantum state measurement</li>
              <li>• Decoherence effects</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Perform measurements along X, Y, and Z axes strategically. You have limited attempts, 
              so plan carefully. Watch for decoherence - adjust the noise filter to isolate the true state.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Entanglement Bridge",
      icon: <Link className="w-6 h-6 text-red-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Prove quantum entanglement through Bell inequality violations.
          </p>
          <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
            <h3 className="font-semibold text-red-300 mb-2">Key Concepts</h3>
            <ul className="text-red-200 text-sm space-y-1">
              <li>• Quantum entanglement</li>
              <li>• Bell inequalities</li>
              <li>• Non-local correlations</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Alternate between Alice and Bob's panels. Perform enough measurements to calculate 
              Bell parameter S. You need S &gt; 2.0 to violate classical limits and prove entanglement.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Tunneling Vault",
      icon: <Mountain className="w-6 h-6 text-yellow-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Master quantum tunneling through classically impossible barriers.
          </p>
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-300 mb-2">Key Concepts</h3>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Quantum tunneling effect</li>
              <li>• Energy barriers</li>
              <li>• Wave function penetration</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Adjust barrier height, width, and particle energy to maximize tunneling probability. 
              Even with low probability, quantum mechanics allows the impossible!
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Quantum Archive",
      icon: <Archive className="w-6 h-6 text-indigo-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Synthesize all quantum knowledge to unlock advanced challenges.
          </p>
          <div className="bg-indigo-900/30 border border-indigo-500 rounded-xl p-4">
            <h3 className="font-semibold text-indigo-300 mb-2">Key Concepts</h3>
            <ul className="text-indigo-200 text-sm space-y-1">
              <li>• Quantum interconnectedness</li>
              <li>• Concept synthesis</li>
              <li>• Advanced applications</li>
            </ul>
          </div>
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Strategy Tips</h3>
            <p className="text-sm text-gray-300">
              Connect all quantum concepts learned from previous rooms. Remember: quantum mechanics 
              is not linear but deeply interconnected across all phenomena.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Quantum Formulas",
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Essential Quantum Equations</h3>
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-cyan-300 mb-2">Quantum State</h4>
              <div className="font-mono text-sm bg-gray-900/50 p-2 rounded">
                |ψ⟩ = α|0⟩ + β|1⟩
              </div>
              <p className="text-xs text-gray-400 mt-1">Where |α|² + |β|² = 1</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-green-300 mb-2">Hadamard Gate</h4>
              <div className="font-mono text-sm bg-gray-900/50 p-2 rounded">
                H|0⟩ = (|0⟩ + |1⟩)/√2
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-red-300 mb-2">Bell State</h4>
              <div className="font-mono text-sm bg-gray-900/50 p-2 rounded">
                |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
              </div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-300 mb-2">Tunneling Probability</h4>
              <div className="font-mono text-sm bg-gray-900/50 p-2 rounded">
                T ≈ e^(-2κa)
              </div>
              <p className="text-xs text-gray-400 mt-1">Where κ = √(2m(V-E))/ℏ</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, guidePages.length - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-orbitron font-semibold">Quantum Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[500px]">
          <div className="flex items-center justify-center mb-6">
            {guidePages[currentPage].icon}
          </div>
          
          <h1 className="text-3xl font-orbitron font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {guidePages[currentPage].title}
          </h1>
          
          <div className="max-w-3xl mx-auto">
            {guidePages[currentPage].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 border-t border-gray-700 flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            {guidePages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === currentPage ? 'bg-cyan-400' : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === guidePages.length - 1}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 
                     disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantumGuide;
