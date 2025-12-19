/**
 * three-compatibility.js
 *
 * This file provides compatibility extensions and utilities for Three.js
 * to ensure consistent behavior across different versions of Three.js
 * and to provide convenience methods for quantum visualizations.
 */

import * as THREE from "three";

// Create our own quantum utilities namespace instead of modifying THREE
const QuantumUtils = {
  // Quantum fluctuation for vectors
  fluctuateVector: (vector, amplitude = 0.1) => {
    const newVector = vector.clone();
    newVector.x += (Math.random() - 0.5) * amplitude;
    newVector.y += (Math.random() - 0.5) * amplitude;
    newVector.z += (Math.random() - 0.5) * amplitude;
    return newVector;
  },

  // Quantum wave function calculation
  waveFunction: (x, y, n = 1, m = 1) => {
    // Simple quantum wave function approximation
    return Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y);
  },

  // Quantum color interpolation
  getQuantumColor: (probability, colorA = 0x00ffff, colorB = 0x8800ff) => {
    const colorObj1 = new THREE.Color(colorA);
    const colorObj2 = new THREE.Color(colorB);
    return colorObj1.lerp(colorObj2, probability);
  },
};

// Export both THREE and our utilities
export { THREE, QuantumUtils };
export default THREE;
