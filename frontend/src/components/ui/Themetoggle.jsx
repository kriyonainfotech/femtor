// src/components/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../Context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};

export default ThemeToggle;