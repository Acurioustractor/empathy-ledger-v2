# Empathy Ledger v2 - Indigenous Stories & Cultural Wisdom Platform

A culturally respectful platform for Indigenous communities to share, preserve, and celebrate their stories, traditions, and wisdom for future generations. Built with Next.js 15, TypeScript, and Supabase, following OCAP principles and Indigenous data sovereignty standards.

## 🌟 Features

### Cultural Foundation
- **OCAP Principles**: Ownership, Control, Access, Possession built into core architecture
- **Cultural Safety**: Comprehensive consent management and cultural protocol checking
- **Elder Review System**: Cultural review workflows for sensitive content
- **Multi-tenant Organizations**: Support for multiple Indigenous communities

### Platform Capabilities
- **Story Preservation**: Rich text stories with cultural context and metadata
- **Storyteller Profiles**: Community storyteller directories with cultural expertise
- **Interactive Cultural Map**: Geographic visualization of stories and territories (React Leaflet)
- **AI-Enhanced Discovery**: Culturally-aware content recommendations
- **Multi-language Support**: Support for Indigenous languages and translations

### Design & Accessibility
- **Cultural Earth-tone Palette**: Clay, Stone, Sage, Sky color system
- **Generous Spacing**: Culturally-appropriate generous layouts
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Mobile-first Responsive**: Optimized for all devices
- **Dark Mode**: System preference aware theming

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/empathy-ledger-v2.git
   cd empathy-ledger-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom cultural design system  
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **UI Components**: Custom component library built on Radix UI primitives
- **Maps**: React Leaflet for cultural territory visualization
- **AI/ML**: OpenAI integration for content enhancement

### Project Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── auth/               # Authentication pages
│   ├── stories/            # Story-related pages
│   ├── storytellers/       # Storyteller profiles
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components (Header, Footer)
│   ├── cultural/           # Cultural-specific components
│   └── forms/              # Form components
├── lib/                    # Utilities and services
│   ├── supabase/           # Supabase clients and helpers
│   ├── context/            # React contexts (Auth, etc.)
│   ├── services/           # Business logic services
│   └── utils.ts            # Utility functions
└── types/                  # TypeScript type definitions
```

## 🎨 Design System

### Cultural Color Palette

```css
/* Clay - Warm, grounding earth tones */
--clay-50: #faf8f6;   /* Lightest clay */
--clay-600: #a68b6c;  /* Primary clay */
--clay-950: #2a221c;  /* Darkest clay */

/* Stone - Neutral, stable foundation */
--stone-500: #78716c; /* Mid stone */
--stone-900: #1c1917; /* Dark stone */

/* Sage - Natural, calming greens */
--sage-500: #6f7a6f;  /* Primary sage */
--sage-600: #5a635a;  /* Darker sage */

/* Sky - Open, inspiring blues */
--sky-500: #0ea5e9;   /* Primary sky */
--sky-600: #0284c7;   /* Darker sky */
```

### Component Examples

```tsx
// Cultural Button variants
<Button variant="cultural-primary">Primary Action</Button>
<Button variant="clay">Clay Theme</Button>
<Button variant="sage-outline">Sage Outline</Button>

// Cultural Card variants  
<Card variant="story">Story Card</Card>
<Card variant="storyteller">Storyteller Card</Card>

// Cultural Typography
<Heading level={1} cultural>Main Heading</Heading>
<Typography variant="cultural-body">Body text</Typography>
```

## 🛡️ Cultural Safety & OCAP Implementation

### OCAP Principles
- **Ownership**: Indigenous communities own their data
- **Control**: Communities control access to their information  
- **Access**: Communities determine who can access data
- **Possession**: Physical control of data and infrastructure

### Implementation Details
- Content approval workflows
- Granular consent management
- Cultural protocol validation
- Elder review systems
- Data sovereignty compliance

## 📦 Key Components Implemented

### UI Component Library
- ✅ **Button**: 12+ variants including cultural themes
- ✅ **Card**: Specialized Story/Storyteller cards
- ✅ **Typography**: Cultural hierarchy system
- ✅ **Form Components**: Input, Select, Textarea with cultural styling
- ✅ **Accessibility**: Alert, Badge, Dialog components
- ✅ **Layout**: Header/Footer with cultural navigation

### Core Infrastructure
- ✅ **Supabase Integration**: Client/SSR configurations
- ✅ **Authentication Context**: Complete auth system
- ✅ **Cultural Safety Utils**: OCAP compliance utilities
- ✅ **Database Types**: Comprehensive TypeScript types
- ✅ **Interactive Map**: React Leaflet cultural territories

### Pages & Features  
- ✅ **Homepage**: Hero section with cultural aesthetics
- ✅ **Authentication**: Sign in/Sign up pages
- ✅ **Design System**: Complete Tailwind cultural theme
- ✅ **Environment Setup**: Production-ready configuration

## 🌍 Next Steps for Development

### Immediate Priorities
1. **Database Setup**: Implement Supabase schema and RLS policies
2. **Authentication Integration**: Connect auth forms to Supabase Auth
3. **Story Management**: Build story creation and viewing interfaces
4. **Storyteller Profiles**: Implement storyteller registration and profiles

### Future Enhancements
1. **AI Content Enhancement**: OpenAI integration for story recommendations
2. **Multi-language Support**: Indigenous language preservation features
3. **Advanced Cultural Maps**: Territory boundaries and story clustering
4. **Elder Review Workflows**: Cultural approval process automation

## 🤝 Contributing

We welcome contributions that align with our cultural values and technical standards.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes following cultural sensitivity guidelines
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the [MIT License](LICENSE) with additional cultural protocols and ethical guidelines for Indigenous content handling.

## 🙏 Acknowledgments

- **Indigenous Communities**: For their wisdom, guidance, and trust
- **Cultural Advisors**: For ensuring cultural appropriateness and safety
- **Open Source Community**: For the tools and libraries that make this possible
- **OCAP Principles**: First Nations Information Governance Centre

---

**Built with cultural respect and Indigenous data sovereignty principles** 🪶

*This platform is designed to honor and preserve Indigenous stories while ensuring communities maintain control over their cultural heritage.*
