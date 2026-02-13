import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#0A0A0A",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#ffffff",
            maxWidth: "none",
            a: {
              color: "#ffffff",
              textDecoration: "underline",
              "&:hover": {
                color: "#e5e5e5",
              },
            },
            h1: {
              color: "#ffffff",
            },
            h2: {
              color: "#ffffff",
            },
            h3: {
              color: "#ffffff",
            },
            h4: {
              color: "#ffffff",
            },
            h5: {
              color: "#ffffff",
            },
            h6: {
              color: "#ffffff",
            },
            p: {
              color: "#ffffff",
            },
            strong: {
              color: "#ffffff",
            },
            blockquote: {
              color: "#ffffff",
              borderLeftColor: "#ffffff40",
            },
            code: {
              color: "#ffffff",
              backgroundColor: "#ffffff10",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              color: "#ffffff",
              backgroundColor: "#0a0a0a",
            },
            table: {
              color: "#ffffff",
            },
            thead: {
              color: "#ffffff",
              borderBottomColor: "#ffffff40",
            },
            tbody: {
              color: "#ffffff",
            },
            tr: {
              borderBottomColor: "#ffffff20",
            },
          },
        },
        invert: {
          css: {
            color: "#ffffff",
          },
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
