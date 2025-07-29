import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { useState, useEffect, useRef } from "react";
import "./styles/LoadingScreen.css";

// Define all critical videos upfront
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
  const assetsToLoad = useRef<Set<string>>(new Set());
  const loadedAssets = useRef<Set<string>>(new Set());
  const progressInterval = useRef<NodeJS.Timeout>();

  const getUsedFontFamilies = () => {
    const fontFamilies = new Set<string>();
    if (!document.fonts) return fontFamilies;

    // Always include your custom font
    fontFamilies.add('BoldOnse');

    // Scan for other fonts
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach((rule) => {
            if (rule instanceof CSSFontFaceRule) {
              const fontFamily = rule.style.fontFamily;
              if (fontFamily) {
                fontFamilies.add(fontFamily.replace(/["']/g, ''));
              }
            }
          });
        }
      } catch (e) {
        console.warn("Couldn't read stylesheet rules", e);
      }
    });

    return fontFamilies;
  };

  const handleAssetLoad = (assetType: string, src: string) => {
    const assetKey = `${assetType}:${src}`;
    if (assetsToLoad.current.has(assetKey)) {
      loadedAssets.current.add(assetKey);
      updateProgress();
    }
  };

  const trackAssets = () => {
    const videoElements: HTMLVideoElement[] = [];

    // 1. Force load all critical videos
    CRITICAL_VIDEOS.forEach(videoPath => {
      const normalizedPath = videoPath.trim();
      assetsToLoad.current.add(`video:${normalizedPath}`);
      
      const video = document.createElement('video');
      video.src = normalizedPath;
      video.preload = "auto";
      video.load(); // Force start loading
      
      const handleVideoReady = () => {
        handleAssetLoad('video', normalizedPath);
        video.removeEventListener('canplaythrough', handleVideoReady);
        video.removeEventListener('error', handleVideoReady);
      };
      
      video.addEventListener('canplaythrough', handleVideoReady);
      video.addEventListener('error', handleVideoReady);
      
      document.body.appendChild(video);
      videoElements.push(video);
    });

    // 2. Track images
    Array.from(document.images).forEach((img) => {
      if (!img.complete && img.src) {
        assetsToLoad.current.add(`image:${img.src}`);
        img.addEventListener('load', () => handleAssetLoad('image', img.src));
        img.addEventListener('error', () => handleAssetLoad('image', img.src));
      }
    });

    // 3. Track fonts
    if (document.fonts) {
      const fontsToCheck = getUsedFontFamilies();
      fontsToCheck.forEach((font) => {
        assetsToLoad.current.add(`font:${font}`);
        document.fonts.load(`12px "${font}"`).then(
          () => handleAssetLoad('font', font),
          () => handleAssetLoad('font', font)
        );
      });
    }

    return () => {
      videoElements.forEach(v => v.remove());
    };
  };

  const updateProgress = () => {
    const total = assetsToLoad.current.size;
    const loaded = loadedAssets.current.size;
    const actualProgress = total > 0 ? (loaded / total) * 100 : 100;

    setProgress(prev => {
      // Smooth animation with actual progress as minimum
      const newProgress = Math.max(actualProgress, Math.min(prev + 2, 95));
      return newProgress;
    });

    if (loaded >= total && total > 0) {
      completeLoading();
    }
  };

  const completeLoading = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = undefined;
    }
    setProgress(100);
    setTimeout(() => setShowLoading(false), 500);
  };

  useEffect(() => {
    if (!entryMode && showLoading) {
      const cleanupVideoElements = trackAssets();

      if (assetsToLoad.current.size === 0) {
        completeLoading();
        return;
      }

      progressInterval.current = setInterval(updateProgress, 100);
      const timeout = setTimeout(completeLoading, 20000); // 20s timeout

      return () => {
        cleanupVideoElements();
        if (progressInterval.current) clearInterval(progressInterval.current);
        clearTimeout(timeout);
      };
    }
  }, [entryMode, showLoading]);

  const toggleEntryMode = () => {
    setEntryMode(false);
    setShowLoading(true);
    setProgress(0);
    assetsToLoad.current = new Set();
    loadedAssets.current = new Set();
  };

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