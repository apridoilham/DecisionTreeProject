/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F9FAFB',       // Main background (Gray 50)
        'bg-secondary': '#FFFFFF',     // Card background (White)
        'bg-tertiary': '#F3F4F6',      // Background for hover, table header (Gray 100)
        'border-color': '#E5E7EB',    // Standard border color (Gray 200)
        'border-light': '#D1D5DB',    // Border color on hover/focus (Gray 300)
        'text-primary': '#1F2937',     // Primary text color (Gray 800)
        'text-secondary': '#6B7280',   // Secondary text color, labels (Gray 500)
        
        /* New Accent Palette - Bright blue suitable for a light theme */
        'accent-blue': '#3B82F6',         // Blue for interactive elements (Blue 500)
        'accent-blue-hover': '#2563EB',   // Darker blue on hover (Blue 600)
        'danger-red': '#EF4444',          // Red for errors (Red 500)
        'danger-red-hover': '#DC2626',    // Darker red on hover (Red 600)
        'success-green': '#10B981',       // Green for success (Emerald 500)
        'success-green-hover': '#059669', // Darker green on hover (Emerald 600)

        /* Custom color for tooltips */
        'brand-primary': '#252D37',
      },
      fontFamily: {
        sans: ['Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'spin': {
          'to': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}