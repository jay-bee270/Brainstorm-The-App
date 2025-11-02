import React from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from './Navbar';
import BottomBar from "./Bottombar";

const Layout = ({ children }) => {
  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <Navbar />
      
      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Bottom Navigation Bar */}
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default Layout;