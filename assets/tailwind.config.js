tailwind.config = {
  prefix: "tw-",
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        charade: '#2E2F3C',
        chambray: '#3C4196',
        serenade: '#FFF6EC',
        'athens-gray': '#F0F0F5',
        scarlet: '#F03306',
        pizazz: '#FF8900',
        'wild-sand': '#F6F6F6',
        comet: '#55576F',
        'green-pea': '#196956',
        'neutral-800': '#55576F',
        'black-65': '#595959',
        'neutral-300': '#D2D3DD',
        'cultured': "#F7F7F9",
        red: '#FF0000'
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            hr: {
              borderColor: theme('colors.gray.200'),
              borderTopWidth: '1px',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'ol > li::before': {
              color: theme('colors.gray.900'),
            },
            'ul > li::before': {
              backgroundColor: theme('colors.gray.900'),
            },
          },
        },
      }),
    },
    fontFamily: {
      'acuminpro': ["acumin-pro"],
      'tiempos': ["Tiempos"],
    }
  },
}
