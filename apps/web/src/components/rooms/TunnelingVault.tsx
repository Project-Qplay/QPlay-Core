import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, AlertTriangle, Mountain, Calculator, BookOpen, Target, BarChart3 } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import FeedbackButton from '../FeedbackButton';

interface TunnelingAttempt {
  barrierHeight: number;
  barrierWidth: number;
  particleEnergy: number;
  probability: number;
  success: boolean;
  timestamp: number;
}

const TunnelingVault: React.FC = () => {
  const { completeRoom } = useGame();
  const [barrierHeight, setBarrierHeight] = useState(5.0); // eV
  const [barrierWidth, setBarrierWidth] = useState(2.0); // nm
  const [particleEnergy, setParticleEnergy] = useState(3.0); // eV
  const [tunnelingProbability, setTunnelingProbability] = useState(0);
  const [transmissionCoefficient, setTransmissionCoefficient] = useState(0);
  const [waveFunction, setWaveFunction] = useState<number[]>([]);
  const [vaultCollapsing, setVaultCollapsing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasJumped, setHasJumped] = useState(false);
  const [jumpSuccess, setJumpSuccess] = useState(false);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [attempts, setAttempts] = useState<TunnelingAttempt[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showPhysicsGuide, setShowPhysicsGuide] = useState(false);
  const [gamePhase, setGamePhase] = useState<'setup' | 'collapsing' | 'complete'>('setup');
  const [autoOptimize, setAutoOptimize] = useState(false);

  // Calculate tunneling probability using quantum mechanics
  useEffect(() => {
    calculateTunnelingProbability();
    generateWaveFunction();
  }, [barrierHeight, barrierWidth, particleEnergy]);

  // Collapse timer
  useEffect(() => {
    if (vaultCollapsing && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && vaultCollapsing) {
      resetVault();
    }
  }, [vaultCollapsing, timeLeft]);

  const calculateTunnelingProbability = () => {
    if (particleEnergy >= barrierHeight) {
      // Classical case - particle has enough energy (over-the-barrier)
      setTunnelingProbability(95);
      setTransmissionCoefficient(0.95);
      return;
    }

    // Quantum tunneling case - simplified educational model
    // Real quantum mechanics uses full Schrödinger equation solutions
    // T ≈ exp(-2κa) where κ = sqrt(2m(V-E))/ℏ
    
    // Constants (simplified for educational purposes - real calculations much more complex)
    const electronMass = 0.511; // MeV/c² (rest mass energy)
    const hbarC = 0.1973; // eV·nm (ℏc in convenient units)
    
    // Energy difference in eV
    const energyDiff = barrierHeight - particleEnergy;
    
    // Wave number inside barrier (in nm⁻¹)
    const kappa = Math.sqrt(2 * electronMass * energyDiff) / hbarC;
    
    // Transmission coefficient (simplified exponential approximation)
    const transmission = Math.exp(-2 * kappa * barrierWidth);
    
    // Convert to percentage and apply realistic scaling
    const probabilityPercent = Math.min(transmission * 100, 100);
    
    setTunnelingProbability(probabilityPercent);
    setTransmissionCoefficient(transmission);
  };

  const generateWaveFunction = () => {
    // Generate simplified wave function visualization for educational purposes
    // Real wavefunctions require solving time-dependent Schrödinger equations
    const points = 200;
    const waveData: number[] = [];
    const xRange = 10; // Total range in nm
    
    for (let i = 0; i < points; i++) {
      const x = (i / points) * xRange - xRange/2; // -5 to 5 nm
      let amplitude: number;
      
      // Wave number for free particle (simplified model)
      const k = Math.sqrt(2 * 0.511 * particleEnergy) / 0.1973; // nm⁻¹
      
      if (x < -barrierWidth/2) {
        // Before barrier - incident + reflected wave (simplified representation)
        const incident = Math.cos(k * (x + xRange/2));
        const reflected = 0.3 * Math.cos(-k * (x + xRange/2) + Math.PI);
        amplitude = (incident + reflected) * Math.exp(-Math.pow((x + 3), 2) / 8);
      } else if (x > barrierWidth/2) {
        // After barrier - transmitted wave (educational approximation)
        const transmittedAmplitude = Math.sqrt(transmissionCoefficient);
        amplitude = transmittedAmplitude * Math.cos(k * (x - barrierWidth/2));
      } else {
        // Inside barrier - exponential decay (simplified exponential form)
        const kappa = Math.sqrt(2 * 0.511 * (barrierHeight - particleEnergy)) / 0.1973;
        amplitude = Math.exp(-kappa * Math.abs(x)) * 0.7;
      }
      
      waveData.push(amplitude);
    }
    
    setWaveFunction(waveData);
  };

  const startVaultCollapse = () => {
    setVaultCollapsing(true);
    setGamePhase('collapsing');
    setTimeLeft(60);
  };

  const attemptQuantumJump = () => {
    setHasJumped(true);
    setAttemptCount(prev => prev + 1);
    
    // Determine success based on tunneling probability
    // Add some randomness but weight it towards the calculated probability
    const randomFactor = Math.random();
    const adjustedProbability = tunnelingProbability / 100;
    
    // Make it slightly easier than pure probability for gameplay
    const gameplayBonus = Math.min(0.1, attemptCount * 0.02); // Small bonus for multiple attempts
    const success = randomFactor < (adjustedProbability + gameplayBonus);
    
    setJumpSuccess(success);
    
    // Record the attempt
    const attempt: TunnelingAttempt = {
      barrierHeight,
      barrierWidth,
      particleEnergy,
      probability: tunnelingProbability,
      success,
      timestamp: Date.now()
    };
    setAttempts(prev => [...prev, attempt]);
    
    if (success) {
      setTimeout(() => {
        setRoomCompleted(true);
        setGamePhase('complete');
        completeRoom('tunneling-vault');
      }, 2000);
    } else if (attemptCount >= 5) {
      // After 5 failed attempts, give helpful hint
      setTimeout(() => {
        resetVault();
      }, 3000);
    }
  };

  const optimizeParameters = () => {
    setAutoOptimize(true);
    
    // Animate to optimal parameters for high tunneling probability
    const targetHeight = 3.5; // Lower barrier
    const targetWidth = 1.0;   // Thinner barrier
    const targetEnergy = 2.8;  // High energy but still below barrier
    
    // Animate the changes
    const steps = 20;
    const heightStep = (targetHeight - barrierHeight) / steps;
    const widthStep = (targetWidth - barrierWidth) / steps;
    const energyStep = (targetEnergy - particleEnergy) / steps;
    
    let currentStep = 0;
    const animateStep = () => {
      if (currentStep < steps) {
        setBarrierHeight(prev => prev + heightStep);
        setBarrierWidth(prev => prev + widthStep);
        setParticleEnergy(prev => prev + energyStep);
        currentStep++;
        setTimeout(animateStep, 100);
      } else {
        setAutoOptimize(false);
        // Final precise values
        setBarrierHeight(targetHeight);
        setBarrierWidth(targetWidth);
        setParticleEnergy(targetEnergy);
      }
    };
    
    animateStep();
  };

  const resetVault = () => {
    setVaultCollapsing(false);
    setGamePhase('setup');
    setTimeLeft(60);
    setHasJumped(false);
    setJumpSuccess(false);
    setAttemptCount(0);
    // Reset to default values
    setBarrierHeight(5.0);
    setBarrierWidth(2.0);
    setParticleEnergy(3.0);
  };

  const getBarrierColor = () => {
    if (particleEnergy >= barrierHeight) {
      return 'from-green-500 to-emerald-500';
    } else if (tunnelingProbability > 10) {
      return 'from-yellow-500 to-orange-500';
    } else if (tunnelingProbability > 1) {
      return 'from-orange-500 to-red-500';
    } else {
      return 'from-red-600 to-red-800';
    }
  };

  const getProbabilityColor = () => {
    if (tunnelingProbability > 20) return 'text-green-400';
    if (tunnelingProbability > 5) return 'text-yellow-400';
    if (tunnelingProbability > 1) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSuccessMessage = () => {
    if (tunnelingProbability > 50) return "Excellent! Very high tunneling probability.";
    if (tunnelingProbability > 20) return "Good! Strong quantum tunneling effect.";
    if (tunnelingProbability > 5) return "Moderate tunneling probability.";
    if (tunnelingProbability > 1) return "Low but possible tunneling.";
    return "Very low probability - try optimizing parameters.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏛️</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            TUNNELING VAULT
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Master the final quantum concept: quantum tunneling. Adjust the energy barrier parameters 
            to create a path through the classically impenetrable wall using the mysterious power of quantum mechanics.
            <span className="text-sm text-gray-400 block mt-2">
              🎓 <em>Using simplified educational physics models to demonstrate core concepts</em>
            </span>
          </p>
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 rounded-2xl border border-yellow-500 max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">⚡</div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quantum Tunneling Challenge</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-2">🎯 Your Mission</h3>
                  <p className="text-yellow-200 text-sm">
                    Escape the vault by quantum tunneling through an energy barrier. Even when your particle 
                    doesn't have enough energy classically, quantum mechanics allows tunneling with some probability!
                  </p>
                </div>
                
                <div className="bg-orange-900/30 border border-orange-500 rounded-xl p-4">
                  <h3 className="font-semibold text-orange-300 mb-2">🔧 How to Play</h3>
                  <ol className="text-orange-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Adjust barrier height, width, and particle energy using the sliders</li>
                    <li>Watch the tunneling probability change in real-time</li>
                    <li>Click "Initiate Vault Collapse" to start the escape sequence</li>
                    <li>Attempt your quantum leap - success depends on the calculated probability!</li>
                    <li>Use "Auto-Optimize" for guaranteed high probability if you get stuck</li>
                  </ol>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🔬 The Physics (Educational Model)</h3>
                  <p className="text-blue-200 text-sm mb-2">
                    <strong>Simplified Tunneling Formula:</strong> T = e^(-2κa) where κ = √(2m(V-E))/ℏ
                  </p>
                  <p className="text-blue-200 text-sm mb-2">
                    Lower barriers, thinner walls, and higher particle energy all increase tunneling probability. 
                    Even with low probability, quantum mechanics makes the impossible possible!
                  </p>
                  <div className="text-blue-300 text-xs mt-2 p-2 bg-blue-800/20 rounded border border-blue-600">
                    <strong>📚 Educational Note:</strong> This uses a simplified 1D rectangular barrier model for learning. 
                    Real quantum tunneling involves complex wavefunctions, varying potentials, and advanced mathematical treatments.
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-2">💡 Pro Tips</h3>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Lower barrier height increases tunneling dramatically</li>
                    <li>• Thinner barriers (smaller width) help significantly</li>
                    <li>• Higher particle energy (but still below barrier) improves odds</li>
                    <li>• Even 1% probability can succeed - quantum mechanics is probabilistic!</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPhysicsGuide(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold 
                           transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Physics Guide</span>
                </button>
                
                <button
                  onClick={() => setShowInstructions(false)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
                           hover:from-yellow-400 hover:to-orange-400 rounded-xl font-semibold text-lg 
                           transition-all duration-300 transform hover:scale-105"
                >
                  Begin Tunneling!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Physics Guide Modal */}
        {showPhysicsGuide && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 rounded-2xl border border-blue-500 max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <Calculator className="w-8 h-8 mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Quantum Tunneling Physics Guide</h2>
                <p className="text-sm text-blue-300">Educational model for learning quantum concepts</p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-3">🧮 Simplified Tunneling Formula (Educational)</h3>
                  <div className="space-y-3 text-sm">
                    <div className="font-mono bg-gray-900/50 p-3 rounded">
                      T = e^(-2κa)
                    </div>
                    <div className="font-mono bg-gray-900/50 p-3 rounded">
                      κ = √(2m(V-E))/ℏ
                    </div>
                    <div className="space-y-1 text-blue-200">
                      <p><strong>T</strong> = Transmission coefficient (probability)</p>
                      <p><strong>κ</strong> = Decay constant inside barrier</p>
                      <p><strong>a</strong> = Barrier width</p>
                      <p><strong>m</strong> = Particle mass</p>
                      <p><strong>V</strong> = Barrier height</p>
                      <p><strong>E</strong> = Particle energy</p>
                      <p><strong>ℏ</strong> = Reduced Planck constant</p>
                    </div>
                    <div className="bg-yellow-800/20 border border-yellow-600 rounded p-3 mt-3">
                      <p className="text-yellow-200 text-xs">
                        <strong>⚠️ Educational Simplification:</strong> This 1D rectangular barrier model demonstrates core concepts. 
                        Real quantum tunneling involves Schrödinger equations, complex wavefunctions, reflection coefficients, 
                        and multi-dimensional potential landscapes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-3">📊 Parameter Effects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-purple-200 mb-2">Barrier Height (V)</h4>
                      <p className="text-purple-100">Higher barriers exponentially decrease tunneling. Even small reductions dramatically improve probability.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-200 mb-2">Barrier Width (a)</h4>
                      <p className="text-purple-100">Thinner barriers allow more tunneling. The effect is exponential - halving width squares the probability.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-200 mb-2">Particle Energy (E)</h4>
                      <p className="text-purple-100">Higher energy (but still below barrier) increases tunneling. The energy difference (V-E) is key.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-3">🔬 Real-World Quantum Tunneling</h3>
                  <div className="space-y-2 text-sm text-green-200">
                    <p><strong>Nuclear Fusion:</strong> Protons tunnel through Coulomb barriers in stars, enabling fusion at "impossible" temperatures.</p>
                    <p><strong>Electronics:</strong> Tunnel diodes and scanning tunneling microscopes rely on quantum tunneling.</p>
                    <p><strong>Radioactive Decay:</strong> Alpha particles tunnel out of atomic nuclei, causing radioactive decay.</p>
                    <p><strong>Quantum Computing:</strong> Josephson junctions use tunneling for superconducting qubits.</p>
                  </div>
                  <div className="bg-emerald-800/20 border border-emerald-600 rounded p-3 mt-3">
                    <p className="text-emerald-200 text-xs">
                      <strong>🎓 Real Physics:</strong> Actual quantum tunneling calculations involve solving time-dependent Schrödinger equations, 
                      considering wave packet dynamics, decoherence effects, and environmental interactions - far more complex than our educational model!
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-3">🎯 Optimization Strategy</h3>
                  <div className="space-y-2 text-sm text-yellow-200">
                    <p><strong>Best approach:</strong> Reduce barrier height first (biggest impact), then reduce width, then increase energy.</p>
                    <p><strong>Sweet spot:</strong> Barrier height ~3.5 eV, width ~1.0 nm, particle energy ~2.8 eV gives ~20% probability.</p>
                    <p><strong>Remember:</strong> Even 1% probability can succeed! Quantum mechanics is fundamentally probabilistic.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPhysicsGuide(false)}
                className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold 
                         transition-all duration-300"
              >
                Back to Experiment
              </button>
            </div>
          </div>
        )}

        {/* Vault Collapse Warning */}
        {vaultCollapsing && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-xl text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-2" />
              <span className="text-xl font-bold text-red-300">VAULT COLLAPSE IN PROGRESS</span>
            </div>
            <p className="text-red-200">Time remaining: {timeLeft} seconds</p>
            <p className="text-red-200 text-sm">Make your quantum leap before the vault seals forever!</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Energy Barrier Visualization */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Mountain className="w-6 h-6 mr-3 text-yellow-400" />
              Quantum Energy Barrier
              <span className="ml-auto text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                Educational Visualization
              </span>
            </h2>

            {/* Barrier Visualization */}
            <div className="relative h-80 bg-gray-900/50 rounded-xl mb-6 overflow-hidden">
              {/* Energy scale */}
              <div className="absolute left-2 top-2 text-xs text-gray-400 z-10">
                <div className="space-y-8">
                  <div>{barrierHeight.toFixed(1)} eV</div>
                  <div>{(barrierHeight * 0.75).toFixed(1)} eV</div>
                  <div>{(barrierHeight * 0.5).toFixed(1)} eV</div>
                  <div>{(barrierHeight * 0.25).toFixed(1)} eV</div>
                  <div>0 eV</div>
                </div>
              </div>

              {/* Position scale */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 flex space-x-8">
                <span>-3nm</span>
                <span>0nm</span>
                <span>+3nm</span>
              </div>

              {/* Barrier */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end h-full">
                <div 
                  className={`bg-gradient-to-t ${getBarrierColor()} rounded-t-lg transition-all duration-500 relative`}
                  style={{ 
                    width: `${barrierWidth * 40}px`, 
                    height: `${(barrierHeight / 10) * 80}%` 
                  }}
                >
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                    {barrierHeight.toFixed(1)}eV
                  </div>
                </div>
              </div>

              {/* Particle */}
              <div className="absolute bottom-8 left-16">
                <div className="w-6 h-6 bg-cyan-400 rounded-full animate-pulse relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-cyan-400 whitespace-nowrap">
                    E = {particleEnergy.toFixed(1)}eV
                  </div>
                </div>
              </div>

              {/* Wave function overlay */}
              {waveFunction.length > 0 && (
                <svg className="absolute inset-0 w-full h-full">
                  <path
                    d={`M ${waveFunction.map((amp, i) => 
                      `${(i / waveFunction.length) * 100},${60 + amp * 15}`
                    ).join(' L ')}`}
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.8)"
                    strokeWidth="2"
                  />
                  <text x="5" y="15" fill="rgba(34, 197, 94, 0.8)" fontSize="12">
                    ψ(x) - Wave Function
                  </text>
                </svg>
              )}

              {/* Tunneling probability indicator */}
              <div className="absolute top-4 right-4 text-center bg-black/50 rounded-lg p-3">
                <div className={`text-2xl font-bold ${getProbabilityColor()}`}>
                  {tunnelingProbability.toFixed(3)}%
                </div>
                <div className="text-xs text-gray-400">Tunneling Probability</div>
                <div className="text-xs text-gray-300 mt-1">
                  T = {transmissionCoefficient.toExponential(2)}
                </div>
              </div>

              {/* Classical vs Quantum indicator */}
              <div className="absolute bottom-4 right-4 text-center bg-black/50 rounded-lg p-2">
                {particleEnergy >= barrierHeight ? (
                  <div className="text-green-400 text-sm font-semibold">
                    ✓ Classical: Over Barrier
                  </div>
                ) : (
                  <div className="text-purple-400 text-sm font-semibold">
                    ⚡ Quantum: Tunneling Required
                  </div>
                )}
              </div>
            </div>

            {/* Parameter Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Barrier Height: {barrierHeight.toFixed(1)} eV
                  </label>
                  <span className="text-xs text-gray-400">
                    {particleEnergy >= barrierHeight ? 'Above particle energy' : `${(barrierHeight - particleEnergy).toFixed(1)} eV above particle`}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={barrierHeight}
                  onChange={(e) => setBarrierHeight(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={hasJumped || autoOptimize}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Barrier Width: {barrierWidth.toFixed(1)} nm
                  </label>
                  <span className="text-xs text-gray-400">
                    {barrierWidth < 1.5 ? 'Thin barrier' : barrierWidth < 2.5 ? 'Medium barrier' : 'Thick barrier'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.1"
                  value={barrierWidth}
                  onChange={(e) => setBarrierWidth(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={hasJumped || autoOptimize}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Particle Energy: {particleEnergy.toFixed(1)} eV
                  </label>
                  <span className="text-xs text-gray-400">
                    {particleEnergy >= barrierHeight ? 'Classical regime' : 'Quantum tunneling regime'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="7"
                  step="0.1"
                  value={particleEnergy}
                  onChange={(e) => setParticleEnergy(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={hasJumped || autoOptimize}
                />
              </div>
            </div>

            {/* Quick optimization button */}
            <button
              onClick={optimizeParameters}
              disabled={hasJumped || autoOptimize || vaultCollapsing}
              className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 
                       hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 
                       disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300"
            >
              {autoOptimize ? 'Optimizing...' : 'Auto-Optimize Parameters'}
            </button>
          </div>

          {/* Control Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-orange-400" />
              Escape Control
            </h2>

            <div className="space-y-6">
              {/* Current Status */}
              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h3 className="font-semibold mb-3">Current Configuration:</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Barrier Height:</div>
                    <div className="font-mono text-yellow-400">{barrierHeight.toFixed(1)} eV</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Barrier Width:</div>
                    <div className="font-mono text-yellow-400">{barrierWidth.toFixed(1)} nm</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Particle Energy:</div>
                    <div className="font-mono text-cyan-400">{particleEnergy.toFixed(1)} eV</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Success Chance:</div>
                    <div className={`font-mono font-bold ${getProbabilityColor()}`}>
                      {tunnelingProbability.toFixed(3)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Physics Analysis */}
              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h3 className="font-semibold mb-2">Physics Analysis (Educational Model):</h3>
                <div className="text-sm space-y-2">
                  {particleEnergy >= barrierHeight ? (
                    <div className="text-green-400">✓ Classical: Particle has sufficient energy to pass over barrier</div>
                  ) : (
                    <div className="text-red-400">✗ Classical: Particle lacks energy to overcome barrier ({(barrierHeight - particleEnergy).toFixed(1)} eV short)</div>
                  )}
                  
                  <div className="text-purple-400">
                    ⚡ Quantum: {getSuccessMessage()}
                  </div>
                  
                  <div className="text-blue-400 text-xs mt-2">
                    κ = {(Math.sqrt(2 * 0.511 * Math.max(0.1, barrierHeight - particleEnergy)) / 0.1973).toFixed(2)} nm⁻¹
                  </div>
                  
                  <div className="text-gray-400 text-xs mt-2 p-2 bg-gray-800/50 rounded border border-gray-600">
                    📚 <strong>Note:</strong> This simplified 1D model demonstrates core principles. Real quantum mechanics involves 
                    3D wavefunctions, time evolution, and environmental decoherence effects.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {gamePhase === 'setup' && (
                  <button
                    onClick={startVaultCollapse}
                    disabled={hasJumped}
                    className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 
                             hover:from-red-400 hover:to-orange-400 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                             transition-all duration-300 transform hover:scale-105"
                  >
                    Initiate Vault Collapse
                  </button>
                )}

                {gamePhase === 'collapsing' && (
                  <button
                    onClick={attemptQuantumJump}
                    disabled={hasJumped}
                    className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 
                             hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                             transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Attempt Quantum Leap ({tunnelingProbability.toFixed(1)}% chance)
                  </button>
                )}

                <button
                  onClick={resetVault}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl 
                           font-semibold transition-all duration-300"
                >
                  Reset Vault Parameters
                </button>
              </div>

              {/* Attempt History */}
              {attempts.length > 0 && (
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Attempt History
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {attempts.slice(-5).reverse().map((attempt, index) => (
                      <div key={index} className="text-xs grid grid-cols-5 gap-2">
                        <span className="text-gray-400">#{attempts.length - index}</span>
                        <span className="text-yellow-400">{attempt.probability.toFixed(1)}%</span>
                        <span className={attempt.success ? 'text-green-400' : 'text-red-400'}>
                          {attempt.success ? '✓ Success' : '✗ Failed'}
                        </span>
                        <span className="text-gray-400">{attempt.barrierHeight.toFixed(1)}eV</span>
                        <span className="text-gray-400">{attempt.barrierWidth.toFixed(1)}nm</span>
                      </div>
                    ))}
                  </div>
                  {attemptCount >= 3 && !roomCompleted && (
                    <div className="mt-3 text-xs text-yellow-400">
                      💡 Tip: Try the auto-optimize button for better parameters!
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {hasJumped && (
                <div className={`p-4 rounded-xl border ${
                  jumpSuccess 
                    ? 'bg-green-900/30 border-green-500' 
                    : 'bg-red-900/30 border-red-500'
                }`}>
                  {jumpSuccess ? (
                    <>
                      <p className="text-green-300 font-semibold">🎉 Quantum Leap Successful!</p>
                      <p className="text-green-200 text-sm mt-2">
                        Against all classical odds, you've tunneled through the energy barrier! 
                        This is the power of quantum mechanics at work - the impossible becomes possible 
                        through wave-particle duality and quantum superposition.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-300 font-semibold">💥 Quantum Leap Failed</p>
                      <p className="text-red-200 text-sm mt-2">
                        The particle bounced back from the barrier. With {tunnelingProbability.toFixed(1)}% probability, 
                        this outcome was {(100 - tunnelingProbability).toFixed(1)}% likely. 
                        Try adjusting parameters for better odds! Attempts: {attemptCount}/5
                      </p>
                    </>
                  )}
                </div>
              )}

              {roomCompleted && (
                <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <p className="text-green-300 font-semibold">🎉 Tunneling Vault Conquered!</p>
                  <p className="text-green-200 text-sm mt-2">
                    Incredible! You've mastered quantum tunneling, one of the most mind-bending 
                    phenomena in physics. You've proven that in the quantum world, particles can 
                    pass through barriers they classically shouldn't be able to overcome. This same 
                    principle powers nuclear fusion in stars, enables modern electronics, and makes 
                    quantum computing possible!
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-800/30 p-2 rounded">
                      <div className="font-semibold">Final Probability</div>
                      <div>{tunnelingProbability.toFixed(3)}%</div>
                    </div>
                    <div className="bg-green-800/30 p-2 rounded">
                      <div className="font-semibold">Attempts</div>
                      <div>{attemptCount}</div>
                    </div>
                    <div className="bg-green-800/30 p-2 rounded">
                      <div className="font-semibold">Success Rate</div>
                      <div>{((attempts.filter(a => a.success).length / attempts.length) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="mt-3 text-green-400 text-sm">
                    🏆 Achievement Unlocked: Quantum Tunneler
                  </div>
                  <div className="mt-2 text-green-300 text-xs p-2 bg-green-800/20 rounded border border-green-600 mb-4">
                    📚 <strong>Educational Journey Complete:</strong> You've learned the fundamentals using simplified models. 
                    Real quantum tunneling research involves advanced mathematics, multi-dimensional analysis, and 
                    cutting-edge experimental techniques!
                  </div>
                  <FeedbackButton 
                    roomId="tunneling-vault" 
                    className="w-full sm:w-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TunnelingVault;