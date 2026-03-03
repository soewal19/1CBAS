/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-900': '#0f172a',
                'dark-800': '#1e293b',
                'dark-700': '#334155',
                primary: {
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
