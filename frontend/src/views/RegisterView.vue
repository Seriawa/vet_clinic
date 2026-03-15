<template>
  <div class="min-h-screen w-full bg-[#7FAF9C] flex items-center justify-center font-['Inter']">
    <div class="w-full max-w-md px-4">
      <div class="text-center text-white mb-8">
        <h1 class="text-3xl font-bold">
          Регистрация
        </h1>
        <p class="mt-2 text-base text-white/90">
          Создайте аккаунт для доступа к системе
        </p>
      </div>

      <form
        @submit.prevent="handleRegister"
        class="space-y-4"
      >
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Имя"
          class="w-full h-14 rounded-[16px] bg-[#D9D9D9] px-6 text-base text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
        >

        <input
          v-model="form.email"
          type="email"
          required
          placeholder="Email"
          class="w-full h-14 rounded-[16px] bg-[#D9D9D9] px-6 text-base text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
        >

        <input
          v-model="form.password"
          type="password"
          required
          placeholder="Пароль"
          class="w-full h-14 rounded-[16px] bg-[#D9D9D9] px-6 text-base text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
        >

        <input
          v-model="form.confirmPassword"
          type="password"
          required
          placeholder="Подтверждение пароля"
          class="w-full h-14 rounded-[16px] bg-[#D9D9D9] px-6 text-base text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
        >

        <div
          v-if="error"
          class="w-full rounded-[16px] bg-red-500/20 border border-red-500/60 px-4 py-3"
        >
          <p class="text-center text-white text-sm">
            {{ error }}
          </p>
        </div>

        <button
          type="submit"
          class="w-full h-14 rounded-[16px] bg-[#D9D9D9] text-lg font-medium text-black hover:bg-[#c7c7c7] active:bg-[#b5b5b5] transition-colors"
        >
          Зарегистрироваться
        </button>
      </form>

      <router-link
        to="/login"
        class="mt-4 w-full h-14 rounded-[16px] border-2 border-white/80 flex items-center justify-center text-base font-medium text-white hover:bg-white hover:text-[#7FAF9C] transition-colors"
      >
        Уже есть аккаунт? Войти
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref('')

const handleRegister = () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Пароли не совпадают'
    return
  }
  
  const success = userStore.register({
    name: form.value.name,
    email: form.value.email
  })
  
  if (success) {
    router.push('/')
  }
}
</script>