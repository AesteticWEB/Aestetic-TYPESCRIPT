/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        ink: "#101014",
        smoke: "#f6f4f0",
        ember: "#ff6b4a",
        aurora: "#7cd1ff",
        moss: "#6ee7b7"
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(1200px 600px at 10% -10%, rgba(124,209,255,0.35), transparent 60%), radial-gradient(900px 500px at 90% 0%, rgba(255,107,74,0.25), transparent 55%)"
      },
      boxShadow: {
        halo: "0 20px 80px -40px rgba(16,16,20,0.45)",
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 30px 60px -30px rgba(124,209,255,0.45)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 12s ease infinite"
      }
    }
  },
  plugins: []
};
