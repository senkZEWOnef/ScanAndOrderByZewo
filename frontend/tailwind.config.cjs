/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.jsx",
    "./src/**/*.js",
    "./src/pages/*.jsx",
    "./src/components/*.jsx",
  ],
  safelist: [
    // Background gradients
    'bg-gradient-to-br',
    'bg-gradient-to-r',
    'from-indigo-50',
    'via-white',
    'to-cyan-50',
    'from-violet-600',
    'via-purple-600',
    'to-blue-600',
    'from-emerald-500',
    'to-teal-500',
    'from-amber-400',
    'via-orange-500',
    'to-red-500',
    'from-blue-500',
    'to-indigo-600',
    'from-purple-500',
    'via-pink-500',
    'to-rose-500',
    
    // Text gradients
    'bg-clip-text',
    'text-transparent',
    
    // Backdrop effects
    'backdrop-blur-xl',
    'backdrop-blur-md',
    
    // Shadows
    'shadow-xl',
    'shadow-2xl',
    'shadow-lg',
    'shadow-sm',
    'shadow-purple-500/25',
    'shadow-emerald-500/25',
    'shadow-blue-500/25',
    'shadow-orange-500/25',
    'shadow-violet-500/10',
    
    // Transforms
    'transform',
    'scale-105',
    'hover:scale-110',
    'hover:scale-125',
    'hover:-translate-y-1',
    'hover:-translate-y-2',
    'group-hover:scale-110',
    'group-hover:scale-125',
    
    // Transitions
    'transition-all',
    'transition-colors',
    'transition-transform',
    'transition-shadow',
    'duration-200',
    'duration-300',
    
    // Border radius
    'rounded-2xl',
    'rounded-3xl',
    'rounded-xl',
    'rounded-full',
    
    // Colors
    'bg-white/90',
    'bg-white/80',
    'bg-white/70',
    'bg-white/60',
    'border-white/20',
    'text-violet-600',
    'text-emerald-700',
    'text-purple-700',
    'text-blue-700',
    'bg-violet-50',
    'bg-emerald-50',
    'bg-blue-50',
    'bg-purple-50',
    'bg-pink-50',
    'border-violet-200',
    'border-emerald-200',
    'border-blue-200',
    'border-purple-200',
    
    // Focus states
    'focus:ring-4',
    'focus:ring-emerald-500/20',
    'focus:ring-blue-500/20',
    'focus:border-emerald-500',
    'focus:border-blue-500',
    
    // Other utilities
    'animate-pulse',
    'animate-spin',
    'min-h-screen',
    'container',
    'mx-auto',
    'filter',
    'drop-shadow-lg',
    'group-hover:drop-shadow-lg',
    'resize-none',
    'line-clamp-2',
    'truncate'
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}

