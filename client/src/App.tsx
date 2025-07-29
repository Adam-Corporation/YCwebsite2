import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EntryScreen from "./components/entry-screen";
import { useState, useEffect, useRef } from "react";
import "./styles/LoadingScreen.css";

// Loading screen UI
const LoadingScreen = ({ progress = 0 }) => (
  <div className="loading-screen">
    <div className="loading-container">
      <div className="loading-strip">
        <div className="loading-progress" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-info">
        <span className="loading-text">Loading</span>
        <span className="loading-percentage">{Math.round(progress)}%</span>
      </div>
    </div>
  </div>
);

// Routing
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
  const [homeReady, setHomeReady] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout>();

  // Check if all assets are fully loaded
  const checkAssetsLoaded = () => {
    const images = document.images;
    const allImagesLoaded = Array.from(images).every(img => img.complete);
    const videos = Array.from(document.querySelectorAll("video"));
    const allVideosLoaded = videos.every(v => v.readyState >= 3); // 3 = HAVE_FUTURE_DATA
    const fontsLoaded = document.fonts?.status === "loaded";

    return allImagesLoaded && allVideosLoaded && fontsLoaded;
  };

  // Entry exit → load screen
  useEffect(() => {
    if (!entryMode && !homeReady) {
      setShowLoading(true);
      setProgress(0);

      const checkAndFinish = () => {
        if (checkAssetsLoaded()) {
          clearInterval(progressInterval.current!);
          setProgress(100);
          setTimeout(() => {
            setShowLoading(false);
            setHomeReady(true);
          }, 400);
          return true;
        }
        return false;
      };

      // Instant check
      if (checkAndFinish()) return;

      // Simulate loading progress
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          const step = prev < 60 ? 5 : prev < 90 ? 2 : 1;
          const next = Math.min(prev + step, 99);
          checkAndFinish();
          return next;
        });
      }, 100);

      // Fallback timeout
      const timeout = setTimeout(() => {
        clearInterval(progressInterval.current!);
        setProgress(100);
        setTimeout(() => {
          setShowLoading(false);
          setHomeReady(true);
        }, 400);
      }, 12000);

      // Cleanup
      return () => {
        clearInterval(progressInterval.current!);
        clearTimeout(timeout);
      };
    }
  }, [entryMode, homeReady]);

  // Entry screen toggle
  const toggleEntryMode = () => {
    setEntryMode(false);
    setShowLoading(true);
    setProgress(0);
  };

  return (
    <QueryClientProvider client={queryClient}>
      {entryMode ? (
        <EntryScreen toggleEntryMode={toggleEntryMode} />
      ) : (
        <div style={{ position: "relative", minHeight: "100vh" }}>
          {showLoading && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "#000",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
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
