<template>
  <div class="card group" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    
    <div class="p-6 relative">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div class="relative w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <span class="text-3xl filter drop-shadow-lg">{{ getSpeciesEmoji(animal.species) }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {{ animal.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ getSpeciesName(animal.species) }} • {{ animal.breed || 'Не указана' }}
            </p>
          </div>
        </div>
        
        <div class="relative">
          <div class="absolute inset-0 bg-current rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity"
               :class="statusColor"></div>
          <span class="status-badge relative" :class="statusClasses">
            {{ getStatusText(animal.status) }}
          </span>
        </div>
      </div>
      
      <div class="space-y-3 text-sm mt-4">
        <div class="flex items-center text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform duration-300">
          <svg class="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="font-medium">{{ animal.owner_name }}</span>
        </div>
        <div class="flex items-center text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform duration-300 delay-75">
          <svg class="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span class="font-medium">{{ animal.owner_phone }}</span>
        </div>
        <div class="flex items-center text-gray-600 dark:text-gray-400 group-hover:translate-x-2 transition-transform duration-300 delay-150">
          <svg class="w-4 h-4 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="font-medium">{{ animal.last_visit || 'Нет визитов' }}</span>
        </div>
      </div>
      
      <div class="my-4 border-t border-gray-200 dark:border-gray-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      
      <div class="flex justify-end space-x-2">
        <router-link
          :to="`/animals/${animal.id}`"
          class="relative px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 
                 hover:text-primary-800 dark:hover:text-primary-300 
                 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 
                 after:bg-gradient-to-r after:from-primary-600 after:to-primary-400
                 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300
                 transform hover:scale-105 transition-transform"
        >
          Подробнее
        </router-link>
        
        <button
          v-if="userStore.canEdit"
          @click="$emit('edit', animal)"
          class="relative p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300
                 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300
                 transform hover:scale-110 hover:rotate-12"
          title="Редактировать"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <button
          v-if="userStore.canEdit"
          @click="$emit('delete', animal.id)"
          class="relative p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300
                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300
                 transform hover:scale-110 hover:-rotate-12"
          title="Удалить"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary-600 to-primary-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../stores/userStore'
import { getSpeciesName, getStatusText, getSpeciesEmoji } from '../utils/animalLabels'

const props = defineProps({
  animal: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const isHovered = ref(false)
const userStore = useUserStore()

const statusClasses = computed(() => {
  const classes = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700',
    treatment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700',
    healthy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-700',
    observation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-700',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
  }
  return classes[props.animal.status] || classes.active
})

const statusColor = computed(() => {
  const colors = {
    active: 'text-green-500',
    treatment: 'text-yellow-500',
    healthy: 'text-blue-500',
    observation: 'text-purple-500',
    critical: 'text-red-500',
    inactive: 'text-gray-500'
  }
  return colors[props.animal.status] || colors.active
})
</script>