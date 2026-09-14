import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Registros from '@/views/Registros.vue';
import Configuracoes from '@/views/Configuracoes.vue';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
  },
  {
    path: '/registros',
    name: 'registros',
    component: Registros,
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: Configuracoes,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
