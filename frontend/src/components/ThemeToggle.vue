<!-- src/components/ThemeToggle.vue -->
<template>
  <button
    @click="toggleTheme"
    class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 
           hover:shadow-lg transition-all duration-500 transform hover:scale-110 active:scale-95
           group overflow-hidden"
    :aria-label="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
    
    <div class="relative flex items-center justify-center">
      <svg
        v-show="!isDark"
        class="w-6 h-6 text-yellow-500 animate-spin-slow"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM7.758 6.697a.75.75 0 001.061-1.06l-1.591-1.59a.75.75 0 00-1.06 1.06l1.59 1.59z" />
      </svg>

      <svg
        v-show="isDark"
        class="w-6 h-6 text-indigo-400 animate-pulse"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
    </div>
    
    <span class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 
                 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()
const isDark = computed(() => themeStore.isDark)

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>