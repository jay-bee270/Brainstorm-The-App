import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity } from "react-icons/fa6";
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
          <Text style={[styles.text, styles.greenText]}>Powered by MikeBytes Technologies</Text>
          <Text style={styles.text}>All rights reserved.</Text>
        </View>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            onPress={() => openLink("https://x.com/ClassicMike17")}
            style={styles.icon}
          >
            <FontAwesome5
              name="twitter"
              size={24}
              color="#10B981"
              style={styles.twitterIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon}>
            <FontAwesome5
              name="instagram"
              size={24}
              color="#10B981"
              style={styles.instagramIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => openLink("https://github.com/ChiebereMichael")}
            style={styles.icon}
          >
            <FontAwesome5
              name="github"
              size={24}
              color="#10B981"
              style={styles.githubIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    marginTop: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginBottom: 40,
  },
  content: {
    flexDirection: 'column',
  },
  textContainer: {
    marginBottom: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
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
  twitterIcon: {
    transform: [{ scale: 1.3 }],
  },
  instagramIcon: {
    transform: [{ scale: 1.3 }],
  },
  githubIcon: {
    transform: [{ scale: 1.3 }],
  },
});

export default Footer;