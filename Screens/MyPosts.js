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
} from 'react-native';

function MyPosts() {
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
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setPosts([
          {
            _id: '1',
            title: 'My Gaming Project',
            description: 'A fun mobile game development project',
            category: 'gaming',
            teamSize: '3',
            skillLevel: 'Intermediate',
            deadline: '2024-12-31',
            tags: ['Unity', 'Mobile'],
            contactMethod: 'discord',
            contactInfo: 'myproject'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to fetch posts');
      setLoading(false);
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
      tags: post.tags?.join(', ') || '',
      contactMethod: post.contactMethod,
      contactInfo: post.contactInfo
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      // Simulate API call
      Alert.alert('Success', editingPost ? 'Post updated successfully!' : 'Post created successfully!');
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
      fetchPosts();
    } catch (err) {
      Alert.alert('Error', 'Failed to save post');
    }
  };

  const handleDelete = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate API call
              Alert.alert('Success', 'Post deleted successfully!');
              fetchPosts();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

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

  const formTitle = editingPost ? 'Edit Post' : 'Create New Post';
  const buttonText = editingPost ? 'Update Post' : 'Create Post';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Posts</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setShowForm(!showForm);
              if (!showForm) {
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
              }
            }}
          >
            <Text style={styles.createButtonText}>
              {showForm ? 'Cancel' : 'Create New Post'}
            </Text>
          </TouchableOpacity>
        </View>

        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{formTitle}</Text>
            <View style={styles.formGrid}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#6B7280"
                value={newPost.title}
                onChangeText={(text) => setNewPost({...newPost, title: text})}
              />
              <View style={styles.selectContainer}>
                <TextInput
                  style={[styles.input, styles.select]}
                  value={newPost.category}
                  editable={false}
                >
                  {newPost.category}
                </TextInput>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Team Size"
                placeholderTextColor="#6B7280"
                value={newPost.teamSize}
                onChangeText={(text) => setNewPost({...newPost, teamSize: text})}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Skill Level Required"
                placeholderTextColor="#6B7280"
                value={newPost.skillLevel}
                onChangeText={(text) => setNewPost({...newPost, skillLevel: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Deadline (YYYY-MM-DD)"
                placeholderTextColor="#6B7280"
                value={newPost.deadline}
                onChangeText={(text) => setNewPost({...newPost, deadline: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                placeholderTextColor="#6B7280"
                value={newPost.tags}
                onChangeText={(text) => setNewPost({...newPost, tags: text})}
              />
              <View style={styles.contactRow}>
                <View style={styles.contactMethodContainer}>
                  <TextInput
                    style={[styles.input, styles.contactMethod]}
                    value={newPost.contactMethod}
                    editable={false}
                  >
                    {newPost.contactMethod}
                  </TextInput>
                </View>
                <TextInput
                  style={[styles.input, styles.contactInfo]}
                  placeholder="Contact Information"
                  placeholderTextColor="#6B7280"
                  value={newPost.contactInfo}
                  onChangeText={(text) => setNewPost({...newPost, contactInfo: text})}
                />
              </View>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#6B7280"
              value={newPost.description}
              onChangeText={(text) => setNewPost({...newPost, description: text})}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          </View>
        )}

        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't made any posts yet</Text>
          </View>
        ) : (
          <View style={styles.postsGrid}>
            {posts.map(post => (
              <View key={post._id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                </View>
                <Text style={styles.postDescription}>{post.description}</Text>
                <View style={styles.postMeta}>
                  <Text style={styles.metaItem}>👥 {post.teamSize || 'N/A'}</Text>
                  <Text style={styles.metaItem}>🎯 {post.skillLevel || 'N/A'}</Text>
                  <Text style={styles.metaItem}>
                    ⏰ {post.deadline ? new Date(post.deadline).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.tagsContainer}>
                  {post.tags?.map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.postFooter}>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactText}>
                      Contact via: <Text style={styles.contactMethod}>{post.contactMethod}</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinButton}
                    onPress={() => handleJoinProject(post)}
                  >
                    <Text style={styles.joinButtonText}>Join Project</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEdit(post)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(post._id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#000000',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 16,
  },
  formGrid: {
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#000000',
    color: '#10B981',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
    fontSize: 16,
  },
  selectContainer: {
    position: 'relative',
  },
  select: {
    color: '#10B981',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  contactMethodContainer: {
    flex: 1,
  },
  contactMethod: {
    flex: 1,
    color: '#10B981',
  },
  contactInfo: {
    flex: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  postsGrid: {
    gap: 16,
  },
  postCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#10B981',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  postDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
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
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    marginBottom: 12,
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
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#10B981',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 12,
  },
});

export default MyPosts;