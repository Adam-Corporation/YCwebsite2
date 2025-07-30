import { useState, useEffect, useRef } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import EntryScreen from "./components/entry-screen";
import "./styles/LoadingScreen.css";

// Import videos directly - they'll be embedded in the build
import video1 from '/Videos/1-HelloWorldv2.mp4';
import video2 from '/Videos/2-MemoryTestv1.mp4';
import video3 from '/Videos/3-ChatGPTFinalVersion.mp4';
import video4 from '/Videos/4-GoogleFormsTestv2.mp4';
import video5 from '/Videos/5-SignInTest - Made with Clipchamp.mp4';
import video6 from '/Videos/6-TweetTest - Made with Clipchamp.mp4';
import video7 from '/Videos/7-GuiBasicTest - Made with Clipchamp.mp4';
import video8 from '/Videos/8-TerminalBasicTest - Made with Clipchamp.mp4';

// Critical videos for YC demo - now embedded in build
const CRITICAL_VIDEOS = [
  { path: '/Videos/1-HelloWorldv2.mp4', src: video1 },
  { path: '/Videos/2-MemoryTestv1.mp4', src: video2 },
  { path: '/Videos/3-ChatGPTFinalVersion.mp4', src: video3 },
  { path: '/Videos/4-GoogleFormsTestv2.mp4', src: video4 },
  { path: '/Videos/5-SignInTest - Made with Clipchamp.mp4', src: video5 },
  { path: '/Videos/6-TweetTest - Made with Clipchamp.mp4', src: video6 },
  { path: '/Videos/7-GuiBasicTest - Made with Clipchamp.mp4', src: video7 },
  { path: '/Videos/8-TerminalBasicTest - Made with Clipchamp.mp4', src: video8 }
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

  // Embedded video loading - instant since they're in the build
  const loadVideo = async (videoObj: { path: string; src: string }): Promise<boolean> => {
    const { path, src } = videoObj;
    
    try {
      console.log(`Loading embedded video: ${path}`);
      
      // Create video element with embedded source
      const video = document.createElement('video');
      video.src = src; // Use the imported embedded source
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      
      // Since the video is embedded, it loads instantly
      await new Promise<void>((resolve) => {
        const onReady = () => {
          video.removeEventListener('loadedmetadata', onReady);
          videoCache.set(path, video);
          loadingStats.current.loadedFiles += 1;
          updateProgress();
          console.log(`✓ Embedded video ready: ${path}`);
          resolve();
        };
        
        video.addEventListener('loadedmetadata', onReady, { once: true });
        video.load();
        
        // Fallback in case metadata loads immediately
        setTimeout(() => {
          if (!videoCache.has(path)) {
            onReady();
          }
        }, 100);
      });
      
      return true;
    } catch (error) {
      console.error(`Embedded video loading failed: ${path}`, error);
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

  // Ensure DOM is fully painted with all styles - NEVER timeout, wait indefinitely
  const waitForCompleteRender = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkComplete = () => {
        // Check 1: All stylesheets loaded and accessible
        const stylesheets = Array.from(document.styleSheets);
        const stylesLoaded = stylesheets.length > 0 && stylesheets.every(sheet => {
          try {
            const rules = sheet.cssRules || sheet.rules;
            return rules && rules.length > 0;
          } catch {
            return false;
          }
        });
        
        // Check 2: DOM is completely ready
        const domReady = document.readyState === 'complete';
        
        // Check 3: Critical elements exist and have computed styles
        const videoSection = document.querySelector('[class*="video"]');
        const hasElements = videoSection !== null;
        const hasComputedStyles = videoSection ? 
          getComputedStyle(videoSection).display !== '' && 
          getComputedStyle(videoSection).position !== '' : true;
        
        // Check 4: Font loading complete
        const fontsReadyPromise = document.fonts ? document.fonts.ready : Promise.resolve();
        
        // ALL checks must pass - no compromises for YC demo
        if (stylesLoaded && domReady && hasElements && hasComputedStyles) {
          console.log("✓ All core checks passed, verifying fonts...");
          fontsReadyPromise.then(() => {
            // Triple RAF to ensure complete paint cycle
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  console.log("✅ PERFECT: Complete rendering verified - DOM fully painted with styles");
                  resolve(true);
                });
              });
            });
          });
        } else {
          // Keep checking - NEVER give up for YC demo
          console.log(`🔄 Still loading: styles=${stylesLoaded}, dom=${domReady}, elements=${hasElements}, computed=${hasComputedStyles}`);
          setTimeout(checkComplete, 100);
        }
      };
      
      // Start checking immediately
      checkComplete();
    });
  };

  const loadAssets = async () => {
    console.log("🚀 Starting complete asset loading for YC Demo");
    
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length + CRITICAL_FONTS.length + 1, // +1 for CSS
      loadedFiles: 0
    };

    setProgress(0);

    try {
      // Load fonts first
      console.log("📝 Loading fonts...");
      const fontResults = await Promise.allSettled(CRITICAL_FONTS.map(font => loadFont(font)));
      const fontsLoaded = fontResults.filter(r => r.status === 'fulfilled' && r.value).length;
      
      // Load embedded videos
      console.log("🎬 Loading embedded videos...");
      const videoResults = await Promise.allSettled(CRITICAL_VIDEOS.map(videoObj => loadVideo(videoObj)));
      const videosLoaded = videoResults.filter(r => r.status === 'fulfilled' && r.value).length;

      // Wait for complete DOM rendering with all styles
      console.log("🎨 Ensuring complete render with all styles...");
      await waitForCompleteRender();
      loadingStats.current.loadedFiles += 1;
      updateProgress();

      const totalLoaded = fontsLoaded + videosLoaded + 1; // +1 for CSS
      const totalAssets = CRITICAL_FONTS.length + CRITICAL_VIDEOS.length + 1;
      
      console.log(`📊 Loading complete: ${totalLoaded}/${totalAssets} assets loaded`);
      console.log(`   - Fonts: ${fontsLoaded}/${CRITICAL_FONTS.length}`);
      console.log(`   - Videos: ${videosLoaded}/${CRITICAL_VIDEOS.length}`);
      console.log(`   - CSS: Fully rendered and painted`);

      // Set final progress
      const finalProgress = Math.min(100, (totalLoaded / totalAssets) * 100);
      setProgress(finalProgress);

      // Store successfully loaded assets
      const loadedVideos = CRITICAL_VIDEOS.filter(v => videoCache.has(v.path)).map(v => v.path);
      storeAssetState(loadedVideos, CRITICAL_FONTS);

      // CRITICAL: All assets AND styles must be ready for YC demo
      if (videosLoaded === CRITICAL_VIDEOS.length && totalLoaded === totalAssets) {
        console.log("✅ ALL assets AND complete styling verified - YC Demo ready!");
        setAssetsReady(true);
        
        // Final paint check before revealing interface
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setShowLoading(false);
            console.log("🎉 Demo interface revealed with perfect styling!");
          });
        });
      } else {
        console.error(`❌ CRITICAL: Only ${totalLoaded}/${totalAssets} assets loaded!`);
        console.error("YC Demo requires ALL videos AND styles to be ready");
        console.error("🚫 BLOCKING: Will NOT show interface until everything is perfect");
        // NO timeout - keep loading screen visible until everything is ready
        setAssetsReady(false);
      }

    } catch (error) {
      console.error("Critical loading error:", error);
      console.error("🚫 ERROR: Will retry loading - YC demo requires perfection");
      // Retry loading instead of proceeding with errors
      setTimeout(() => loadAssets(), 1000);
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

  // Embedded video playback - get from cache
  const playVideo = (path: string) => {
    const cleanPath = path.trim();
    let video = videoCache.get(cleanPath);
    
    if (!video) {
      // Fallback: find the embedded source
      const videoObj = CRITICAL_VIDEOS.find(v => v.path === cleanPath);
      if (videoObj) {
        video = document.createElement('video');
        video.src = videoObj.src;
        video.muted = true;
        video.playsInline = true;
        videoCache.set(cleanPath, video);
      } else {
        console.error(`Video not found in embedded sources: ${cleanPath}`);
        return;
      }
    }
    
    console.log(`Playing embedded video: ${cleanPath}`);
    video.currentTime = 0;
    video.play().catch(e => {
      console.error("Video play failed:", e);
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