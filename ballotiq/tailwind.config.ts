import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [
    function ({
      addComponents,
      addUtilities,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      addComponents: Function;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      addUtilities: Function;
    }) {
      // Glassmorphism components
      addComponents({
        ".glass": {
          background: "rgba(10, 12, 20, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
        ".glass-light": {
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
        },
        ".bento-card": {
          "@apply glass rounded-[2rem] p-8 overflow-hidden relative transition-all duration-500":
            {},
          "&:hover": {
            "@apply border-white/20 bg-white/[0.05]": {},
          },
        },
      });

      // Utility classes
      addUtilities({
        ".bg-grain": {
          position: "relative",
        },
        ".bg-grain::before": {
          content: '""',
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          opacity: "0.03",
          pointerEvents: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3BaseFilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/baseFilter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        },
        ".hover-glow": {
          transition: "all 0.3s ease",
        },
        ".hover-glow:hover": {
          boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 0.4)",
        },
        ".text-gradient": {
          "@apply bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/70":
            {},
        },
        ".text-primary-gradient": {
          background: "var(--grad-primary)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        },
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".no-scrollbar": {
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        },
      });
    },
  ],
};

export default config;
