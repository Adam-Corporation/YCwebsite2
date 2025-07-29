import { motion } from "framer-motion";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="grid md:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              Transform Your Workflow With <span className="text-primary">NovaFlow</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 max-w-lg">
              A revolutionary platform that streamlines your processes, enhances team collaboration, and delivers actionable insights - all in one seamless interface.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <motion.a 
                href="#waitlist" 
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join Waitlist
              </motion.a>
              <motion.a 
                href="#features" 
                className="border border-white/20 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            variants={itemVariants}
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 6,
              ease: "easeInOut"
            }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-[#10b981] rounded-2xl blur opacity-30"></div>
            <div className="relative bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-72 md:h-80 bg-[#1e293b] flex items-center justify-center">
                <svg 
                  className="w-48 h-48 text-primary/20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 19H21V5H3V19ZM2 3H22C22.5523 3 23 3.44772 23 4V20C23 20.5523 22.5523 21 22 21H2C1.44772 21 1 20.5523 1 20V4C1 3.44772 1.44772 3 2 3ZM13 7H19V9H13V7ZM13 11H19V13H13V11ZM13 15H19V17H13V15ZM5 7H11V17H5V7Z" 
                  fill="currentColor"
                />
                </svg>
            </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Abstract shapes background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-[#10b981]/20 rounded-full filter blur-3xl opacity-20"></div>
      </div>
    </section>
  );
}
