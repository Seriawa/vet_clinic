<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] relative overflow-hidden font-['Inter']">
    <div class="relative z-10 px-8 py-8 box-border">
      <div class="flex justify-between items-start mb-10">
        <h1 class="text-[56px] font-extrabold text-[#0E1E20] leading-none">
          Ветклиника
        </h1>
        
        <div class="flex gap-6 items-center">
          <div class="bg-[#428B94] rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[260px] shadow-[0_10px_0_rgba(0,0,0,0.1)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#0E1E20" stroke-width="2"/>
              <path d="M16 16L21 21" stroke="#0E1E20" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              v-model="filters.search"
              placeholder="Поиск..."
              class="bg-transparent border-none outline-none w-full text-[18px] text-[#0E1E20] placeholder:text-[#0E1E20]"
            >
          </div>

          <button 
            v-if="userStore.canEdit"
            @click="router.push('/animals/new')"
            class="bg-[#428B94] rounded-2xl px-6 py-3 text-[18px] font-semibold text-[#0E1E20] shadow-[0_10px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-transform"
          >
            + Добавить
          </button>
        </div>
      </div>

      <div class="flex gap-4 mb-8 ml-24">
        <select v-model="filters.species" class="bg-[#428B94] rounded-2xl px-4 py-2 text-[18px] text-[#0E1E20] min-w-[180px] border-none shadow-[0_8px_0_rgba(0,0,0,0.1)]">
          <option value="">Все виды</option>
          <option v-for="opt in speciesOptions" :key="opt.value" :value="opt.value">
            {{ getSpeciesEmoji(opt.value) }} {{ opt.label }}
          </option>
        </select>
        
        <select v-model="filters.status" class="bg-[#428B94] rounded-2xl px-4 py-2 text-[18px] text-[#0E1E20] min-w-[180px] border-none shadow-[0_8px_0_rgba(0,0,0,0.1)]">
          <option value="">Все статусы</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        
        <button @click="resetFilters" class="bg-[#428B94] rounded-2xl px-6 py-2 text-[18px] font-semibold text-[#0E1E20] border-none shadow-[0_8px_0_rgba(0,0,0,0.1)]">
          Сбросить
        </button>
      </div>

      <div class="ml-24 max-w-3xl">
        <div v-if="filteredAnimals.length > 0" class="flex flex-col gap-4">
          <div
            v-for="animal in filteredAnimals"
            :key="animal.id"
            class="rounded-2xl px-8 py-4 text-[32px] font-semibold text-[#0E1E20] flex items-center justify-between shadow-[0_8px_0_rgba(0,0,0,0.1)] transition-all"
            :class="{
              'bg-[#BB4B3E]': getStatusCardClass(animal.status) === 'error',
              'bg-[#858D3F]': getStatusCardClass(animal.status) === 'success',
              'bg-[#428B94]': !getStatusCardClass(animal.status)
            }"
          >
            <div class="flex items-center gap-6">
              <div class="w-12 h-12 flex items-center justify-center text-[32px]">
                {{ getSpeciesEmoji(animal.species) }}
              </div>
              <span class="text-[32px] font-semibold text-[#0E1E20]">{{ animal.name }}</span>
              <span class="text-[20px] text-[#0E1E20]/70">{{ getSpeciesName(animal.species) }}</span>
            </div>
            
            <div class="flex items-center gap-4">
              <span class="text-[22px] font-medium">{{ getStatusText(animal.status) }}</span>
              
              <div v-if="userStore.canEdit" class="flex gap-2">
                <button @click.stop="router.push(`/animals/${animal.id}/edit`)" class="border-none bg-transparent text-[20px] cursor-pointer hover:scale-110 transition-transform">
                  ✎
                </button>
                <button @click.stop="handleDelete(animal.id)" class="border-none bg-transparent text-[20px] cursor-pointer text-[#BB4B3E] hover:scale-110 transition-transform">
                  ×
                </button>
              </div>
              
              <button @click="router.push(`/animals/${animal.id}`)" class="border-none bg-transparent cursor-pointer hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#0E1E20" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-[#428B94] rounded-2xl px-6 py-6 flex items-center justify-center text-[24px] text-[#0E1E20] shadow-[0_8px_0_rgba(0,0,0,0.1)]">
          Нет животных для отображения
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-[#7FAF9C] rounded-2xl px-8 py-8 max-w-sm border-4 border-[#0E1E20] box-border">
        <h3 class="text-2xl font-bold text-[#0E1E20] mb-3">Подтверждение</h3>
        <p class="text-lg text-[#0E1E20] mb-5">Удалить карточку животного?</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteModal = false" class="bg-[#428B94] rounded-xl px-4 py-2 text-sm font-medium text-[#0E1E20]">
            Отмена
          </button>
          <button @click="confirmDelete" class="bg-[#BB4B3E] rounded-xl px-4 py-2 text-sm font-medium text-white">
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useAnimalsStore } from '../stores/animalsStore'
import { SPECIES_OPTIONS, STATUS_OPTIONS, getSpeciesName, getStatusText, getSpeciesEmoji } from '../utils/animalLabels'

const router = useRouter()
const userStore = useUserStore()
const animalsStore = useAnimalsStore()

const speciesOptions = SPECIES_OPTIONS
const statusOptions = STATUS_OPTIONS

onMounted(() => {
  animalsStore.fetchAnimals()
})

const filters = ref({
  search: '',
  species: '',
  status: ''
})

const selectAll = ref(false)
const showDeleteModal = ref(false)
const animalToDelete = ref(null)

const filteredAnimals = computed(() => {
  return animalsStore.animals.filter(animal => {
    const matchesSearch = !filters.value.search || 
      animal.name.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesSpecies = !filters.value.species || animal.species === filters.value.species
    const matchesStatus = !filters.value.status || animal.status === filters.value.status
    
    return matchesSearch && matchesSpecies && matchesStatus
  })
})

const getStatusCardClass = (status) => {
  switch(status) {
    case 'error':
    case 'treatment':
    case 'critical': return 'error'
    case 'success':
    case 'active':
    case 'healthy': return 'success'
    case 'observation': return 'error'
    case 'inactive': return ''
    default: return ''
  }
}

const toggleSelectAll = () => {
  selectAll.value = !selectAll.value
}

const handleDelete = (id) => {
  animalToDelete.value = id
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (animalToDelete.value) {
    animalsStore.deleteAnimal(animalToDelete.value)
    showDeleteModal.value = false
    animalToDelete.value = null
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    species: '',
    status: ''
  }
}
</script>