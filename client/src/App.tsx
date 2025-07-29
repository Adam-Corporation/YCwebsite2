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

// Simplified loading screen component
const LoadingScreen = ({ progress = 0 }) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-strip">
          <div 
            className="loading-progress"
            style={{ width: `${progress}%` }}
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
  const [showLoading, setShowLoading] = useState(false);
  
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
    console.log('Effect triggered with entryMode:', entryMode, 'homeReady:', homeReady, 'isLoading:', isLoading);
    
    // Only run this effect when home is ready to be shown (after entry screen)
    if (!entryMode && !homeReady) {
      console.log('Starting loading sequence...');
      setIsLoading(true);
      setProgress(0);
      setShowLoading(true);
      
      const checkAndHandleAssets = () => {
        const areAssetsLoaded = checkAssetsLoaded();
        console.log('Checking if assets are loaded:', areAssetsLoaded);
        
        if (areAssetsLoaded) {
          // Clear any existing interval
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = undefined;
          }
          
          // Set progress to 100%
          setProgress(100);
          
          // After a short delay, hide the loading screen
          setTimeout(() => {
            console.log('All assets loaded, hiding loading screen');
            setShowLoading(false);
            setIsLoading(false);
            setHomeReady(true);
          }, 500);
          
          return true;
        }
        return false;
      };
      
      // Initial check - if assets are already loaded
      if (checkAndHandleAssets()) {
        return;
      }
      
      // Start progress animation
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          // Slow down as we approach 100%
          const increment = prev < 50 ? 5 : prev < 80 ? 2 : 1;
          const newProgress = Math.min(prev + increment, 100);
          console.log('Progress:', newProgress);
          
          // Check if assets are loaded as we progress
          if (newProgress >= 80) {
            checkAndHandleAssets();
          }
          
          return newProgress;
        });
      }, 100);
      
      // Set up event listeners for assets
      const handleLoad = () => {
        checkAndHandleAssets();
      };
      
      // Add event listeners
      window.addEventListener('load', handleLoad);
      window.addEventListener('DOMContentLoaded', handleLoad);
      
      // Fallback in case assets take too long to load
      const loadingTimeout = setTimeout(() => {
        console.log('Fallback: Loading timeout reached, forcing completion');
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = undefined;
        }
        setProgress(100);
        setTimeout(() => {
          setShowLoading(false);
          setIsLoading(false);
          setHomeReady(true);
        }, 300);
      }, 10000); // 10 second timeout as fallback
      
      // Cleanup function
      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = undefined;
        }
        clearTimeout(loadingTimeout);
        window.removeEventListener('load', handleLoad);
        window.removeEventListener('DOMContentLoaded', handleLoad);
      };
    }
  }, [entryMode, homeReady]);

  const toggleEntryMode = () => {
    console.log('Toggle entry mode called, showing loading screen');
    setShowLoading(true);
    setEntryMode(false);
    setIsLoading(true);
    setProgress(0);
  };

  console.log('Rendering with showLoading:', showLoading, 'progress:', progress);
  
  return (
    <QueryClientProvider client={queryClient}>
      {entryMode ? (
        <EntryScreen key="entry" toggleEntryMode={toggleEntryMode} />
      ) : (
        <div key="app" style={{ position: 'relative', minHeight: '100vh' }}>
          {showLoading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.5s ease-out',
              opacity: showLoading ? 1 : 0,
              pointerEvents: showLoading ? 'auto' : 'none'
            }}>
              <LoadingScreen progress={progress} />
            </div>
          )}
          <AppRouter />
        </div>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
