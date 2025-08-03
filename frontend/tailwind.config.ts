import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS Variables integration
        primary: {
          DEFAULT: "var(--primary-color)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "var(--secondary-color)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
          foreground: "hsl(var(--accent-foreground))",
        },
        background: "var(--background-color)",
        foreground: "var(--text-color)",
        surface: {
          DEFAULT: "var(--surface-color)",
          elevated: "var(--surface-elevated)",
        },
        border: {
          DEFAULT: "var(--border-color)",
          light: "var(--border-light)",
          dark: "var(--border-dark)",
        },
        success: {
          DEFAULT: "var(--success-color)",
          light: "var(--success-light)",
          dark: "var(--success-dark)",
        },
        danger: {
          DEFAULT: "var(--danger-color)",
          light: "var(--danger-light)",
          dark: "var(--danger-dark)",
        },
        warning: {
          DEFAULT: "var(--warning-color)",
          light: "var(--warning-light)",
          dark: "var(--warning-dark)",
        },
        info: {
          DEFAULT: "var(--info-color)",
          light: "var(--info-light)",
          dark: "var(--info-dark)",
        },
        muted: {
          DEFAULT: "var(--text-secondary)",
          foreground: "var(--text-tertiary)",
        },
        // Additional semantic colors for better theming
        destructive: {
          DEFAULT: "var(--danger-color)",
          foreground: "var(--background-color)",
        },
        input: "var(--surface-color)",
        ring: "var(--primary-color)",
      },
      borderRadius: {
        sm: "var(--border-radius-sm)",
        md: "var(--border-radius-md)",
        lg: "var(--border-radius-lg)",
        xl: "var(--border-radius-xl)",
        full: "var(--border-radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      transitionDuration: {
        fast: "var(--transition-fast)",
        normal: "var(--transition-normal)",
        slow: "var(--transition-slow)",
      },
      spacing: {
        'page-padding': 'var(--page-padding)',
        'section-spacing': 'var(--section-spacing)',
        'component-spacing': 'var(--component-spacing)',
        'element-spacing': 'var(--element-spacing)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        tooltip: 'var(--z-tooltip)',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Add line clamp plugin for text truncation
    function({ addUtilities }: any) {
      addUtilities({
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      })
    }
  ],
};

export default config;