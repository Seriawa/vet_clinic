<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] flex items-center justify-center font-['Inter']">
    <div class="w-full max-w-2xl bg-white/95 rounded-3xl px-8 py-10 box-border">
      <h1 class="text-3xl font-bold text-[#0E1E20] text-center mb-3">
        Календарь записей
      </h1>

      <div class="flex gap-3 mt-4 mb-2 items-end">
        <div class="flex flex-col text-sm text-gray-700">
          <label class="mb-1">С</label>
          <input
            type="date"
            v-model="from"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div class="flex flex-col text-sm text-gray-700">
          <label class="mb-1">По</label>
          <input
            type="date"
            v-model="to"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          class="ml-auto inline-flex items-center justify-center rounded-full bg-[#0E1E20] text-white px-4 py-2 text-sm font-medium"
          @click="load"
        >
          Обновить
        </button>
      </div>

      <div
        v-if="calendarStore.isLoading"
        class="text-lg text-center text-gray-600"
      >
        Загрузка...
      </div>
      <div
        v-else-if="calendarStore.error"
        class="mt-2 text-center text-sm text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-2"
      >
        {{ calendarStore.error }}
      </div>

      <div v-else>
        <div
          v-if="!calendarStore.items.length"
          class="text-lg text-center text-gray-600 mt-2"
        >
          Нет визитов в выбранном диапазоне
        </div>

        <ul
          v-else
          class="mt-4 space-y-2"
        >
          <li
            v-for="item in calendarStore.items"
            :key="item.id"
            class="bg-gray-100 rounded-xl px-4 py-3"
          >
            <div class="flex justify-between font-medium">
              <span class="text-gray-900">
                {{ formatDate(item.visit_date) }}
              </span>
              <span class="text-xs uppercase tracking-wide text-gray-600">
                {{ item.status || 'planned' }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1 flex gap-1">
              <span>{{ item.animal_name || 'Без животного' }}</span>
              <span v-if="item.animal_species">• {{ item.animal_species }}</span>
            </div>
            <p class="text-sm text-gray-700 mt-1">
              {{ item.reason }}
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCalendarStore } from '../stores/calendarStore'

const calendarStore = useCalendarStore()

const from = ref('')
const to = ref('')

const load = () => {
  calendarStore.fetchForRange(from.value || null, to.value || null)
}

onMounted(() => {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  from.value = start.toISOString().slice(0, 10)
  to.value = end.toISOString().slice(0, 10)
  load()
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('ru-RU')
}
</script>