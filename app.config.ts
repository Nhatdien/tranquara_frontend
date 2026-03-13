export default defineAppConfig({
    ui: {
      colors: {
        primary: 'amber',
        neutral: 'zinc',
        radius: 0.125,
      },
      card:{
        slots: {
          root: 'rounded-lg overflow-hidden border border-default bg-elevated shadow-sm',
          header: 'p-4 sm:px-6',
          body: 'p-4 sm:p-6',
          footer: 'p-4 sm:px-6'
        },
      }
    }
  })
  