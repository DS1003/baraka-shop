import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
        "./ui/**/*.{js,ts,jsx,tsx,mdx}",
        "./layout/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1500px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                orange: {
                    50: '#fdf3ed',
                    100: '#fae3d2',
                    200: '#f4c4a2',
                    300: '#eea06b',
                    400: '#eb823f',
                    500: '#E8621A', // Primary Brand Color
                    600: '#d95213',
                    700: '#b43f11',
                    800: '#8e3412',
                    900: '#722d12',
                    950: '#3d1406',
                },
                baraka: {
                    50: '#fdf3ed',
                    100: '#fae3d2',
                    200: '#f4c4a2',
                    300: '#eea06b',
                    400: '#eb823f',
                    500: '#E8621A', // Primary Brand Color (Orange Baraka)
                    600: '#d95213',
                    700: '#b43f11',
                    800: '#8e3412',
                    900: '#722d12',
                    950: '#3d1406',
                },
                'baraka-dark': '#0A0C10', // Bleu Nuit
                'baraka-red': '#FF4747',
                'baraka-blue': '#0A0C10', // Updated to Bleu Nuit
                'baraka-yellow': '#C8973A', // Updated to Or (Accent)
                'baraka-paper': '#F5F2ED', // Papier
                'baraka-smoke': '#2A3040', // Fumée
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in-up": "fade-in-up 0.8s ease-out forwards",
                "float": "float 6s ease-in-out infinite",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
                montserrat: ["var(--font-montserrat)"],
                roboto: ["var(--font-roboto)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
