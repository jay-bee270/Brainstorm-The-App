import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://brainstorm-r7xb.onrender.com';

// Helper function to make API calls
const makeRequest = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const authAPI = {
  register: (userData) => 
    makeRequest('/api/users/register', {
      method: 'POST',
      body: userData,
    }),
  
  login: (credentials) => 
    makeRequest('/api/users/login', {
      method: 'POST',
      body: credentials,
    }),
  
  getUser: () => makeRequest('/api/users/me'),
  
  updateUser: async (userData) => {
    const token = await AsyncStorage.getItem('token');
    return makeRequest('/api/users/me', {
      method: 'PUT',
      body: userData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'userId']);
  }
};

export const postsAPI = {
  getAllPosts: (filters = {}) => 
    makeRequest('/api/posts', {
      method: 'GET',
    }),
  
  createPost: (postData) => 
    makeRequest('/api/posts/create', {
      method: 'POST',
      body: postData,
    }),
  
  getPostsByCategory: (category) => 
    makeRequest(`/api/posts/category/${category}`),
  
  getPostsByTag: (tag) => 
    makeRequest(`/api/posts/tag/${tag}`),
  
  getPostsByUser: (userId) => 
    makeRequest(`/api/posts/user/${userId}`),
  
  getPostById: (id) => 
    makeRequest(`/api/posts/${id}`),
  
  updatePost: (id, postData) => 
    makeRequest(`/api/posts/${id}`, {
      method: 'PUT',
      body: postData,
    }),
  
  deletePost: (id) => 
    makeRequest(`/api/posts/${id}`, {
      method: 'DELETE',
    }),
  
  searchPosts: (query) => 
    makeRequest(`/api/posts/search?q=${encodeURIComponent(query)}`),
  
  getGamingPosts: () => 
    makeRequest('/api/posts/category/gaming'),
  
  getResearchPosts: () => 
    makeRequest('/api/posts/category/research'),
  
  getDevelopmentPosts: () => 
    makeRequest('/api/posts/category/development'),
  
  getStats: () => 
    makeRequest('/api/stats'),
};

export default {
  authAPI,
  postsAPI,
};