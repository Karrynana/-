import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import md2web from './vite-plugin-md2web';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), md2web()],
});
