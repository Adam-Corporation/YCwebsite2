import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { useState, useEffect, useRef } from "react";
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
  const videoElements = useRef<HTMLVideoElement[]>([]);

  // Improved asset loading with better error handling
  const loadAssets = async () => {
    // Load videos first since they're the largest
    await loadVideos();
    
    // Then load other assets
    await Promise.all([
      loadImages(),
      loadFonts()
    ]);
    
    completeLoading();
  };

  const loadVideos = async () => {
    const videoPromises = CRITICAL_VIDEOS.map(videoPath => {
      return new Promise<void>((resolve) => {
        const cleanPath = videoPath.trim();
        const video = document.createElement('video');
        video.src = cleanPath;
        video.preload = "auto";
        
        video.addEventListener('loadeddata', () => {
          handleAssetLoad('video', cleanPath);
          resolve();
        });
        
        video.addEventListener('canplaythrough', () => {
          handleAssetLoad('video', cleanPath);
          resolve();
        });
        
        video.addEventListener('error', () => {
          console.warn(`Failed to load video: ${cleanPath}`);
          handleAssetLoad('video', cleanPath); // Still count as loaded to avoid blocking
          resolve();
        });
        
        video.load();
        videoElements.current.push(video);
      });
    });
    
    await Promise.all(videoPromises);
  };

  const loadImages = async () => {
    const imageElements = Array.from(document.images);
    const imagePromises = imageElements
      .filter(img => !img.complete && img.src)
      .map(img => {
        return new Promise<void>((resolve) => {
          img.addEventListener('load', () => {
            handleAssetLoad('image', img.src);
            resolve();
          });
          
          img.addEventListener('error', () => {
            console.warn(`Failed to load image: ${img.src}`);
            handleAssetLoad('image', img.src);
            resolve();
          });
        });
      });
    
    await Promise.all(imagePromises);
  };

  const loadFonts = async () => {
    if (!document.fonts) return;

    const fontFamilies = getUsedFontFamilies();
    const fontPromises = Array.from(fontFamilies).map(font => {
      return document.fonts.load(`12px "${font}"`)
        .then(() => handleAssetLoad('font', font))
        .catch(() => {
          console.warn(`Failed to load font: ${font}`);
          handleAssetLoad('font', font);
        });
    });
    
    await Promise.all(fontPromises);
  };

  const getUsedFontFamilies = () => {
    const fontFamilies = new Set<string>();
    if (!document.fonts) return fontFamilies;
  
    // 1. Add known/hardcoded fonts first
    fontFamilies.add('BoldOnse');
    fontFamilies.add('Inter');
    fontFamilies.add('Space Grotesk');
  
    // 2. Scan stylesheets safely
    try {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          // Skip cross-origin stylesheets that might throw security errors
          if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
            continue;
          }
  
          // Safely access rules
          let rules: CSSRuleList;
          try {
            rules = sheet.cssRules || sheet.rules || [];
          } catch (e) {
            console.debug("Cannot access stylesheet rules due to CORS");
            continue;
          }
  
          // Iterate through rules safely
          for (let i = 0; i < rules.length; i++) {
            try {
              const rule = rules[i];
              if (rule instanceof CSSFontFaceRule) {
                const fontFamily = rule.style.fontFamily;
                if (fontFamily) {
                  fontFamilies.add(fontFamily.replace(/["']/g, ''));
                }
              }
            } catch (e) {
              console.debug("Error processing CSS rule", e);
            }
          }
        } catch (e) {
          console.debug("Error processing stylesheet", e);
        }
      }
    } catch (e) {
      console.warn("Font detection error:", e);
    }
  
    return fontFamilies;
  };
  const handleAssetLoad = (assetType: string, src: string) => {
    const assetKey = `${assetType}:${src}`;
    if (assetsToLoad.current.has(assetKey)) {
      loadedAssets.current.add(assetKey);
      updateProgress();
    }
  };

  const updateProgress = () => {
    const total = assetsToLoad.current.size;
    const loaded = loadedAssets.current.size;
    const actualProgress = total > 0 ? (loaded / total) * 100 : 100;

    setProgress(prev => {
      // Smooth progression - don't jump backwards
      return Math.max(actualProgress, Math.min(prev + 2, 99));
    });
  };

  const completeLoading = () => {
    setProgress(100);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      // Clean up video elements
      videoElements.current.forEach(v => v.remove());
      videoElements.current = [];
      setShowLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (!entryMode && showLoading) {
      // Initialize all assets that need to be loaded
      CRITICAL_VIDEOS.forEach(videoPath => {
        assetsToLoad.current.add(`video:${videoPath.trim()}`);
      });

      Array.from(document.images)
        .filter(img => !img.complete && img.src)
        .forEach(img => {
          assetsToLoad.current.add(`image:${img.src}`);
        });

      if (document.fonts) {
        getUsedFontFamilies().forEach(font => {
          assetsToLoad.current.add(`font:${font}`);
        });
      }

      // Start loading process
      loadAssets().catch(console.error);

      // Fallback timeout in case something hangs
      const timeout = setTimeout(() => {
        console.warn("Loading timeout reached, proceeding anyway");
        completeLoading();
      }, 30000); // 30 seconds timeout

      return () => {
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
              alignItems: 'center',
              justifyContent: 'center',
              opacity: showLoading ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
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