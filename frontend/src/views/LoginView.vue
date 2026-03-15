<template>
  <div class="flex min-h-screen w-full bg-[#7FAF9C] items-center justify-center relative font-['Inter']">
    <div class="w-full max-w-md px-4 sm:px-0">
      <div class="text-center mb-10 text-white">
        <h1 class="text-3xl sm:text-4xl font-bold">С возвращением!</h1>
        <p class="mt-2 text-lg text-white/90">Войдите в систему управления клиникой</p>
      </div>

      <div class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full h-16 rounded-[16px] bg-[#D9D9D9] px-6 text-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
        />

        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Пароль"
            class="w-full h-16 rounded-[16px] bg-[#D9D9D9] px-6 pr-14 text-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-white focus:bg-white"
          />
        </div>

        <div
          v-if="userStore.error"
          class="w-full rounded-[16px] bg-red-500/20 border border-red-500/60 px-4 py-3"
        >
          <p class="text-center text-white text-sm">{{ userStore.error }}</p>
        </div>

        <button
          @click="handleLogin"
          type="button"
          class="w-full h-16 rounded-[16px] bg-[#D9D9D9] text-[20px] font-medium text-black hover:bg-[#c7c7c7] active:bg-[#b5b5b5] transition-colors"
        >
          ВОЙТИ
        </button>

        <router-link
          to="/register"
          class="w-full h-16 rounded-[16px] border-2 border-white/80 flex items-center justify-center text-lg font-medium text-white hover:bg-white hover:text-[#7FAF9C] transition-colors"
        >
          Зарегистрироваться
        </router-link>
      </div>
    </div>

    <div class="absolute left-6 bottom-6 text-white text-sm max-w-xs space-y-3">
      <p class="font-semibold text-base">Тестовые учетные записи:</p>

      <div class="flex items-start gap-3">
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-[#D9D9D9] flex items-center justify-center font-bold text-base text-gray-800"
          @click="fillAdmin"
        >
          А
        </button>
        <div>
          <p class="font-medium">Администратор</p>
          <p class="text-white/90 text-xs">admin@vetclinic.com / admin123</p>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-[#D9D9D9] flex items-center justify-center font-bold text-base text-gray-800"
          @click="fillGuest"
        >
          Г
        </button>
        <div>
          <p class="font-medium">Гость</p>
          <p class="text-white/90 text-xs">guest@vetclinic.com / guest123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    userStore.error = 'Введите email и пароль'
    return
  }

  const ok = await userStore.login(email.value, password.value)
  if (ok) {
    router.push('/')
  }
}

const fillAdmin = () => {
  email.value = 'admin@vetclinic.com'
  password.value = 'admin123'
}

const fillGuest = () => {
  email.value = 'guest@vetclinic.com'
  password.value = 'guest123'
}
</script>