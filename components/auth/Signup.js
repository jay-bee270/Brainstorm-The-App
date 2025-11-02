import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

function Signup() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    bio: '',
    skills: '',
    interests: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
        bio: form.bio.trim(),
        skills: form.skills ? form.skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [],
        interests: form.interests ? form.interests.split(',').map(interest => interest.trim()).filter(interest => interest) : [],
      };

      console.log('Attempting registration with:', { ...userData, password: '***' });
      
      // REAL API CALL
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);

      if (response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        await AsyncStorage.multiSet([
          ['token', token],
          ['userId', user._id],
          ['hasSeenOnboarding', 'true'],
        ]);

        console.log('User registered successfully:', user.username);
        
        Alert.alert(
          'Success! 🎉',
          `Welcome to Brainstorm, ${user.username}! Your account has been created successfully.`,
          [
            { 
              text: 'Get Started', 
              onPress: () => navigation.replace('Dashboard')
            }
          ]
        );
      } else {
        throw new Error('No data received from server');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      // Handle specific error cases
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('409') || error.response?.data?.message?.includes('already exists')) {
        errorMessage = 'An account with this email or username already exists.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join our community of creators and collaborators
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.username && styles.inputError
                ]}
                placeholder="Choose a unique username"
                placeholderTextColor="#6B7280"
                value={form.username}
                onChangeText={(text) => handleChange('username', text)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.name && styles.inputError
                ]}
                placeholder="Your full name"
                placeholderTextColor="#6B7280"
                value={form.name}
                onChangeText={(text) => handleChange('name', text)}
                autoCapitalize="words"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.email && styles.inputError
                ]}
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Bio */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about yourself (e.g., Developer, Gamer, Researcher)"
                placeholderTextColor="#6B7280"
                value={form.bio}
                onChangeText={(text) => handleChange('bio', text)}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
              <Text style={styles.charCount}>
                {form.bio.length}/200
              </Text>
            </View>

            {/* Skills */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skills</Text>
              <TextInput
                style={styles.input}
                placeholder="React, Python, Design, Gaming, etc."
                placeholderTextColor="#6B7280"
                value={form.skills}
                onChangeText={(text) => handleChange('skills', text)}
              />
              <Text style={styles.helperText}>
                Separate skills with commas
              </Text>
            </View>

            {/* Interests */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interests</Text>
              <TextInput
                style={styles.input}
                placeholder="Web Development, AI Research, Mobile Games, etc."
                placeholderTextColor="#6B7280"
                value={form.interests}
                onChangeText={(text) => handleChange('interests', text)}
              />
              <Text style={styles.helperText}>
                Separate interests with commas
              </Text>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.password && styles.inputError
                ]}
                placeholder="At least 6 characters"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.confirmPassword && styles.inputError
                ]}
                placeholder="Repeat your password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                value={form.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.button, 
                loading && styles.buttonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Redirect */}
            <View style={styles.loginRedirect}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleLoginRedirect}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
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
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Signup;