import React from 'react';
import { View, Image, StyleSheet } from 'react-native';


// Using placeholder images - you'll need to replace these with actual image sources
const avatars = [
  { img: require('../../assets/avatar.png') }, // Replace with actual image paths
  { img: require('../../assets/avatar2.png') },
  { img: require('../../assets/avatar3.png') },
  { img: require('../../assets/avatar4.png') },
];

const Avatar = () => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatarWrapper, styles.topCenter]}>
          <Image source={avatars[0].img} style={styles.avatar} />
        </View>
        <View style={[styles.avatarWrapper, styles.bottomCenter]}>
          <Image source={avatars[1].img} style={styles.avatar} />
        </View>
        <View style={[styles.avatarWrapper, styles.leftCenter]}>
          <Image source={avatars[2].img} style={styles.avatar} />
        </View>
        <View style={[styles.avatarWrapper, styles.rightCenter]}>
          <Image source={avatars[3].img} style={styles.avatar} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginBottom: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  avatarContainer: {
    width: 300,
    height: 240,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    backgroundColor: '#10B981', // Fallback background color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  topCenter: {
    top: 0,
    left: '50%',
    transform: [{ translateX: -45 }],
  },
  bottomCenter: {
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -45 }],
  },
  leftCenter: {
    top: '50%',
    left: 0,
    transform: [{ translateY: -45 }],
  },
  rightCenter: {
    top: '50%',
    right: 0,
    transform: [{ translateY: -45 }],
  },
});

export default Avatar;