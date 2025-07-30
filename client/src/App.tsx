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
  const loadingStats = useRef({
    totalBytes: 0,
    loadedBytes: 0,
    fileCount: 0,
    loadedFiles: 0
  });
  const videoElements = useRef<HTMLVideoElement[]>([]);
  const xhrRequests = useRef<XMLHttpRequest[]>([]);

  const updateProgress = () => {
    const { totalBytes, loadedBytes, fileCount, loadedFiles } = loadingStats.current;
    
    // Calculate progress based on both bytes and file count
    const bytesProgress = totalBytes > 0 ? (loadedBytes / totalBytes) * 80 : 0;
    const filesProgress = fileCount > 0 ? (loadedFiles / fileCount) * 20 : 0;
    
    setProgress(Math.min(bytesProgress + filesProgress, 99));
  };

  const loadVideo = (path: string): Promise<void> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhrRequests.current.push(xhr);
      
      xhr.open('GET', path, true);
      xhr.responseType = 'blob';
      
      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          loadingStats.current.loadedBytes += e.loaded - (xhr as any).lastLoaded || 0;
          (xhr as any).lastLoaded = e.loaded;
          updateProgress();
        }
      };
      
      xhr.onload = () => {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
        resolve();
      };
      
      xhr.onerror = () => {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
        resolve();
      };
      
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 2) {
          const contentLength = xhr.getResponseHeader('Content-Length');
          if (contentLength) {
            loadingStats.current.totalBytes += parseInt(contentLength);
          }
        }
      };
      
      xhr.send();
    });
  };

  const loadImage = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
        return;
      }

      loadingStats.current.fileCount += 1;
      
      img.onload = () => {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
        resolve();
      };
      
      img.onerror = () => {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
        resolve();
      };
    });
  };

  const getUsedFontFamilies = (): Set<string> => {
    const fontFamilies = new Set<string>();
    if (!document.fonts) return fontFamilies;

    // Add known fonts
    fontFamilies.add('BoldOnse');
    fontFamilies.add('Inter');
    fontFamilies.add('Space Grotesk');

    // Scan stylesheets
    try {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
            continue;
          }
          
          const rules = sheet.cssRules || [];
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

  const loadFont = (font: string): Promise<void> => {
    loadingStats.current.fileCount += 1;
    
    return new Promise((resolve) => {
      if (!document.fonts) {
        loadingStats.current.loadedFiles += 1;
        updateProgress();
        return resolve();
      }

      document.fonts.load(`12px "${font}"`)
        .then(() => {
          loadingStats.current.loadedFiles += 1;
          updateProgress();
          resolve();
        })
        .catch(() => {
          loadingStats.current.loadedFiles += 1;
          updateProgress();
          resolve();
        });
    });
  };

  const loadAssets = async () => {
    // Reset loading stats
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: CRITICAL_VIDEOS.length,
      loadedFiles: 0
    };

    // Load videos with byte-by-byte tracking
    await Promise.all(CRITICAL_VIDEOS.map(loadVideo));
    
    // Load images
    const images = Array.from(document.images);
    loadingStats.current.fileCount += images.length;
    await Promise.all(images.map(img => loadImage(img)));
    
    // Load fonts
    const fonts = getUsedFontFamilies();
    loadingStats.current.fileCount += fonts.size;
    await Promise.all(Array.from(fonts).map(font => loadFont(font)));
    
    // Complete loading
    setProgress(100);
    setTimeout(() => setShowLoading(false), 500);
  };

  const cleanupResources = () => {
    // Abort any pending XHR requests
    xhrRequests.current.forEach(xhr => xhr.abort());
    xhrRequests.current = [];
    
    // Remove video elements
    videoElements.current.forEach(v => v.remove());
    videoElements.current = [];
  };

  useEffect(() => {
    if (!entryMode && showLoading) {
      loadAssets().catch(console.error);
      
      return () => {
        cleanupResources();
      };
    }
  }, [entryMode, showLoading]);

  const toggleEntryMode = () => {
    setEntryMode(false);
    setShowLoading(true);
    setProgress(0);
    loadingStats.current = {
      totalBytes: 0,
      loadedBytes: 0,
      fileCount: 0,
      loadedFiles: 0
    };
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