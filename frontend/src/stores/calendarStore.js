import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './userStore'

const API_URL = 'http://localhost:3000/api'

export const useCalendarStore = defineStore('calendar', () => {
  const items = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const userStore = useUserStore()

  const fetchForRange = async (from, to) => {
    isLoading.value = true
    error.value = ''

    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)

    try {
      const res = await axios.get(`${API_URL}/calendar/visits?${params.toString()}`, {
        headers: userStore.withAuthHeaders()
      })
      items.value = res.data?.data || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить календарь визитов'
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    error,
    fetchForRange
  }
})

