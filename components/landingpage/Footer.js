import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

function Footer() {
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>&copy; 2025 BrainStorm.</Text>
          <Text style={[styles.text, styles.greenText]}>
            Powered by MikeBytes Technologies
          </Text>
          <Text style={styles.text}>All rights reserved.</Text>
        </View>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={() => openLink('https://x.com/IFearAids')}
            style={styles.icon}
          >
            <FontAwesome5 name="twitter" size={24} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <FontAwesome5 name="instagram" size={24} color="#10B981" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openLink('https://github.com/ChidiebereMichael18')}
            style={styles.icon}
          >
            <FontAwesome5 name="github" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 16,
  },
  content: {
    flexDirection: 'column',
  },
  textContainer: {
    marginBottom: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  greenText: {
    color: '#10B981',
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  icon: {
    padding: 4,
  },
});

export default Footer;