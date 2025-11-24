import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import Welcome from "../components/dashboard/Welcome";
import { postsAPI } from '../services/api';

function Dashboard() {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Get theme colors
  const [featuredProjects, setFeaturedProjects] = useState({
    gaming: [],
    research: [],
    development: [],
  });
  const [stats, setStats] = useState({
    activeProjects: 0,
    collaborators: 0,
    completedProjects: 0,
    newToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from all categories concurrently
      const [gamingResponse, researchResponse, developmentResponse, statsResponse] = await Promise.all([
        postsAPI.getGamingPosts(),
        postsAPI.getResearchPosts(),
        postsAPI.getDevelopmentPosts(),
        postsAPI.getStats()
      ]);

      // Process featured projects (show first 2-3 from each category)
      setFeaturedProjects({
        gaming: gamingResponse.data?.slice(0, 2) || [],
        research: researchResponse.data?.slice(0, 2) || [],
        development: developmentResponse.data?.slice(0, 2) || [],
      });

      // Set stats from API response
      if (statsResponse.data) {
        setStats({
          activeProjects: statsResponse.data.activeProjects || 0,
          collaborators: statsResponse.data.collaborators || 0,
          completedProjects: statsResponse.data.completedProjects || 0,
          newToday: statsResponse.data.newToday || 0,
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getContactLink = (method, info) => {
    switch (method?.toLowerCase()) {
      case 'phone':
        return `tel:${info}`;
      case 'email':
        return `mailto:${info}`;
      case 'whatsapp':
        // Remove any non-digit characters for WhatsApp
        const phone = info.replace(/\D/g, '');
        return `https://wa.me/${phone}`;
      case 'discord':
        return info.startsWith('https://') ? info : `https://discord.gg/${info}`;
      case 'telegram':
        return info.startsWith('https://') ? info : `https://t.me/${info}`;
      case 'slack':
        return info.startsWith('https://') ? info : '#';
      default:
        return '#';
    }
  };

  const handleJoinProject = async (project) => {
    try {
      const link = getContactLink(project.contactMethod, project.contactInfo);
      
      if (link === '#') {
        Alert.alert('Contact Info', `Contact via ${project.contactMethod}: ${project.contactInfo}`);
        return;
      }

      const supported = await Linking.canOpenURL(link);
      if (supported) {
        await Linking.openURL(link);
      } else {
        Alert.alert('Error', `Unable to open ${project.contactMethod} link`);
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open contact link');
    }
  };

  const handleViewAll = (category) => {
    navigation.navigate(category.charAt(0).toUpperCase() + category.slice(1), {
      category: category.toLowerCase()
    });
  };

  const formatProjectData = (project) => {
    return {
      _id: project._id,
      title: project.title || 'Untitled Project',
      tags: project.tags || [],
      contactMethod: project.contactMethod || 'email',
      contactInfo: project.contactInfo || 'No contact info',
      description: project.description,
      createdAt: project.createdAt,
    };
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={fetchDashboardData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <Welcome />
        
        {/* Featured Projects Grid */}
        <View style={styles.projectsGrid}>
          {Object.entries(featuredProjects).map(([category, projects]) => (
            <View 
              key={category} 
              style={[
                styles.categoryCard, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border 
                }
              ]}
            >
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: colors.primary }]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)} Projects
                </Text>
                <TouchableOpacity onPress={() => handleViewAll(category)}>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All →</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.projectsList}>
                {projects.length > 0 ? (
                  projects.map((project, index) => {
                    const formattedProject = formatProjectData(project);
                    return (
                      <TouchableOpacity
                        key={formattedProject._id || index}
                        style={[
                          styles.projectCard, 
                          { 
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.border
                          }
                        ]}
                        onPress={() => handleJoinProject(formattedProject)}
                      >
                        <Text style={[styles.projectTitle, { color: colors.text }]}>
                          {formattedProject.title}
                        </Text>
                        <View style={styles.tagsContainer}>
                          {formattedProject.tags.map((tag, i) => (
                            <View 
                              key={i} 
                              style={[
                                styles.tag, 
                                { 
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                  borderColor: 'rgba(16, 185, 129, 0.2)'
                                }
                              ]}
                            >
                              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={[styles.projectFooter, { borderTopColor: colors.border }]}>
                          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                            Via: <Text style={[styles.contactMethod, { color: colors.primary }]}>
                              {formattedProject.contactMethod}
                            </Text>
                          </Text>
                          <Text style={[styles.joinText, { color: colors.primary }]}>Join →</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.noProjectsContainer}>
                    <Text style={[styles.noProjectsText, { color: colors.textSecondary }]}>
                      No projects available
                    </Text>
                    <Text style={[styles.noProjectsSubtext, { color: colors.textSecondary }]}>
                      Check back later for new {category} projects
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View 
            style={[
              styles.statCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.activeProjects}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Projects</Text>
          </View>
          <View 
            style={[
              styles.statCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.collaborators}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collaborators</Text>
          </View>
          <View 
            style={[
              styles.statCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.completedProjects}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed Projects</Text>
          </View>
          <View 
            style={[
              styles.statCard, 
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border 
              }
            ]}
          >
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.newToday}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>New Today</Text>
          </View>
        </View>

        {/* Pull to refresh indicator */}
        <TouchableOpacity style={styles.refreshButton} onPress={fetchDashboardData}>
          <Text style={[styles.refreshText, { color: colors.primary }]}>↻ Refresh Dashboard</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  projectsGrid: {
    gap: 16,
    marginTop: 24,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  projectsList: {
    gap: 12,
  },
  projectCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  contactText: {
    fontSize: 12,
  },
  contactMethod: {
    textTransform: 'capitalize',
  },
  joinText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noProjectsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noProjectsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  noProjectsSubtext: {
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
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
    textAlign: 'center',
  },
  refreshButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  refreshText: {
    fontSize: 14,
  },
});

export default Dashboard;