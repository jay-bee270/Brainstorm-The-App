import React from "react";
import { StatusBar } from "react-native";
import { ThemeProvider, useTheme } from './context/ThemeContext';
import RouterPath from "./routing/RouterPath";

// Separate component for themed StatusBar
const ThemedStatusBar = () => {
  const { colors, isDarkMode } = useTheme();

  // useEffect(() => {
  //   const initializeApp = async () => {
  //     // TEMPORARY: Clear storage for testing (remove this in production)
  //     await AsyncStorage.clear();
  //     console.log('🔄 Storage cleared for testing');
      
  //     setIsLoading(false);
  //   };

  //   initializeApp();
  // }, []);

  // if (isLoading) {
  //   return null; // Or a minimal loading indicator
  // }

  
  return (
    <StatusBar 
      barStyle={isDarkMode ? "light-content" : "dark-content"}
      backgroundColor={colors.background}
      translucent={false}
    />
  );
};

// Main App component
function AppContent() {
  return (
    <>
      <ThemedStatusBar />
      <RouterPath />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;