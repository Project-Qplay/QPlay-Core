import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Modern spaceship model using Three.js geometries
const SpaceshipModel = ({ active = false, isMoving = false, ...props }) => {
  const shipBodyRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  // Subtle animation effects
  useFrame((state) => {
    if (shipBodyRef.current) {
      // Very subtle floating motion when not actively moving
      if (!isMoving) {
        shipBodyRef.current.position.y =
          Math.sin(state.clock.getElapsedTime() * 0.8) * 0.01;
      }
    }

    // Engine glow effect
    if (engineGlowRef.current) {
      // Make engine glow pulse, more intensely when moving
      const baseIntensity = isMoving ? 2.5 : 1.2;
      const pulseAmount = isMoving ? 0.5 : 0.2;
      engineGlowRef.current.intensity =
        baseIntensity +
        Math.sin(state.clock.getElapsedTime() * 4) * pulseAmount;
    }
  });

  return (
    <group ref={shipBodyRef} {...props}>
      {/* Main body - oriented so the "nose" points forward (correct orientation) */}
      <group>
        {/* Sleek fuselage */}
        <mesh position={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.7, 2, 8, 16]} />
          <meshStandardMaterial
            color="#454FBF"
            emissive="#232975"
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Forward cockpit section */}
        <mesh position={[0, 0.15, -0.7]}>
          <capsuleGeometry args={[0.5, 1, 8, 16]} />
          <meshStandardMaterial
            color="#5D67E0"
            emissive="#2C348E"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Cockpit canopy */}
        <mesh position={[0, 0.4, -0.5]}>
          <sphereGeometry
            args={[0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]}
          />
          <meshStandardMaterial
            color="#55DDFF"
            emissive="#55DDFF"
            emissiveIntensity={0.2}
            transparent
            opacity={0.85}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Cockpit interior glow */}
        <pointLight
          position={[0, 0.3, -0.5]}
          color="#55DDFF"
          intensity={0.4}
          distance={1}
        />

        {/* Engine section */}
        <mesh position={[0, 0, 2]}>
          <cylinderGeometry args={[0.65, 0.8, 0.8, 16]} />
          <meshStandardMaterial
            color="#373C8A"
            emissive="#22254D"
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>

        {/* Engine nozzle */}
        <mesh position={[0, 0, 2.4]}>
          <cylinderGeometry args={[0.8, 0.6, 0.4, 16]} />
          <meshStandardMaterial
            color="#2C2F66"
            emissive="#16173A"
            emissiveIntensity={0.3}
            metalness={1.0}
            roughness={0.3}
          />
        </mesh>

        {/* Engine exhaust glow */}
        <pointLight
          ref={engineGlowRef}
          position={[0, 0, 2.7]}
          color="#5599FF"
          intensity={2.5}
          distance={4}
        />

        {/* Engine exhaust effect - improved realistic effect */}
        <group position={[0, 0, 2.8]}>
          {/* Main exhaust cone */}
          <mesh rotation={[0, 0, 0]}>
            <coneGeometry args={[0.4, isMoving ? 2.5 : 1.5, 16, 1, true]} />
            <meshBasicMaterial
              color={isMoving ? "#AACCFF" : "#7799FF"}
              transparent
              opacity={isMoving ? 0.6 : 0.4}
            />
          </mesh>

          {/* Inner brighter cone */}
          <mesh position={[0, 0, -0.2]}>
            <coneGeometry args={[0.25, isMoving ? 1.8 : 1.0, 12, 1, true]} />
            <meshBasicMaterial
              color={isMoving ? "#FFFFFF" : "#AADDFF"}
              transparent
              opacity={isMoving ? 0.9 : 0.7}
            />
          </mesh>

          {/* Particle effect for engine when moving */}
          {isMoving && (
            <points position={[0, 0, 1]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={20}
                  itemSize={3}
                  array={Float32Array.from(
                    Array(60)
                      .fill(0)
                      .map((_, i) => {
                        if (i % 3 === 0) return (Math.random() - 0.5) * 0.4; // x
                        if (i % 3 === 1) return (Math.random() - 0.5) * 0.4; // y
                        return Math.random() * 2; // z
                      }),
                  )}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.1}
                color="#FFFFFF"
                transparent
                opacity={0.8}
              />
            </points>
          )}
        </group>

        {/* Wings */}
        <group>
          {/* Right wing */}
          <mesh position={[1.2, 0, 0.8]} rotation={[0, 0, Math.PI * -0.1]}>
            <boxGeometry args={[1.8, 0.1, 1.2]} />
            <meshStandardMaterial
              color="#3D46B0"
              emissive="#232870"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Right wing accent */}
          <mesh position={[1.9, 0, 0.8]} rotation={[0, 0, Math.PI * -0.1]}>
            <boxGeometry args={[0.5, 0.15, 1.4]} />
            <meshStandardMaterial
              color="#343D9E"
              emissive="#1C2266"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Right wing tip light */}
          <mesh position={[2.1, 0, 0.4]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#FF3333" />
          </mesh>
          <pointLight
            position={[2.1, 0, 0.4]}
            color="#FF3333"
            intensity={0.8}
            distance={2}
          />

          {/* Left wing */}
          <mesh position={[-1.2, 0, 0.8]} rotation={[0, 0, Math.PI * 0.1]}>
            <boxGeometry args={[1.8, 0.1, 1.2]} />
            <meshStandardMaterial
              color="#3D46B0"
              emissive="#232870"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Left wing accent */}
          <mesh position={[-1.9, 0, 0.8]} rotation={[0, 0, Math.PI * 0.1]}>
            <boxGeometry args={[0.5, 0.15, 1.4]} />
            <meshStandardMaterial
              color="#343D9E"
              emissive="#1C2266"
              emissiveIntensity={0.4}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Left wing tip light */}
          <mesh position={[-2.1, 0, 0.4]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#33FF33" />
          </mesh>
          <pointLight
            position={[-2.1, 0, 0.4]}
            color="#33FF33"
            intensity={0.8}
            distance={2}
          />
        </group>

        {/* Vertical stabilizer */}
        <mesh position={[0, 0.6, 1.2]}>
          <boxGeometry args={[0.1, 1, 1.2]} />
          <meshStandardMaterial
            color="#3D46B0"
            emissive="#232870"
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Top stabilizer light */}
        <mesh position={[0, 1.1, 1.2]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <pointLight
          position={[0, 1.1, 1.2]}
          color="#FFFFFF"
          intensity={0.5}
          distance={2}
        />
      </group>
    </group>
  );
};

// Interface for Spaceship props
interface SpaceshipProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  controlsEnabled?: boolean;
  velocity?: { x: number; y: number; z: number };
  onMove?: (position: THREE.Vector3, rotation: THREE.Euler) => void;
}

// Main Spaceship component
const Spaceship: React.FC<SpaceshipProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  controlsEnabled = false,
  velocity = { x: 0, y: 0, z: 0 },
  onMove,
}) => {
  const shipRef = useRef<THREE.Group>(null);
  const targetRotation = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));

  // Handle physics and movement
  useFrame((state, delta) => {
    if (!shipRef.current) return;

    // Position update
    shipRef.current.position.x += velocity.x * delta;
    shipRef.current.position.y += velocity.y * delta;
    shipRef.current.position.z += velocity.z * delta;

    // Calculate speed for animation purposes
    const speed = Math.sqrt(
      velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z,
    );

    // Determine forward direction based on velocity
    if (speed > 0.1) {
      // Calculate the angle in the XZ plane (yaw) - fixed orientation
      const targetYaw = Math.atan2(velocity.x, velocity.z);

      // Apply smooth rotation toward movement direction
      shipRef.current.rotation.y = THREE.MathUtils.lerp(
        shipRef.current.rotation.y,
        targetYaw,
        delta * 3, // Adjust this value for rotation speed
      );

      // Bank when turning (roll)
      const targetRoll = -velocity.x * 0.5;
      shipRef.current.rotation.z = THREE.MathUtils.lerp(
        shipRef.current.rotation.z,
        targetRoll,
        delta * 2,
      );

      // Pitch based on vertical movement
      const targetPitch = velocity.y * 0.5;
      shipRef.current.rotation.x = THREE.MathUtils.lerp(
        shipRef.current.rotation.x,
        targetPitch,
        delta * 2,
      );
    }

    // Notify parent of position and rotation changes
    if (onMove) {
      onMove(shipRef.current.position, shipRef.current.rotation);
    }
  });

  // Check if the ship is moving
  const isMoving =
    Math.abs(velocity.x) > 0.1 ||
    Math.abs(velocity.y) > 0.1 ||
    Math.abs(velocity.z) > 0.1;

  return (
    <group
      ref={shipRef}
      position={position as any}
      rotation={rotation as any}
      scale={scale}
    >
      <SpaceshipModel active={controlsEnabled} isMoving={isMoving} />
    </group>
  );
};

export default Spaceship;
