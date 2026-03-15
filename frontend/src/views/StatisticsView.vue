<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] flex items-center justify-center font-['Inter']">
    <div class="w-full max-w-2xl bg-white/95 rounded-3xl px-8 py-10 box-border">
      <div class="flex justify-between items-center mb-3">
        <h1 class="text-3xl font-bold text-[#0E1E20]">
          Статистика
        </h1>
        
        <button
          v-if="statisticsStore.summary && !statisticsStore.isLoading"
          @click="exportToCSV"
          class="text-sm font-medium text-white bg-[#0E1E20] hover:bg-[#1a2f33] px-4 py-2 rounded-xl transition-colors"
          :disabled="isExporting"
        >
          {{ isExporting ? 'Экспорт...' : 'Экспорт в CSV' }}
        </button>
      </div>

      <div
        v-if="statisticsStore.isLoading"
        class="text-lg text-center text-gray-600"
      >
        Загрузка...
      </div>

      <div
        v-else-if="statisticsStore.error"
        class="mt-2 text-center text-sm text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-2"
      >
        {{ statisticsStore.error }}
      </div>

      <div
        v-else-if="!statisticsStore.summary"
        class="text-lg text-center text-gray-600"
      >
        Нет данных для отображения
      </div>

      <div
        v-else
        class="mt-6 flex flex-col gap-5"
      >
        <div class="flex gap-4">
          <div class="flex-1 rounded-2xl bg-gray-100 px-4 py-3">
            <p class="m-0 text-xs text-gray-500">
              Всего животных
            </p>
            <p class="m-0 text-2xl font-bold text-gray-900">
              {{ statisticsStore.summary.total_animals }}
            </p>
          </div>
          <div class="flex-1 rounded-2xl bg-gray-100 px-4 py-3">
            <p class="m-0 text-xs text-gray-500">
              Всего визитов
            </p>
            <p class="m-0 text-2xl font-bold text-gray-900">
              {{ statisticsStore.summary.total_visits }}
            </p>
          </div>
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-2">
            Визиты по статусу
          </h2>
          <ul class="list-none p-0 m-0 space-y-1">
            <li
              v-for="item in statisticsStore.summary.visits_by_status"
              :key="item.status"
              class="flex justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
            >
              <span class="text-gray-700">{{ item.status }}</span>
              <span class="font-medium text-gray-900">{{ item.count }}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-2">
            Животные по видам
          </h2>
          <ul class="list-none p-0 m-0 space-y-1">
            <li
              v-for="item in statisticsStore.summary.animals_by_species"
              :key="item.species"
              class="flex justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm"
            >
              <span class="text-gray-700">{{ getSpeciesName(item.species) }}</span>
              <span class="font-medium text-gray-900">{{ item.count }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStatisticsStore } from '../stores/statisticsStore'
import { getSpeciesName, getStatusText } from '../utils/animalLabels'

const statisticsStore = useStatisticsStore()
const isExporting = ref(false)

onMounted(() => {
  statisticsStore.fetchSummary()
})

const exportToCSV = () => {
  if (!statisticsStore.summary) return
  
  isExporting.value = true
  
  try {
    const csvRows = []
    
    csvRows.push('Статистика ветеринарной клиники')
    csvRows.push('')
    
    csvRows.push('Общая статистика')
    csvRows.push(`Всего животных,${statisticsStore.summary.total_animals}`)
    csvRows.push(`Всего визитов,${statisticsStore.summary.total_visits}`)
    csvRows.push('')
    
    csvRows.push('Визиты по статусу')
    csvRows.push('Статус,Количество')
    statisticsStore.summary.visits_by_status.forEach(item => {
      const statusText = getStatusText(item.status) || item.status
      csvRows.push(`"${statusText}",${item.count}`)
    })
    csvRows.push('')
    
    csvRows.push('Животные по видам')
    csvRows.push('Вид,Количество')
    statisticsStore.summary.animals_by_species.forEach(item => {
      const speciesText = getSpeciesName(item.species) || item.species
      csvRows.push(`"${speciesText}",${item.count}`)
    })
    
    csvRows.push('')
    csvRows.push(`Дата генерации,${new Date().toLocaleDateString('ru-RU')}`)
    
    const csvString = csvRows.join('\n')
    
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' }) // \uFEFF для UTF-8 with BOM (поддержка кириллицы)
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `vet_clinic_statistics_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
  } catch (error) {
    console.error('Ошибка при экспорте CSV:', error)
  } finally {
    isExporting.value = false
  }
}
</script>