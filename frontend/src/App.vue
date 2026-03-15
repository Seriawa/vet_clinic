<template>
  <div class="min-h-screen bg-gray-50">
    <Layout v-if="userStore.isAuthenticated" />
    <router-view v-else />
  </div>
</template>

<script setup>
import { useUserStore } from './stores/userStore'
import Layout from './components/Layout.vue'

const userStore = useUserStore()
</script>