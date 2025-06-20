// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  runtimeConfig: {
    public: {
      baseURL: "",
      baseFrontendURL: "",
      websocketURL: "",
      clientId: "",
    },
  },
  compatibilityDate: "2024-04-03",
  // devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/image",'@nuxt/ui'],
  vite: {
    css: {
      preprocessorOptions: {
        sass: {
          api: "modern-compiler",
        },
      },
    },
  },
  
  image:{

  },
  css: ["~/assets/scss/main.scss"],
  pinia: {
    storesDirs: ["./stores/stores/**"],
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    }
  },
});