import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParticleEffect } from "@/lib/hooks/use-particle-effect";

interface ToggleButtonProps {
  onToggle: () => void;
}

export default function ToggleButton({ onToggle }: ToggleButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const { enhanceEffect } = useParticleEffect();

  const handleToggle = () => {
    // Step 1: Activate toggle and enhance particles
    setIsActive(true);
    enhanceEffect();
    
    // Step 2: After toggle animation starts, prepare for light flash
    setTimeout(() => {
      setShowFlash(true);
    }, 250);
    
    // Step 3: After the flash effect has time to fully expand, redirect to home
    setTimeout(() => {
      onToggle();
    }, 1000);
  };

  return (
    <div className="relative">
      {/* Light flash effect that radiates from toggle button and covers the screen */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed z-50"
            initial={{ 
              opacity: 0, 
              scale: 0.1,
              left: "50%",
              top: "50%",
              width: "50px",
              height: "50px",
              x: "-50%",  
              y: "-50%"
            }}
            animate={{ 
              opacity: [0, 1, 1, 0.9], 
              scale: [0.1, 1, 10, 30],
              width: ["50px", "100px", "150vw", "200vw"],
              height: ["50px", "100px", "150vh", "200vh"],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1, 
              times: [0, 0.2, 0.5, 1],
              ease: "easeOut" 
            }}
            style={{ 
              pointerEvents: "none",
              background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.98) 100%)",
              boxShadow: "0 0 300px 150px rgba(255,255,255,1), 0 0 100px 50px rgba(255,255,255,1) inset",
              transformOrigin: "center", 
              borderRadius: "50%"
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Pulsing ring animation when not active */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ 
              repeat: Infinity, 
              duration: 2,
              ease: "easeInOut"
            }}
            style={{ 
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%)",
              zIndex: -1
            }}
          />
        )}
      </AnimatePresence>
      
      {/* The actual toggle button */}
      <motion.button
        onClick={handleToggle}
        disabled={isActive}
        className="w-20 h-10 rounded-full bg-gray-900 border border-gray-500 p-1 flex items-center cursor-pointer relative overflow-hidden shadow-lg"
        whileHover={!isActive ? { scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" } : {}}
        whileTap={!isActive ? { scale: 0.98 } : {}}
        animate={isActive ? { boxShadow: "0 0 25px rgba(255, 255, 255, 0.8)" } : {}}
      >
        {/* Track glow effect */}
        <motion.span 
          className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-full"
          animate={{ 
            opacity: isActive ? 1 : 0.7
          }}
        />
        
        {/* Moving toggle handle */}
        <motion.span
          className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-full shadow-lg flex items-center justify-center z-10"
          animate={{ 
            x: isActive ? 38 : 0,
            scale: isActive ? 1.1 : 1,
            background: isActive ? 
              "linear-gradient(to bottom right, #ffffff, #888888)" : 
              "linear-gradient(to bottom right, #ffffff, #dadada)"
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            scale: { delay: isActive ? 0.2 : 0 }
          }}
        >
          {/* Circle handle is empty - no > sign */}
        </motion.span>
      </motion.button>
    </div>
  );
}