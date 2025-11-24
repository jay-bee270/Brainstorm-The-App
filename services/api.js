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
    // Log the error structure for debugging
    if (error.response) {
      console.log("[Api] Server Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      })
    } else if (error.request) {
      console.log("[Api] No response received:", error.request)
    } else {
      console.log("[Api] Error setting up request:", error.message)
    }

    if (error.response?.status === 401) {
      AsyncStorage.multiRemove(["token", "userId"])
    }
    return Promise.reject(error)
  },
)

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
