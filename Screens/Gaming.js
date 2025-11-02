import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';

function Gaming() {
  const [gamingProjects, setGamingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGamingPosts = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setGamingProjects([
            {
              _id: '1',
              title: 'Mobile Game Development',
              description: 'Creating an innovative mobile gaming experience',
              deadline: '2024-12-15',
              teamSize: '5',
              skillLevel: 'Intermediate',
              tags: ['Unity', 'C#', 'Mobile'],
              contactMethod: 'discord',
              contactInfo: 'discord.gg/gaming'
            },
            {
              _id: '2',
              title: 'VR Gaming Project',
              description: 'Developing immersive virtual reality games',
              deadline: '2025-01-20',
              teamSize: '4',
              skillLevel: 'Advanced',
              tags: ['Unreal Engine', 'VR', '3D'],
              contactMethod: 'whatsapp',
              contactInfo: '+1234567890'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch gaming posts');
        console.error(err);
        setLoading(false);
      }
    };

    fetchGamingPosts();
  }, []);

  const getContactLink = (method, info) => {
    switch (method) {
      case 'phone':
        return `tel:${info}`;
      case 'email':
        return `mailto:${info}`;
      case 'whatsapp':
        return `https://wa.me/${info}`;
      case 'discord':
        return info.startsWith('https://') ? info : `https://discord.gg/${info}`;
      default:
        return '#';
    }
  };

  const handleJoinProject = (project) => {
    const link = getContactLink(project.contactMethod, project.contactInfo);
    if (link !== '#') {
      Linking.openURL(link);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
  
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gaming Projects</Text>
        <Text style={styles.subtitle}>Join exciting gaming projects</Text>
        
        {gamingProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No gaming projects available</Text>
          </View>
        ) : (
          <View style={styles.projectsGrid}>
            {gamingProjects.map((project, index) => (
              <View
                key={project._id || index}
                style={styles.projectCard}
              >
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <View style={styles.deadlineBadge}>
                    <Text style={styles.deadlineText}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.projectDescription}>{project.description}</Text>

                <View style={styles.projectMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>👥</Text>
                    <Text style={styles.metaText}>{project.teamSize || 'N/A'}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>🎯</Text>
                    <Text style={styles.metaText}>{project.skillLevel || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.tagsContainer}>
                  {project.tags?.length ? (
                    project.tags.map((tag, i) => (
                      <View
                        key={i}
                        style={styles.tag}
                      >
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noTagsText}>No tags</Text>
                  )}
                </View>

                <View style={styles.contactSection}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactText}>
                      Contact via: <Text style={styles.contactMethod}>{project.contactMethod}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinProject(project)}
                  >
                    <Text style={styles.joinButtonText}>Join Project</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  projectsGrid: {
    gap: 16,
  },
  projectCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    flex: 1,
  },
  deadlineBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  deadlineText: {
    color: '#10B981',
    fontSize: 12,
  },
  projectDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  projectMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  tagText: {
    color: '#10B981',
    fontSize: 12,
  },
  noTagsText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  contactSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  contactInfo: {
    flex: 1,
  },
  contactText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  contactMethod: {
    color: '#10B981',
    textTransform: 'capitalize',
  },
  joinButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  joinButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Gaming;