import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './userStore'

const API_URL = 'http://localhost:3000/api'

export const useVisitsStore = defineStore('visits', () => {
  const visits = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const userStore = useUserStore()

  const fetchVisits = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const res = await axios.get(`${API_URL}/visits`, {
        headers: userStore.withAuthHeaders()
      })
      visits.value = res.data?.data || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить визиты'
    } finally {
      isLoading.value = false
    }
  }

  const addVisit = async (payload) => {
    error.value = ''
    try {
      const res = await axios.post(`${API_URL}/visits`, payload, {
        headers: {
          ...userStore.withAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      const created = res.data?.data
      if (created) {
        visits.value.unshift(created)
      }
      return created
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось создать визит'
      return null
    }
  }

  const updateVisit = async (id, payload) => {
    error.value = ''
    try {
      const res = await axios.put(`${API_URL}/visits/${id}`, payload, {
        headers: {
          ...userStore.withAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      const updated = res.data?.data
      if (updated) {
        const index = visits.value.findIndex(v => v.id === id)
        if (index !== -1) {
          visits.value[index] = updated
        } else {
          visits.value.push(updated)
        }
      }
      return updated
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось обновить визит'
      return null
    }
  }

  const deleteVisit = async (id) => {
    error.value = ''
    try {
      await axios.delete(`${API_URL}/visits/${id}`, {
        headers: userStore.withAuthHeaders()
      })
      visits.value = visits.value.filter(v => v.id !== id)
      return true
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось удалить визит'
      return false
    }
  }

  return {
    visits,
    isLoading,
    error,
    fetchVisits,
    addVisit,
    updateVisit,
    deleteVisit
  }
})

