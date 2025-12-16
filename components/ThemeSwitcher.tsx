import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, MonitorIcon, CheckIcon } from './icons/Icon';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { name: 'light', label: 'Light', icon: SunIcon },
    { name: 'dark', label: 'Dark', icon: MoonIcon },
    { name: 'system', label: 'System', icon: MonitorIcon },
  ];

  const CurrentIcon = themes.find(t => t.name === theme)?.icon || MonitorIcon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 focus:outline-none"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div 
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border dark:border-gray-700"
            onMouseLeave={() => setIsOpen(false)}
        >
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => {
                setTheme(t.name as 'light' | 'dark' | 'system');
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
