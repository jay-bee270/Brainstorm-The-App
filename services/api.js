import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create axios instance
const api = axios.create({
  baseURL: "https://brainstorm-r7xb.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.warn("Failed to attach token", error)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(["token", "userId"])
    }
    return Promise.reject(error)
  },
)

export const ERROR_CODES = {
  // Authentication & Registration Errors
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  EMAIL_IN_USE: "EMAIL_IN_USE",
  USERNAME_ALREADY_EXISTS: "USERNAME_ALREADY_EXISTS",
  USERNAME_IN_USE: "USERNAME_IN_USE",
  ACCOUNT_EXISTS: "ACCOUNT_EXISTS",

  // Password Errors
  PASSWORDS_NOT_MATCHING: "PASSWORDS_NOT_MATCHING",
  PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",

  // Email Errors
  INVALID_EMAIL: "INVALID_EMAIL",
  EMAIL_REQUIRED: "EMAIL_REQUIRED",

  // Username Errors
  USERNAME_REQUIRED: "USERNAME_REQUIRED",
  USERNAME_TOO_SHORT: "USERNAME_TOO_SHORT",
  USERNAME_INVALID_FORMAT: "USERNAME_INVALID_FORMAT",

  // General Validation
  FIELD_REQUIRED: "FIELD_REQUIRED",
  INVALID_INPUT: "INVALID_INPUT",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Network/Server Errors
  NETWORK_ERROR: "NETWORK_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
}

export const ERROR_MESSAGES = {
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: {
    title: "Email Already Registered",
    message: "This email address is already associated with an account. Please try logging in instead.",
    field: "email",
  },
  [ERROR_CODES.EMAIL_IN_USE]: {
    title: "Email in Use",
    message: "This email is already registered. Please use a different email or try logging in.",
    field: "email",
  },
  [ERROR_CODES.USERNAME_ALREADY_EXISTS]: {
    title: "Username Taken",
    message: "This username is already taken. Please choose a different username.",
    field: "username",
  },
  [ERROR_CODES.USERNAME_IN_USE]: {
    title: "Username in Use",
    message: "Someone else has already chosen this username. Please try another.",
    field: "username",
  },
  [ERROR_CODES.ACCOUNT_EXISTS]: {
    title: "Account Already Exists",
    message: "An account with these credentials already exists. Please log in to your account.",
    field: null,
  },
  [ERROR_CODES.PASSWORDS_NOT_MATCHING]: {
    title: "Passwords Do Not Match",
    message: "Your passwords do not match. Please ensure both password fields are identical.",
    field: "confirmPassword",
  },
  [ERROR_CODES.PASSWORD_TOO_WEAK]: {
    title: "Password Too Weak",
    message: "Password must be at least 6 characters and contain a mix of letters and numbers.",
    field: "password",
  },
  [ERROR_CODES.PASSWORD_REQUIRED]: {
    title: "Password Required",
    message: "Please enter a password to create your account.",
    field: "password",
  },
  [ERROR_CODES.INVALID_EMAIL]: {
    title: "Invalid Email",
    message: "Please enter a valid email address (example: user@example.com).",
    field: "email",
  },
  [ERROR_CODES.EMAIL_REQUIRED]: {
    title: "Email Required",
    message: "Please provide your email address to continue.",
    field: "email",
  },
  [ERROR_CODES.USERNAME_REQUIRED]: {
    title: "Username Required",
    message: "Please choose a username for your account.",
    field: "username",
  },
  [ERROR_CODES.USERNAME_TOO_SHORT]: {
    title: "Username Too Short",
    message: "Username must be at least 3 characters long.",
    field: "username",
  },
  [ERROR_CODES.USERNAME_INVALID_FORMAT]: {
    title: "Invalid Username",
    message: "Username can only contain letters, numbers, and underscores.",
    field: "username",
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: "Connection Error",
    message: "Unable to connect to the server. Please check your internet connection and try again.",
    field: null,
  },
  [ERROR_CODES.TIMEOUT_ERROR]: {
    title: "Request Timeout",
    message: "The request took too long. Please check your connection and try again.",
    field: null,
  },
  [ERROR_CODES.SERVER_ERROR]: {
    title: "Server Error",
    message: "An error occurred on the server. Please try again later.",
    field: null,
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: "Something Went Wrong",
    message: "An unexpected error occurred. Please try again.",
    field: null,
  },
}

export const parseError = (error) => {
  if (!error) {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      title: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR].title,
      message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR].message,
      fieldErrors: {},
    }
  }

  let errorCode = ERROR_CODES.UNKNOWN_ERROR
  const fieldErrors = {}

  // Network errors
  if (error.code === "ECONNABORTED") {
    errorCode = ERROR_CODES.TIMEOUT_ERROR
  } else if (!error.response) {
    errorCode = ERROR_CODES.NETWORK_ERROR
  } else if (error.response.status >= 500) {
    errorCode = ERROR_CODES.SERVER_ERROR
  } else if (error.response.status === 422 || error.response.status === 400) {
    // Validation errors from server
    const responseData = error.response.data || {}
    const serverMessage = responseData.message || ""
    const serverErrors = responseData.errors || {}

    const messageLower = serverMessage.toLowerCase()

    // Check for email errors
    if (
      messageLower.includes("email") &&
      (messageLower.includes("already") || messageLower.includes("in use") || messageLower.includes("exists"))
    ) {
      errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS
      fieldErrors.email = ERROR_MESSAGES[ERROR_CODES.EMAIL_ALREADY_EXISTS].message
    }
    // Check for username errors
    else if (
      messageLower.includes("username") &&
      (messageLower.includes("already") || messageLower.includes("taken"))
    ) {
      errorCode = ERROR_CODES.USERNAME_ALREADY_EXISTS
      fieldErrors.username = ERROR_MESSAGES[ERROR_CODES.USERNAME_ALREADY_EXISTS].message
    }
    // Check for password errors
    else if (messageLower.includes("password") && messageLower.includes("at least")) {
      errorCode = ERROR_CODES.PASSWORD_TOO_WEAK
      fieldErrors.password = ERROR_MESSAGES[ERROR_CODES.PASSWORD_TOO_WEAK].message
    }
    // Check for email format errors
    else if (messageLower.includes("valid email")) {
      errorCode = ERROR_CODES.INVALID_EMAIL
      fieldErrors.email = ERROR_MESSAGES[ERROR_CODES.INVALID_EMAIL].message
    }

    if (Object.keys(serverErrors).length > 0) {
      Object.entries(serverErrors).forEach(([field, errors]) => {
        const errorMsg = Array.isArray(errors) ? errors[0] : errors
        const errorLower = String(errorMsg).toLowerCase()

        // Map field-specific errors with better pattern matching
        if (field === "email" || field === "email_address") {
          if (errorLower.includes("already") || errorLower.includes("in use") || errorLower.includes("exists")) {
            fieldErrors.email = ERROR_MESSAGES[ERROR_CODES.EMAIL_ALREADY_EXISTS].message
            errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS
          } else if (errorLower.includes("valid") || errorLower.includes("invalid")) {
            fieldErrors.email = ERROR_MESSAGES[ERROR_CODES.INVALID_EMAIL].message
            errorCode = ERROR_CODES.INVALID_EMAIL
          } else {
            fieldErrors.email = errorMsg
          }
        } else if (field === "username" || field === "user_name") {
          if (errorLower.includes("already") || errorLower.includes("taken") || errorLower.includes("in use")) {
            fieldErrors.username = ERROR_MESSAGES[ERROR_CODES.USERNAME_ALREADY_EXISTS].message
            errorCode = ERROR_CODES.USERNAME_ALREADY_EXISTS
          } else if (errorLower.includes("at least 3") || errorLower.includes("3 characters")) {
            fieldErrors.username = ERROR_MESSAGES[ERROR_CODES.USERNAME_TOO_SHORT].message
            errorCode = ERROR_CODES.USERNAME_TOO_SHORT
          } else {
            fieldErrors.username = errorMsg
          }
        } else if (field === "password") {
          if (errorLower.includes("at least") || errorLower.includes("weak")) {
            fieldErrors.password = ERROR_MESSAGES[ERROR_CODES.PASSWORD_TOO_WEAK].message
            errorCode = ERROR_CODES.PASSWORD_TOO_WEAK
          } else if (errorLower.includes("match") || errorLower.includes("confirm")) {
            fieldErrors.confirmPassword = ERROR_MESSAGES[ERROR_CODES.PASSWORDS_NOT_MATCHING].message
            errorCode = ERROR_CODES.PASSWORDS_NOT_MATCHING
          } else {
            fieldErrors.password = errorMsg
          }
        } else if (field === "confirm_password" || field === "confirmPassword") {
          if (errorLower.includes("match") || errorLower.includes("not")) {
            fieldErrors.confirmPassword = ERROR_MESSAGES[ERROR_CODES.PASSWORDS_NOT_MATCHING].message
            errorCode = ERROR_CODES.PASSWORDS_NOT_MATCHING
          } else {
            fieldErrors.confirmPassword = errorMsg
          }
        } else if (field === "name" || field === "full_name") {
          fieldErrors.name = errorMsg
        } else {
          // Generic field error mapping
          fieldErrors[field] = errorMsg
        }
      })

      if (Object.keys(fieldErrors).length > 0 && errorCode === ERROR_CODES.UNKNOWN_ERROR) {
        errorCode = ERROR_CODES.VALIDATION_ERROR
      }
    }
  } else if (error.response.status === 409) {
    const responseData = error.response.data || {}
    const serverMessage = responseData.message || ""
    const messageLower = serverMessage.toLowerCase()

    if (messageLower.includes("email")) {
      errorCode = ERROR_CODES.EMAIL_ALREADY_EXISTS
      fieldErrors.email = ERROR_MESSAGES[ERROR_CODES.EMAIL_ALREADY_EXISTS].message
    } else if (messageLower.includes("username")) {
      errorCode = ERROR_CODES.USERNAME_ALREADY_EXISTS
      fieldErrors.username = ERROR_MESSAGES[ERROR_CODES.USERNAME_ALREADY_EXISTS].message
    } else {
      errorCode = ERROR_CODES.ACCOUNT_EXISTS
    }
  }

  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  return {
    code: errorCode,
    title: errorInfo.title,
    message: errorInfo.message,
    fieldErrors,
  }
}

export const authAPI = {
  register: (userData) => api.post("/api/users/register", userData),
  login: (credentials) => api.post("/api/users/login", credentials),
  getUser: () => api.get("/api/users/me"),
  updateUser: (userData) => api.put("/api/users/me", userData),
  logout: async () => {
    await AsyncStorage.multiRemove(["token", "userId"])
  },
}

export const postsAPI = {
  getAllPosts: (filters = {}) => api.get("/api/posts", { params: filters }),
  createPost: (postData) => api.post("/api/posts/create", postData),
  getPostsByCategory: (category) => api.get(`/api/posts/category/${category}`),
  getPostsByTag: (tag) => api.get(`/api/posts/tag/${tag}`),
  getPostsByUser: (userId) => api.get(`/api/posts/user/${userId}`),
  getPostById: (id) => api.get(`/api/posts/${id}`),
  updatePost: (id, postData) => api.put(`/api/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/api/posts/${id}`),
  searchPosts: (query) => api.get("/api/posts/search", { params: { q: query } }),
  getGamingPosts: () => api.get("/api/posts/category/gaming"),
  getResearchPosts: () => api.get("/api/posts/category/research"),
  getDevelopmentPosts: () => api.get("/api/posts/category/development"),
  getStats: () => api.get("/api/stats"),
}

export const saveUserData = async (data) => {
  try {
    await AsyncStorage.setItem("token", data.token)
    await AsyncStorage.setItem("userId", data.id)
    await AsyncStorage.setItem("user", JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save user data", error)
  }
}

export const getStoredUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem("user")
    return userJson ? JSON.parse(userJson) : null
  } catch (error) {
    console.error("Failed to load user", error)
    return null
  }
}

export default api
