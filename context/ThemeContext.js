import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('darkMode');
      if (saved !== null) {
        setDarkMode(JSON.parse(saved));
      } else {
        setDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setDarkMode(systemColorScheme === 'dark');
    }
  };

  useEffect(() => {
    if (darkMode !== null) {
      saveThemePreference();
    }
  }, [darkMode]);

  const saveThemePreference = async () => {
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = {
    darkMode,
    toggleTheme,
    colors: darkMode 
      ? {
          background: '#111827',
          surface: '#1F2937',
          text: '#FFFFFF',
          textSecondary: '#9CA3AF',
          primary: '#10B981',
          border: '#374151',
          error: '#EF4444',
        }
      : {
          background: '#FFFFFF',
          surface: '#F3F4F6',
          text: '#111827',
          textSecondary: '#6B7280',
          primary: '#10B981',
          border: '#D1D5DB',
          error: '#DC2626',
        }
  };

  if (darkMode === null) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};