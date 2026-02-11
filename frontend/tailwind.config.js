/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": {
                    DEFAULT: "#7311d4",
                    50: "#f3e6ff",
                    100: "#e6ccff",
                    200: "#cf99ff",
                    300: "#b866ff",
                    400: "#a133ff",
                    500: "#7311d4", // Base
                    600: "#5c0eb0",
                    700: "#460b8a",
                    800: "#2f0861",
                    900: "#190538",
                },
                "background": {
                    light: "#f7f6f8",
                    dark: "#0a080c", // Darker base
                    card: "#141118",
                },
                "surface": {
                    dark: "#1c1822",
                    highlight: "#2a2433",
                }
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "body": ["Inter", "sans-serif"],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
            },
            animation: {
                'blob': 'blob 7s infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
