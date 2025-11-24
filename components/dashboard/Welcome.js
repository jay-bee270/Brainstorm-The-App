import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

function Welcome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { colors } = useTheme();

  const fetchUserData = async (showLoader = false) => {
    try {
      if (showLoader) setRefreshing(true);
      
      const token = await AsyncStorage.getItem('token');
      console.log('Token found:', !!token);
      
      if (!token) {
        console.log('No token found, redirecting to login');
        navigation.navigate('Login');
        return;
      }

      console.log('Fetching user data...');
      const response = await authAPI.getUser();
      console.log('User data response:', response);
      
      if (response.data) {
        setUser(response.data);
        if (response.data._id) {
          await AsyncStorage.setItem('userId', response.data._id);
        }
      } else {
        throw new Error('No user data received');
      }
      
    } catch (error) {
      console.error('Error fetching user:', error);
      
      if (error.message.includes('401') || error.message.includes('token')) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                handleLogout();
                navigation.navigate('Login');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Connection Issue',
          'Unable to load user data. Please check your connection.',
          [
            { text: 'Try Again', onPress: () => fetchUserData(true) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      await AsyncStorage.multiRemove(['token', 'userId', 'userData']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfilePress = () => {
    if (user) {
      navigation.navigate('Profile', { user });
    }
  };

  const handleRefresh = () => {
    fetchUserData(true);
  };

  // NEW: Handle new project creation
  const handleNewProject = () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to create a new project.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    // Navigate to MyPosts with form opened
    navigation.navigate('MyPosts', { 
      showForm: true,
      category: 'development' // Default category
    });
  };

  // NEW: Navigate to view existing posts
  const handleViewMyPosts = () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please sign in to view your projects.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    navigation.navigate('MyPosts');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token && user) {
          setUser(null);
          navigation.navigate('Login');
        }
      };
      checkAuth();
    }, [user, navigation])
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.welcomeContent}>
          <Text style={[styles.title, { color: colors.primary }]}>Welcome to Brainstorm! 🚀</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join our community of creators and collaborators
          </Text>
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handleProfilePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Welcome back, {user.username || user.name || 'Collaborator'}! 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {getWelcomeMessage()}
          </Text>
          {user.email && (
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: `${colors.primary}20` }]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.refreshText, { color: colors.primary }]}>↻</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.inputBackground }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Projects</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collaboration</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>0</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </View>
      </View>

      {/* Updated Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleNewProject}
        >
          <Text style={styles.actionButtonText}>+ New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButtonOutline, { borderColor: colors.primary }]}
          onPress={handleViewMyPosts}
        >
          <Text style={[styles.actionButtonOutlineText, { color: colors.primary }]}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Helper function to generate dynamic welcome messages
const getWelcomeMessage = () => {
  const messages = [
    "Ready to collaborate on some amazing projects?",
    "Great things happen when minds come together!",
    "Your next collaboration is waiting for you!",
    "What will you create today?",
    "The community is buzzing with new ideas!",
    "Ready to bring your ideas to life?",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    margin: 16,
    marginBottom: 8,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  welcomeContent: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  userInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  secondaryButtonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
  },
  actionButtonOutlineText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Welcome;