import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Animals',
    component: () => import('../views/AnimalsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('../views/StatisticsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/visits',
    name: 'Visits',
    component: () => import('../views/VisitsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/animals/:id',
    name: 'AnimalDetail',
    component: () => import('../views/AnimalDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/animals/:id/edit',
    name: 'EditAnimal',
    component: () => import('../components/AnimalForm.vue'),
    meta: { requiresAuth: true, requiresEdit: true }
  },
  {
    path: '/animals/new',
    name: 'NewAnimal',
    component: () => import('../components/AnimalForm.vue'),
    meta: { requiresAuth: true, requiresEdit: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresEdit && !userStore.canEdit) {
    next('/')
  } else {
    next()
  }
})

export default router