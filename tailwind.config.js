/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        brand: {
          navy: "hsl(var(--brand-navy))",
          blue: "hsl(var(--brand-blue))",
          sky: "hsl(var(--brand-sky))",
          pale: "hsl(var(--brand-pale))",
          ink: "hsl(var(--brand-ink))",
          slate: "hsl(var(--brand-slate))",
        },
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
