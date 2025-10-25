import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from './icons';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-light-muted dark:text-dark-muted hover:bg-light-panel-muted dark:hover:bg-dark-panel-muted hover:text-light-text dark:hover:text-dark-text transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-surface dark:focus:ring-offset-dark-surface focus:ring-accent"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5" />
      ) : (
        <SunIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default ThemeToggle;