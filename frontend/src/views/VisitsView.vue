<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] flex items-center justify-center font-['Inter']">
    <div class="w-full max-w-2xl bg-white/95 rounded-3xl px-8 py-10 box-border">
      <h1 class="text-3xl font-bold text-[#0E1E20] text-center mb-3">
        Визиты
      </h1>

      <div
        v-if="visitsStore.isLoading"
        class="text-lg text-center text-gray-600"
      >
        Загрузка...
      </div>
      <div
        v-else-if="visitsStore.error"
        class="mt-2 text-center text-sm text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-2"
      >
        {{ visitsStore.error }}
      </div>

      <div v-else>
        <div
          v-if="!visitsStore.visits.length"
          class="text-lg text-center text-gray-600 mt-2"
        >
          Нет визитов
        </div>

        <ul
          v-else
          class="mt-6 space-y-3"
        >
          <li
            v-for="visit in visitsStore.visits"
            :key="visit.id"
            class="bg-gray-100 rounded-xl px-4 py-3"
          >
            <div class="flex justify-between font-medium mb-1">
              <span class="text-gray-900">
                {{ formatDate(visit.visit_date) }}
              </span>
              <span class="text-xs uppercase tracking-wide text-gray-600">
                {{ visit.status || 'planned' }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mb-1 flex gap-1">
              <span>{{ visit.animal_name || 'Без животного' }}</span>
              <span v-if="visit.veterinarian_name">• {{ visit.veterinarian_name }}</span>
            </div>
            <p class="text-sm text-gray-700 m-0">
              {{ visit.reason }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useVisitsStore } from '../stores/visitsStore'

const visitsStore = useVisitsStore()

onMounted(() => {
  visitsStore.fetchVisits()
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('ru-RU')
}
</script>