import { useEffect } from "react";
import { useParticleEffect } from "@/lib/hooks/use-particle-effect";

export default function ParticleBackground() {
  const { canvasRef, initParticles } = useParticleEffect();

  useEffect(() => {
    const cleanup = initParticles();
    return cleanup;
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
