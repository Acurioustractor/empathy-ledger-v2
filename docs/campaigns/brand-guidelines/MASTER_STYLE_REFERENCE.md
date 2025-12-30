# 🎨 **MASTER STYLE REFERENCE**
## **Complete CSS Foundation for Empathy Ledger Rebuild**

---

## 📋 **SYSTEM OVERVIEW**

This document serves as the **single source of truth** for rebuilding the Empathy Ledger CSS system. All styling decisions should reference this guide.

### **🎯 Design Goals:**
- **Cultural Respect** - Indigenous-inspired colors with proper attribution  
- **Accessibility First** - WCAG 2.1 AA compliance minimum
- **Component-Based** - Semantic, reusable class system
- **Mobile-First** - Responsive without breakpoint hell
- **Performance** - Critical path CSS + smart loading

---

## 🌍 **CULTURAL COLOR SYSTEM**

### **Primary Palette (Natural Elements)**

#### **EARTH TONES (Foundation)**
```css
--color-earth-deep: #2d3748;     /* Ancestral wisdom, primary text */
--color-earth-rich: #4a5568;     /* Growing knowledge, secondary text */  
--color-earth-warm: #718096;     /* Enduring stone, body text */
```

#### **WATER ELEMENTS (Communication)**
```css
--color-water-deep: #2c5282;     /* Profound wisdom, links/actions */
--color-water-clear: #3182ce;    /* Transparency, interactive elements */
--color-water-light: #4299e1;    /* Accessibility, hover states */
```

#### **FOREST GREENS (Growth & Community)**
```css
--color-forest-deep: #22543d;    /* Protected knowledge, success */
--color-forest-rich: #2f855a;    /* Community flourishing, positive */
--color-forest-fresh: #48bb78;   /* New growth, fresh content */
```

#### **SUN ELEMENTS (Wisdom & Highlights)**
```css
--color-sun-warm: #d69e2e;       /* Elder wisdom, important info */
--color-sun-golden: #f6e05e;     /* Dawn light (dark bg only) */
--color-sun-soft: #faf089;       /* Gentle illumination (dark bg only) */
```

### **Semantic Color Mappings**
```css
--color-sovereignty: var(--color-earth-deep);     /* Data sovereignty */
--color-governance: var(--color-water-deep);      /* Community decisions */
--color-community: var(--color-forest-rich);      /* Collective benefit */
--color-knowledge: var(--color-earth-rich);       /* Traditional wisdom */
--color-sacred: var(--color-forest-deep);         /* Protected content */
--color-wisdom: var(--color-sun-warm);            /* Elder guidance */
```

---

## 📝 **TYPOGRAPHY SYSTEM**

### **Font Families**
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-indigenous: 'Noto Sans Canadian Aboriginal', 'Noto Sans', sans-serif;
--font-fallback: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
```

### **Font Sizes (Responsive)**
```css
--text-xs: 0.75rem;    /* 12px - Small captions */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text (WCAG minimum) */
--text-lg: 1.125rem;   /* 18px - Emphasized body */
--text-xl: 1.25rem;    /* 20px - Large body */
--text-2xl: 1.5rem;    /* 24px - Large text (WCAG threshold) */
--text-3xl: 1.875rem;  /* 30px - Small headings */
--text-4xl: 2.25rem;   /* 36px - Medium headings */
--text-5xl: 3rem;      /* 48px - Large headings */
--text-6xl: 3.75rem;   /* 60px - Display headings */
--text-7xl: 4.5rem;    /* 72px - Hero headings */
```

### **Font Weights**
```css
--font-light: 300;     /* Light emphasis */
--font-normal: 400;    /* Regular body text */
--font-medium: 500;    /* Subtle emphasis */
--font-semibold: 600;  /* Headings, strong emphasis */
--font-bold: 700;      /* Important text */
--font-extrabold: 800; /* Display text, hero */
--font-black: 900;     /* Maximum emphasis, logos */
```

### **Line Heights**
```css
--leading-none: 1;       /* Icons, single line */
--leading-tight: 1.25;   /* Large headings */
--leading-snug: 1.375;   /* Medium headings */
--leading-normal: 1.5;   /* Body text (WCAG recommended) */
--leading-relaxed: 1.625; /* Comfortable reading */
--leading-loose: 2;      /* Poetry, special content */
```

---

## 📐 **SPACING SYSTEM**

### **Consistent Scale**
```css
--space-0: 0;
--space-px: 1px;
--space-0-5: 0.125rem;  /* 2px */
--space-1: 0.25rem;     /* 4px */
--space-1-5: 0.375rem;  /* 6px */
--space-2: 0.5rem;      /* 8px */
--space-2-5: 0.625rem;  /* 10px */
--space-3: 0.75rem;     /* 12px */
--space-3-5: 0.875rem;  /* 14px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-7: 1.75rem;     /* 28px */
--space-8: 2rem;        /* 32px */
--space-9: 2.25rem;     /* 36px */
--space-10: 2.5rem;     /* 40px */
--space-11: 2.75rem;    /* 44px */
--space-12: 3rem;       /* 48px */
--space-14: 3.5rem;     /* 56px */
--space-16: 4rem;       /* 64px */
--space-20: 5rem;       /* 80px */
--space-24: 6rem;       /* 96px */
--space-28: 7rem;       /* 112px */
--space-32: 8rem;       /* 128px */
--space-36: 9rem;       /* 144px */
--space-40: 10rem;      /* 160px */
--space-44: 11rem;      /* 176px */
--space-48: 12rem;      /* 192px */
--space-52: 13rem;      /* 208px */
--space-56: 14rem;      /* 224px */
--space-60: 15rem;      /* 240px */
--space-64: 16rem;      /* 256px */
--space-72: 18rem;      /* 288px */
--space-80: 20rem;      /* 320px */
--space-96: 24rem;      /* 384px */
```

---

## 🎨 **COMPONENT CATEGORIES**

### **1. ADMIN DASHBOARDS**
**Required Components:**
- System health indicators
- Data tables & grids  
- Navigation tabs
- Metrics cards
- Configuration panels
- Performance charts

### **2. PROFILE SYSTEMS**
**Required Components:**
- Multi-tier displays (community, professional, admin)
- Cultural protocol indicators
- Privacy controls
- Professional services
- Story showcases

### **3. CONTENT DISPLAYS**
**Required Components:**
- Story cards
- Quote displays
- Media galleries
- Theme visualizations
- Search interfaces

### **4. NAVIGATION**
**Required Components:**  
- Header/footer
- Dropdown menus
- Breadcrumbs
- Tab navigation
- Mobile menus

### **5. FORMS & INTERACTION**
**Required Components:**
- Multi-step wizards
- Input validation
- Toggle controls
- Modal dialogs
- Drag & drop

---

## 🔧 **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation**
1. CSS variables system
2. Reset & base styles
3. Typography scales
4. Color system
5. Spacing utilities

### **Phase 2: Layout**
1. Grid system
2. Container utilities
3. Responsive breakpoints
4. Flexbox utilities

### **Phase 3: Components**
1. Cards & buttons
2. Navigation elements
3. Form components
4. Data displays
5. Interactive elements

### **Phase 4: Specialized**
1. Admin dashboard styles
2. Profile system styles
3. Cultural protocol indicators
4. Accessibility enhancements

---

## ♿ **ACCESSIBILITY REQUIREMENTS**

### **WCAG 2.1 AA Compliance**
- Minimum contrast ratio: 4.5:1 (normal text)
- Large text contrast: 3:1 (24px+ or 18px+ bold)
- UI component contrast: 3:1
- Focus indicators: Visible and high contrast
- Touch targets: Minimum 44x44px

### **Cultural Accessibility**
- Indigenous language support (syllabics)
- Respectful color usage
- Community review process
- Cultural context documentation

---

## 📱 **RESPONSIVE STRATEGY**

### **Mobile-First Approach**
```css
/* Base styles for mobile (320px+) */
/* Tablet styles (768px+) */
/* Desktop styles (1024px+) */
/* Large desktop (1280px+) */
```

### **Breakpoints**
```css
--breakpoint-sm: 640px;   /* Small tablets, large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops, small desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Very large screens */
```

---

## 🎯 **NEXT STEPS**

1. **Build Foundation CSS** - Implement variables, reset, typography
2. **Create Component System** - Build reusable component classes  
3. **Test All Pages** - Ensure admin dashboards, profiles work
4. **Accessibility Audit** - WCAG compliance verification
5. **Cultural Review** - Community approval of color usage

---

*This system replaces ALL previous CSS implementations with a unified, culturally-respectful, accessible foundation.*
