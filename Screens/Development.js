import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { postsAPI } from '../services/api';

function Development() {
  const navigation = useNavigation();
  const { colors } = useTheme(); // Get theme colors
  const [devProjects, setDevProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');

  const skills = ['all', 'React', 'JavaScript', 'Python', 'Node.js', 'Mobile', 'Web', 'API', 'Database'];

  useFocusEffect(
    React.useCallback(() => {
      fetchDevelopmentPosts();
    }, [])
  );

  const fetchDevelopmentPosts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      console.log('Fetching development posts...');
      
      // REAL API CALL
      const response = await postsAPI.getDevelopmentPosts();
      console.log('Development posts response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        const projects = response.data.map(project => ({
          _id: project._id,
          title: project.title || 'Untitled Project',
          description: project.description || project.content || 'No description available',
          deadline: project.deadline || project.dueDate || 'Flexible',
          teamSize: project.teamSize || project.collaborators || 'Not specified',
          skillLevel: project.skillLevel || project.difficulty || 'Any',
          tags: project.tags || project.skills || [],
          contactMethod: project.contactMethod || project.contact?.method || 'email',
          contactInfo: project.contactInfo || project.contact?.info || 'No contact info',
          createdAt: project.createdAt,
          createdBy: project.createdBy || project.user,
          status: project.status || 'active',
        }));
        
        setDevProjects(projects);
        setFilteredProjects(projects);
      } else {
        setDevProjects([]);
        setFilteredProjects([]);
      }
      
    } catch (err) {
      console.error('Error fetching development posts:', err);
      setError('Failed to load development projects. Please check your connection.');
      
      // Fallback to empty array
      setDevProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    let filtered = devProjects;
    
    // Filter by search query
    if (query) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Filter by selected skill
    if (selectedSkill !== 'all') {
      filtered = filtered.filter(project =>
        project.tags.some(tag => tag.toLowerCase().includes(selectedSkill.toLowerCase()))
      );
    }
    
    setFilteredProjects(filtered);
  };

  const handleSkillFilter = (skill) => {
    setSelectedSkill(skill);
    
    if (skill === 'all') {
      setFilteredProjects(devProjects);
    } else {
      const filtered = devProjects.filter(project =>
        project.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
      );
      setFilteredProjects(filtered);
    }
  };

  const getContactLink = (method, info) => {
    if (!method || !info) return '#';
    
    switch (method.toLowerCase()) {
      case 'phone':
        return `tel:${info}`;
      case 'email':
        return `mailto:${info}`;
      case 'whatsapp':
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
        Alert.alert(
          'Contact Information',
          `Contact via ${project.contactMethod}: ${project.contactInfo}`,
          [{ text: 'OK' }]
        );
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

  const handleCreateProject = () => {
    navigation.navigate('MyPosts', { category: 'development' });
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Flexible') return 'Flexible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const onRefresh = () => {
    fetchDevelopmentPosts(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading development projects...</Text>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.primary }]}>Development Projects</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Collaborate on coding projects and build amazing applications
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateProject}
          >
            <Text style={styles.createButtonText}>+ New Project</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          <TextInput
            style={[
              styles.searchInput, 
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border 
              }
            ]}
            placeholder="Search projects, technologies..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.skillsScroll}
            contentContainerStyle={styles.skillsContainer}
          >
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillChip,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border 
                  },
                  selectedSkill === skill && [
                    styles.skillChipActive, 
                    { 
                      backgroundColor: colors.primary,
                      borderColor: colors.primary 
                    }
                  ]
                ]}
                onPress={() => handleSkillFilter(skill)}
              >
                <Text style={[
                  styles.skillText,
                  { color: colors.textSecondary },
                  selectedSkill === skill && [
                    styles.skillTextActive,
                    { color: '#000000' }
                  ]
                ]}>
                  {skill === 'all' ? 'All Skills' : skill}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Error State */}
        {error && (
          <View style={[
            styles.errorContainer, 
            { 
              backgroundColor: `${colors.error}20`,
              borderColor: colors.error 
            }
          ]}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.error }]}
              onPress={() => fetchDevelopmentPosts()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Projects Grid */}
        <View style={styles.projectsGrid}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <View 
                key={project._id} 
                style={[
                  styles.projectCard, 
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border 
                  }
                ]}
              >
                <View style={styles.projectHeader}>
                  <Text style={[styles.projectTitle, { color: colors.primary }]}>
                    {project.title}
                  </Text>
                  <View style={[
                    styles.deadlineBadge,
                    { 
                      backgroundColor: `${colors.primary}20`,
                      borderColor: `${colors.primary}50` 
                    }
                  ]}>
                    <Text style={[styles.deadlineText, { color: colors.primary }]}>
                      {formatDate(project.deadline)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.projectDescription, { color: colors.textSecondary }]} 
                      numberOfLines={3}>
                  {project.description}
                </Text>

                <View style={styles.projectMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      {project.teamSize} needed
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🎯</Text>
                    <Text style={[styles.metaText, { color: colors.text }]}>
                      {project.skillLevel}
                    </Text>
                  </View>
                  {project.status && (
                    <View style={[
                      styles.statusBadge,
                      project.status === 'active' && [
                        styles.statusActive,
                        { 
                          backgroundColor: `${colors.primary}20`,
                          borderColor: `${colors.primary}50` 
                        }
                      ],
                      project.status === 'completed' && [
                        styles.statusCompleted,
                        { 
                          backgroundColor: `${colors.textSecondary}20`,
                          borderColor: `${colors.textSecondary}50` 
                        }
                      ]
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        { color: colors.textSecondary }
                      ]}>
                        {project.status}
                      </Text>
                    </View>
                  )}
                </View>

                {project.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {project.tags.slice(0, 4).map((tag, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.tag,
                          { 
                            backgroundColor: `${colors.primary}10`,
                            borderColor: `${colors.primary}30` 
                          }
                        ]}
                      >
                        <Text style={[styles.tagText, { color: colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                    {project.tags.length > 4 && (
                      <View style={[
                        styles.moreTag,
                        { 
                          backgroundColor: `${colors.textSecondary}10`,
                          borderColor: `${colors.textSecondary}30` 
                        }
                      ]}>
                        <Text style={[styles.moreTagText, { color: colors.textSecondary }]}>
                          +{project.tags.length - 4}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={[styles.contactSection, { borderTopColor: colors.border }]}>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                      Contact via:{' '}
                      <Text style={[styles.contactMethod, { color: colors.primary }]}>
                        {project.contactMethod}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      { 
                        backgroundColor: `${colors.primary}20`,
                        borderColor: `${colors.primary}50` 
                      }
                    ]}
                    onPress={() => handleJoinProject(project)}
                  >
                    <Text style={[styles.joinButtonText, { color: colors.primary }]}>
                      Join Project
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            !loading && (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateTitle, { color: colors.primary }]}>
                  {searchQuery || selectedSkill !== 'all' ? 'No matching projects' : 'No projects yet'}
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  {searchQuery || selectedSkill !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create a development project!'
                  }
                </Text>
                <TouchableOpacity 
                  style={[styles.createProjectButton, { backgroundColor: colors.primary }]}
                  onPress={handleCreateProject}
                >
                  <Text style={styles.createProjectButtonText}>
                    Create First Project
                  </Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {/* Loading more indicator */}
        {refreshing && (
          <ActivityIndicator size="small" color={colors.primary} style={styles.refreshIndicator} />
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    maxWidth: '70%',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  skillsScroll: {
    marginHorizontal: -16,
  },
  skillsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  skillChipActive: {
    // Styles applied dynamically
  },
  skillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skillTextActive: {
    // Color applied dynamically
  },
  errorContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  deadlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  deadlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActive: {
    // Styles applied dynamically
  },
  statusCompleted: {
    // Styles applied dynamically
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
  moreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  moreTagText: {
    fontSize: 12,
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactText: {
    fontSize: 14,
  },
  contactMethod: {
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createProjectButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createProjectButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  refreshIndicator: {
    marginVertical: 16,
  },
});

export default Development;