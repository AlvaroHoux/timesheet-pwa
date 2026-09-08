import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import { auth, redirectToLogin } from '@/services/auth';

const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next();

  try {
    const session = await auth.getSession();
    if (session) return next();    
  } catch (error) {
    console.error('Falha ao validar sessão:', error);
  }

  redirectToLogin();
});

export default router;
