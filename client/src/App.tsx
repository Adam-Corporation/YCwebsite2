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

  // Improved video loading with retry logic
  const loadVideo = async (path: string, retries = 3): Promise<boolean> => {
    const cleanPath = path.trim();
    if (videoCache.has(cleanPath)) {
      return true;
    }

    const controller = new AbortController();
    activeRequests.current.add(controller);

    try {
      const response = await fetch(cleanPath, {
        signal: controller.signal,
        cache: 'force-cache' // Leverage browser caching
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('Content-Length');
      if (contentLength) {
        loadingStats.current.totalBytes += parseInt(contentLength);
      }

      // Create video element and cache it
      const video = document.createElement('video');
      video.src = cleanPath;
      video.preload = "auto";
      video.load();

      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          videoCache.set(cleanPath, video);
          loadingStats.current.loadedFiles += 1;
          loadingStats.current.loadedBytes += contentLength ? parseInt(contentLength) : 0;
          updateProgress();
          resolve();
        };

        const onError = () => {
          video.removeEventListener('canplaythrough', onReady);
          video.removeEventListener('error', onError);
          reject(new Error(`Failed to load video: ${cleanPath}`));
        };

        video.addEventListener('canplaythrough', onReady, { once: true });
        video.addEventListener('error', onError, { once: true });
      });

      return true;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying ${cleanPath}, attempts left: ${retries}`);
        return loadVideo(cleanPath, retries - 1);
      }
      console.error(`Failed to load video after retries: ${cleanPath}`, error);
      return false;
    } finally {
      activeRequests.current.delete(controller);
    }
  };

  // Other asset loaders (images, fonts) remain similar but with retry logic
  // ...

  const loadAssets = async () => {
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length,
      loadedFiles: 0
    };

    // Load videos with retry logic
    const videoResults = await Promise.allSettled(
      CRITICAL_VIDEOS.map(video => loadVideo(video))
    );

    // Check if all critical assets loaded
    const allLoaded = videoResults.every(result => result.status === 'fulfilled' && result.value);
    
    if (allLoaded) {
      setAssetsReady(true);
      setProgress(100);
      setTimeout(() => setShowLoading(false), 500);
    } else {
      console.error("Some critical assets failed to load");
      // Implement fallback behavior here
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