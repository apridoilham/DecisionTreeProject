/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/js/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#F9FAFB',      // Latar belakang utama (Gray 50)
        'bg-secondary': '#FFFFFF',    // Latar belakang kartu (Putih)
        'bg-tertiary': '#F3F4F6',     // Latar belakang untuk hover, header tabel (Gray 100)
        'border-color': '#E5E7EB',   // Warna border standar (Gray 200)
        'border-light': '#D1D5DB',   // Warna border saat hover/fokus (Gray 300)
        'text-primary': '#1F2937',    // Warna teks utama (Gray 800)
        'text-secondary': '#6B7280',  // Warna teks sekunder, label (Gray 500)
        
        /* Palet Aksen Baru - Biru cerah yang cocok di tema terang */
        'accent-blue': '#3B82F6',          // Biru untuk elemen interaktif (Blue 500)
        'accent-blue-hover': '#2563EB',    // Biru lebih gelap saat hover (Blue 600)
        'danger-red': '#EF4444',           // Merah untuk error (Red 500)
        'danger-red-hover': '#DC2626',     // Merah lebih gelap saat hover (Red 600)
        'success-green': '#10B981',        // Hijau untuk sukses (Emerald 500)
        'success-green-hover': '#059669',  // Hijau lebih gelap saat hover (Emerald 600)

        /* Warna khusus untuk tooltip */
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