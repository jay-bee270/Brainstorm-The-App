import React, { useState, useEffect } from "react";
import { StatusBar } from "react-native";
import { ThemeProvider } from './context/ThemeContext';
// import { ToastProvider } from './utils/ToastProvider';
import RouterPath from "./routing/RouterPath";
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const [isLoading, setIsLoading] = useState(true);

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
    <ThemeProvider>
      {/* <ToastProvider> */}
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#000000" 
          translucent={true}
        />
        <RouterPath />
      {/* </ToastProvider> */}
    </ThemeProvider>
  );
}

export default App;