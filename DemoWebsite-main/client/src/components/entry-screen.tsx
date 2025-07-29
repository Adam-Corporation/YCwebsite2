import { motion } from "framer-motion";
import ParticleBackground from "./particle-background";
import ToggleButton from "./toggle-button";

interface EntryScreenProps {
  toggleEntryMode: () => void;
}

export default function EntryScreen({ toggleEntryMode }: EntryScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
    >
      <ParticleBackground />

      <div className="relative z-10 text-center px-4">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
        >
          <span className="text-white">Adam</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white text-xl md:text-2xl max-w-md mx-auto mb-16 font-light"
        >
          "Beyond building the next generation of computers, we're igniting the true revolution of AI."
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <p className="text-white mb-4 font-medium">Enter the next decade</p>
          <ToggleButton onToggle={toggleEntryMode} />
          <p className="text-white mt-3 text-sm font-light"></p>
        </motion.div>
      </div>
    </motion.div>
  );
}
