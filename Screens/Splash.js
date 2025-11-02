import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Simple fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Check where to navigate
    const checkNavigation = async () => {
      try {
        const [token, hasSeenOnboarding] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasSeenOnboarding')
        ]);

        setTimeout(() => {
          if (token) {
            // User is logged in, go to Dashboard
            navigation.replace('Dashboard');
          } else if (hasSeenOnboarding) {
            // User has seen onboarding but not logged in, go to Login
            navigation.replace('Login');
          } else {
            // New user, show onboarding
            navigation.replace('Onboarding');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error checking navigation:', error);
        // Default to onboarding on error
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2000);
      }
    };

    checkNavigation();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🧠</Text>
        </View>
        <Text style={styles.appName}>BrainStorm</Text>
        <Text style={styles.tagline}>Where Innovation Meets Collaboration</Text>
      </Animated.View>
      
      <Text style={styles.poweredBy}>Powered by MikeBytes Technologies</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  poweredBy: {
    position: 'absolute',
    bottom: 40,
    color: '#6B7280',
    fontSize: 12,
  },
});

export default SplashScreen;