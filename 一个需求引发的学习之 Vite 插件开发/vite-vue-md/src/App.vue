<script setup lang="ts">
import mdRoutes from './router/md';
</script>

<template>
  <nav>
    <ul>
      <li>
        <router-link to="/">Home</router-link>
      </li>
      <li v-for="md in mdRoutes" :key="md.name">
        <router-link :to="md.path">
          {{ md.name }}
        </router-link>
      </li>
    </ul>
  </nav>
  <router-view></router-view>
</template>
