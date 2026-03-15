import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './userStore'

const API_URL = 'http://localhost:3000/api'

export const useStatisticsStore = defineStore('statistics', () => {
  const summary = ref(null)
  const isLoading = ref(false)
  const error = ref('')

  const userStore = useUserStore()

  const fetchSummary = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const res = await axios.get(`${API_URL}/statistics/summary`, {
        headers: userStore.withAuthHeaders()
      })
      summary.value = res.data?.data || null
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить статистику'
    } finally {
      isLoading.value = false
    }
  }

  return {
    summary,
    isLoading,
    error,
    fetchSummary
  }
})

