// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    pageTransition: { "name": 'page', mode: "out-in" },
    layoutTransition: { "name": 'layout', mode: 'out-in' },
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1.0, interactive-widget=resizes-content" }
      ],
      title: "TheraPrep",
    }
  },
  devtools: false,
  runtimeConfig: {
    public: {
      baseURL: "",
      baseFrontendURL: "",
      websocketURL: "",
      clientId: "",
      keycloakURL: "", // Add Keycloak URL
    },
  },
  compatibilityDate: "2024-04-03",
  // devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/image", '@nuxt/ui', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'vi', name: 'Tiếng Việt', file: 'vi.json' },
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },
  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          api: "modern-compiler",
        },
      },
    },
  },

  image: {

  },
  css: ["~/assets/scss/main.scss"],
  pinia: {
    storesDirs: ["./stores/stores/**"],
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {
      },
    }
  },
});