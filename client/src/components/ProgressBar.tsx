import { useEffect } from 'react';
import nprogress from 'nprogress';
import '../styles/nprogress.css';

interface ProgressBarProps {
  isLoading: boolean;
  progress?: number;
}

// Configure nprogress
nprogress.configure({
  showSpinner: false,
  speed: 200,
  minimum: 0.08,
  easing: 'ease',
  positionUsing: '',
  barSelector: '[role="bar"]',
  parent: 'body'
});

const ProgressBar = ({ isLoading, progress }: ProgressBarProps) => {
  useEffect(() => {
    if (isLoading) {
      nprogress.start();
      
      if (progress !== undefined) {
        nprogress.set(progress / 100);
      }
    } else {
      nprogress.done();
    }
    
    return () => {
      nprogress.done();
    };
  }, [isLoading, progress]);

  return null; // nprogress handles the rendering
};

export default ProgressBar;