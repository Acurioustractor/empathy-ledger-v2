import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ========================================
        // EMPATHY LEDGER - "Editorial Warmth" Design System
        // Inspired by: Haus of Words, NITV, Charity: Water
        // ========================================

        // Ink - Rich blacks for depth and sophistication
        ink: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',  // Primary black
          950: '#0d0d0d',
        },
        // Cream - Warm whites for backgrounds
        cream: {
          50: '#ffffff',
          100: '#fdfcfb',
          200: '#faf8f5',  // Primary background
          300: '#f5f2ed',
          400: '#ebe5dc',
          500: '#ddd4c7',
          600: '#c4b8a8',
          700: '#a89a86',
          800: '#8a7d6b',
          900: '#6e6455',
        },
        // Sunshine - Yellow accent for energy and optimism
        sunshine: {
          50: '#fffef5',
          100: '#fffbe6',
          200: '#fff5c2',
          300: '#ffed8a',
          400: '#ffda48',  // Primary accent
          500: '#f5c800',
          600: '#d4a300',
          700: '#a87a00',
          800: '#7a5800',
          900: '#4d3700',
        },
        // Terracotta - Warm earth accent
        terracotta: {
          50: '#fdf6f4',
          100: '#faeae6',
          200: '#f5d4cc',
          300: '#e8b5a6',
          400: '#d88f7a',
          500: '#c4634f',  // Primary terracotta
          600: '#a84d3a',
          700: '#8a3d2e',
          800: '#6e3125',
          900: '#4a211a',
        },
        // Stone - Warm grays for muted elements
        stone: {
          50: '#faf9f8',
          100: '#f2f0ed',
          200: '#e6e2dd',
          300: '#d4cec6',
          400: '#b8b0a5',
          500: '#9a938a',  // Primary muted
          600: '#7d776e',
          700: '#635e57',
          800: '#4a4641',
          900: '#2c2420',  // Deep brown text
        },
        // Design System Colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Semantic colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        // Neutral greys for compatibility
        grey: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      // Playful rotations for editorial feel
      rotate: {
        '-4': '-4deg',
        '-3': '-3deg',
        '-2': '-2deg',
        '-1': '-1deg',
        '1': '1deg',
        '2': '2deg',
        '3': '3deg',
        '4': '4deg',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        display: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
      },
      fontSize: {
        // Display sizes
        'display-2xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        // Body sizes
        'body-xl': ['1.25rem', { lineHeight: '1.75' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body-md': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        'cultural': '0 4px 6px -1px rgba(107, 90, 74, 0.1), 0 2px 4px -2px rgba(107, 90, 74, 0.1)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-from-top': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'slide-in-from-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-from-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'in': 'fade-in 0.2s ease-out',
        'slide-in-from-top-2': 'slide-in-from-top 0.2s ease-out',
        'slide-in-from-bottom-2': 'slide-in-from-bottom 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config