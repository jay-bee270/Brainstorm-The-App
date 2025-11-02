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
} from 'react-native';

function Settings() {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setForm({
            username: 'johndoe',
            email: 'john@example.com',
            name: 'John Doe',
            bio: 'Full-stack developer and gaming enthusiast',
            skills: 'React, Node.js, Unity',
            interests: 'Gaming, AI Research, Open Source',
            password: '',
            confirmPassword: '',
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

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    setError('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Simulate API call
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (err) {
      const errorMessage = 'Failed to save settings';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={form.username}
              onChangeText={(text) => handleChange('username', text)}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={(text) => handleChange('bio', text)}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Skills (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={form.skills}
              onChangeText={(text) => handleChange('skills', text)}
              placeholder="e.g., React, Python"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Interests (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={form.interests}
              onChangeText={(text) => handleChange('interests', text)}
              placeholder="e.g., Gaming, Research"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={form.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              secureTextEntry
            />
          </View>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000000',
    color: '#10B981',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: 'rgba(127, 29, 29, 0.8)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B91C1C',
  },
  errorText: {
    color: '#FCA5A5',
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;