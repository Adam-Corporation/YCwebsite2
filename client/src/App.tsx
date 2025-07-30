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

  // Honest video loading - only succeeds when actually loaded
  const loadVideo = async (path: string): Promise<boolean> => {
    const cleanPath = path.trim();
    
    // Check if already successfully loaded
    if (videoCache.has(cleanPath)) {
      return true;
    }

    try {
      console.log(`Loading video: ${cleanPath}`);
      
      // Create video element with proper loading
      const video = document.createElement('video');
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      // Remove crossOrigin to avoid CORS issues
      video.src = cleanPath;

      // Only resolve when video is actually ready
      const success = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          cleanup();
          console.warn(`Video loading timeout: ${cleanPath}`);
          resolve(false);
        }, 8000);

        const cleanup = () => {
          clearTimeout(timeout);
          video.removeEventListener('loadedmetadata', onSuccess);
          video.removeEventListener('canplay', onSuccess);
          video.removeEventListener('error', onError);
          video.removeEventListener('abort', onError);
        };

        const onSuccess = () => {
          if (video.readyState >= 1 && video.duration > 0) {
            cleanup();
            videoCache.set(cleanPath, video);
            console.log(`✓ Video loaded: ${cleanPath} (${video.duration.toFixed(1)}s)`);
            resolve(true);
          }
        };

        const onError = (e: any) => {
          cleanup();
          console.error(`Video failed: ${cleanPath}`, e);
          resolve(false);
        };

        video.addEventListener('loadedmetadata', onSuccess);
        video.addEventListener('canplay', onSuccess);
        video.addEventListener('error', onError);
        video.addEventListener('abort', onError);
        
        // Start loading
        video.load();
      });

      if (success) {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
      }
      
      return success;
    } catch (error) {
      console.error(`Video loading failed: ${cleanPath}`, error);
      return false;
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
    console.log("🚀 Starting honest asset loading for YC Demo");
    
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length + CRITICAL_FONTS.length,
      loadedFiles: 0
    };

    setProgress(0);

    try {
      // Load fonts first
      console.log("📝 Loading fonts...");
      const fontResults = await Promise.allSettled(CRITICAL_FONTS.map(font => loadFont(font)));
      const fontsLoaded = fontResults.filter(r => r.status === 'fulfilled' && r.value).length;
      
      // Load videos with honest progress tracking
      console.log("🎬 Loading videos...");
      const videoResults = await Promise.allSettled(CRITICAL_VIDEOS.map(video => loadVideo(video)));
      const videosLoaded = videoResults.filter(r => r.status === 'fulfilled' && r.value).length;

      const totalLoaded = fontsLoaded + videosLoaded;
      const totalAssets = CRITICAL_FONTS.length + CRITICAL_VIDEOS.length;
      
      console.log(`📊 Loading complete: ${totalLoaded}/${totalAssets} assets loaded`);
      console.log(`   - Fonts: ${fontsLoaded}/${CRITICAL_FONTS.length}`);
      console.log(`   - Videos: ${videosLoaded}/${CRITICAL_VIDEOS.length}`);

      // Set final progress based on actually loaded assets
      const finalProgress = Math.min(100, (totalLoaded / totalAssets) * 100);
      setProgress(finalProgress);

      // Store successfully loaded assets
      const loadedVideos = CRITICAL_VIDEOS.filter(v => videoCache.has(v));
      storeAssetState(loadedVideos, CRITICAL_FONTS);

      // Only show "ready" if most assets loaded
      if (videosLoaded >= Math.ceil(CRITICAL_VIDEOS.length * 0.75)) {
        console.log("✅ YC Demo ready for presentation!");
        setAssetsReady(true);
        setTimeout(() => {
          setShowLoading(false);
          console.log("🎉 Demo interface loaded!");
        }, 500);
      } else {
        console.warn("⚠️ Some videos failed to load, but proceeding with demo");
        setAssetsReady(true);
        setTimeout(() => setShowLoading(false), 800);
      }

    } catch (error) {
      console.error("Critical loading error:", error);
      setProgress(100);
      setAssetsReady(true);
      setTimeout(() => setShowLoading(false), 300);
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