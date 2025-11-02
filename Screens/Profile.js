import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

function Profile() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setUserProfile({
            username: 'johndoe',
            name: 'John Doe',
            bio: 'Full-stack developer and gaming enthusiast',
            skills: ['React', 'Node.js', 'Unity'],
            interests: ['Gaming', 'AI Research', 'Open Source'],
            stats: {
              projects: 12,
              collaborations: 24,
              completed: 8
            }
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileLayout}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userProfile.name?.charAt(0) || userProfile.username.charAt(0)}
                </Text>
              </View>
              <Text style={styles.userName}>{userProfile.name || userProfile.username}</Text>
              <Text style={styles.userHandle}>@{userProfile.username}</Text>
              <Text style={styles.userBio}>{userProfile.bio || 'No bio provided'}</Text>
            </View>

            <View style={styles.socialLinks}>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome5 name="github" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome5 name="linkedin" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <FontAwesome5 name="twitter" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <FontAwesome5 name="edit" size={16} color="#10B981" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Stats */}
            <View style={styles.statsGrid}>
              {userProfile.stats ? (
                Object.entries(userProfile.stats).map(([key, value]) => (
                  <View key={key} style={styles.statCard}>
                    <Text style={styles.statNumber}>{value}</Text>
                    <Text style={styles.statLabel}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noStatsText}>No stats available</Text>
              )}
            </View>

            {/* Skills & Interests */}
            <View style={styles.skillsInterestsCard}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {userProfile.skills?.length ? (
                  userProfile.skills.map((skill) => (
                    <View key={skill} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>No skills listed</Text>
                )}
              </View>

              <Text style={[styles.sectionTitle, styles.interestsTitle]}>Interests</Text>
              <View style={styles.interestsContainer}>
                {userProfile.interests?.length ? (
                  userProfile.interests.map((interest) => (
                    <View key={interest} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noItemsText}>No interests listed</Text>
                )}
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
    backgroundColor: '#000000',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#10B981',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  profileLayout: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userHandle: {
    color: '#10B981',
    fontSize: 16,
    marginBottom: 8,
  },
  userBio: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialIcon: {
    padding: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  editButtonText: {
    color: '#10B981',
    fontWeight: '500',
  },
  mainContent: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  noStatsText: {
    color: '#9CA3AF',
    textAlign: 'center',
    width: '100%',
  },
  skillsInterestsCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#10B981',
    fontSize: 14,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#10B981',
    fontSize: 14,
  },
  noItemsText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default Profile;