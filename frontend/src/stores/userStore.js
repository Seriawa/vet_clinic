import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!currentUser.value && !!token.value)
  const userRole = computed(() => currentUser.value?.role || null)
  const canEdit = computed(() => currentUser.value?.role === 'admin')

  const setAuthData = (newToken, user) => {
    token.value = newToken
    currentUser.value = user
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const withAuthHeaders = () => {
    return token.value
      ? { Authorization: `Bearer ${token.value}` }
      : {}
  }

  const login = async (email, password) => {
    isLoading.value = true
    error.value = ''
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      if (res.data?.success) {
        setAuthData(res.data.token, res.data.user)
        return true
      }
      error.value = res.data?.message || 'Ошибка авторизации'
      return false
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка соединения с сервером'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (payload) => {
    isLoading.value = true
    error.value = ''
    try {
      const res = await axios.post(`${API_URL}/auth/register`, payload)
      if (res.data?.success) {
        setAuthData(res.data.token, res.data.user)
        return true
      }
      error.value = res.data?.message || 'Ошибка регистрации'
      return false
    } catch (e) {
      error.value = e.response?.data?.message || 'Ошибка соединения с сервером'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const fetchMe = async () => {
    if (!token.value || currentUser.value) return
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: withAuthHeaders(),
      })
      if (res.data?.success) {
        currentUser.value = res.data.user
      } else {
        setAuthData(null, null)
      }
    } catch {
      setAuthData(null, null)
    }
  }

  const logout = () => {
    setAuthData(null, null)
  }

  return {
    currentUser,
    token,
    isLoading,
    error,
    isAuthenticated,
    userRole,
    canEdit,
    login,
    register,
    fetchMe,
    logout,
    withAuthHeaders,
  }
})