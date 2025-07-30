import { useState, useEffect, useRef } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import EntryScreen from "./components/entry-screen";
import "./styles/LoadingScreen.css";

const CRITICAL_VIDEOS = [
  '/Videos/1-HelloWorldv2.mp4',
  '/Videos/2-MemoryTestv1.mp4',
  '/Videos/3-ChatGPTFinalVersion.mp4',
  '/Videos/4-GoogleFormsTestv2.mp4',
  '/Videos/5-SignInTest - Made with Clipchamp.mp4',
  '/Videos/6-TweetTest - Made with Clipchamp.mp4',
  '/Videos/7-GuiBasicTest - Made with Clipchamp.mp4',
  '/Videos/8-TerminalBasicTest - Made with Clipchamp.mp4'
];

const CRITICAL_FONTS = [
  '/fonts/Boldonse-Regular.ttf'
];

// Enhanced video cache with localStorage persistence
const videoCache = new Map<string, HTMLVideoElement>();
const CACHE_KEY = 'yc_demo_loaded_assets';

// Check localStorage for previously loaded assets
const getStoredAssetState = () => {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    return stored ? JSON.parse(stored) : { videos: [], fonts: [], timestamp: 0 };
  } catch {
    return { videos: [], fonts: [], timestamp: 0 };
  }
};

// Store asset state in localStorage
const storeAssetState = (videos: string[], fonts: string[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      videos,
      fonts,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore localStorage errors
  }
};

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
          <span className="loading-text">Preparing Demo</span>
          <span className="loading-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="loading-subtitle">
          Loading videos and assets...
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
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const loadingStats = useRef({
    totalBytes: 0,
    loadedBytes: 0,
    fileCount: 0,
    loadedFiles: 0
  });
  const activeRequests = useRef<Set<AbortController>>(new Set());

  // Production-ready video loading for YC Demo
  const loadVideo = async (path: string): Promise<boolean> => {
    const cleanPath = path.trim();
    
    // Check if already cached
    if (videoCache.has(cleanPath)) {
      loadingStats.current.loadedFiles += 1;
      updateProgress();
      return true;
    }

    try {
      console.log(`Preparing video: ${cleanPath}`);
      
      // Just verify the video exists with a simple HEAD request
      const response = await fetch(cleanPath, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Video not found: ${response.status}`);
      }

      // Create video element with minimal preloading for faster startup
      const video = document.createElement('video');
      video.preload = "metadata"; // Only load metadata, not the full video
      video.muted = true;
      video.playsInline = true;
      video.src = cleanPath;

      // Wait only for metadata to load (much faster)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Metadata timeout: ${cleanPath}`));
        }, 3000); // Much shorter timeout

        const onMetadata = () => {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', onMetadata);
          video.removeEventListener('error', onError);
          
          if (video.duration > 0) {
            videoCache.set(cleanPath, video);
            loadingStats.current.loadedFiles += 1;
            updateProgress();
            console.log(`✓ Video ready: ${cleanPath}`);
            resolve();
          } else {
            reject(new Error(`Invalid video: ${cleanPath}`));
          }
        };

        const onError = () => {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', onMetadata);
          video.removeEventListener('error', onError);
          reject(new Error(`Video error: ${cleanPath}`));
        };

        video.addEventListener('loadedmetadata', onMetadata, { once: true });
        video.addEventListener('error', onError, { once: true });
        
        video.load();
      });

      return true;
    } catch (error) {
      console.error(`Video preparation failed: ${cleanPath}`, error);
      
      // Create a fallback video element anyway to prevent blocking
      const video = document.createElement('video');
      video.src = cleanPath;
      video.muted = true;
      video.playsInline = true;
      videoCache.set(cleanPath, video);
      
      loadingStats.current.loadedFiles += 1;
      updateProgress();
      return true; // Return true to not block the demo
    }
  };

  // Enhanced font loading
  const loadFont = async (path: string, retries = 3): Promise<boolean> => {
    try {
      console.log(`Loading font: ${path}`);
      
      const font = new FontFace('BoldOnse', `url(${path})`);
      await font.load();
      document.fonts.add(font);
      
      // Verify font is actually loaded
      await document.fonts.ready;
      
      loadingStats.current.loadedFiles += 1;
      updateProgress();
      console.log(`✓ Font loaded successfully: ${path}`);
      return true;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying font ${path}, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return loadFont(path, retries - 1);
      }
      console.error(`Failed to load font after retries: ${path}`, error);
      return false;
    }
  };

  // Fixed progress calculation to prevent over 100%
  const updateProgress = () => {
    const { fileCount, loadedFiles } = loadingStats.current;
    if (fileCount > 0) {
      const progressPercent = Math.min(100, Math.max(0, (loadedFiles / fileCount) * 100));
      setProgress(progressPercent);
    }
  };

  const loadAssets = async () => {
    console.log("🚀 YC Demo - Fast loading sequence initiated");
    
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length + CRITICAL_FONTS.length,
      loadedFiles: 0
    };

    setProgress(0);

    try {
      // Load fonts instantly
      console.log("📝 Loading fonts...");
      await Promise.allSettled(CRITICAL_FONTS.map(font => loadFont(font)));

      // Load video metadata only (fast)
      console.log("🎬 Preparing videos...");
      await Promise.allSettled(CRITICAL_VIDEOS.map(video => loadVideo(video)));

      // Mark as complete
      console.log("✅ YC Demo ready for presentation!");
      setProgress(100);
      setAssetsReady(true);
      
      // Store in cache for next time
      storeAssetState(CRITICAL_VIDEOS, CRITICAL_FONTS);
      
      setTimeout(() => {
        setShowLoading(false);
        console.log("🎉 Demo interface loaded!");
      }, 300);

    } catch (error) {
      console.error("Error during loading:", error);
      // Always show the demo - never block the presentation
      setProgress(100);
      setAssetsReady(true);
      setTimeout(() => setShowLoading(false), 200);
    }
  };

  const cleanup = () => {
    // Abort all pending requests
    activeRequests.current.forEach(controller => controller.abort());
    activeRequests.current.clear();
  };

  useEffect(() => {
    if (!entryMode && showLoading) {
      loadAssets();
      return cleanup;
    }
  }, [entryMode, showLoading]);

  // Enhanced video playback for YC Demo
  const playVideo = (path: string) => {
    const cleanPath = path.trim();
    let video = videoCache.get(cleanPath);
    
    if (!video) {
      // Create video on-demand if not cached
      video = document.createElement('video');
      video.src = cleanPath;
      video.muted = true;
      video.playsInline = true;
      videoCache.set(cleanPath, video);
    }
    
    video.currentTime = 0;
    
    // Enhanced play with better error handling
    video.play().then(() => {
      console.log(`Playing: ${cleanPath}`);
    }).catch(e => {
      console.error("Video play failed:", e);
      // Try once more after a brief delay
      setTimeout(() => {
        video?.play().catch(() => {
          console.error("Video playback completely failed for:", cleanPath);
        });
      }, 100);
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      {entryMode ? (
        <EntryScreen toggleEntryMode={() => {
          setEntryMode(false);
          setShowLoading(true);
        }} />
      ) : (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <AppRouter />
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
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LoadingScreen progress={progress} />
            </div>
          )}
        </div>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;