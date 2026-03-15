<template>
  <div class="min-h-screen bg-[#7FAF9C]">
    <nav class="bg-[#428B94] border-b-4 border-[#0E1E20]">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-12">
            <router-link to="/" class="flex items-center gap-3 group">
              <span class="text-4xl group-hover:scale-110 transition-transform">🐾</span>
              <span class="text-3xl font-bold text-[#0E1E20]">VetClinic</span>
            </router-link>
            
            <div class="flex gap-8">
              <router-link 
                v-for="item in navItems" 
                :key="item.path"
                :to="item.path"
                class="text-2xl font-semibold text-[#0E1E20] hover:translate-y-[-2px] transition-transform"
                :class="{ 'font-bold underline': $route.path === item.path }"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>
          
          <div class="flex items-center gap-6">
            <span class="text-2xl font-medium text-[#0E1E20]">
              {{ userStore.currentUser?.name }}
            </span>
            <button
              @click="handleLogout"
              class="text-2xl font-semibold text-[#0E1E20] hover:text-[#BB4B3E] transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const navItems = [
  { name: 'Животные', path: '/' },
  { name: 'Календарь', path: '/calendar' },
  { name: 'Статистика', path: '/statistics' },
  { name: 'Визиты', path: '/visits' }
]

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>