// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the context
const ThemeContext = createContext();

// 2. Create the provider component
export const ThemeProvider = ({ children }) => {
    // State to hold the current theme. Initialize from localStorage or default to 'light'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // Effect to apply the theme class to the <html> element
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        // Save the theme to localStorage
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Function to toggle the theme
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 3. Create a custom hook for easy access to the context
export const useTheme = () => {
    return useContext(ThemeContext);
};