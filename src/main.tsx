import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign third-party defaultProps warnings from recharts/react 18
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: any[]) => {
  if (args.some(arg => typeof arg === 'string' && arg.includes('defaultProps'))) {
    return;
  }
  originalError(...args);
};

console.warn = (...args: any[]) => {
  if (args.some(arg => typeof arg === 'string' && arg.includes('defaultProps'))) {
    return;
  }
  originalWarn(...args);
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      },
      (err) => {
        console.log('ServiceWorker registration failed: ', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
