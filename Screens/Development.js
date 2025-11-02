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

function Development() {
  const [devProjects, setDevProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevelopmentPosts = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setDevProjects([
            {
              _id: '1',
              title: 'React Native App',
              description: 'Building a cross-platform mobile application',
              deadline: '2024-12-31',
              teamSize: '3',
              skillLevel: 'Intermediate',
              tags: ['React Native', 'JavaScript', 'Firebase'],
              contactMethod: 'discord',
              contactInfo: 'discord.gg/dev'
            },
            {
              _id: '2',
              title: 'E-commerce Website',
              description: 'Full-stack e-commerce platform development',
              deadline: '2024-11-30',
              teamSize: '4',
              skillLevel: 'Advanced',
              tags: ['React', 'Node.js', 'MongoDB'],
              contactMethod: 'email',
              contactInfo: 'dev@example.com'
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Failed to fetch development posts');
        console.error(err);
        setLoading(false);
      }
    };

    fetchDevelopmentPosts();
  }, []);

  const getContactLink = (method, info) => {
    switch (method) {
      case 'phone': return `tel:${info}`;
      case 'email': return `mailto:${info}`;
      case 'whatsapp': return `https://wa.me/${info}`;
      case 'discord': return `https://discord.gg/${info}`;
      default: return '#';
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
        <Text style={styles.title}>Development Projects</Text>
        <Text style={styles.subtitle}>Join innovative coding projects</Text>
        
        <View style={styles.projectsGrid}>
          {devProjects.map((project, index) => (
            <View key={index} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <View style={styles.deadlineBadge}>
                  <Text style={styles.deadlineText}>{project.deadline}</Text>
                </View>
              </View>

              <Text style={styles.projectDescription}>{project.description}</Text>

              <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>👥</Text>
                  <Text style={styles.metaText}>{project.teamSize}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🎯</Text>
                  <Text style={styles.metaText}>{project.skillLevel}</Text>
                </View>
              </View>

              <View style={styles.tagsContainer}>
                {project.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
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

export default Development;