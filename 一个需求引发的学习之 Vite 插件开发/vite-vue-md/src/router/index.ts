import { createRouter, createWebHistory } from 'vue-router';
import mdRoutes from './md';
import Home from '../views/Home.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    ...mdRoutes,
  ],
});
