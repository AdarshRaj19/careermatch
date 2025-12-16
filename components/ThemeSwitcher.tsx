import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from './icons/Icon';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { name: 'light', label: 'Light', icon: SunIcon },
    { name: 'dark', label: 'Dark', icon: MoonIcon },
    { name: 'system', label: 'System', icon: MonitorIcon },
  ];

  const CurrentIcon = themes.find(t => t.name === theme)?.icon || MonitorIcon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Toggle theme on button click (cycles through light -> dark -> system)
  const handleToggle = () => {
    const currentIndex = themes.findIndex(t => t.name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].name as 'light' | 'dark' | 'system');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 focus:outline-none transition-colors"
        aria-label="Toggle theme"
        title="Click to toggle theme, right-click for menu"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
        >
          {themes.map(t => (
            <button
              key={t.name}
              onClick={(e) => {
                e.stopPropagation();
                setTheme(t.name as 'light' | 'dark' | 'system');
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <t.icon className="w-4 h-4 mr-3" />
              <span className="flex-grow">{t.label}</span>
              {theme === t.name && <CheckIcon className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
