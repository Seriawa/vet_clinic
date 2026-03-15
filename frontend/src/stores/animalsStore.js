import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from './userStore'

const API_URL = 'http://localhost:3000/api'

export const useAnimalsStore = defineStore('animals', () => {
  const animals = ref([])
  const isLoading = ref(false)
  const error = ref('')

  const userStore = useUserStore()

  const fetchAnimals = async () => {
    isLoading.value = true
    error.value = ''
    try {
      const res = await axios.get(`${API_URL}/animals`, {
        headers: userStore.withAuthHeaders()
      })
      animals.value = res.data?.data || []
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить список животных'
    } finally {
      isLoading.value = false
    }
  }

  const fetchAnimalById = async (id) => {
    error.value = ''
    try {
      const res = await axios.get(`${API_URL}/animals/${id}`, {
        headers: userStore.withAuthHeaders()
      })
      const animal = res.data?.data
      if (animal) {
        const index = animals.value.findIndex(a => a.id === animal.id)
        if (index === -1) {
          animals.value.push(animal)
        } else {
          animals.value[index] = animal
        }
      }
      return animal
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось загрузить животное'
      return null
    }
  }

  const getAnimalById = (id) => {
    return animals.value.find(a => a.id === id)
  }

  const addAnimal = async (animalData) => {
    error.value = ''
    try {
      const res = await axios.post(`${API_URL}/animals`, animalData, {
        headers: {
          ...userStore.withAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      const created = res.data?.data
      if (created) {
        animals.value.unshift(created)
      }
      return created
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось создать животное'
      return null
    }
  }

  const updateAnimal = async (id, updatedData) => {
    error.value = ''
    try {
      const res = await axios.put(`${API_URL}/animals/${id}`, updatedData, {
        headers: {
          ...userStore.withAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })
      const updated = res.data?.data
      if (updated) {
        const index = animals.value.findIndex(a => a.id === id)
        if (index !== -1) {
          animals.value[index] = updated
        } else {
          animals.value.push(updated)
        }
      }
      return updated
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось обновить животное'
      return null
    }
  }

  const deleteAnimal = async (id) => {
    error.value = ''
    try {
      await axios.delete(`${API_URL}/animals/${id}`, {
        headers: userStore.withAuthHeaders()
      })
      animals.value = animals.value.filter(a => a.id !== id)
      return true
    } catch (e) {
      error.value = e.response?.data?.message || 'Не удалось удалить животное'
      return false
    }
  }

  return {
    animals,
    isLoading,
    error,
    fetchAnimals,
    fetchAnimalById,
    getAnimalById,
    addAnimal,
    updateAnimal,
    deleteAnimal
  }
})