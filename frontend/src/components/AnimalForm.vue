<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEditing ? 'Редактирование карточки' : 'Новая карточка животного' }}
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Основная информация</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Имя животного *</label>
              <input v-model="form.name" type="text" required class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Вид *</label>
              <select v-model="form.species" required class="input-field">
                <option value="">Выберите вид</option>
                <option v-for="opt in speciesOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Статус питомца</label>
              <select v-model="form.status" class="input-field">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Порода</label>
              <input v-model="form.breed" type="text" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Пол</label>
              <select v-model="form.gender" class="input-field">
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Дата рождения</label>
              <input v-model="form.birth_date" type="date" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Окрас</label>
              <input v-model="form.color" type="text" class="input-field">
            </div>
          </div>
          
          <div class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Информация о владельце</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">ФИО владельца *</label>
              <input v-model="form.owner_name" type="text" required class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Телефон *</label>
              <input v-model="form.owner_phone" type="tel" required class="input-field" placeholder="+7 (999) 123-45-67">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="form.owner_email" type="email" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Адрес</label>
              <textarea v-model="form.owner_address" rows="3" class="input-field"></textarea>
            </div>
          </div>
        </div>
        
        <div class="space-y-4">
          <h3 class="text-lg font-medium text-gray-900">Медицинская информация</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Номер чипа</label>
              <input v-model="form.microchip_number" type="text" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Номер паспорта</label>
              <input v-model="form.passport_number" type="text" class="input-field">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Аллергии</label>
              <textarea v-model="form.allergies" rows="2" class="input-field"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Хронические заболевания</label>
              <textarea v-model="form.chronic_diseases" rows="2" class="input-field"></textarea>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Особые заметки</label>
          <textarea v-model="form.special_notes" rows="3" class="input-field"></textarea>
        </div>
        
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button type="button" @click="router.back()" class="btn-secondary">
            Отмена
          </button>
          <button type="submit" class="btn-primary">
            {{ isEditing ? 'Сохранить изменения' : 'Создать карточку' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnimalsStore } from '../stores/animalsStore'
import { SPECIES_OPTIONS, STATUS_OPTIONS } from '../utils/animalLabels'

const router = useRouter()
const route = useRoute()
const animalsStore = useAnimalsStore()

const isEditing = computed(() => route.params.id && route.params.id !== 'new')

const speciesOptions = SPECIES_OPTIONS
const statusOptions = STATUS_OPTIONS

const form = ref({
  name: '',
  species: '',
  breed: '',
  gender: '',
  birth_date: '',
  color: '',
  owner_name: '',
  owner_phone: '',
  owner_email: '',
  owner_address: '',
  microchip_number: '',
  passport_number: '',
  allergies: '',
  chronic_diseases: '',
  special_notes: '',
  status: 'active'
})

onMounted(async () => {
  if (isEditing.value) {
    const id = parseInt(route.params.id)
    let animal = animalsStore.getAnimalById(id)
    if (!animal) {
      animal = await animalsStore.fetchAnimalById(id)
    }
    if (animal) {
      const {
        id: _id,
        created_at,
        updated_at,
        created_by,
        updated_by,
        total_visits,
        visits,
        ...rest
      } = animal
      form.value = {
        ...form.value,
        ...rest
      }
    }
  }
})

const handleSubmit = async () => {
  const payload = { ...form.value }

  if (isEditing.value) {
    const ok = await animalsStore.updateAnimal(parseInt(route.params.id), payload)
    if (ok) {
      router.push('/')
    }
  } else {
    const created = await animalsStore.addAnimal(payload)
    if (created) {
      router.push('/')
    }
  }
}
</script>