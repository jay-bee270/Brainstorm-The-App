import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('themeMode');
      if (saved !== null) {
        setThemeMode(saved);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  useEffect(() => {
    if (themeMode !== null) {
      saveThemePreference();
    }
  }, [themeMode]);

  const saveThemePreference = async () => {
    try {
      await AsyncStorage.setItem('themeMode', themeMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine the actual theme to use based on mode and system preference
  const getActualTheme = () => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  };

  const isDarkMode = getActualTheme() === 'dark';

  const toggleTheme = (mode) => {
    setThemeMode(mode);
  };

  const theme = {
  themeMode,
  isDarkMode,
  toggleTheme,
  colors: isDarkMode 
    ? {
        background: '#000',
        surface: '#1F2937',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        primary: '#10B981',
        border: '#374151',
        error: '#EF4444',
        card: 'rgba(31, 41, 55, 0.8)',
        buttonText: '#FFFFFF',   // ✅ Added
      }
    : {
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: '#111827',
        textSecondary: '#6B7280',
        primary: '#10B981',
        border: '#D1D5DB',
        error: '#DC2626',
        card: 'rgba(243, 244, 246, 0.8)',
        buttonText: '#FFFFFF',   // ✅ Added 
      }
};

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

