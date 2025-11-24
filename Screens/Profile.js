import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { authAPI, postsAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Profile() {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Get theme colors
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      console.log('Fetching user profile...');
      
      // REAL API CALL - Get user data
      const userResponse = await authAPI.getUser();
      console.log('User profile response:', userResponse);
      
      if (userResponse.data) {
        const userData = userResponse.data;
        
        // Get user ID for fetching user-specific posts
        const userId = userData._id;
        
        // Fetch user's posts to calculate stats
        let userPosts = [];
        try {
          const postsResponse = await postsAPI.getPostsByUser(userId);
          if (postsResponse.data && Array.isArray(postsResponse.data)) {
            userPosts = postsResponse.data;
          }
        } catch (postsError) {
          console.log('Could not fetch user posts:', postsError);
        }
        
        // Calculate stats from user's posts
        const stats = {
          projects: userPosts.length,
          collaborations: userPosts.reduce((acc, post) => acc + (post.applicants || 0), 0),
          completed: userPosts.filter(post => post.status === 'completed').length,
          active: userPosts.filter(post => post.status === 'active').length,
        };
        
        const profile = {
          _id: userData._id,
          username: userData.username || 'user',
          name: userData.name || userData.username || 'User',
          email: userData.email,
          bio: userData.bio || 'No bio provided',
          skills: Array.isArray(userData.skills) ? userData.skills : (userData.skills ? [userData.skills] : []),
          interests: Array.isArray(userData.interests) ? userData.interests : (userData.interests ? [userData.interests] : []),
          joinedDate: userData.createdAt || userData.joinedDate,
          website: userData.website,
          github: userData.github,
          linkedin: userData.linkedin,
          twitter: userData.twitter,
        };
        
        console.log('Processed profile:', profile);
        console.log('User stats:', stats);
        
        setUserProfile(profile);
        setUserStats(stats);
      } else {
        throw new Error('No user data received');
      }
      
    } catch (err) {
      console.error('Error fetching user profile:', err);
      
      let errorMessage = 'Failed to load profile';
      
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message.includes('401') || err.message.includes('token')) {
        errorMessage = 'Session expired. Please log in again.';
        // Redirect to login
        setTimeout(() => navigation.navigate('Login'), 2000);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      
      // Fallback to mock data for demonstration
      const mockProfile = {
        username: 'johndoe',
        name: 'John Doe',
        email: 'john@example.com',
        bio: 'Full-stack developer and gaming enthusiast passionate about building amazing applications.',
        skills: ['React', 'Node.js', 'JavaScript', 'Python', 'MongoDB'],
        interests: ['Web Development', 'Mobile Apps', 'AI Research', 'Open Source'],
        joinedDate: '2024-01-15',
        github: 'johndoe',
        linkedin: 'johndoe',
      };
      
      const mockStats = {
        projects: 8,
        collaborations: 15,
        completed: 5,
        active: 3,
      };
      
      setUserProfile(mockProfile);
      setUserStats(mockStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSocialPress = (platform, username) => {
    if (!username) {
      Alert.alert('No Profile', `No ${platform} username provided`);
      return;
    }
    
    let url = '';
    switch (platform) {
      case 'github':
        url = `https://github.com/${username}`;
        break;
      case 'linkedin':
        url = `https://linkedin.com/in/${username}`;
        break;
      case 'twitter':
        url = `https://twitter.com/${username}`;
        break;
      case 'website':
        url = username.startsWith('http') ? username : `https://${username}`;
        break;
    }
    
    if (url) {
      Alert.alert(
        'Open Link',
        `Open ${platform} profile?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: () => Linking.openURL(url) }
        ]
      );
    }
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      return `Joined ${date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })}`;
    } catch {
      return 'Recently joined';
    }
  };

  const onRefresh = () => {
    fetchUserProfile(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading your profile...</Text>
      </View>
    );
  }

  if (error && !userProfile) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.error }]}
          onPress={() => fetchUserProfile()}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      <View style={styles.content}>
        <View style={styles.profileLayout}>
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {userProfile.name?.charAt(0)?.toUpperCase() || userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={[styles.userName, { color: colors.text }]}>{userProfile.name}</Text>
              <Text style={[styles.userHandle, { color: colors.primary }]}>@{userProfile.username}</Text>
              {userProfile.email && (
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userProfile.email}</Text>
              )}
              <Text style={[styles.userBio, { color: colors.textSecondary }]}>{userProfile.bio}</Text>
              {userProfile.joinedDate && (
                <Text style={[styles.joinDate, { color: colors.textSecondary }]}>
                  {formatJoinDate(userProfile.joinedDate)}
                </Text>
              )}
            </View>

            {/* Social Links */}
            <View style={styles.socialLinks}>
              {userProfile.github && (
                <TouchableOpacity 
                  style={[styles.socialIcon, { backgroundColor: colors.inputBackground }]}
                  onPress={() => handleSocialPress('github', userProfile.github)}
                >
                  <FontAwesome5 name="github" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              {userProfile.linkedin && (
                <TouchableOpacity 
                  style={[styles.socialIcon, { backgroundColor: colors.inputBackground }]}
                  onPress={() => handleSocialPress('linkedin', userProfile.linkedin)}
                >
                  <FontAwesome5 name="linkedin" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              {userProfile.twitter && (
                <TouchableOpacity 
                  style={[styles.socialIcon, { backgroundColor: colors.inputBackground }]}
                  onPress={() => handleSocialPress('twitter', userProfile.twitter)}
                >
                  <FontAwesome5 name="twitter" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              {userProfile.website && (
                <TouchableOpacity 
                  style={[styles.socialIcon, { backgroundColor: colors.inputBackground }]}
                  onPress={() => handleSocialPress('website', userProfile.website)}
                >
                  <FontAwesome5 name="globe" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.editButton,
                { 
                  backgroundColor: `${colors.primary}10`,
                  borderColor: `${colors.primary}20`
                }
              ]}
              onPress={() => navigation.navigate('Settings')}
            >
              <FontAwesome5 name="edit" size={16} color={colors.primary} />
              <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Stats */}
            <View style={styles.statsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Activity</Text>
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{userStats?.projects || 0}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Projects</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{userStats?.collaborations || 0}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collaborations</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{userStats?.completed || 0}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.statNumber, { color: colors.primary }]}>{userStats?.active || 0}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
                </View>
              </View>
            </View>

            {/* Skills & Interests */}
            <View style={[styles.skillsInterestsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Skills & Expertise</Text>
              <View style={styles.skillsContainer}>
                {userProfile.skills?.length > 0 ? (
                  userProfile.skills.map((skill, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.skillTag,
                        { 
                          backgroundColor: `${colors.primary}10`,
                          borderColor: `${colors.primary}30`
                        }
                      ]}
                    >
                      <Text style={[styles.skillText, { color: colors.primary }]}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No skills listed yet</Text>
                    <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                      Add your skills in settings to help others find you
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.sectionTitle, styles.interestsTitle, { color: colors.text }]}>Interests</Text>
              <View style={styles.interestsContainer}>
                {userProfile.interests?.length > 0 ? (
                  userProfile.interests.map((interest, index) => (
                    <View 
                      key={index} 
                      style={[
                        styles.interestTag,
                        { 
                          backgroundColor: `${colors.primary}10`,
                          borderColor: `${colors.primary}30`
                        }
                      ]}
                    >
                      <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No interests listed yet</Text>
                    <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                      Add your interests to discover relevant projects
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={[styles.actionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    { 
                      backgroundColor: `${colors.primary}05`,
                      borderColor: `${colors.primary}10`
                    }
                  ]}
                  onPress={() => navigation.navigate('MyPosts')}
                >
                  <FontAwesome5 name="file-alt" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>My Posts</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    { 
                      backgroundColor: `${colors.primary}05`,
                      borderColor: `${colors.primary}10`
                    }
                  ]}
                  onPress={() => navigation.navigate('MyPosts', { 
                    showForm: true,
                    category: 'development'
                  })}
                >
                  <FontAwesome5 name="plus" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>New Project</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    { 
                      backgroundColor: `${colors.primary}05`,
                      borderColor: `${colors.primary}10`
                    }
                  ]}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <FontAwesome5 name="cog" size={20} color={colors.primary} />
                  <Text style={[styles.actionButtonText, { color: colors.primary }]}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileLayout: {
    gap: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userBio: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  joinDate: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialIcon: {
    padding: 12,
    borderRadius: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontWeight: '500',
  },
  mainContent: {
    gap: 16,
  },
  statsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  skillsInterestsCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  interestsTitle: {
    marginTop: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Profile;