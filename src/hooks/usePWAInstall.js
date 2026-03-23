// src/hooks/usePWAInstall.js
// Tracks the beforeinstallprompt event (Android/Desktop Chrome)
// and whether the app is already running in standalone mode.

import { useState, useEffect } from 'react';

export function usePWAInstall() {
  const [prompt, setPrompt]       = useState(null);   // deferred install event
  const [installed, setInstalled] = useState(false);  // already installed / standalone

  useEffect(() => {
    // Already running as installed PWA?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;            // iOS Safari
    setInstalled(isStandalone);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }

    // Capture install prompt (Chrome Android / Desktop)
    const handler = e => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detect when user installs from browser menu
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setPrompt(null);
    }
    return outcome === 'accepted';
  };

  return { prompt, installed, triggerInstall };
}
