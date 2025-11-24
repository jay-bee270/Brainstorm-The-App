import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { postsAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MyPosts() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useTheme(); // Get theme colors
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'gaming',
    teamSize: '',
    skillLevel: '',
    deadline: '',
    tags: '',
    contactMethod: 'discord',
    contactInfo: ''
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['gaming', 'development', 'research'];
  const contactMethods = ['discord', 'email', 'whatsapp', 'telegram', 'phone'];

  // Handle navigation parameters
  useEffect(() => {
    if (route.params?.showForm) {
      setShowForm(true);
      if (route.params?.category) {
        setNewPost(prev => ({
          ...prev,
          category: route.params.category
        }));
      }
    }
  }, [route.params]);

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const fetchPosts = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError('');
      console.log('Fetching user posts...');
      
      // Get current user ID
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not found. Please login again.');
      }
      
      // REAL API CALL - Get posts by current user
      const response = await postsAPI.getPostsByUser(userId);
      console.log('User posts response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        const userPosts = response.data.map(post => ({
          _id: post._id,
          title: post.title || 'Untitled Project',
          description: post.description || post.content || 'No description available',
          category: post.category || 'general',
          teamSize: post.teamSize || post.collaborators || 'Not specified',
          skillLevel: post.skillLevel || post.difficulty || 'Any',
          deadline: post.deadline || post.dueDate || 'Flexible',
          tags: post.tags || [],
          contactMethod: post.contactMethod || post.contact?.method || 'email',
          contactInfo: post.contactInfo || post.contact?.info || 'No contact info',
          createdAt: post.createdAt,
          status: post.status || 'active',
          views: post.views || 0,
          applicants: post.applicants || 0,
        }));
        
        setPosts(userPosts);
      } else {
        setPosts([]);
      }
      
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setError('Failed to load your posts. Please check your connection.');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      description: post.description,
      category: post.category,
      teamSize: post.teamSize || '',
      skillLevel: post.skillLevel || '',
      deadline: post.deadline || '',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      contactMethod: post.contactMethod,
      contactInfo: post.contactInfo
    });
    setShowForm(true);
  };

  const validateForm = () => {
    if (!newPost.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your project');
      return false;
    }
    if (!newPost.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description for your project');
      return false;
    }
    if (!newPost.contactInfo.trim()) {
      Alert.alert('Validation Error', 'Please enter contact information');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        title: newPost.title.trim(),
        description: newPost.description.trim(),
        category: newPost.category,
        teamSize: newPost.teamSize,
        skillLevel: newPost.skillLevel,
        deadline: newPost.deadline || undefined,
        tags: newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        contactMethod: newPost.contactMethod,
        contactInfo: newPost.contactInfo.trim(),
      };

      console.log('Submitting post:', postData);

      let response;
      
      if (editingPost) {
        // Update existing post
        response = await postsAPI.updatePost(editingPost._id, postData);
        console.log('Update response:', response);
      } else {
        // Create new post
        response = await postsAPI.createPost(postData);
        console.log('Create response:', response);
      }

      if (response.data) {
        Alert.alert(
          'Success! ✅',
          editingPost ? 'Post updated successfully!' : 'Post created successfully!',
          [{ text: 'OK' }]
        );
        
        resetForm();
        fetchPosts();
      } else {
        throw new Error('No data received from server');
      }
      
    } catch (error) {
      console.error('Error saving post:', error);
      
      let errorMessage = editingPost ? 'Failed to update post' : 'Failed to create post';
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage += '. Please check your internet connection.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting post:', postId);
              
              // REAL API CALL
              await postsAPI.deletePost(postId);
              
              Alert.alert('Success', 'Post deleted successfully!');
              fetchPosts();
            } catch (err) {
              console.error('Error deleting post:', err);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPost(null);
    setNewPost({
      title: '',
      description: '',
      category: 'gaming',
      teamSize: '',
      skillLevel: '',
      deadline: '',
      tags: '',
      contactMethod: 'discord',
      contactInfo: ''
    });
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
    fetchPosts(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading your posts...</Text>
      </View>
    );
  }

  const formTitle = editingPost ? 'Edit Post' : 'Create New Post';
  const buttonText = submitting ? (editingPost ? 'Updating...' : 'Creating...') : (editingPost ? 'Update Post' : 'Create Post');

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
            <Text style={[styles.title, { color: colors.primary }]}>My Posts</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Manage your collaboration projects
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            <Text style={styles.createButtonText}>
              {showForm ? 'Cancel' : '+ New Post'}
            </Text>
          </TouchableOpacity>
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
              onPress={() => fetchPosts()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <View style={[
            styles.formContainer, 
            { 
              backgroundColor: colors.card,
              borderColor: colors.border 
            }
          ]}>
            <Text style={[styles.formTitle, { color: colors.primary }]}>{formTitle}</Text>
            
            <View style={styles.formGrid}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Project Title *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="Enter project title"
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.title}
                  onChangeText={(text) => setNewPost({...newPost, title: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Category</Text>
                <View style={styles.categoriesContainer}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        { 
                          backgroundColor: colors.card,
                          borderColor: colors.border 
                        },
                        newPost.category === category && [
                          styles.categoryChipActive,
                          { 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary 
                          }
                        ]
                      ]}
                      onPress={() => setNewPost({...newPost, category})}
                    >
                      <Text style={[
                        styles.categoryText,
                        { color: colors.textSecondary },
                        newPost.category === category && [
                          styles.categoryTextActive,
                          { color: '#000000' }
                        ]
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Team Size</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="e.g., 3-5 people"
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.teamSize}
                  onChangeText={(text) => setNewPost({...newPost, teamSize: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Skill Level</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="e.g., Beginner, Intermediate, Advanced"
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.skillLevel}
                  onChangeText={(text) => setNewPost({...newPost, skillLevel: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Deadline</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="YYYY-MM-DD or 'Flexible'"
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.deadline}
                  onChangeText={(text) => setNewPost({...newPost, deadline: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Tags</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder="Comma-separated tags (e.g., React, Gaming, AI)"
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.tags}
                  onChangeText={(text) => setNewPost({...newPost, tags: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Contact Method</Text>
                <View style={styles.contactMethodsContainer}>
                  {contactMethods.map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.contactMethodChip,
                        { 
                          backgroundColor: colors.card,
                          borderColor: colors.border 
                        },
                        newPost.contactMethod === method && [
                          styles.contactMethodChipActive,
                          { 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary 
                          }
                        ]
                      ]}
                      onPress={() => setNewPost({...newPost, contactMethod: method})}
                    >
                      <Text style={[
                        styles.contactMethodText,
                        { color: colors.textSecondary },
                        newPost.contactMethod === method && [
                          styles.contactMethodTextActive,
                          { color: '#000000' }
                        ]
                      ]}>
                        {method}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.primary }]}>Contact Information *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    }
                  ]}
                  placeholder={`Your ${newPost.contactMethod} contact info`}
                  placeholderTextColor={colors.textSecondary}
                  value={newPost.contactInfo}
                  onChangeText={(text) => setNewPost({...newPost, contactInfo: text})}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.primary }]}>Project Description *</Text>
              <TextInput
                style={[
                  styles.input, 
                  styles.textArea,
                  { 
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                    borderColor: colors.border 
                  }
                ]}
                placeholder="Describe your project in detail..."
                placeholderTextColor={colors.textSecondary}
                value={newPost.description}
                onChangeText={(text) => setNewPost({...newPost, description: text})}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton, 
                { backgroundColor: colors.primary },
                submitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Posts List */}
        {posts.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.primary }]}>No Posts Yet</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              You haven't created any posts yet. Start by creating your first project!
            </Text>
            <TouchableOpacity 
              style={[styles.createFirstButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.createFirstButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          !showForm && (
            <View style={styles.postsGrid}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Your Projects ({posts.length})
              </Text>
              {posts.map(post => (
                <View 
                  key={post._id} 
                  style={[
                    styles.postCard, 
                    { 
                      backgroundColor: colors.card,
                      borderColor: colors.border 
                    }
                  ]}
                >
                  <View style={styles.postHeader}>
                    <Text style={[styles.postTitle, { color: colors.primary }]}>
                      {post.title}
                    </Text>
                    <View style={[
                      styles.categoryBadge,
                      { 
                        backgroundColor: `${colors.primary}20`,
                        borderColor: `${colors.primary}50` 
                      }
                    ]}>
                      <Text style={[styles.categoryText, { color: colors.primary }]}>
                        {post.category}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.postDescription, { color: colors.textSecondary }]} 
                        numberOfLines={3}>
                    {post.description}
                  </Text>

                  <View style={styles.postMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>👥</Text>
                      <Text style={[styles.metaText, { color: colors.text }]}>
                        {post.teamSize}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>🎯</Text>
                      <Text style={[styles.metaText, { color: colors.text }]}>
                        {post.skillLevel}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>⏰</Text>
                      <Text style={[styles.metaText, { color: colors.text }]}>
                        {formatDate(post.deadline)}
                      </Text>
                    </View>
                  </View>

                  {post.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {post.tags.slice(0, 4).map((tag, i) => (
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
                      {post.tags.length > 4 && (
                        <View style={[
                          styles.moreTag,
                          { 
                            backgroundColor: `${colors.textSecondary}10`,
                            borderColor: `${colors.textSecondary}30` 
                          }
                        ]}>
                          <Text style={[styles.moreTagText, { color: colors.textSecondary }]}>
                            +{post.tags.length - 4}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={[styles.statsContainer, { borderTopColor: colors.border }]}>
                    <View style={styles.stat}>
                      <Text style={[styles.statNumber, { color: colors.primary }]}>
                        {post.views || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Views
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={[styles.statNumber, { color: colors.primary }]}>
                        {post.applicants || 0}
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        Applicants
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      post.status === 'active' ? [
                        styles.statusActive,
                        { 
                          backgroundColor: `${colors.primary}20`,
                          borderColor: `${colors.primary}50` 
                        }
                      ] : [
                        styles.statusInactive,
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
                        {post.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.postFooter, { borderTopColor: colors.border }]}>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                        Contact via:{' '}
                        <Text style={[styles.contactMethod, { color: colors.primary }]}>
                          {post.contactMethod}
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
                      onPress={() => handleJoinProject(post)}
                    >
                      <Text style={[styles.joinButtonText, { color: colors.primary }]}>
                        Test Contact
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { 
                          backgroundColor: `${colors.primary}20`,
                          borderColor: `${colors.primary}50` 
                        }
                      ]}
                      onPress={() => handleEdit(post)}
                    >
                      <Text style={[styles.editButtonText, { color: colors.primary }]}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        { 
                          backgroundColor: `${colors.error}20`,
                          borderColor: `${colors.error}50` 
                        }
                      ]}
                      onPress={() => handleDelete(post._id)}
                    >
                      <Text style={[styles.deleteButtonText, { color: colors.error }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGrid: {
    gap: 16,
    marginBottom: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipActive: {
    // Styles applied dynamically
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    // Color applied dynamically
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactMethodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  contactMethodChipActive: {
    // Styles applied dynamically
  },
  contactMethodText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  contactMethodTextActive: {
    // Color applied dynamically
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
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
  createFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  postsGrid: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  postDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  postMeta: {
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
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
    borderWidth: 1,
  },
  statusActive: {
    // Styles applied dynamically
  },
  statusInactive: {
    // Styles applied dynamically
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyPosts;