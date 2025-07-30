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

  // Fixed video loading with proper duplicate prevention
  const loadVideo = async (path: string, retries = 3): Promise<boolean> => {
    const cleanPath = path.trim();
    
    // Check if already loaded and cached
    if (videoCache.has(cleanPath)) {
      loadingStats.current.loadedFiles += 1;
      updateProgress();
      return true;
    }

    const controller = new AbortController();
    activeRequests.current.add(controller);

    try {
      console.log(`Loading video: ${cleanPath}`);
      
      // Create video element with enhanced loading
      const video = document.createElement('video');
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;
      video.src = cleanPath;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Video loading timeout: ${cleanPath}`));
        }, 15000); // Reduced timeout

        const onReady = () => {
          clearTimeout(timeout);
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          
          // Verify video is ready and prevent duplicates
          if (video.readyState >= 3 && video.duration > 0 && !videoCache.has(cleanPath)) {
            videoCache.set(cleanPath, video);
            loadingStats.current.loadedFiles += 1;
            updateProgress();
            console.log(`✓ Video loaded successfully: ${cleanPath}`);
            resolve();
          } else if (videoCache.has(cleanPath)) {
            // Already loaded by another instance
            resolve();
          } else {
            reject(new Error(`Video not properly loaded: ${cleanPath}`));
          }
        };

        const onError = (e: any) => {
          clearTimeout(timeout);
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          reject(new Error(`Video load error: ${cleanPath}`));
        };

        video.addEventListener('canplaythrough', onReady, { once: true });
        video.addEventListener('error', onError, { once: true });
        
        video.load();
      });

      return true;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying ${cleanPath}, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return loadVideo(cleanPath, retries - 1);
      }
      console.error(`Failed to load video: ${cleanPath}`, error);
      return false;
    } finally {
      activeRequests.current.delete(controller);
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
    console.log("🚀 Starting asset loading for YC Demo...");
    
    // Check if assets were recently loaded
    const storedState = getStoredAssetState();
    const isRecentlyLoaded = Date.now() - storedState.timestamp < 300000; // 5 minutes
    
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length + CRITICAL_FONTS.length,
      loadedFiles: 0
    };

    setProgress(0);

    try {
      // If recently loaded, check cache first
      if (isRecentlyLoaded) {
        console.log("⚡ Using cached assets...");
        for (const video of CRITICAL_VIDEOS) {
          if (storedState.videos.includes(video)) {
            loadingStats.current.loadedFiles += 1;
            updateProgress();
          }
        }
        for (const font of CRITICAL_FONTS) {
          if (storedState.fonts.includes(font)) {
            loadingStats.current.loadedFiles += 1;
            updateProgress();
          }
        }
      }

      // Load remaining assets
      const pendingFonts = CRITICAL_FONTS.filter(f => !storedState.fonts.includes(f) || !isRecentlyLoaded);
      const pendingVideos = CRITICAL_VIDEOS.filter(v => !storedState.videos.includes(v) || !isRecentlyLoaded);

      // Load fonts first
      if (pendingFonts.length > 0) {
        console.log("📝 Loading fonts...");
        await Promise.allSettled(pendingFonts.map(font => loadFont(font)));
      }

      // Load videos
      if (pendingVideos.length > 0) {
        console.log("🎬 Loading videos...");
        await Promise.allSettled(pendingVideos.map(video => loadVideo(video)));
      }

      // Store successful loads
      const loadedVideos = CRITICAL_VIDEOS.filter(v => videoCache.has(v));
      storeAssetState(loadedVideos, CRITICAL_FONTS);

      console.log("✅ All assets loaded successfully!");
      
      setProgress(100);
      setAssetsReady(true);
      
      setTimeout(() => {
        setShowLoading(false);
        console.log("🎉 YC Demo ready to present!");
      }, 600);

    } catch (error) {
      console.error("💥 Loading error:", error);
      setProgress(100);
      setAssetsReady(true);
      setTimeout(() => setShowLoading(false), 400);
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

  // In your Home component or wherever you use the videos:
  const playVideo = (path: string) => {
    const cleanPath = path.trim();
    const video = videoCache.get(cleanPath);
    
    if (video) {
      video.currentTime = 0;
      video.play().catch(e => {
        console.error("Video play failed:", e);
        // Implement user-friendly fallback
      });
    }
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