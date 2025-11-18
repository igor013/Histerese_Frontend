/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0099cc",
                    dark: "#0288b3",
                    light: "#e0f7fa",
                },
                success: {
                    DEFAULT: "#28a745",
                    dark: "#218838",
                },
                danger: {
                    DEFAULT: "#dc3545",
                    dark: "#b02a37",
                },
                warning: {
                    DEFAULT: "#ffc107",
                    dark: "#e0a800",
                },
                neutral: {
                    light: "#f4f6f9",
                    DEFAULT: "#e9ecef",
                    dark: "#adb5bd",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                card: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
                smooth: "0 4px 12px rgba(0,0,0,0.08)",
            },
            borderRadius: {
                xl: "0.75rem",
                "2xl": "1rem",
            },
        },
    },
    plugins: [],
};
