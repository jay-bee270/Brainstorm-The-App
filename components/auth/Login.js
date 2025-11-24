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
import { useTheme } from '../../context/ThemeContext'; // Import useTheme
import { authAPI, saveUserData } from "../../services/api"
import MessageBanner from "../../components/MessageBanner"
import { showAlert, showConfirmation } from "../../utils/alerts"

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please try again.",
  ACCOUNT_NOT_FOUND: "No account found with this email. Please check your email or sign up.",
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT_ERROR: "The request took too long. Please try again.",
  SERVER_ERROR: "An error occurred on the server. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
}

function Login({ navigation }) {
  const { colors } = useTheme(); // Get theme colors
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const generateErrorMessagesFromResponse = (error) => {
    const fieldErrors = {}
    const serverData = error.response?.data || {}
    const status = error.response?.status

    console.log("[Login] Server error response:", { status, data: serverData })

    // Handle authentication errors
    if (status === 401) {
      fieldErrors.general = ERROR_MESSAGES.INVALID_CREDENTIALS
    } else if (status === 404) {
      fieldErrors.general = ERROR_MESSAGES.ACCOUNT_NOT_FOUND
    } else if (status === 400 || status === 422) {
      const errors = serverData.errors || {}
      const message = (serverData.message || "").toLowerCase()

      Object.entries(errors).forEach(([field, errorList]) => {
        const errorMsg = Array.isArray(errorList) ? errorList[0] : errorList
        if (field === "email" || field === "email_address") {
          fieldErrors.email = errorMsg
        } else if (field === "password") {
          fieldErrors.password = errorMsg
        }
      })

      // If no structured errors but we have a message
      if (Object.keys(fieldErrors).length === 0) {
        if (message.includes("invalid") || message.includes("incorrect")) {
          fieldErrors.general = ERROR_MESSAGES.INVALID_CREDENTIALS
        } else if (message.includes("not found") || message.includes("no account")) {
          fieldErrors.general = ERROR_MESSAGES.ACCOUNT_NOT_FOUND
        }
      }
    }

    return fieldErrors
  }

  const getGeneralErrorMessage = (error, fieldErrors) => {
    const status = error.response?.status
    const serverData = error.response?.data || {}

    if (!error.response) {
      return {
        title: "Connection Error",
        message: ERROR_MESSAGES.NETWORK_ERROR,
        type: "error"
      }
    }

    if (error.code === "ECONNABORTED") {
      return {
        title: "Request Timeout",
        message: ERROR_MESSAGES.TIMEOUT_ERROR,
        type: "error"
      }
    }

    if (status >= 500) {
      return {
        title: "Server Error",
        message: ERROR_MESSAGES.SERVER_ERROR,
        type: "error"
      }
    }

    // If we have a general error from field errors
    if (fieldErrors.general) {
      return {
        title: "Login Failed",
        message: fieldErrors.general,
        type: "error"
      }
    }

    // Fallback to server message or generic error
    return {
      title: "Login Error",
      message: serverData.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      type: "error"
    }
  }

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value })
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (errors.general) {
      setErrors({})
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!form.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!form.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (loading) return

    if (!validateForm()) {
      showAlert("Validation Error", "Please fix the errors in the form", "error")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const credentials = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }

      console.log("[Login] Attempting login with:", {
        ...credentials,
        password: "***",
      })

      const response = await authAPI.login(credentials)

      if (response.data) {
        await saveUserData(response.data)

        console.log("[Login] User logged in successfully:", response.data.username)

        showAlert(
          "Welcome Back!",
          `Great to see you again, ${response.data.username}!`,
          "success",
          () => navigation.replace("Dashboard")
        )
      }
    } catch (error) {
      console.error("[Login] Login error:", error)

      const fieldErrorsFromResponse = generateErrorMessagesFromResponse(error)
      const generalErrorMessage = getGeneralErrorMessage(error, fieldErrorsFromResponse)

      console.log("[Login] Generated field errors:", fieldErrorsFromResponse)
      console.log("[Login] General error:", generalErrorMessage)

      if (Object.keys(fieldErrorsFromResponse).length > 0) {
        setErrors(fieldErrorsFromResponse)
      }

      // Show alert for authentication errors
      if (fieldErrorsFromResponse.general) {
        showAlert(generalErrorMessage.title, generalErrorMessage.message, generalErrorMessage.type)
      } else if (Object.keys(fieldErrorsFromResponse).length === 0) {
        showAlert(generalErrorMessage.title, generalErrorMessage.message, generalErrorMessage.type)
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
              <Text style={[styles.title, { color: colors.primary }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue your creative journey</Text>
            </View>

            {/* General Error Banner */}
            {errors.general && (
              <MessageBanner
                type="error"
                title="Login Failed"
                message={errors.general}
                visible={!!errors.general}
                style={styles.messageBanner}
              />
            )}

            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border 
                    },
                    errors.email && [
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
                  editable={!loading}
                />
                {errors.email && (
                  <View style={[
                    styles.errorContainer,
                    { 
                      backgroundColor: `${colors.error}05`,
                      borderLeftColor: colors.error 
                    }
                  ]}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠️</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>
                  </View>
                )}
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.primary }]}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.passwordInput, 
                      { 
                        backgroundColor: colors.inputBackground,
                        color: colors.text,
                        borderColor: colors.border 
                      },
                      errors.password && [
                        styles.inputError,
                        { 
                          borderColor: colors.error,
                          backgroundColor: `${colors.error}10`
                        }
                      ]
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(text) => handleChange("password", text)}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={togglePasswordVisibility}
                    disabled={loading}
                  >
                    <Text style={[styles.eyeIconText, { color: colors.textSecondary }]}>
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <View style={[
                    styles.errorContainer,
                    { 
                      backgroundColor: `${colors.error}05`,
                      borderLeftColor: colors.error 
                    }
                  ]}>
                    <Text style={[styles.errorIcon, { color: colors.error }]}>⚠️</Text>
                    <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
                  </View>
                )}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton, 
                  { backgroundColor: colors.primary },
                  loading && [
                    styles.loginButtonDisabled,
                    { backgroundColor: colors.border }
                  ]
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator color="#000000" size="small" />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Signup Link */}
              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")} disabled={loading}>
                  <Text style={[
                    styles.signupLink, 
                    { color: colors.primary },
                    loading && styles.signupLinkDisabled
                  ]}>Sign up</Text>
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
    lineHeight: 22,
  },
  messageBanner: {
    marginBottom: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
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
    borderWidth: 1,
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
  },
  inputError: {
    // Styles applied dynamically
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  errorIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    fontWeight: "500",
  },
  loginButton: {
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
  loginButtonDisabled: {
    shadowOpacity: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  signupLinkDisabled: {
    opacity: 0.5,
  },
})

export default Login