import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

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
        // Brand Guide Colors (Editorial Warmth Palette)
        ochre: {
          DEFAULT: '#96643a',
          50: '#faf7f4',
          100: '#f0e8df',
          200: '#e0d0bf',
          300: '#cdb393',
          400: '#b89468',
          500: '#96643a', // Primary
          600: '#7d5330',
          700: '#644228',
          800: '#4b3220',
          900: '#322118',
        },
        terracotta: {
          DEFAULT: '#b84a32',
          dark: '#a03a28',
          50: '#fdf5f3',
          100: '#fce8e3',
          200: '#fbd5cc',
          300: '#f6b5a5',
          400: '#ee8b72',
          500: '#e26548',
          600: '#b84a32', // Primary
          700: '#a03a28',
          800: '#7c3324',
          900: '#672e23',
        },
        sage: {
          DEFAULT: '#5c6d51',
          dark: '#4a5741',
          50: '#f5f7f4',
          100: '#e8ebe5',
          200: '#d2d9cc',
          300: '#b3c0a8',
          400: '#8fa27f',
          500: '#6f8560',
          600: '#5c6d51', // Primary
          700: '#4a5741',
          800: '#3d4736',
          900: '#333b2e',
        },
        charcoal: {
          DEFAULT: '#42291a',
          50: '#f9f6f4',
          100: '#f0e9e4',
          200: '#e0d1c7',
          300: '#c9b3a3',
          400: '#ae8f7a',
          500: '#8f7058',
          600: '#6b5545',
          700: '#574538',
          800: '#42291a', // Primary
          900: '#2e1c12',
        },
        cream: {
          DEFAULT: '#faf6f1',
          50: '#fdfcfa',
          100: '#faf6f1', // Primary
          200: '#f5ede3',
          300: '#ede0ce',
          400: '#e2cfb5',
          500: '#d4ba96',
        },
        // Cultural Theme Colors
        cultural: '#d97706',
        family: '#059669',
        land: '#0284c7',
        resilience: '#dc2626',
        knowledge: '#7c3aed',
        justice: '#ea580c',
        arts: '#06b6d4',
        everyday: '#65a30d',
        // Primary Brand Colors - Warm Earth Tones (Legacy - kept for compatibility)
        earth: {
          50: '#fefefe',
          100: '#f7f5f3',
          200: '#e6ddd6',
          300: '#d4c4b9',
          400: '#c1aa9c',
          500: '#a8927e',
          600: '#8f7961',
          700: '#6b5a4a',
          800: '#4a3f33',
          900: '#2c241c',
          950: '#1a1511',
        },
        // Secondary - Clay Tones
        clay: {
          50: '#fdf8f6',
          100: '#f2e8e0',
          200: '#e3d1c5',
          300: '#d3b9aa',
          400: '#c1a08f',
          500: '#a8866e',
          600: '#8f6d54',
          700: '#75583f',
          800: '#5c442b',
          900: '#3d2d1c',
          950: '#2a1f12',
        },
        // Accent - Sage Green
        sage: {
          50: '#f7f8f6',
          100: '#e8ebe5',
          200: '#d2d7ca',
          300: '#b7c2ae',
          400: '#9cad92',
          500: '#7e9774',
          600: '#67805c',
          700: '#526946',
          800: '#3e5131',
          900: '#2a3620',
          950: '#1d2416',
        },
        // Accent - Sky Blue (Trust/Transparency)
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4A90A4',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Accent - Ember Red (Important Actions)
        ember: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#C85A54',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
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
    forms,
    typography,
  ],
}

export default config
