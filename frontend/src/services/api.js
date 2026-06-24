import axios from 'axios'

// Base URL — in Docker, Nginx proxies /api to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // Bypass ngrok interstitial warning page for API calls
    'ngrok-skip-browser-warning': 'true',
  },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ---- Auth API ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
}

// ---- Products API ----
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ---- Categories API ----
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

// ---- Cart API ----
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),
}

// ---- Orders API ----
export const orderAPI = {
  create: (data)     => api.post('/orders', data),
  getAll: ()         => api.get('/orders'),
  getById: (id)      => api.get(`/orders/${id}`),
  cancel: (id)       => api.post(`/orders/${id}/cancel`),
}

// ---- Admin API ----
export const adminAPI = {
  // Dashboard
  getStats: () => api.get('/admin/stats'),
  // Products (admin — all including inactive)
  getProducts: (params) => api.get('/admin/products', { params }),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  // File Uploads
  uploadSingle: (formData) => api.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/admin/upload-multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// ---- Chat API ----
export const chatAPI = {
  // User side
  getMessages: () => api.get('/chat/messages'),
  sendMessage: (content) => api.post('/chat/messages', { content }),
  
  // Admin side
  getConversationsAdmin: () => api.get('/chat/admin/conversations'),
  getMessagesAdmin: (id) => api.get(`/chat/admin/conversations/${id}/messages`),
  sendMessageAdmin: (id, content) => api.post(`/chat/admin/conversations/${id}/messages`, { content }),
  closeConversationAdmin: (id) => api.put(`/chat/admin/conversations/${id}/close`),
}

export default api;
