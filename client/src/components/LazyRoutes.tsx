import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/not-found'));

const LazyRoutes = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
};

export default LazyRoutes;