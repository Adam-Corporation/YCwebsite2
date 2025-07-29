import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface UseParticleEffectProps {
  color?: string;
  particleCount?: number;
  particleSize?: number;
  speed?: number;
}

export const useParticleEffect = ({
  color = "#ffffff", // White color
  particleCount = 400, // Even more particles
  particleSize = 0.12, // Larger particles for more light
  speed = 0.0008, // Slightly faster rotation
}: UseParticleEffectProps = {}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particleSystemRef = useRef<THREE.Points | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize the particle system
  const initParticles = () => {
    if (!canvasRef.current) return;

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create particle system with two colors for a more dynamic effect
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(color);
    const color2 = new THREE.Color("#000000"); // Black color
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position (more concentrated in the center)
      particlePositions[i3] = (Math.random() - 0.5) * 18;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 18;
      
      // Colors - mix between white and black for monochrome effect
      // Using Math.pow to bias towards white (more light-filled particles)
      const ratio = Math.pow(Math.random(), 2.5); // Power of 2.5 biases heavily towards white
      const mixedColor = new THREE.Color().lerpColors(color1, color2, ratio);
      
      particleColors[i3] = mixedColor.r;
      particleColors[i3 + 1] = mixedColor.g;
      particleColors[i3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: particleSize,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending, // For light-filled glowing effect
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particleSystemRef.current = particleSystem;
    scene.add(particleSystem);

    // Set ready state
    setIsReady(true);

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (
        cameraRef.current &&
        rendererRef.current &&
        canvasRef.current
      ) {
        const camera = cameraRef.current;
        const renderer = rendererRef.current;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  };

  // Animation loop with more dynamic movement
  const animate = () => {
    if (
      sceneRef.current &&
      cameraRef.current &&
      rendererRef.current &&
      particleSystemRef.current
    ) {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const particleSystem = particleSystemRef.current;

      // Create more interesting motion pattern
      const time = Date.now() * 0.0005;
      particleSystem.rotation.x = Math.sin(time * 0.7) * 0.2 + speed;
      particleSystem.rotation.y = Math.cos(time * 0.5) * 0.2 + speed;
      particleSystem.rotation.z = Math.sin(time * 0.3) * 0.1;

      // Gentle camera movement
      camera.position.x = Math.sin(time * 0.3) * 0.2;
      camera.position.y = Math.cos(time * 0.4) * 0.2;
      camera.lookAt(scene.position);

      // Render
      renderer.render(scene, camera);
    }

    frameIdRef.current = requestAnimationFrame(animate);
  };

  // Enhance the particle effect (for toggle animation)
  const enhanceEffect = () => {
    if (particleSystemRef.current && particleSystemRef.current.material) {
      const material = particleSystemRef.current.material as THREE.PointsMaterial;
      
      // Make particles larger and brighter for a dramatic light burst effect
      material.size = particleSize * 4;
      
      // Force all particles to be bright white
      material.color = new THREE.Color("#ffffff");
      material.opacity = 1.0;
      
      // Create a more dramatic burst effect
      if (particleSystemRef.current) {
        // Add rapid rotational movement for dynamic effect
        particleSystemRef.current.rotation.x += 0.12;
        particleSystemRef.current.rotation.y += 0.12;
        particleSystemRef.current.rotation.z += 0.08;
        
        // Scale the particles for a visual "burst" effect
        particleSystemRef.current.scale.set(1.3, 1.3, 1.3);
        
        // Reset scale after animation
        setTimeout(() => {
          if (particleSystemRef.current) {
            particleSystemRef.current.scale.set(1, 1, 1);
          }
        }, 600);
      }
    }
  };

  return {
    canvasRef,
    initParticles,
    enhanceEffect,
    isReady,
  };
};
