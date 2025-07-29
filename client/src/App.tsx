import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Loading screen component
const LoadingScreen = () => (
  <motion.div 
    className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5 } }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 border-4 border-d9d9d9 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-d9d9d9 text-lg">Loading...</p>
    </div>
  </motion.div>
);

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [entryMode, setEntryMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const assetsLoaded = useRef(false);
  
  // Check if all assets are loaded
  const checkAssetsLoaded = () => {
    // Check if all images are loaded
    const images = document.images;
    let allImagesLoaded = true;
    
    for (let i = 0; i < images.length; i++) {
      if (!images[i].complete) {
        allImagesLoaded = false;
        break;
      }
    }
    
    // Check if all videos are loaded
    const videos = document.querySelectorAll('video');
    let allVideosLoaded = true;
    
    videos.forEach(video => {
      if (video.readyState < 3) { // 3 = HAVE_FUTURE_DATA
        allVideosLoaded = false;
      }
    });
    
    // Check if fonts are loaded
    const allFontsLoaded = document.fonts ? document.fonts.status === 'loaded' : true;
    
    return allImagesLoaded && allVideosLoaded && allFontsLoaded;
  };
  
  // Handle asset loading
  useEffect(() => {
    // Clear any previously stored value
    localStorage.removeItem("hasVisitedBefore");
    
    // Check if assets are already loaded
    if (checkAssetsLoaded() && !assetsLoaded.current) {
      setIsLoading(false);
      assetsLoaded.current = true;
      return;
    }
    
    // Set up event listeners for assets
    const handleLoad = () => {
      if (checkAssetsLoaded() && !assetsLoaded.current) {
        // Small delay to ensure everything is ready
        setTimeout(() => {
          setIsLoading(false);
          assetsLoaded.current = true;
        }, 500);
      }
    };
    
    // Add event listeners
    window.addEventListener('load', handleLoad);
    window.addEventListener('DOMContentLoaded', handleLoad);
    
    // Fallback in case some assets don't trigger load events
    const timeout = setTimeout(() => {
      if (!assetsLoaded.current) {
        console.log('Fallback: Loading timeout reached, showing content');
        setIsLoading(false);
        assetsLoaded.current = true;
      }
    }, 5000); // 5 second timeout as fallback
    
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('DOMContentLoaded', handleLoad);
      clearTimeout(timeout);
    };
  }, []);

  const toggleEntryMode = () => {
    setEntryMode(prev => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading && <LoadingScreen />}
      <AnimatePresence mode="wait">
        {!isLoading && (entryMode ? (
          <EntryScreen toggleEntryMode={toggleEntryMode} />
        ) : (
          <AppRouter />
        ))}
      </AnimatePresence>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
