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
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Gradient colors that work in both light and dark mode
const GRADIENT_COLORS = {
  start: '#10B981',    // Emerald
  end: '#059669',      // Darker emerald
};

const SPLASH_COLORS = {
  textPrimary: '#FFFFFF',
  textSecondary: '#F0FDF4',
};

const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
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

    const checkNavigation = async () => {
      try {
        const [token, hasSeenOnboarding] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('hasSeenOnboarding')
        ]);

        setTimeout(() => {
          if (token) {
            navigation.replace('Dashboard');
          } else if (hasSeenOnboarding) {
            navigation.replace('Login');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Error checking navigation:', error);
        setTimeout(() => {
          navigation.replace('Onboarding');
        }, 2000);
      }
    };

    checkNavigation();
  }, [navigation]);

  return (
    <LinearGradient
      colors={[GRADIENT_COLORS.start, GRADIENT_COLORS.end]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={[styles.logo, { 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          borderColor: 'rgba(255, 255, 255, 0.3)',
        }]}>
          <Text style={styles.logoIcon}>🧠</Text>
        </View>
        <Text style={[styles.appName, { color: SPLASH_COLORS.textPrimary }]}>BrainStorm</Text>
        <Text style={[styles.tagline, { color: SPLASH_COLORS.textSecondary }]}>
          Where Innovation Meets Collaboration
        </Text>
      </Animated.View>
      
      <Text style={[styles.poweredBy, { color: SPLASH_COLORS.textSecondary }]}>
        Powered by BRAINS Technologies
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    backdropFilter: 'blur(10px)', // For web if needed
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  poweredBy: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SplashScreen;