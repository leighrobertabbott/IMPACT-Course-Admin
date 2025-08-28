/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NHS Color Scheme (for backward compatibility)
        'nhs-blue': '#005EB8',
        'nhs-dark-blue': '#003087',
        'nhs-bright-blue': '#0072CE',
        'nhs-light-blue': '#41B6E6',
        'nhs-aqua-blue': '#00A9CE',
        'nhs-green': '#009639',
        'nhs-dark-green': '#006747',
        'nhs-purple': '#330072',
        'nhs-dark-purple': '#270140',
        'nhs-red': '#DA291C',
        'nhs-dark-red': '#A41E1E',
        'nhs-warm-yellow': '#FFB81C',
        'nhs-orange': '#ED8B00',
        'nhs-dark-orange': '#D26000',
        'nhs-pink': '#C81E7E',
        'nhs-dark-pink': '#9B1B5B',
        'nhs-grey': '#425563',
        'nhs-dark-grey': '#2E383F',
        'nhs-mid-grey': '#768692',
        'nhs-pale-grey': '#E8EDEE',
        'nhs-light-grey': '#F0F4F5',
        'nhs-white': '#FFFFFF',
        'nhs-black': '#231F20',
      },
      fontFamily: {
        'sans': ['Inter', 'Frutiger', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'nhs': '0 2px 4px rgba(0, 94, 184, 0.1)',
        'nhs-lg': '0 4px 6px rgba(0, 94, 184, 0.15)',
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
