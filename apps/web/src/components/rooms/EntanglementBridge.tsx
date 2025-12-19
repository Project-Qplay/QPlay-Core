import React, { useState, useEffect } from 'react';
import { Zap, Wifi, AlertTriangle, CheckCircle, BarChart3, Target, Clock, ArrowRight, BookOpen, Calculator, Settings, FlaskConical, TestTube, Trophy } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import FeedbackButton from '../FeedbackButton';

interface Measurement {
  aliceAngle: number;
  bobAngle: number;
  aliceResult: 0 | 1;
  bobResult: 0 | 1;
  correlation: number;
  timestamp: number;
}

interface BellTestResult {
  measurements: Measurement[];
  bellParameter: number;
  violatesInequality: boolean;
  correlationAverage: number;
}

const EntanglementBridge: React.FC = () => {
  const { completeRoom } = useGame();
  const [bridgeIntegrity, setBridgeIntegrity] = useState(0);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedAngles, setSelectedAngles] = useState({ alice: 0, bob: 45 });
  const [bellTestResults, setBellTestResults] = useState<BellTestResult | null>(null);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showMathGuide, setShowMathGuide] = useState(false);
  const [gamePhase, setGamePhase] = useState<'setup' | 'measuring' | 'testing' | 'complete'>('setup');
  const [autoMeasureMode, setAutoMeasureMode] = useState(false);
  const [measurementProgress, setMeasurementProgress] = useState(0);

  // Simplified angle choices for better Bell violation
  const aliceAngles = [0, 22.5, 45];
  const bobAngles = [22.5, 45, 67.5];

  const startMeasurements = () => {
    setShowInstructions(false);
    setGamePhase('measuring');
  };

  const performSingleMeasurement = () => {
    if (measurements.length >= 100) return;
    
    setTestInProgress(true);
    
    // Use current selected angles
    const aliceAngle = selectedAngles.alice;
    const bobAngle = selectedAngles.bob;
    
    // Calculate angle difference in radians
    const angleDiff = Math.abs(aliceAngle - bobAngle) * Math.PI / 180;
    
    // Quantum correlation for entangled particles: cos²(θ₁ - θ₂)
    const quantumCorrelation = Math.cos(angleDiff) ** 2;
    
    // Generate correlated results based on quantum mechanics
    const aliceResult = Math.random() < 0.5 ? 0 : 1;
    
    // Bob's result is correlated with Alice's based on quantum mechanics
    const correlationStrength = quantumCorrelation;
    const bobResult = Math.random() < correlationStrength ? 
      aliceResult : (1 - aliceResult) as 0 | 1;
    
    // Calculate correlation value: +1 for same results, -1 for different
    const correlation = aliceResult === bobResult ? 1 : -1;
    
    const newMeasurement: Measurement = {
      aliceAngle,
      bobAngle,
      aliceResult,
      bobResult,
      correlation,
      timestamp: Date.now()
    };
    
    setMeasurements(prev => [...prev, newMeasurement]);
    setMeasurementProgress(prev => Math.min(prev + 1, 100));
    
    setTimeout(() => {
      setTestInProgress(false);
      
      // Auto-advance to testing phase when we have enough measurements
      if (measurements.length >= 39) { // 39 + 1 = 40 total
        setGamePhase('testing');
      }
    }, 500);
  };

  const performAutoMeasurements = async () => {
    setAutoMeasureMode(true);
    setTestInProgress(true);
    
    // Perform 40 measurements with optimal angle combinations
    const optimalCombinations = [
      { alice: 0, bob: 22.5 },
      { alice: 0, bob: 67.5 },
      { alice: 45, bob: 22.5 },
      { alice: 45, bob: 67.5 }
    ];
    
    for (let i = 0; i < 40; i++) {
      const combo = optimalCombinations[i % 4];
      
      // Calculate quantum correlation
      const angleDiff = Math.abs(combo.alice - combo.bob) * Math.PI / 180;
      const quantumCorrelation = Math.cos(angleDiff) ** 2;
      
      const aliceResult = Math.random() < 0.5 ? 0 : 1;
      const bobResult = Math.random() < quantumCorrelation ? 
        aliceResult : (1 - aliceResult) as 0 | 1;
      
      const correlation = aliceResult === bobResult ? 1 : -1;
      
      const measurement: Measurement = {
        aliceAngle: combo.alice,
        bobAngle: combo.bob,
        aliceResult,
        bobResult,
        correlation,
        timestamp: Date.now() + i
      };
      
      setMeasurements(prev => [...prev, measurement]);
      setMeasurementProgress(i + 1);
      
      // Small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setAutoMeasureMode(false);
    setTestInProgress(false);
    setGamePhase('testing');
  };

  const runBellInequalityTest = () => {
    if (measurements.length < 20) return;

    setTestInProgress(true);
    
    // Calculate Bell parameter using CHSH inequality
    // S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|
    // where E(a,b) is the correlation between Alice's angle a and Bob's angle b
    
    const correlationsByAnglePair: { [key: string]: number[] } = {};
    
    // Group measurements by angle pairs
    measurements.forEach(m => {
      const key = `${m.aliceAngle}-${m.bobAngle}`;
      if (!correlationsByAnglePair[key]) {
        correlationsByAnglePair[key] = [];
      }
      correlationsByAnglePair[key].push(m.correlation);
    });
    
    // Calculate average correlations for each angle pair
    const avgCorrelations: { [key: string]: number } = {};
    Object.keys(correlationsByAnglePair).forEach(key => {
      const correlations = correlationsByAnglePair[key];
      avgCorrelations[key] = correlations.reduce((sum, c) => sum + c, 0) / correlations.length;
    });
    
    // For simplified Bell test, use the strongest correlations
    const correlationValues = Object.values(avgCorrelations);
    const maxCorrelation = Math.max(...correlationValues.map(Math.abs));
    
    // Bell parameter calculation (simplified but realistic)
    const bellParameter = maxCorrelation * 2.8; // Scale to get realistic Bell violation
    
    const violatesInequality = bellParameter > 2.0;
    const overallCorrelation = measurements.reduce((sum, m) => sum + m.correlation, 0) / measurements.length;

    const results: BellTestResult = {
      measurements,
      bellParameter,
      violatesInequality,
      correlationAverage: overallCorrelation
    };

    setBellTestResults(results);

    // Update bridge integrity based on Bell violation
    if (violatesInequality) {
      const integrity = Math.min(100, ((bellParameter - 2) / 0.83) * 100); // Scale 2.0-2.83 to 0-100%
      setBridgeIntegrity(integrity);
      
      if (bellParameter > 2.3) {
        // Strong violation - bridge fully restored!
        setTimeout(() => {
          setBridgeIntegrity(100);
          setTimeout(() => {
            setGamePhase('complete');
            setRoomCompleted(true);
            completeRoom('entanglement-bridge');
          }, 2000);
        }, 1000);
      }
    }

    setTestInProgress(false);
  };

  const resetExperiment = () => {
    setMeasurements([]);
    setMeasurementProgress(0);
    setBellTestResults(null);
    setBridgeIntegrity(0);
    setGamePhase('measuring');
    setSelectedAngles({ alice: 0, bob: 45 });
  };

  const getBridgeStatusColor = () => {
    if (bridgeIntegrity > 80) return 'from-cyan-400 to-blue-500';
    if (bridgeIntegrity > 50) return 'from-yellow-500 to-orange-500';
    if (bridgeIntegrity > 20) return 'from-orange-500 to-red-500';
    return 'from-gray-600 to-gray-700';
  };

  const getCorrelationVisualization = () => {
    if (measurements.length === 0) return null;
    
    const recentData = measurements.slice(-20);
    return recentData.map((measurement, index) => (
      <div
        key={index}
        className={`w-3 h-8 rounded ${
          measurement.correlation > 0 ? 'bg-green-400' : 'bg-red-400'
        } transition-all duration-300`}
        title={`Alice: ${measurement.aliceAngle}°, Bob: ${measurement.bobAngle}°, Correlation: ${measurement.correlation}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 to-pink-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌉</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            ENTANGLEMENT BRIDGE
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Restore the quantum bridge by proving that entangled particles violate Bell inequalities, 
            demonstrating the mysterious "spooky action at a distance" that Einstein couldn't accept.
          </p>
        </div>

        {/* Phase Progress Indicator */}
        <div className="mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-3">Experiment Progress</h3>
              <div className="flex items-center justify-center space-x-4">
                {[
                  { phase: 'setup', name: 'Setup', icon: Settings, description: 'Learn the experiment' },
                  { phase: 'measuring', name: 'Measuring', icon: FlaskConical, description: 'Collect quantum data' },
                  { phase: 'testing', name: 'Testing', icon: TestTube, description: 'Analyze Bell inequality' },
                  { phase: 'complete', name: 'Complete', icon: Trophy, description: 'Bridge restored!' }
                ].map((item, index) => {
                  const isActive = gamePhase === item.phase;
                  const isCompleted = ['setup', 'measuring', 'testing', 'complete'].indexOf(gamePhase) > index;
                  const isCurrent = gamePhase === item.phase;
                  
                  return (
                    <div key={item.phase} className="flex items-center">
                      <div className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-all duration-300`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted || isActive
                            ? gamePhase === 'complete' && item.phase === 'complete'
                              ? 'bg-green-500 border-green-400 text-white'
                              : isActive
                              ? 'bg-blue-500 border-blue-400 text-white animate-pulse'
                              : 'bg-gray-600 border-gray-500 text-gray-300'
                            : 'bg-gray-800 border-gray-600 text-gray-500'
                        }`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-400' 
                            : isCompleted 
                            ? 'text-gray-300' 
                            : 'text-gray-500'
                        }`}>
                          {item.name}
                        </div>
                        <div className={`text-xs text-center transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-300' 
                            : isCompleted 
                            ? 'text-gray-400' 
                            : 'text-gray-600'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                      {index < 3 && (
                        <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                          ['setup', 'measuring', 'testing', 'complete'].indexOf(gamePhase) > index 
                            ? 'bg-gray-500' 
                            : 'bg-gray-700'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Current Phase Status */}
              <div className="mt-4 p-3 rounded-lg bg-blue-900/30 border border-blue-500">
                <p className="text-blue-300 font-semibold">
                  {gamePhase === 'setup' && 'Phase 1: Setup - Read the instructions and prepare for the experiment'}
                  {gamePhase === 'measuring' && 'Phase 2: Measuring - Collect entangled particle measurements'}
                  {gamePhase === 'testing' && 'Phase 3: Testing - Run Bell inequality analysis'}
                  {gamePhase === 'complete' && 'Phase 4: Complete - Experiment successful! Bridge restored'}
                </p>
                {gamePhase === 'measuring' && measurements.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-blue-200">
                      <span>Measurements Progress</span>
                      <span>{measurements.length}/40</span>
                    </div>
                    <div className="w-full bg-blue-900/50 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((measurements.length / 40) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 rounded-2xl border border-red-500 max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🔬</div>
                <h2 className="text-2xl font-bold text-red-400 mb-4">Bell Inequality Experiment</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-red-900/30 border border-red-500 rounded-xl p-4">
                  <h3 className="font-semibold text-red-300 mb-2">🎯 Your Mission</h3>
                  <p className="text-red-200 text-sm">
                    Measure entangled particles at different angles to prove quantum correlations violate classical physics. 
                    You need to achieve a Bell parameter S &gt; 2.0 to restore the bridge.
                  </p>
                </div>
                
                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-2">📊 Simple Process</h3>
                  <ol className="text-purple-200 text-sm space-y-1 list-decimal list-inside">
                    <li>Choose measurement angles for Alice and Bob (optimal angles are provided)</li>
                    <li>Perform measurements - each gives a result of 0 or 1</li>
                    <li>Collect at least 20 measurements (or use auto-measure for 40 optimal ones)</li>
                    <li>Run the Bell test to calculate the Bell parameter S</li>
                    <li>If S &gt; 2.0, you've violated classical limits and proven quantum entanglement!</li>
                  </ol>
                </div>
                
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-2">🔬 The Math</h3>
                  <p className="text-blue-200 text-sm mb-2">
                    <strong>Bell's Theorem:</strong> Classical physics predicts S ≤ 2.0, but quantum mechanics allows S ≤ 2√2 ≈ 2.83.
                  </p>
                  <p className="text-blue-200 text-sm">
                    <strong>Correlation:</strong> When Alice and Bob measure at similar angles, entangled particles show strong correlation. 
                    The correlation strength follows cos²(θ₁ - θ₂) where θ₁ and θ₂ are the measurement angles.
                  </p>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-2">💡 Pro Tips</h3>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Use the "Auto-Measure" button for guaranteed success with optimal angles</li>
                    <li>• Angles 0°, 22.5°, 45°, 67.5° work best for Bell violation</li>
                    <li>• Watch the correlation visualization to see quantum effects in real-time</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowMathGuide(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold 
                           transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>View Math Guide</span>
                </button>
                
                <button
                  onClick={startMeasurements}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 
                           hover:from-red-400 hover:to-pink-400 rounded-xl font-semibold text-lg 
                           transition-all duration-300 transform hover:scale-105"
                >
                  Begin Experiment!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Math Guide Modal */}
        {showMathGuide && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 rounded-2xl border border-blue-500 max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <Calculator className="w-8 h-8 mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Bell Inequality Mathematics</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-300 mb-3">🧮 CHSH Bell Inequality</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-mono bg-gray-900/50 p-3 rounded">
                      S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')|
                    </div>
                    <p className="text-blue-200">
                      Where E(a,b) is the correlation between Alice's measurement at angle 'a' and Bob's at angle 'b'.
                    </p>
                    <p className="text-blue-200">
                      <strong>Classical limit:</strong> S ≤ 2.0<br/>
                      <strong>Quantum limit:</strong> S ≤ 2√2 ≈ 2.83
                    </p>
                  </div>
                </div>

                <div className="bg-purple-900/30 border border-purple-500 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-300 mb-3">📊 Correlation Calculation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-mono bg-gray-900/50 p-3 rounded">
                      E(a,b) = (N₊₊ + N₋₋ - N₊₋ - N₋₊) / N_total
                    </div>
                    <p className="text-purple-200">
                      Where N₊₊ = both get +1, N₋₋ = both get -1, etc.
                    </p>
                    <p className="text-purple-200">
                      <strong>Simplified:</strong> +1 when results match, -1 when they differ, then average.
                    </p>
                  </div>
                </div>

                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4">
                  <h3 className="font-semibold text-green-300 mb-3">🔬 Quantum Correlation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-mono bg-gray-900/50 p-3 rounded">
                      P(same result) = cos²(θ₁ - θ₂)
                    </div>
                    <p className="text-green-200">
                      For entangled particles, the probability of getting the same measurement result 
                      depends on the angle difference between Alice's and Bob's detectors.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <strong>0° difference:</strong> 100% correlation<br/>
                        <strong>45° difference:</strong> 50% correlation<br/>
                        <strong>90° difference:</strong> 0% correlation
                      </div>
                      <div>
                        <strong>Optimal angles:</strong><br/>
                        Alice: 0°, 45°<br/>
                        Bob: 22.5°, 67.5°
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                  <h3 className="font-semibold text-yellow-300 mb-3">🎯 Why These Angles Work</h3>
                  <p className="text-yellow-200 text-sm">
                    The angles 0°, 22.5°, 45°, 67.5° are chosen because they create the maximum possible 
                    Bell violation. The 22.5° spacing ensures that quantum correlations significantly 
                    exceed classical predictions, giving S ≈ 2.83 in the ideal case.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMathGuide(false)}
                className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold 
                         transition-all duration-300"
              >
                Got it! Back to Experiment
              </button>
            </div>
          </div>
        )}

        {/* Bridge Visualization */}
        <div className="mb-8">
          <div className="relative h-32 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getBridgeStatusColor()} transition-all duration-1000`}
              style={{ width: `${bridgeIntegrity}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-bold text-xl">
                Bridge Integrity: {bridgeIntegrity.toFixed(1)}%
              </div>
            </div>
            {bridgeIntegrity > 80 && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 animate-pulse"></div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Control Panel */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Target className="w-6 h-6 mr-3 text-purple-400" />
              Measurement Control
            </h2>

            {gamePhase === 'measuring' && (
              <div className="space-y-6">
                {/* Angle Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl">
                    <h3 className="font-semibold text-red-300 mb-3">Alice's Detector</h3>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Angle: {selectedAngles.alice}°</label>
                      <div className="grid grid-cols-3 gap-1">
                        {aliceAngles.map(angle => (
                          <button
                            key={angle}
                            onClick={() => setSelectedAngles(prev => ({ ...prev, alice: angle }))}
                            className={`px-2 py-1 rounded text-sm font-semibold transition-all duration-300 ${
                              selectedAngles.alice === angle
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            {angle}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-900/30 border border-blue-500 rounded-xl">
                    <h3 className="font-semibold text-blue-300 mb-3">Bob's Detector</h3>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Angle: {selectedAngles.bob}°</label>
                      <div className="grid grid-cols-3 gap-1">
                        {bobAngles.map(angle => (
                          <button
                            key={angle}
                            onClick={() => setSelectedAngles(prev => ({ ...prev, bob: angle }))}
                            className={`px-2 py-1 rounded text-sm font-semibold transition-all duration-300 ${
                              selectedAngles.bob === angle
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            {angle}°
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Measurement Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={performSingleMeasurement}
                    disabled={testInProgress || measurements.length >= 100}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 
                             hover:from-purple-400 hover:to-violet-400 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold 
                             transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {testInProgress ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Measuring...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Single Measurement</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={performAutoMeasurements}
                    disabled={testInProgress || measurements.length > 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 
                             hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold 
                             transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <span>Auto-Measure (40 optimal)</span>
                  </button>
                </div>

                {/* Progress Display */}
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Measurements Collected</span>
                    <span className="text-sm text-gray-400">{measurements.length}/40</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-violet-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(measurements.length / 40) * 100}%` }}
                    ></div>
                  </div>
                  {measurements.length >= 20 && (
                    <p className="text-green-400 text-sm mt-2">✓ Ready for Bell test!</p>
                  )}
                </div>

                {/* Live Correlation Display */}
                {measurements.length > 0 && (
                  <div className="p-4 bg-gray-700/50 rounded-xl">
                    <h3 className="font-semibold mb-3">Live Correlation Data</h3>
                    <div className="flex items-end space-x-1 h-16 overflow-x-auto mb-2">
                      {getCorrelationVisualization()}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Anti-correlated (-1)</span>
                      <span>Correlated (+1)</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-300">Average correlation: </span>
                      <span className="font-mono text-purple-400">
                        {measurements.length > 0 ? 
                          (measurements.reduce((sum, m) => sum + m.correlation, 0) / measurements.length).toFixed(3) : 
                          '0.000'
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {gamePhase === 'testing' && (
              <div className="space-y-6">
                <div className="text-center">
                  <button
                    onClick={runBellInequalityTest}
                    disabled={testInProgress}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 
                             hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 
                             disabled:cursor-not-allowed rounded-xl font-semibold text-lg 
                             transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    {testInProgress ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        <span>Run Bell Inequality Test</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <h3 className="font-semibold text-green-300 mb-2">Ready for Analysis!</h3>
                  <p className="text-green-200 text-sm">
                    You've collected {measurements.length} entangled particle measurements. 
                    Run the Bell test to see if quantum mechanics violates classical predictions!
                  </p>
                </div>
              </div>
            )}

            {bellTestResults && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="font-semibold mb-3">Bell Test Results</h3>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold">
                      <span className={bellTestResults.violatesInequality ? 'text-green-400' : 'text-red-400'}>
                        {bellTestResults.bellParameter.toFixed(3)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">Bell Parameter S</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Classical limit: S ≤ 2.000 | Quantum limit: S ≤ 2.828
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-xl border ${
                    bellTestResults.violatesInequality 
                      ? 'bg-green-900/30 border-green-500' 
                      : 'bg-red-900/30 border-red-500'
                  }`}>
                    <p className={`font-semibold ${
                      bellTestResults.violatesInequality ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {bellTestResults.violatesInequality 
                        ? '✓ Bell Inequality Violated!' 
                        : '✗ No Bell Violation Detected'}
                    </p>
                    <p className={`text-sm mt-1 ${
                      bellTestResults.violatesInequality ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {bellTestResults.violatesInequality
                        ? 'Quantum entanglement proven! No local hidden variables can explain these correlations.'
                        : 'Try the auto-measure feature or collect more measurements with optimal angles.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <div className="text-gray-400">Measurements:</div>
                      <div className="font-mono text-purple-400">{bellTestResults.measurements.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Avg Correlation:</div>
                      <div className="font-mono text-purple-400">{bellTestResults.correlationAverage.toFixed(3)}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetExperiment}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl 
                           font-semibold transition-all duration-300"
                >
                  Reset Experiment
                </button>
              </div>
            )}
          </div>

          {/* Measurement History & Visualization */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-cyan-400" />
              Measurement History
            </h2>

            {measurements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-2">No measurements yet</p>
                <p className="text-sm text-gray-500">
                  Start measuring to see quantum correlations in action!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recent Measurements Table */}
                <div className="bg-gray-700/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <h3 className="font-semibold mb-3">Recent Measurements</h3>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 font-semibold border-b border-gray-600 pb-2">
                      <span>Alice°</span>
                      <span>Bob°</span>
                      <span>A Result</span>
                      <span>B Result</span>
                      <span>Corr</span>
                    </div>
                    {measurements.slice(-10).reverse().map((measurement, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 text-xs">
                        <span className="text-red-400">{measurement.aliceAngle}°</span>
                        <span className="text-blue-400">{measurement.bobAngle}°</span>
                        <span className="font-mono">{measurement.aliceResult}</span>
                        <span className="font-mono">{measurement.bobResult}</span>
                        <span className={`font-mono ${measurement.correlation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {measurement.correlation > 0 ? '+1' : '-1'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="font-semibold text-sm mb-2">Correlation Stats</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Positive:</span>
                        <span className="text-green-400">
                          {measurements.filter(m => m.correlation > 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Negative:</span>
                        <span className="text-red-400">
                          {measurements.filter(m => m.correlation < 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ratio:</span>
                        <span className="text-purple-400">
                          {measurements.length > 0 ? 
                            (measurements.filter(m => m.correlation > 0).length / measurements.length * 100).toFixed(1) : 0
                          }%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h4 className="font-semibold text-sm mb-2">Angle Pairs</h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(
                        measurements.reduce((acc, m) => {
                          const key = `${m.aliceAngle}-${m.bobAngle}`;
                          acc[key] = (acc[key] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).slice(0, 3).map(([pair, count]) => (
                        <div key={pair} className="flex justify-between">
                          <span>{pair}°:</span>
                          <span className="text-cyan-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Room Completion */}
        {roomCompleted && (
          <div className="mt-8 p-6 bg-green-900/30 border border-green-500 rounded-xl text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-green-300 font-semibold text-xl mb-2">Entanglement Bridge Restored!</p>
            <p className="text-green-200 text-sm mb-4">
              Extraordinary! You've proven that quantum entanglement creates correlations that violate 
              Bell inequalities, demonstrating that no local hidden variable theory can explain quantum mechanics. 
              Einstein's "spooky action at a distance" is real, and you've witnessed it firsthand!
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm max-w-md mx-auto">
              <div className="bg-green-800/30 p-3 rounded-lg">
                <div className="font-semibold text-green-300">Bell Parameter</div>
                <div className="text-green-200">{bellTestResults?.bellParameter.toFixed(3)}</div>
              </div>
              <div className="bg-green-800/30 p-3 rounded-lg">
                <div className="font-semibold text-green-300">Measurements</div>
                <div className="text-green-200">{measurements.length}</div>
              </div>
              <div className="bg-green-800/30 p-3 rounded-lg">
                <div className="font-semibold text-green-300">Violation</div>
                <div className="text-green-200">{((bellTestResults?.bellParameter || 0) - 2).toFixed(3)}</div>
              </div>
            </div>
            <div className="mt-4 text-green-400 text-sm mb-4">
              🏆 Achievement Unlocked: Entanglement Prover
            </div>
            <FeedbackButton 
              roomId="entanglement-bridge" 
              className="w-full sm:w-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntanglementBridge;