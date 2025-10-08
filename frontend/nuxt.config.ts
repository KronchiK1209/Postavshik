export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vee-validate/nuxt'],
  css: ['@/assets/css/main.css'],
  app: {
    head: {
      title: 'Портал поставщика — демо',
      meta: [
        { name: 'description', content: 'Демоверсия портала поставщика для управления бронированием разгрузки.' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000',
    },
  },
  nitro: {
    routeRules: {
      '/**': {
        cors: true,
      },
    },
  },
  pinia: {
    autoImports: ['defineStore'],
  },
  veeValidate: {
    autoImports: true,
  },
  future: {
    compatibilityVersion: 4,
  },
});
