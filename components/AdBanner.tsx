import React, { useState, useEffect } from 'react';

const AdBanner: React.FC = () => {
  const [showAd, setShowAd] = useState(true);

  // Simulate an ad network call
  useEffect(() => {
    const adTimer = setTimeout(() => {
      // Simulate ad failing to load ~20% of the time
      if (Math.random() < 0.2) {
        setShowAd(false);
      }
    }, 1500);

    return () => clearTimeout(adTimer);
  }, []);

  if (!showAd) {
    return null; // Fallback behavior: render nothing if ad fails
  }

  return (
    <footer 
      className="flex-shrink-0 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border flex items-center justify-center"
      style={{ height: '50px' }} // Standard banner ad height
      role="contentinfo"
      aria-label="Advertisement"
    >
      <div className="text-sm text-light-muted dark:text-dark-muted">
        Advertisement
      </div>
    </footer>
  );
};

export default AdBanner;