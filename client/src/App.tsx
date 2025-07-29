import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { useState, useEffect, useRef } from "react";
import "./styles/LoadingScreen.css";

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
    // Track images
    Array.from(document.images).forEach((img) => {
      if (!img.complete && img.src) {
        assetsToLoad.current.add(`image:${img.src}`);
        img.addEventListener('load', () => handleAssetLoad('image', img.src));
        img.addEventListener('error', () => handleAssetLoad('image', img.src));
      }
    });

    // Track videos
    Array.from(document.querySelectorAll('video')).forEach((video) => {
      if (video.readyState < 3 && video.src) {
        assetsToLoad.current.add(`video:${video.src}`);
        video.addEventListener('canplaythrough', () => handleAssetLoad('video', video.src));
        video.addEventListener('loadeddata', () => handleAssetLoad('video', video.src));
        video.addEventListener('error', () => handleAssetLoad('video', video.src));
      }
    });

    // Track fonts
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
  };

  const updateProgress = () => {
    const total = assetsToLoad.current.size;
    const loaded = loadedAssets.current.size;
    const actualProgress = total > 0 ? (loaded / total) * 100 : 100;

    setProgress(prev => {
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
    }
    setProgress(100);
    setTimeout(() => setShowLoading(false), 500);
  };

  useEffect(() => {
    if (!entryMode && showLoading) {
      trackAssets();

      // If no assets to load, skip loading screen
      if (assetsToLoad.current.size === 0) {
        completeLoading();
        return;
      }

      // Start progress animation
      progressInterval.current = setInterval(updateProgress, 100);

      // Fallback timeout
      const timeout = setTimeout(completeLoading, 15000);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
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