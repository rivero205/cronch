/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-base': '#F6F4EF',
                'brand-orange': '#E8833A', // Naranja Vibrante
                'brand-coffee': '#6B3E23', // Café Tostado
                'brand-gold': '#E8833A', // Deprecated: mapped to orange for backward compatibility
                'brand-dark': '#6B3E23', // Deprecated: mapped to coffee for backward compatibility
                'brand-gray': '#8A8A8A',
                'brand-light-gray': '#E0E0E0',
                'status-success': '#5CB85C',
                'status-danger': '#D9534F',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
