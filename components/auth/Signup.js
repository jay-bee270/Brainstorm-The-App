import React, { useState } from "react"
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
import { useTheme } from '../../context/ThemeContext'; // Import useTheme
import { authAPI, saveUserData } from "../../services/api"

const ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: "This email is already registered. Please use a different email or log in.",
  EMAIL_IN_USE: "This email is already in use. Please try another email address.",
  USERNAME_ALREADY_EXISTS: "This username is already taken. Please choose a different username.",
  USERNAME_IN_USE: "Someone already has this username. Try another.",
  ACCOUNT_EXISTS: "An account with these credentials already exists. Please log in.",
  PASSWORDS_NOT_MATCHING: "Passwords do not match. Please ensure both password fields are identical.",
  PASSWORD_TOO_WEAK: "Password must be at least 6 characters.",
  INVALID_EMAIL: "Please enter a valid email address (example: user@example.com).",
  USERNAME_TOO_SHORT: "Username must be at least 3 characters long.",
  USERNAME_INVALID_FORMAT: "Username can only contain letters, numbers, and underscores.",
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "The request took too long. Please try again.",
  SERVER_ERROR: "An error occurred on the server. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
}

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
  const { colors } = useTheme(); // Get theme colors
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

  // Helper function to apply errors to specific fields
  const applyErrorToField = (field, errorMsg, fieldErrors) => {
    const errorLower = String(errorMsg).toLowerCase()

    if (field === "email" || field === "email_address" || field.includes("email")) {
      if (
        errorLower.includes("already") ||
        errorLower.includes("in use") ||
        errorLower.includes("exists") ||
        errorLower.includes("registered") ||
        errorLower.includes("taken")
      ) {
        fieldErrors.email = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      } else if (errorLower.includes("valid") || errorLower.includes("invalid")) {
        fieldErrors.email = ERROR_MESSAGES.INVALID_EMAIL
      } else {
        fieldErrors.email = errorMsg
      }
    } else if (field === "username" || field === "user_name" || field.includes("username")) {
      if (
        errorLower.includes("already") ||
        errorLower.includes("taken") ||
        errorLower.includes("in use") ||
        errorLower.includes("exists")
      ) {
        fieldErrors.username = ERROR_MESSAGES.USERNAME_ALREADY_EXISTS
      } else if (errorLower.includes("at least 3") || errorLower.includes("3 characters")) {
        fieldErrors.username = ERROR_MESSAGES.USERNAME_TOO_SHORT
      } else if (errorLower.includes("format") || errorLower.includes("invalid")) {
        fieldErrors.username = ERROR_MESSAGES.USERNAME_INVALID_FORMAT
      } else {
        fieldErrors.username = errorMsg
      }
    } else if (field === "password") {
      if (errorLower.includes("at least") || errorLower.includes("weak") || errorLower.includes("short")) {
        fieldErrors.password = ERROR_MESSAGES.PASSWORD_TOO_WEAK
      } else if (errorLower.includes("match")) {
        fieldErrors.confirmPassword = ERROR_MESSAGES.PASSWORDS_NOT_MATCHING
      } else {
        fieldErrors.password = errorMsg
      }
    } else if (field === "confirm_password" || field === "confirmPassword" || field === "password_confirmation" || field.includes("confirm")) {
      if (errorLower.includes("match")) {
        fieldErrors.confirmPassword = ERROR_MESSAGES.PASSWORDS_NOT_MATCHING
      } else {
        fieldErrors.confirmPassword = errorMsg
      }
    } else if (field === "name" || field === "full_name" || field.includes("name")) {
      fieldErrors.name = errorMsg
    } else {
      // For unknown fields, still show the error
      fieldErrors[field] = errorMsg
    }
  }

  const generateErrorMessagesFromResponse = (error) => {
    const fieldErrors = {}
    const serverData = error.response?.data || {}
    const status = error.response?.status

    console.log("[Signup] Server error response:", { 
      status, 
      data: serverData,
      message: serverData.message 
    })

    // Handle 400 Bad Request (your backend uses this for both validation and duplicate checks)
    if (status === 400) {
      const message = serverData.message || ''
      const messageLower = message.toLowerCase()

      console.log("[Signup] 400 error message:", message)

      // Check for email/username duplicate errors
      if (messageLower.includes('email already in use') || messageLower.includes('email already exists')) {
        fieldErrors.email = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
        return fieldErrors
      }
      
      if (messageLower.includes('username already taken') || messageLower.includes('username already exists')) {
        fieldErrors.username = ERROR_MESSAGES.USERNAME_ALREADY_EXISTS
        return fieldErrors
      }

      // Check for missing fields
      if (messageLower.includes('please provide username, email, and password')) {
        if (!form.username.trim()) {
          fieldErrors.username = VALIDATION_RULES.username.messages.required
        }
        if (!form.email.trim()) {
          fieldErrors.email = VALIDATION_RULES.email.messages.required
        }
        if (!form.password.trim()) {
          fieldErrors.password = VALIDATION_RULES.password.messages.required
        }
        return fieldErrors
      }

      // Check for validation errors from mongoose or other middleware
      if (serverData.errors) {
        Object.entries(serverData.errors).forEach(([field, errorObj]) => {
          const errorMsg = errorObj.message || ''
          const errorLower = errorMsg.toLowerCase()

          if (field === 'email') {
            if (errorLower.includes('already') || errorLower.includes('unique')) {
              fieldErrors.email = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
            } else if (errorLower.includes('valid')) {
              fieldErrors.email = ERROR_MESSAGES.INVALID_EMAIL
            }
          } else if (field === 'username') {
            if (errorLower.includes('already') || errorLower.includes('unique') || errorLower.includes('taken')) {
              fieldErrors.username = ERROR_MESSAGES.USERNAME_ALREADY_EXISTS
            }
          }
        })
      }

      // If we still don't have specific field errors, use the general message
      if (Object.keys(fieldErrors).length === 0 && message) {
        // Try to map the general message to a specific field
        if (messageLower.includes('email')) {
          fieldErrors.email = message
        } else if (messageLower.includes('username')) {
          fieldErrors.username = message
        } else if (messageLower.includes('password')) {
          fieldErrors.password = message
        }
      }

      return fieldErrors
    }

    // Handle 401 Unauthorized (login errors)
    if (status === 401) {
      const message = serverData.message || ''
      if (message.toLowerCase().includes('invalid email or password')) {
        fieldErrors.email = "Invalid email or password"
        fieldErrors.password = "Invalid email or password"
      }
      return fieldErrors
    }

    // Handle 409 Conflict status (email/username already exists)
    if (status === 409) {
      const message = (serverData.message || "").toLowerCase()
      if (message.includes("email")) {
        fieldErrors.email = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      } else if (message.includes("username")) {
        fieldErrors.username = ERROR_MESSAGES.USERNAME_ALREADY_EXISTS
      } else {
        fieldErrors.email = ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
      }
      return fieldErrors
    }

    return fieldErrors
  }

  const getGeneralErrorMessage = (error, fieldErrors) => {
    const status = error.response?.status
    const serverData = error.response?.data || {}

    console.log("[Signup] General error analysis:", {
      status,
      fieldErrorsCount: Object.keys(fieldErrors).length,
      serverMessage: serverData.message
    })

    // If we have field-specific errors, don't show a general error
    if (Object.keys(fieldErrors).length > 0) {
      return null
    }

    if (!error.response) {
      return {
        title: "Connection Error",
        message: ERROR_MESSAGES.NETWORK_ERROR,
      }
    }

    if (error.code === "ECONNABORTED") {
      return {
        title: "Request Timeout",
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
      }
    }

    if (status >= 500) {
      return {
        title: "Server Error",
        message: ERROR_MESSAGES.SERVER_ERROR,
      }
    }

    // For 400 errors without field-specific handling, show the server message
    if (status === 400 && serverData.message) {
      return {
        title: "Registration Error",
        message: serverData.message,
      }
    }

    // Final fallback
    return {
      title: "Registration Error",
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
    }
  }

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })

    if (touchedFields[name]) {
      validateField(name, value)
    }

    if (generalError) {
      setGeneralError(null)
    }

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
      console.log("[Signup] Full error object:", JSON.stringify(error, null, 2))

      const fieldErrorsFromResponse = generateErrorMessagesFromResponse(error)
      const generalErrorMessage = getGeneralErrorMessage(error, fieldErrorsFromResponse)

      console.log("[Signup] Generated field errors:", fieldErrorsFromResponse)
      console.log("[Signup] General error:", generalErrorMessage)

      // Always set field errors if we have them
      if (Object.keys(fieldErrorsFromResponse).length > 0) {
        setFieldErrors(fieldErrorsFromResponse)
      }

      // Only show alert for general errors (no field-specific errors)
      if (generalErrorMessage && Object.keys(fieldErrorsFromResponse).length === 0) {
        setGeneralError(generalErrorMessage)
        Alert.alert(generalErrorMessage.title, generalErrorMessage.message)
      } else if (Object.keys(fieldErrorsFromResponse).length > 0) {
        // If we have field errors, clear any previous general error
        setGeneralError(null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.primary }]}>Join BrainStorm</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connect with like-minded creators and build amazing projects together</Text>
            </View>

            {generalError && (
              <View style={[
                styles.generalErrorBanner, 
                { 
                  backgroundColor: `${colors.error}20`,
                  borderLeftColor: colors.error 
                }
              ]}>
                <Text style={[styles.generalErrorTitle, { color: colors.error }]}>{generalError.title}</Text>
                <Text style={[styles.generalErrorMessage, { color: colors.error }]}>{generalError.message}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Username Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Username *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.username && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="Choose a unique username"
                  placeholderTextColor={colors.textSecondary}
                  value={form.username}
                  onChangeText={(text) => handleChange("username", text)}
                  onBlur={() => handleFieldBlur("username")}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {fieldErrors.username && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{fieldErrors.username}</Text>
                  </View>
                )}
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>3-20 characters, letters, numbers, and underscores only</Text>
              </View>

              {/* Full Name Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Full Name *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.name && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="Your full name"
                  placeholderTextColor={colors.textSecondary}
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                  onBlur={() => handleFieldBlur("name")}
                  autoCapitalize="words"
                  editable={!loading}
                />
                {fieldErrors.name && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{fieldErrors.name}</Text>
                  </View>
                )}
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Email *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.email && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(text) => handleChange("email", text)}
                  onBlur={() => handleFieldBlur("email")}
                  editable={!loading}
                />
                {fieldErrors.email && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{fieldErrors.email}</Text>
                  </View>
                )}
              </View>

              {/* Bio Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Bio (Optional)</Text>
                <TextInput
                  style={[
                    styles.input, 
                    styles.textArea,
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.bio && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.textSecondary}
                  value={form.bio}
                  onChangeText={(text) => handleChange("bio", text)}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  editable={!loading}
                />
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>{form.bio.length}/200</Text>
              </View>

              {/* Skills Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Skills (Optional)</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.skills && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="React, Python, Design, Gaming, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={form.skills}
                  onChangeText={(text) => handleChange("skills", text)}
                  editable={!loading}
                />
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Separate with commas</Text>
              </View>

              {/* Interests Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Interests (Optional)</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.interests && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="Web Development, AI Research, Mobile Games, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={form.interests}
                  onChangeText={(text) => handleChange("interests", text)}
                  editable={!loading}
                />
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Separate with commas</Text>
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Password *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.password && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={form.password}
                  onChangeText={(text) => handleChange("password", text)}
                  onBlur={() => handleFieldBlur("password")}
                  editable={!loading}
                />
                {fieldErrors.password && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{fieldErrors.password}</Text>
                  </View>
                )}
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Use a strong password with at least 6 characters</Text>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Confirm Password *</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    fieldErrors.confirmPassword && [
                      styles.inputError,
                      { 
                        borderColor: colors.error,
                        backgroundColor: `${colors.error}10`
                      }
                    ]
                  ]}
                  placeholder="Repeat your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={form.confirmPassword}
                  onChangeText={(text) => handleChange("confirmPassword", text)}
                  onBlur={() => handleFieldBlur("confirmPassword")}
                  editable={!loading}
                />
                {fieldErrors.confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{fieldErrors.confirmPassword}</Text>
                  </View>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton, 
                  { backgroundColor: colors.primary },
                  loading && [
                    styles.signupButtonDisabled,
                    { backgroundColor: colors.border }
                  ]
                ]}
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
                <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
                  <Text style={[
                    styles.loginLink, 
                    { color: colors.primary },
                    loading && styles.loginLinkDisabled
                  ]}>Log in</Text>
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
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
  },
  generalErrorBanner: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  generalErrorTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  generalErrorMessage: {
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
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputError: {
    // Styles applied dynamically
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
    fontSize: 14,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  helperText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
  },
  signupButton: {
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
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginLinkDisabled: {
    opacity: 0.5,
  },
})

export default Signup