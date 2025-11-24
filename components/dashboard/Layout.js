import React from 'react';
import { View, StyleSheet } from 'react-native';
import Navbar from './Navbar';
import BottomBar from "./Bottombar";
import { useTheme } from '../../context/ThemeContext';

const Layout = ({ children }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Navbar />

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {children}
      </View>

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Layout;
