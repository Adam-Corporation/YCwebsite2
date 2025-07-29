import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home"; // Fix casing of Home component import
import EntryScreen from "./components/entry-screen";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Use local state instead of context
  const [entryMode, setEntryMode] = useState(true);
  
  // Always start with entry mode true and clear any stored value
  useEffect(() => {
    // Clear any previously stored value
    localStorage.removeItem("hasVisitedBefore");
    
    // Reset entry mode to true when page loads
    setEntryMode(true);
  }, []);

  // Function to toggle entry mode - pass this to EntryScreen
  const toggleEntryMode = () => {
    setEntryMode(prev => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {entryMode ? (
          <EntryScreen toggleEntryMode={toggleEntryMode} />
        ) : (
          <AppRouter />
        )}
      </AnimatePresence>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
