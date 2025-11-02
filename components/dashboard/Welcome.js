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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

function Welcome() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

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
        // Store user ID for future use
        if (response.data._id) {
          await AsyncStorage.setItem('userId', response.data._id);
        }
      } else {
        throw new Error('No user data received');
      }
      
    } catch (error) {
      console.error('Error fetching user:', error);
      
      // Handle specific error cases
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
      // Clear all stored data
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

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Refresh when screen comes into focus
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
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContent}>
          <Text style={styles.title}>Welcome to Brainstorm! 🚀</Text>
          <Text style={styles.subtitle}>
            Join our community of creators and collaborators
          </Text>
          <View style={styles.authButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleProfilePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.title}>
            Welcome back, {user.username || user.name || 'Collaborator'}! 👋
          </Text>
          <Text style={styles.subtitle}>
            {getWelcomeMessage()}
          </Text>
          {user.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Text style={styles.refreshText}>↻</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Collaborating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Text style={styles.actionButtonText}>+ New Project</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButtonOutline}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionButtonOutlineText}>View Profile</Text>
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
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
    margin: 16,
    marginBottom: 8,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#10B981',
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
    color: '#10B981',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    lineHeight: 22,
  },
  userEmail: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  refreshText: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#374151',
    marginHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    flex: 1,
  },
  actionButtonOutlineText: {
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Welcome;