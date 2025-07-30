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

// Improved video cache handler
const videoCache = new Map<string, HTMLVideoElement>();

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

  // Enhanced video loading with better caching and verification
  const loadVideo = async (path: string, retries = 5): Promise<boolean> => {
    const cleanPath = path.trim();
    if (videoCache.has(cleanPath)) {
      return true;
    }

    const controller = new AbortController();
    activeRequests.current.add(controller);

    try {
      console.log(`Loading video: ${cleanPath}`);
      
      // Pre-fetch with range request to verify file exists
      const headResponse = await fetch(cleanPath, {
        method: 'HEAD',
        signal: controller.signal,
      });

      if (!headResponse.ok) {
        throw new Error(`Video not accessible: ${cleanPath} (${headResponse.status})`);
      }

      const contentLength = headResponse.headers.get('Content-Length');
      if (contentLength) {
        loadingStats.current.totalBytes += parseInt(contentLength);
      }

      // Create video element with enhanced loading
      const video = document.createElement('video');
      video.preload = "auto";
      video.muted = true; // Required for autoplay policies
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      
      // Set source and force load
      video.src = cleanPath;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Video loading timeout: ${cleanPath}`));
        }, 30000); // 30 second timeout

        const onReady = () => {
          clearTimeout(timeout);
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          video.removeEventListener('loadeddata', onLoaded);
          
          // Verify video is truly ready
          if (video.readyState >= 3 && video.duration > 0) {
            videoCache.set(cleanPath, video);
            loadingStats.current.loadedFiles += 1;
            loadingStats.current.loadedBytes += contentLength ? parseInt(contentLength) : 0;
            updateProgress();
            console.log(`✓ Video loaded successfully: ${cleanPath}`);
            resolve();
          } else {
            reject(new Error(`Video not properly loaded: ${cleanPath}`));
          }
        };

        const onLoaded = () => {
          // Additional check when metadata is loaded
          if (video.readyState >= 2) {
            onReady();
          }
        };

        const onError = (e: any) => {
          clearTimeout(timeout);
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          video.removeEventListener('loadeddata', onLoaded);
          reject(new Error(`Video load error: ${cleanPath} - ${e.message || 'Unknown error'}`));
        };

        video.addEventListener('canplaythrough', onReady, { once: true });
        video.addEventListener('loadeddata', onLoaded, { once: true });
        video.addEventListener('error', onError, { once: true });
        
        // Start loading
        video.load();
      });

      return true;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying ${cleanPath}, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return loadVideo(cleanPath, retries - 1);
      }
      console.error(`Failed to load video after all retries: ${cleanPath}`, error);
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

  // Update progress based on loaded files
  const updateProgress = () => {
    const { fileCount, loadedFiles } = loadingStats.current;
    if (fileCount > 0) {
      const progressPercent = (loadedFiles / fileCount) * 100;
      setProgress(progressPercent);
    }
  };

  const loadAssets = async () => {
    console.log("🚀 Starting asset loading for YC Demo...");
    
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length + CRITICAL_FONTS.length,
      loadedFiles: 0
    };

    setProgress(0);

    try {
      // Load fonts first (faster, smaller files)
      console.log("📝 Loading fonts...");
      const fontResults = await Promise.allSettled(
        CRITICAL_FONTS.map(font => loadFont(font))
      );

      // Load videos concurrently
      console.log("🎬 Loading videos...");
      const videoResults = await Promise.allSettled(
        CRITICAL_VIDEOS.map(video => loadVideo(video))
      );

      // Verify all assets loaded successfully
      const fontsLoaded = fontResults.every(result => result.status === 'fulfilled' && result.value);
      const videosLoaded = videoResults.every(result => result.status === 'fulfilled' && result.value);
      
      if (fontsLoaded && videosLoaded) {
        console.log("✅ All assets loaded successfully!");
        
        // Wait for any final DOM updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        setProgress(100);
        setAssetsReady(true);
        
        // Smooth transition delay
        setTimeout(() => {
          setShowLoading(false);
          console.log("🎉 YC Demo ready to present!");
        }, 800);
      } else {
        const failedFonts = fontResults.filter(r => r.status === 'rejected' || !r.value);
        const failedVideos = videoResults.filter(r => r.status === 'rejected' || !r.value);
        
        console.error("❌ Asset loading failed:");
        if (failedFonts.length > 0) console.error("Failed fonts:", failedFonts.length);
        if (failedVideos.length > 0) console.error("Failed videos:", failedVideos.length);
        
        // Show loading failure state but still proceed (graceful degradation)
        setProgress(100);
        setAssetsReady(true);
        setTimeout(() => setShowLoading(false), 1000);
      }
    } catch (error) {
      console.error("💥 Critical loading error:", error);
      // Emergency fallback - show the site anyway
      setProgress(100);
      setAssetsReady(true);
      setTimeout(() => setShowLoading(false), 500);
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
          {assetsReady && <AppRouter />}
        </div>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;