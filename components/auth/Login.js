import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../services/api';

function Login() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
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

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (loading) return;
    
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check your email and password');
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      console.log('Attempting login with:', { ...credentials, password: '***' });
      
      // REAL API CALL
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);

      if (response.data) {
        const { token, user } = response.data;
        
        // Store authentication data
        await AsyncStorage.multiSet([
          ['token', token],
          ['userId', user._id],
        ]);

        console.log('User logged in successfully:', user.username);
        
        // Show success message and navigate
        Alert.alert(
          'Welcome Back! 👋',
          `Great to see you again, ${user.username || user.name}!`,
          [
            { 
              text: 'Continue', 
              onPress: () => navigation.replace('Dashboard')
            }
          ],
          { cancelable: false }
        );
        
      } else {
        throw new Error('No data received from server');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      // Handle specific error cases
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401') || error.response?.data?.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('404')) {
        errorMessage = 'No account found with this email address.';
      }
      
      setErrors({ submit: errorMessage });
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Please contact support or try resetting your password through our website.',
      [{ text: 'OK' }]
    );
  };

  const handleDemoLogin = async () => {
    // Optional: Demo login for testing
    setForm({
      email: 'demo@example.com',
      password: 'demo123',
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue collaborating
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.email && styles.inputError
                ]}
                placeholder="Enter your email"
                placeholderTextColor="#6B7280"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.email}
                onChangeText={(text) => handleChange('email', text)}
                onSubmitEditing={handleSubmit}
                returnKeyType="next"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  errors.password && styles.inputError
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#6B7280"
                secureTextEntry
                autoCapitalize="none"
                value={form.password}
                onChangeText={(text) => handleChange('password', text)}
                onSubmitEditing={handleSubmit}
                returnKeyType="go"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot your password?
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.button, 
                loading && styles.buttonDisabled,
                (!form.email || !form.password) && styles.buttonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={loading || !form.email || !form.password}
            >
              {loading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo Login (Optional - remove in production) */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={handleDemoLogin}
              >
                <Text style={styles.demoButtonText}>Fill Demo Credentials</Text>
              </TouchableOpacity>
            )}

            {/* Signup Redirect */}
            <View style={styles.signupRedirect}>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignupRedirect}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Brainstorm</Text>
            <Text style={styles.appTagline}>Collaborate • Create • Innovate</Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  },
  formContainer: {
    gap: 4,
  },
  inputGroup: {
    marginBottom: 20,
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
    paddingVertical: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  signupRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signupText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  signupLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
  },
  appName: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appTagline: {
    color: '#6B7280',
    fontSize: 12,
    letterSpacing: 1,
  },
});

export default Login;