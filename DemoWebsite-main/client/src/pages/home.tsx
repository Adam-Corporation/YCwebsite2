import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "@/components/footer";

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSlogan, setCurrentSlogan] = useState(0);

  // Add your slogans here
  const slogans = [
    "not like ChatGPT , Adam enter the browser, search and use ChatGPT like any other website or app.",
    "Adam is a computer ,it is not a user high level application it have some kind of awarness of what is happenning in the computer from high to low level , that is the power",
    "every task a human use the computer for , the computer can do it by itself , except art and generation of content which the computer can help its best with it",
    "Adam is an autmation miracle",
    "A general purpose computer is defined to be a processor , memory ,I/O and user, the definition of Adam is a general purpose computer execluding the user role the most it can",
    "we do not want robots that walk and wash dishes , we want robots that use its programs not hands — this is Adam",
    "Adam is a computer from the future — combination of the highest technologies in computers history",
    "The intelligence here is how he configures plans and syncs and learns to achieve any task alone, it is an eligible compelling employer",

    "A computer in every home in every desk —Microsoft 1980",
    "Level-up to the next generation of computers -Adam",
    "forget the rest this is a real AGI",

    // Add more slogans as needed
  ];

  // Rotate slogans with dynamic timing based on length
  useEffect(() => {
    const baseTime = 2000; // Base time in milliseconds
    const timePerChar = 50; // Additional time per character

    const getCurrentSloganDuration = () => {
      const sloganLength = slogans[currentSlogan].length;
      return baseTime + sloganLength * timePerChar;
    };

    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, getCurrentSloganDuration());

    return () => clearInterval(interval);
  }, [currentSlogan]);
  const containerRef = useRef(null);

  // Get scroll progress for animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Transform values based on scroll position - with MUCH longer full-screen video phase
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.1], [0.45, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  // Video stays fully visible from 0.1 all the way to 0.7, creating a much longer video-only phase
  const videoOpacity = useTransform(scrollYProgress, [0.7, 0.75], [1, 0]);

  // Create a return-to-original-position effect when scrolling
  const textY = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 25, 50]);
  const textScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle video loaded event
  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[400vh] flex flex-col relative overflow-x-hidden bg-black"
      style={{ position: "relative" }}
    >
      {/* Full-screen video background */}
      <motion.div
        className="fixed inset-0 z-0 w-full h-full overflow-hidden"
        style={{ opacity: videoOpacity }}
      >
        <video
          className="absolute min-w-full min-h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoaded}
        >
          <source
            src="/videos/Adam--a computer version2.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Subtle dark overlay that fades out on scroll */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent"
          style={{ opacity: overlayOpacity }}
        />
      </motion.div>

      {/* Centered title and slogan that disappear on scroll */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center z-30 text-center"
        style={{
          opacity: textOpacity,
          y: textY,
          scale: textScale,
          marginTop: "-20vh", // Move the content up by 20% of viewport height
        }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-display font-bold text-white mb-3 md:mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: videoLoaded ? 1 : 0, y: videoLoaded ? 0 : -20 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Adam
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-gray-200 mb-8 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: videoLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          The first real artificial general intelligence AGI
        </motion.p>

        {/* Scroll indicator moved to separate fixed position at bottom */}
      </motion.div>

      {/* Scroll indicator fixed at bottom of screen */}
      <motion.div
        className="fixed bottom-6 left-0 w-full flex flex-col items-center z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: videoLoaded ? 0.7 : 0 }}
        transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        style={{ opacity: textOpacity }}
      >
        <p className="text-sm text-gray-400 mb-2">Scroll to explore</p>
        <motion.div
          className="w-[2px] h-12 bg-gray-400/50 rounded-full"
          animate={{
            scaleY: [0.5, 1, 0.5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Main content - sections begin after the extended video-only section */}
      <main className="relative" style={{ paddingTop: "220vh" }}>
        {/* First content section - black background with text and image */}
        <section className="min-h-screen bg-black text-white p-6 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-12 text-center">
            Introducing Adam
          </h2>

          {/* First paragraph in gradient container */}
          <div className="rounded-2xl bg-gradient-to-br from-white via-gray-300 to-black p-6 mb-16 shadow-xl max-w-4xl mx-auto">
            <p className="text-xl text-black font-medium leading-relaxed">
              Adam is an artificial general intelligent computer, starting the
              revolution of AI in the real sense of affecting the human daily
              life to human hardest problems, Adam redefines what a computer is
              and restates its capabilities and the way humans interact with
              computers.
            </p>
          </div>

          {/* Second paragraph with image side by side */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Left side - Text content */}
            <div className="w-full md:w-1/2 space-y-6">
              <p className="text-xl text-gray-300 leading-relaxed">
                Why this name: this is not a random name, Adam is the first
                human being peace be upon him, humans represent a very high
                level of AGI, and their intelligence is not just for answering
                questions (like ChatGPT and other LLMs), but also enable them to
                achieve tasks and know how to use their infrastructures like
                hands and legs, and can, to a certain extent, track
                environmental parameters and proactively respond to them, human
                can be placed in thousands of jobs doing thousands of tasks,
                this is AGI, hands legs plus knowledge on how to use them and
                the capability to learn and grow. For computer hands and legs
                can be described as all the computer resources like different
                hardware and software, The environment represents the system's
                current state, ranging from low-level aspects like CPU execution
                mode (interruption context or process context) to high-level
                elements such as the current process's task with which the user
                is interacting, and that is why AGI demands the urgent creation
                of a whole new computer system design, introducing Adam.
              </p>

              {/* Quote with underlined phrases */}
              <blockquote className="mt-8 border-l-4 border-gray-500 pl-6 italic text-gray-400 text-lg w-full md:w-[200%] -mr-[100%]">
                ". . . the only way to realistically{" "}
                <span className="underline decoration-2 decoration-white/70">
                  realize the performance goals
                </span>{" "}
                and make them accessible to the user was{" "}
                <span className="underline decoration-2 decoration-white/70">
                  to design the compiler and the computer at the same time
                </span>
                . In this way features would not be put in the hardware which
                the software could not use ..."
                <footer className="text-right mt-2 text-sm font-medium not-italic">
                  — Frances Elizabeth "Fran" Allen, 1981, Turing Award Winner
                </footer>
              </blockquote>
            </div>

            {/* Right side - Image */}
            <div className="w-full md:w-1/2 flex justify-center items-start">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg shadow-2xl">
                <img
                  src="/images/blessOfAllah.jpg"
                  alt="Adam Technology"
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: "600px", objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Full screen section for rotating slogans */}
        <section className="h-screen w-full bg-black flex items-center justify-center relative">
          {/* Top line */}
          <div className="absolute top-0 w-full h-[1px] bg-white/30" />
          <motion.h3
            key={slogans[currentSlogan]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-bold text-white text-center max-w-5xl mx-auto px-4 leading-relaxed"
          >
            {slogans[currentSlogan]}
          </motion.h3>
          {/* Bottom line */}
          <div className="absolute bottom-0 w-full h-[1px] bg-white/30" />
        </section>

        {/* Spacer div for additional scrolling */}
        <div className="h-screen bg-black"></div>
      </main>
      <Footer />
    </motion.div>
  );
}
