<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] px-4 py-8 box-border font-['Inter'] flex justify-center items-start">
    <div
      v-if="animal"
      class="w-full max-w-4xl bg-white rounded-3xl px-6 py-6 box-border"
    >
      <button
        class="border-none bg-transparent text-sm text-gray-600 mb-4 cursor-pointer"
        @click="router.back()"
      >
        ← Назад к списку
      </button>

      <div class="bg-gray-50 rounded-2xl px-5 py-5 mb-4">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-4">
            <div class="w-18 h-18 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
              <span>{{ getAnimalEmoji(animal.species) }}</span>
            </div>
            <div>
              <h1 class="m-0 text-2xl font-bold text-gray-900">
                {{ animal.name }}
              </h1>
              <p class="mt-1 text-sm text-gray-600">
                {{ animal.species }} • {{ animal.breed || 'Порода не указана' }}
              </p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
            {{ getStatusText(animal.status) }}
          </span>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div>
            <h2 class="text-base font-semibold mb-3 text-gray-900">
              Информация о животном
            </h2>
            <dl class="m-0">
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Пол:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ getGenderText(animal.gender) }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Дата рождения:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ formatDate(animal.birth_date) || 'Не указана' }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Возраст:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.age_years || 'Не рассчитан' }} лет
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Окрас:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.color || 'Не указан' }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Номер чипа:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.microchip_number || 'Не указан' }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Паспорт:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.passport_number || 'Не указан' }}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 class="text-base font-semibold mb-3 text-gray-900">
              Информация о владельце
            </h2>
            <dl class="m-0">
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  ФИО:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.owner_name }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Телефон:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.owner_phone }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Email:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.owner_email || 'Не указан' }}
                </dd>
              </div>
              <div class="flex mb-1.5 text-sm">
                <dt class="w-28 text-gray-500">
                  Адрес:
                </dt>
                <dd class="m-0 text-gray-900">
                  {{ animal.owner_address || 'Не указан' }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-2xl px-5 py-4 mb-4">
        <h2 class="text-base font-semibold mb-3 text-gray-900">
          Медицинская информация
        </h2>
        <div class="space-y-3 text-sm text-gray-900">
          <div>
            <h3 class="m-0 mb-1 text-sm font-semibold text-gray-700">
              Аллергии
            </h3>
            <p class="m-0">
              {{ animal.allergies || 'Не указаны' }}
            </p>
          </div>
          <div>
            <h3 class="m-0 mb-1 text-sm font-semibold text-gray-700">
              Хронические заболевания
            </h3>
            <p class="m-0">
              {{ animal.chronic_diseases || 'Не указаны' }}
            </p>
          </div>
          <div>
            <h3 class="m-0 mb-1 text-sm font-semibold text-gray-700">
              Особые заметки
            </h3>
            <p class="m-0">
              {{ animal.special_notes || 'Нет' }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-2xl px-5 py-4 mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-base font-semibold text-gray-900">
            История визитов
          </h2>
          <button
            v-if="userStore.canEdit"
            class="border-none bg-transparent text-sm font-medium text-blue-600 cursor-pointer"
          >
            + Добавить визит
          </button>
        </div>

        <div
          v-if="animal.visits?.length > 0"
          class="flex flex-col gap-3"
        >
          <div
            v-for="visit in animal.visits"
            :key="visit.id"
            class="pl-3 border-l-4 border-blue-500 text-sm"
          >
            <div class="flex justify-between">
              <p class="m-0 font-semibold text-gray-900">
                {{ formatDate(visit.visit_date) }}
              </p>
              <p class="m-0 text-gray-500">
                {{ visit.visit_type || 'Обычный прием' }}
              </p>
            </div>
            <p class="m-0 mt-1 text-gray-700">
              {{ visit.reason }}
            </p>
            <p class="m-0 mt-0.5 text-gray-400">
              {{ visit.diagnosis }}
            </p>
          </div>
        </div>

        <p
          v-else
          class="m-0 mt-2 text-center text-sm text-gray-500"
        >
          Нет записей о визитах
        </p>
      </div>

      <div
        v-if="userStore.canEdit"
        class="mt-4 flex justify-end gap-3"
      >
        <button
          class="rounded-full px-4 py-2 text-sm font-medium bg-blue-500 text-white border-none cursor-pointer"
          @click="router.push(`/animals/${animal.id}/edit`)"
        >
          Редактировать
        </button>
        <button
          class="rounded-full px-4 py-2 text-sm font-medium bg-red-500 text-white border-none cursor-pointer"
          @click="handleDelete"
        >
          Удалить
        </button>
      </div>
    </div>

    <div
      v-else
      class="w-full max-w-4xl bg-white rounded-3xl px-6 py-12 text-center text-gray-600"
    >
      Животное не найдено
    </div>

    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-2xl px-6 py-6 max-w-sm box-border">
        <h3 class="m-0 mb-2 text-lg font-semibold">
          Подтверждение удаления
        </h3>
        <p class="m-0 mb-4 text-sm text-gray-600">
          Вы уверены, что хотите удалить карточку животного? Это действие нельзя отменить.
        </p>
        <div class="flex justify-end gap-2">
          <button
            class="rounded-full px-4 py-2 text-sm font-medium bg-gray-200 text-gray-900 border-none cursor-pointer"
            @click="showDeleteModal = false"
          >
            Отмена
          </button>
          <button
            class="rounded-full px-4 py-2 text-sm font-medium bg-red-500 text-white border-none cursor-pointer"
            @click="confirmDelete"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useAnimalsStore } from '../stores/animalsStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const animalsStore = useAnimalsStore()

const animal = ref(null)
const showDeleteModal = ref(false)

onMounted(async () => {
  const id = parseInt(route.params.id)
  let found = animalsStore.getAnimalById(id)
  if (!found) {
    found = await animalsStore.fetchAnimalById(id)
  }
  animal.value = found
})

const statusClasses = computed(() => {
  if (!animal.value) return ''
  const classes = {
    active: 'bg-green-100 text-green-800',
    treatment: 'bg-yellow-100 text-yellow-800',
    healthy: 'bg-blue-100 text-blue-800',
    observation: 'bg-purple-100 text-purple-800',
    critical: 'bg-red-100 text-red-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  return classes[animal.value.status] || classes.active
})

const getAnimalEmoji = (species) => {
  const emojis = {
    dog: '🐕',
    cat: '🐈',
    bird: '🐦',
    rabbit: '🐇',
    hamster: '🐹',
    fish: '🐠',
    reptile: '🦎'
  }
  return emojis[species?.toLowerCase()] || '🐾'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активен',
    treatment: 'На лечении',
    healthy: 'Здоров',
    observation: 'Наблюдение',
    critical: 'Критическое',
    inactive: 'Неактивен'
  }
  return texts[status] || status
}

const getGenderText = (gender) => {
  const texts = {
    male: 'Мужской',
    female: 'Женский',
    unknown: 'Не указан'
  }
  return texts[gender] || 'Не указан'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

const handleDelete = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (animal.value) {
    const ok = await animalsStore.deleteAnimal(animal.value.id)
    if (ok) {
      router.push('/')
    }
  }
}
</script>