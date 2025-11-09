import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

function Settings() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    name: '',
    bio: '',
    skills: '',
    interests: '',
    password: '',
    confirmPassword: '',
  });
  const [originalForm, setOriginalForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    projectUpdates: true,
    newMessages: true,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile...');
      
      const response = await authAPI.getUser();
      console.log('User profile response:', response);
      
      if (response.data) {
        const user = response.data;
        const userForm = {
          username: user.username || '',
          email: user.email || '',
          name: user.name || '',
          bio: user.bio || '',
          skills: Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || ''),
          interests: Array.isArray(user.interests) ? user.interests.join(', ') : (user.interests || ''),
          password: '',
          confirmPassword: '',
        };
        
        setForm(userForm);
        setOriginalForm(userForm);
      } else {
        throw new Error('No user data received');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert(
        'Error',
        'Failed to load profile. Please check your connection.',
        [
          { text: 'Try Again', onPress: fetchUserProfile },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationChange = (name, value) => {
    setNotifications(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = () => {
    return JSON.stringify(form) !== JSON.stringify(originalForm) ||
           Object.values(notifications).some(value => value !== true);
  };

  const handleSave = async () => {
    if (saving) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    if (!hasChanges()) {
      Alert.alert('No Changes', 'No changes detected to save.');
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        bio: form.bio.trim(),
        skills: form.skills ? form.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
        interests: form.interests ? form.interests.split(',').map(interest => interest.trim()).filter(interest => interest) : [],
      };

      // Only include password if it's being changed
      if (form.password) {
        updateData.password = form.password;
      }

      console.log('Updating user profile with:', { ...updateData, password: form.password ? '***' : 'unchanged' });
      
      // REAL API CALL
      const response = await authAPI.updateUser(updateData);
      console.log('Update response:', response);

      if (response.data) {
        // Update original form to current state
        setOriginalForm({
          ...form,
          password: '',
          confirmPassword: '',
        });
        
        // Clear password fields
        setForm(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));

        Alert.alert(
          'Success! ✅',
          'Your profile has been updated successfully.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No data received from server');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to save settings. Please try again.';
      
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('409')) {
        errorMessage = 'Username or email already exists. Please choose different ones.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              // Force logout even if API call fails
              await AsyncStorage.multiRemove(['token', 'userId']);
              navigation.replace('Login');
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Type "DELETE" to confirm account deletion:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  style: 'destructive',
                  onPress: () => {
                    // Implement account deletion logic here
                    Alert.alert('Account Deletion', 'This feature is not yet implemented.');
                  }
                }
              ]
            );
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Profile Settings</Text>
          
          {/* Profile Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                value={form.username}
                onChangeText={(text) => handleChange('username', text)}
                placeholder="Choose a username"
                placeholderTextColor="#6B7280"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Your full name"
                placeholderTextColor="#6B7280"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.bio}
                onChangeText={(text) => handleChange('bio', text)}
                multiline
                numberOfLines={3}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#6B7280"
              />
              <Text style={styles.charCount}>{form.bio.length}/200</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Skills</Text>
              <TextInput
                style={styles.input}
                value={form.skills}
                onChangeText={(text) => handleChange('skills', text)}
                placeholder="React, Python, Design, Gaming..."
                placeholderTextColor="#6B7280"
              />
              <Text style={styles.helperText}>Separate skills with commas</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Interests</Text>
              <TextInput
                style={styles.input}
                value={form.interests}
                onChangeText={(text) => handleChange('interests', text)}
                placeholder="Web Development, AI Research, Mobile Games..."
                placeholderTextColor="#6B7280"
              />
              <Text style={styles.helperText}>Separate interests with commas</Text>
            </View>
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry
                placeholder="Leave blank to keep current password"
                placeholderTextColor="#6B7280"
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={form.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                secureTextEntry
                placeholder="Confirm your new password"
                placeholderTextColor="#6B7280"
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Email Notifications</Text>
              <Switch
                value={notifications.emailNotifications}
                onValueChange={(value) => handleNotificationChange('emailNotifications', value)}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={notifications.emailNotifications ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>Project Updates</Text>
              <Switch
                value={notifications.projectUpdates}
                onValueChange={(value) => handleNotificationChange('projectUpdates', value)}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={notifications.projectUpdates ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.switchLabel}>New Messages</Text>
              <Switch
                value={notifications.newMessages}
                onValueChange={(value) => handleNotificationChange('newMessages', value)}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={notifications.newMessages ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (!hasChanges() || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges() || saving}
          >
            {saving ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasChanges() ? 'Save Changes' : 'No Changes'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitleDanger}>Danger Zone</Text>
            
            <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
              <Text style={styles.dangerButtonText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButtonDelete} onPress={handleDeleteAccount}>
              <Text style={styles.dangerButtonDeleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
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
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  sectionTitle: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitleDanger: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  charCount: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  switchLabel: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButtonDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerButtonDeleteText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;