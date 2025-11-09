"use client"

import { useState } from "react"
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
} from "react-native"
import { authAPI, parseError, saveUserData, ERROR_CODES } from "../../services/api"

const VALIDATION_RULES = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    messages: {
      required: "Username is required",
      minLength: "Username must be at least 3 characters",
      maxLength: "Username cannot exceed 20 characters",
      pattern: "Username can only contain letters, numbers, and underscores",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "Email is required",
      pattern: "Please enter a valid email address",
    },
  },
  password: {
    required: true,
    minLength: 6,
    messages: {
      required: "Password is required",
      minLength: "Password must be at least 6 characters",
    },
  },
  confirmPassword: {
    required: true,
    messages: {
      required: "Please confirm your password",
    },
  },
  name: {
    required: true,
    minLength: 2,
    messages: {
      required: "Full name is required",
      minLength: "Full name must be at least 2 characters",
    },
  },
}

function Signup({ navigation }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    bio: "",
    skills: "",
    interests: "",
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })

    if (touchedFields[name]) {
      validateField(name, value)
    }

    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError(null)
    }

    // Clear field error when user modifies the field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFieldBlur = (name) => {
    setTouchedFields((prev) => ({ ...prev, [name]: true }))
    validateField(name, form[name])
  }

  const validateField = (name, value) => {
    const rules = VALIDATION_RULES[name]

    if (!rules) return null

    if (rules.required && !value.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: rules.messages.required,
      }))
      return false
    }

    if (rules.minLength && value.trim().length < rules.minLength) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: rules.messages.minLength,
      }))
      return false
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: rules.messages.maxLength,
      }))
      return false
    }

    if (rules.pattern && value.trim() && !rules.pattern.test(value.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: rules.messages.pattern,
      }))
      return false
    }

    if (name === "confirmPassword" && form.password !== value) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }))
      return false
    }

    setFieldErrors((prev) => ({ ...prev, [name]: null }))
    return true
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = ["username", "email", "password", "confirmPassword", "name"]

    requiredFields.forEach((field) => {
      const rules = VALIDATION_RULES[field]
      const value = form[field]

      if (rules.required && !value.trim()) {
        newErrors[field] = rules.messages.required
        return
      }

      if (rules.minLength && value.trim().length < rules.minLength) {
        newErrors[field] = rules.messages.minLength
        return
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        newErrors[field] = rules.messages.maxLength
        return
      }

      if (rules.pattern && value.trim() && !rules.pattern.test(value.trim())) {
        newErrors[field] = rules.messages.pattern
        return
      }
    })

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async () => {
    if (loading) return

    setGeneralError(null)
    setFieldErrors({})

    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form")
      return
    }

    setLoading(true)

    try {
      const userData = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        name: form.name.trim(),
        bio: form.bio.trim() || undefined,
        skills: form.skills
          ? form.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        interests: form.interests
          ? form.interests
              .split(",")
              .map((interest) => interest.trim())
              .filter((interest) => interest)
          : [],
      }

      console.log("[Signup] Attempting registration with:", {
        ...userData,
        password: "***",
      })

      const response = await authAPI.register(userData)

      if (response.data) {
        const { token, id, username } = response.data

        await saveUserData(response.data)

        console.log("[Signup] User registered successfully:", username)

        Alert.alert(
          "Success! Your account has been created.",
          `Welcome to Brainstorm, ${username}! You're all set to start exploring and collaborating.`,
          [
            {
              text: "Get Started",
              onPress: () => navigation.replace("Dashboard"),
            },
          ],
        )
      }
    } catch (error) {
      console.error("[Signup] Registration error:", error)

      const errorInfo = parseError(error)
      const { code, title, message, fieldErrors: serverFieldErrors } = errorInfo

      console.log("[Signup] Parsed error code:", code)
      console.log("[Signup] Server field errors:", serverFieldErrors)
      console.log("[Signup] Error title:", title)
      console.log("[Signup] Error message:", message)

      if (Object.keys(serverFieldErrors).length > 0) {
        console.log("[Signup] Setting field errors:", serverFieldErrors)
        setFieldErrors(serverFieldErrors)
      }

      setGeneralError({ title, message })

      if (code === ERROR_CODES.EMAIL_ALREADY_EXISTS) {
        Alert.alert(title, message)
      } else if (code === ERROR_CODES.USERNAME_ALREADY_EXISTS) {
        Alert.alert(title, message)
      } else if (Object.keys(serverFieldErrors).length > 0) {
        // If there are field errors, show them in the banner but skip alert
        // User can see the specific field errors inline
        const firstFieldError = Object.values(serverFieldErrors)[0]
        if (firstFieldError) {
          console.log("[Signup] Showing field error in banner")
        }
      } else {
        Alert.alert(title, message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Join BrainStorm</Text>
              <Text style={styles.subtitle}>Connect with like-minded creators and build amazing projects together</Text>
            </View>

            {generalError && (
              <View style={styles.generalErrorBanner}>
                <Text style={styles.generalErrorTitle}>{generalError.title}</Text>
                <Text style={styles.generalErrorMessage}>{generalError.message}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Username Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username *</Text>
                <TextInput
                  style={[styles.input, fieldErrors.username && styles.inputError]}
                  placeholder="Choose a unique username"
                  placeholderTextColor="#6B7280"
                  value={form.username}
                  onChangeText={(text) => handleChange("username", text)}
                  onBlur={() => handleFieldBlur("username")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {fieldErrors.username && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>{fieldErrors.username}</Text>
                  </View>
                )}
                <Text style={styles.helperText}>3-20 characters, letters, numbers, and underscores only</Text>
              </View>

              {/* Full Name Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={[styles.input, fieldErrors.name && styles.inputError]}
                  placeholder="Your full name"
                  placeholderTextColor="#6B7280"
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                  onBlur={() => handleFieldBlur("name")}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {fieldErrors.name && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>{fieldErrors.name}</Text>
                  </View>
                )}
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={[styles.input, fieldErrors.email && styles.inputError]}
                  placeholder="your@email.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => handleChange("email", text)}
                  onBlur={() => handleFieldBlur("email")}
                  editable={!loading}
                />
                {fieldErrors.email && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>{fieldErrors.email}</Text>
                  </View>
                )}
              </View>

              {/* Bio Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bio (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, fieldErrors.bio && styles.inputError]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#6B7280"
                  value={form.bio}
                  onChangeText={(text) => handleChange("bio", text)}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  editable={!loading}
                />
                <Text style={styles.charCount}>{form.bio.length}/200</Text>
              </View>

              {/* Skills Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Skills (Optional)</Text>
                <TextInput
                  style={[styles.input, fieldErrors.skills && styles.inputError]}
                  placeholder="React, Python, Design, Gaming, etc."
                  placeholderTextColor="#6B7280"
                  value={form.skills}
                  onChangeText={(text) => handleChange("skills", text)}
                  editable={!loading}
                />
                <Text style={styles.helperText}>Separate with commas</Text>
              </View>

              {/* Interests Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Interests (Optional)</Text>
                <TextInput
                  style={[styles.input, fieldErrors.interests && styles.inputError]}
                  placeholder="Web Development, AI Research, Mobile Games, etc."
                  placeholderTextColor="#6B7280"
                  value={form.interests}
                  onChangeText={(text) => handleChange("interests", text)}
                  editable={!loading}
                />
                <Text style={styles.helperText}>Separate with commas</Text>
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, fieldErrors.password && styles.inputError]}
                    placeholder="At least 6 characters"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(text) => handleChange("password", text)}
                    onBlur={() => handleFieldBlur("password")}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                    disabled={loading}
                  >
                    <Text style={styles.eyeIconText}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {fieldErrors.password && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>{fieldErrors.password}</Text>
                  </View>
                )}
                <Text style={styles.helperText}>Use a strong password with at least 6 characters</Text>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, fieldErrors.confirmPassword && styles.inputError]}
                    placeholder="Repeat your password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showConfirmPassword}
                    value={form.confirmPassword}
                    onChangeText={(text) => handleChange("confirmPassword", text)}
                    onBlur={() => handleFieldBlur("confirmPassword")}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={toggleConfirmPasswordVisibility}
                    disabled={loading}
                  >
                    <Text style={styles.eyeIconText}>
                      {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {fieldErrors.confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠</Text>
                    <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
                  <Text style={[styles.loginLink, loading && styles.loginLinkDisabled]}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  formContainer: {
    borderRadius: 24,
    padding: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    marginTop: 16,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
  },
  generalErrorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  generalErrorTitle: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  generalErrorMessage: {
    color: "#FCA5A5",
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "rgba(31, 41, 55, 0.8)",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B5563",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    paddingRight: 50, // Space for the eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  errorIcon: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 2,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  helperText: {
    color: "#6B7280",
    fontSize: 12,
    fontStyle: "italic",
  },
  charCount: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "right",
  },
  signupButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: "#374151",
    shadowOpacity: 0,
  },
  signupButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  loginLink: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginLinkDisabled: {
    opacity: 0.5,
  },
})

export default Signup