import React, { useRef, useEffect, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import * as THREE from "three";

/**
 * Cat 3D model credits:
 * "LowPoly Cat Rig + Run Animation" by Omabuarts Studio
 * Source: https://sketchfab.com/3d-models/lowpoly-cat-rig-run-animation-c36df576c9ae4ed28e89069b1a2f427a
 */

// Interface for CatModel props
interface CatModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  controlsEnabled?: boolean;
  onMove?: (position: THREE.Vector3, rotation: THREE.Euler) => void;
  keys?: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  freezeAnimation?: boolean;
}

// Main Cat component
const CatModel: React.FC<CatModelProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  controlsEnabled = false,
  onMove,
  keys = { forward: false, backward: false, left: false, right: false },
  freezeAnimation = true,
}) => {
  const catRef = useRef<THREE.Group>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const animRef = useRef({ initialized: false });
  const materialApplied = useRef(false);

  // Load the model with error handling
  const { scene, animations } = useGLTF(
    "/models/cat.glb",
    undefined,
    (error) => {
      setModelError("Failed to load cat model");
    },
  );

  // Effect for handling animations
  useEffect(() => {
    // Animation handling logic
  }, [animations]);

  const { actions, mixer } = useAnimations(animations, catRef);

  // Clean up animations when component unmounts
  useEffect(() => {
    return () => {
      if (mixer) {
        mixer.stopAllAction();
      }
    };
  }, [mixer]);

  // Apply black and white coloring to the cat model
  useEffect(() => {
    if (scene && !materialApplied.current) {
      // Create a texture-based approach
      const textureCanvas = document.createElement("canvas");
      textureCanvas.width = 1024;
      textureCanvas.height = 1024;
      const ctx = textureCanvas.getContext("2d");

      if (ctx) {
        // Fill the entire canvas with black
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 1024, 1024);

        // Create a white underbelly area (lower third of the texture)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 1024 * 0.6, 1024, 1024 * 0.4); // Bottom 40% is white

        // Create white paws (four circles at the corners of the lower section)
        const pawSize = 180;
        // Front paws
        ctx.beginPath();
        ctx.arc(pawSize, 1024 - pawSize, pawSize, 0, Math.PI * 2);
        ctx.arc(1024 - pawSize, 1024 - pawSize, pawSize, 0, Math.PI * 2);
        // Back paws
        ctx.arc(
          pawSize * 1.5,
          1024 - pawSize * 2.2,
          pawSize * 0.9,
          0,
          Math.PI * 2,
        );
        ctx.arc(
          1024 - pawSize * 1.5,
          1024 - pawSize * 2.2,
          pawSize * 0.9,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Create a white chest area
        ctx.beginPath();
        ctx.ellipse(1024 / 2, 1024 * 0.6, 200, 150, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Create texture from the canvas
      const catTexture = new THREE.CanvasTexture(textureCanvas);
      catTexture.flipY = false; // Important for correct texture orientation

      // Create material with the texture
      const catMaterial = new THREE.MeshStandardMaterial({
        map: catTexture,
        roughness: 0.8,
        metalness: 0.1,
      });

      // Apply the textured material to all parts of the cat
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // Store original UV if needed for future reference
          const originalUvs = object.geometry.attributes.uv?.clone();

          // Apply our textured material
          if (Array.isArray(object.material)) {
            object.material = object.material.map(() => catMaterial.clone());
          } else {
            object.material = catMaterial.clone();
          }
        }
      });

      materialApplied.current = true;
    }
  }, [scene]);

  // Start animations when the model loads
  useEffect(() => {
    if (
      actions &&
      Object.keys(actions).length &&
      !animRef.current.initialized
    ) {
      animRef.current.initialized = true;

      // Get the first animation as default
      const defaultAnim = Object.values(actions)[0];

      if (defaultAnim) {
        // Stop any other animations
        Object.values(actions).forEach((action) => action.stop());

        if (freezeAnimation) {
          // Set the animation to a single frame and stop
          defaultAnim.reset();
          defaultAnim.timeScale = 0;
          defaultAnim.play();
          defaultAnim.paused = true;

          // Force a single frame update to show the first frame
          if (mixer) {
            mixer.update(0);
          }
        } else {
          // Play the animation at a very slow speed
          defaultAnim.reset();
          defaultAnim.timeScale = 0.1;
          defaultAnim.play();
        }
      }
    }
  }, [actions, mixer, freezeAnimation]);

  // Handle physics and movement
  const speedRef = useRef(0);
  const angularSpeedRef = useRef(0);
  const [isWalking, setIsWalking] = useState(false);
  const lastAnimationType = useRef<string>("idle");

  useFrame((state, delta) => {
    if (!catRef.current) return;

    // Car-like movement variables
    const ROTATION_SPEED = 2.0; // How fast the cat turns
    const MAX_SPEED = 5.0; // Maximum move speed
    const ACCELERATION = 4.0; // How quickly cat speeds up
    const DECELERATION = 6.0; // How quickly cat slows down

    // Get current speed from ref
    let currentSpeed = speedRef.current;

    // Calculate movement direction based on cat's current rotation
    const forward = new THREE.Vector3(
      Math.sin(catRef.current.rotation.y),
      0,
      Math.cos(catRef.current.rotation.y),
    );

    // Apply acceleration or deceleration
    if (keys.forward) {
      currentSpeed = Math.min(MAX_SPEED, currentSpeed + ACCELERATION * delta);
    } else if (keys.backward) {
      currentSpeed = Math.max(
        -MAX_SPEED / 1.5,
        currentSpeed - ACCELERATION * delta,
      );
    } else if (Math.abs(currentSpeed) > 0) {
      // Decelerate when no key is pressed
      const decelerationAmount = DECELERATION * delta;
      if (currentSpeed > 0) {
        currentSpeed = Math.max(0, currentSpeed - decelerationAmount);
      } else {
        currentSpeed = Math.min(0, currentSpeed + decelerationAmount);
      }
    }

    // Turning calculations - can turn even when stationary
    let currentAngularSpeed = 0;

    if (keys.left) {
      // Use a small positive value for rotation direction when stationary
      const rotationAmount =
        ROTATION_SPEED *
        delta *
        (Math.abs(currentSpeed) > 0.1 ? Math.sign(currentSpeed) : 1);
      catRef.current.rotation.y += rotationAmount;
      currentAngularSpeed += rotationAmount / delta; // Convert to angular speed
    }
    if (keys.right) {
      // Use a small positive value for rotation direction when stationary
      const rotationAmount =
        ROTATION_SPEED *
        delta *
        (Math.abs(currentSpeed) > 0.1 ? Math.sign(currentSpeed) : 1);
      catRef.current.rotation.y -= rotationAmount;
      currentAngularSpeed += rotationAmount / delta; // Convert to angular speed
    }

    // Store angular speed in ref
    angularSpeedRef.current = currentAngularSpeed;

    // Update position based on forward direction and speed
    catRef.current.position.x += forward.x * currentSpeed * delta;
    catRef.current.position.z += forward.z * currentSpeed * delta;

    // Keep y position constant (no vertical movement)
    catRef.current.position.y = position[1]; // Maintain original height

    // Store new speed in ref (no re-renders)
    speedRef.current = currentSpeed;

    // Calculate total movement including both linear and angular velocities
    // Increase the influence of linear speed for faster animations at top speed
    const totalMovement =
      Math.abs(currentSpeed) * 1.2 + Math.abs(angularSpeedRef.current) * 0.5;

    // Update animation state
    const isMovingNow = totalMovement > 0.5;
    if (isMovingNow !== isWalking) {
      setIsWalking(isMovingNow);
    }

    // Calculate speed for animation purposes
    const movementSpeed = totalMovement;

    // Play appropriate animation based on movement
    if (movementSpeed > 0.1) {
      // We're moving - make sure animations aren't paused
      if (
        actions &&
        Object.keys(actions).length &&
        lastAnimationType.current !== "walking"
      ) {
        const walkingAnim = Object.values(actions)[0]; // Use the main animation

        if (walkingAnim) {
          // Stop all other animations
          Object.values(actions).forEach((action) => {
            action.stop();
          });

          // Play at normal speed, but faster when at top speed
          walkingAnim.reset();
          walkingAnim.timeScale = Math.min(
            2.5,
            Math.max(0.5, movementSpeed / 1.5),
          );
          walkingAnim.paused = false;
          walkingAnim.play();
          lastAnimationType.current = "walking";
        }
      }
    } else if (Math.abs(currentSpeed) < 0.05) {
      // We've stopped - freeze the animation
      if (
        actions &&
        Object.keys(actions).length &&
        lastAnimationType.current !== "idle"
      ) {
        const idleAnim = Object.values(actions)[0]; // Use the main animation

        if (idleAnim) {
          // Stop all other animations
          Object.values(actions).forEach((action) => {
            action.stop();
          });

          if (freezeAnimation) {
            // Completely freeze animation
            idleAnim.reset();
            idleAnim.timeScale = 0;
            idleAnim.play();

            // Update once to show the first frame, then pause
            if (mixer) {
              mixer.update(0);
              idleAnim.paused = true;
            }
          } else {
            // Play very slowly
            idleAnim.reset();
            idleAnim.timeScale = 0.1;
            idleAnim.paused = false;
            idleAnim.play();
          }

          lastAnimationType.current = "idle";
        }
      }
    }

    // Update animations
    if (mixer) {
      mixer.update(delta);
    }

    // Notify parent of position and rotation changes
    if (onMove) {
      onMove(catRef.current.position, catRef.current.rotation);
    }
  });

  // Debug indicator for cat's direction (front is +Z in the model's local space)
  const showDebugHelpers = false;

  // If there was an error loading the model, show a fallback box with error message
  if (modelError) {
    return (
      <group
        ref={catRef}
        position={position as any}
        rotation={rotation as any}
        scale={scale}
      >
        <mesh>
          <boxGeometry args={[1, 1, 2]} />
          <meshStandardMaterial color="hotpink" />
        </mesh>
        <Html position={[0, 1.5, 0]} center>
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              width: "200px",
              textAlign: "center",
            }}
          >
            {modelError}
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group
      ref={catRef}
      position={position as any}
      rotation={rotation as any}
      scale={scale}
    >
      {/* Use the correct orientation for the cat model to match its movement direction */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive
          object={scene}
          dispose={null}
          onUpdate={() => {
            // Ensure cat is black when rendered
            if (scene && !materialApplied.current) {
              const blackMaterial = new THREE.MeshStandardMaterial({
                color: 0x000000,
                roughness: 0.95,
                metalness: 0.05,
              });

              scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                  if (Array.isArray(object.material)) {
                    object.material = object.material.map(() =>
                      blackMaterial.clone(),
                    );
                  } else {
                    object.material = blackMaterial.clone();
                  }
                }
              });

              materialApplied.current = true;
            }
          }}
        />

        {/* White underbelly - larger and more visible */}
        <mesh position={[0, -0.04, 0]} scale={[0.3, 0.06, 0.4]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* White chest patch - more pronounced */}
        <mesh position={[0, 0.03, 0.2]} scale={[0.2, 0.25, 0.15]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* White paws - larger and more visible */}
        <mesh position={[0.12, -0.13, 0.23]} scale={[0.1, 0.04, 0.1]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[-0.12, -0.13, 0.23]} scale={[0.1, 0.04, 0.1]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[0.12, -0.13, -0.23]} scale={[0.1, 0.04, 0.1]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh position={[-0.12, -0.13, -0.23]} scale={[0.1, 0.04, 0.1]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.7}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Optional debug helpers to show direction */}
        {showDebugHelpers && (
          <>
            <arrowHelper
              args={[
                new THREE.Vector3(0, 0, 1), // direction (forward)
                new THREE.Vector3(0, 0, 0), // origin
                1, // length
                0x00ff00, // color (green)
              ]}
            />
            <axesHelper args={[1]} />
          </>
        )}
      </group>
    </group>
  );
};

// Pre-load the cat model (source: https://sketchfab.com/3d-models/lowpoly-cat-rig-run-animation-c36df576c9ae4ed28e89069b1a2f427a)
useGLTF.preload("/models/cat.glb");

// Export with Suspense for better loading experience
export default function CatModelWithSuspense(props: CatModelProps) {
  // More attractive loading state
  return (
    <Suspense
      fallback={
        <group scale={props.scale}>
          <mesh>
            <boxGeometry args={[1.5, 1, 2]} />
            <meshStandardMaterial
              color="#8866cc"
              wireframe
              opacity={0.7}
              transparent
            />
          </mesh>
          <mesh position={[0, 0.8, -0.8]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color="#8866cc"
              wireframe
              opacity={0.7}
              transparent
            />
          </mesh>
          <mesh position={[0, 0, -0.8]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.2, 0.2, 1]} />
            <meshStandardMaterial
              color="#8866cc"
              wireframe
              opacity={0.7}
              transparent
            />
          </mesh>
        </group>
      }
    >
      <CatModel {...props} />
    </Suspense>
  );
}
