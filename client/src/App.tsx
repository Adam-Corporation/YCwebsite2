import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import "./styles/LoadingScreen.css";

// Loading screen component with animated progress bar and percentage
const LoadingScreen = ({ progress = 0, isExiting = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const prevProgress = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger fade in animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Update progress with smooth transition
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${progress}%`;
      prevProgress.current = progress;
    }
  }, [progress]);

  return (
    <div className={`loading-screen ${isExiting ? 'fade-out' : ''}`}>
      <div className={`loading-container ${!isVisible ? 'opacity-0' : ''}`}>
        <div className="loading-strip">
          <div 
            ref={progressRef}
            className="loading-progress"
            style={{ width: '0%' }}
          />
        </div>
        <div className="loading-info">
          <span className="loading-text">Loading</span>
          <span className="loading-percentage">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const assetsLoaded = useRef(false);
  const [homeReady, setHomeReady] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout>();
  
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
  
  // Handle asset loading when home is ready to be shown
  useEffect(() => {
    // Only run this effect when home is ready to be shown (after entry screen)
    if (!entryMode && !homeReady) {
      setIsLoading(true);
      setProgress(0);
      
      // Start progress animation
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          // Slow down as we approach 90%
          const increment = prev < 50 ? 5 : prev < 80 ? 2 : 1;
          return Math.min(prev + increment, 90);
        });
      }, 100);
      
      const checkAssets = () => {
        if (checkAssetsLoaded()) {
          // Set progress to 100% and finish loading
          setProgress(100);
          
          // Small delay to show 100% and ensure everything is ready
          setTimeout(() => {
            if (progressInterval.current) clearInterval(progressInterval.current);
            setIsLoading(false);
            setHomeReady(true);
          }, 500);
          return true;
        }
        return false;
      };
      
      // Initial check
      if (checkAssets()) {
        return;
      }
      
      // Set up event listeners for assets
      const handleLoad = () => {
        if (checkAssets()) {
          window.removeEventListener('load', handleLoad);
          window.removeEventListener('DOMContentLoaded', handleLoad);
        }
      };
      
      // Add event listeners
      window.addEventListener('load', handleLoad);
      window.addEventListener('DOMContentLoaded', handleLoad);
      
      // Fallback in case some assets don't trigger load events
      const timeout = setTimeout(() => {
        console.log('Fallback: Loading timeout reached, showing content');
        if (progressInterval.current) clearInterval(progressInterval.current);
        setProgress(100);
        setTimeout(() => {
          setIsLoading(false);
          setHomeReady(true);
        }, 300);
      }, 10000); // 10 second timeout as fallback
      
      return () => {
        window.removeEventListener('load', handleLoad);
        window.removeEventListener('DOMContentLoaded', handleLoad);
        clearTimeout(timeout);
      };
    }
  }, [entryMode, homeReady]);

  const toggleEntryMode = () => {
    setEntryMode(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {entryMode ? (
          <EntryScreen key="entry" toggleEntryMode={toggleEntryMode} />
        ) : (
          <div key="app">
            {isLoading && <LoadingScreen progress={progress} />}
            <AppRouter />
          </div>
        )}
      </AnimatePresence>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
