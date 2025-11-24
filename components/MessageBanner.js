import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const MessageBanner = ({ type, title, message, visible, style }) => {
  const { colors } = useTheme();

  if (!visible) return null;

  const getBannerStyle = () => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: `${colors.error}20`,
          borderLeftColor: colors.error,
        };
      case 'success':
        return {
          backgroundColor: `${colors.primary}20`,
          borderLeftColor: colors.primary,
        };
      case 'warning':
        return {
          backgroundColor: `${colors.warning || '#F59E0B'}20`,
          borderLeftColor: colors.warning || '#F59E0B',
        };
      default:
        return {
          backgroundColor: `${colors.textSecondary}20`,
          borderLeftColor: colors.textSecondary,
        };
    }
  };

  const bannerStyle = getBannerStyle();

  return (
    <View style={[styles.container, bannerStyle, style]}>
      <Text style={[styles.title, { color: bannerStyle.borderLeftColor }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MessageBanner;