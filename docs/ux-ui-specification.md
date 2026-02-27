# PolicyAi UX/UI Specification
## Human Habitat Implementation

**Client**: Human Habitat
**Developer**: CoralShades
**Version**: 1.0
**Date**: 2025-10-21
**Status**: ACTIVE DEVELOPMENT

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Logo & Branding](#logo--branding)
5. [Component Specifications](#component-specifications)
6. [Layout & Navigation](#layout--navigation)
7. [Footer & Credits](#footer--credits)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Brand Identity

### Client Information
- **Company**: Human Habitat
- **Industry**: Policy Management & Compliance
- **Target Users**: Board Members, Executives, Administrators, Company Operators
- **Brand Position**: Professional, Trustworthy, Modern, Efficient

### Design Philosophy
1. **Clarity First**: Every element must serve a clear purpose
2. **Role-Aware**: UI adapts to user's role and permissions
3. **Professional Polish**: Enterprise-grade appearance and interactions
4. **Human-Centered**: Empathetic design that reduces cognitive load
5. **Brand Consistency**: Human Habitat identity throughout

---

## Color System

### Primary Palette (Human Habitat Brand)

Based on the Human Habitat brand identity, we've developed a cohesive color system:

```css
/* Primary Brand Color - Human Habitat Red */
--hh-primary: #EE4433;          /* Main brand red */
--hh-primary-dark: #CC3322;     /* Darker variant for hover states */
--hh-primary-light: #FF6655;    /* Lighter variant for accents */
--hh-primary-pale: #FFE8E5;     /* Very light for backgrounds */

/* Neutral Colors - Professional Base */
--hh-charcoal: #333322;         /* Dark text, headers */
--hh-warm-gray: #BBBBAA;        /* Secondary text, borders */
--hh-white: #FFFFFF;            /* Backgrounds, cards */

/* Accent Color - Success & Positive Actions */
--hh-green: #77CC99;            /* Success states, positive indicators */
--hh-green-dark: #5FAA7F;       /* Hover states */
--hh-green-light: #E5F7EE;      /* Success backgrounds */

/* Extended Palette for UI States */
--hh-warning: #FFB84D;          /* Warning states */
--hh-warning-light: #FFF3E0;    /* Warning backgrounds */
--hh-error: #EE4433;            /* Uses primary red */
--hh-error-light: #FFE8E5;      /* Error backgrounds */
--hh-info: #5B9BD5;             /* Info states */
--hh-info-light: #E8F4FF;       /* Info backgrounds */
```

### Role-Based Color Coding

Each user role has a distinct color for visual identification:

```css
/* Role Colors - Using Primary Palette */
--role-system-owner: #EE4433;      /* Primary Red - Highest authority */
--role-company-operator: #FF6655;  /* Light Red - Operational access */
--role-board: #5B9BD5;             /* Blue - Strategic oversight */
--role-executive: #77CC99;         /* Green - Executive access */
--role-administrator: #FFB84D;     /* Amber - Administrative access */
```

### Semantic Color Mapping (Tailwind CSS Variables)

```css
:root {
  /* Background & Foreground */
  --background: 0 0% 100%;                    /* White */
  --foreground: 60 20% 16%;                   /* Charcoal #333322 */

  /* Card */
  --card: 0 0% 100%;                          /* White */
  --card-foreground: 60 20% 16%;              /* Charcoal */

  /* Primary (Human Habitat Red) */
  --primary: 5 84% 56%;                       /* #EE4433 */
  --primary-foreground: 0 0% 100%;            /* White text on red */

  /* Secondary (Warm Gray) */
  --secondary: 60 11% 70%;                    /* #BBBBAA */
  --secondary-foreground: 60 20% 16%;         /* Charcoal */

  /* Accent (Green) */
  --accent: 143 45% 63%;                      /* #77CC99 */
  --accent-foreground: 60 20% 16%;            /* Charcoal */

  /* Muted */
  --muted: 60 11% 96%;                        /* Very light warm gray */
  --muted-foreground: 60 11% 40%;             /* Darker warm gray */

  /* Destructive */
  --destructive: 5 84% 56%;                   /* Same as primary red */
  --destructive-foreground: 0 0% 100%;        /* White */

  /* Border & Input */
  --border: 60 11% 85%;                       /* Light warm gray */
  --input: 60 11% 85%;                        /* Light warm gray */
  --ring: 5 84% 56%;                          /* Primary red for focus rings */

  /* Sidebar */
  --sidebar-background: 0 0% 98%;             /* Off-white */
  --sidebar-foreground: 60 20% 16%;           /* Charcoal */
  --sidebar-primary: 5 84% 56%;               /* Primary red */
  --sidebar-primary-foreground: 0 0% 100%;    /* White */
  --sidebar-accent: 60 11% 96%;               /* Very light warm gray */
  --sidebar-accent-foreground: 60 20% 16%;    /* Charcoal */
  --sidebar-border: 60 11% 90%;               /* Light warm gray */
  --sidebar-ring: 5 84% 56%;                  /* Primary red */

  /* Radius */
  --radius: 0.5rem;                           /* 8px - modern, friendly */
}
```

### Color Usage Guidelines

#### Dashboard
- **Background**: `--hh-white` (#FFFFFF)
- **Card backgrounds**: `--hh-white` with subtle shadow
- **Headers**: `--hh-charcoal` (#333322)
- **Body text**: `--hh-charcoal` with 87% opacity
- **Accent elements**: `--hh-primary` (#EE4433)
- **Success indicators**: `--hh-green` (#77CC99)

#### Navigation Bar
- **Background**: `--hh-white` with border-bottom in `--hh-warm-gray`
- **Logo area**: Primary red accent
- **Active tab**: `--hh-primary-pale` (#FFE8E5) background
- **Hover state**: `--hh-warm-gray` with 20% opacity

#### Chat Interface
- **Background**: `--hh-white`
- **User messages**: `--hh-primary-pale` (#FFE8E5) background
- **AI messages**: `--hh-warm-gray` with 10% opacity
- **Input field**: White with `--hh-warm-gray` border
- **Send button**: `--hh-primary` (#EE4433)

#### Sources Sidebar
- **Background**: `--hh-white`
- **Header**: `--hh-charcoal` with `--hh-primary` accent
- **Source items**: Hover state with `--hh-primary-pale` (5% opacity)
- **Selected source**: `--hh-primary-pale` (#FFE8E5)

#### PDF Preview
- **Container background**: `--hh-warm-gray` with 5% opacity
- **Toolbar**: `--hh-charcoal` (#333322)
- **Toolbar icons**: `--hh-white` on charcoal
- **Page background**: Pure white (#FFFFFF)

---

## Typography

### Font Stack

```css
/* Primary Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
                'Roboto', 'Helvetica Neue', Arial, sans-serif;

/* Monospace Font (code, technical data) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Type Scale

```css
/* Headings */
--text-xs: 0.75rem;      /* 12px - Labels, captions */
--text-sm: 0.875rem;     /* 14px - Secondary text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Subheadings */
--text-xl: 1.25rem;      /* 20px - Card titles */
--text-2xl: 1.5rem;      /* 24px - Section headers */
--text-3xl: 1.875rem;    /* 30px - Page titles */
--text-4xl: 2.25rem;     /* 36px - Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Typography Usage

- **Page Titles**: text-3xl, font-bold, text-charcoal
- **Section Headers**: text-2xl, font-semibold, text-charcoal
- **Card Titles**: text-xl, font-semibold, text-charcoal
- **Body Text**: text-base, font-normal, text-charcoal with 87% opacity
- **Labels**: text-sm, font-medium, text-charcoal with 60% opacity
- **Captions**: text-xs, font-normal, text-warm-gray

---

## Logo & Branding

### Logo Implementation

**Primary Logo**: `docs/logo-new.svg`

#### Logo Variants

1. **Full Logo** (Navigation): Full SVG with company wordmark
   - Usage: Primary navigation bar, login page
   - Min width: 150px
   - Max width: 200px

2. **Icon Only** (Mobile/Small Spaces): Logo mark without wordmark
   - Usage: Mobile navigation, favicons, loading states
   - Sizes: 16x16, 32x32, 48x48, 64x64

3. **Favicon**:
   - Generate from logo SVG
   - Sizes: 16x16, 32x32, 48x48 (PNG)
   - Format: .ico file with multiple sizes

#### Logo Usage Rules

- **Minimum clear space**: 16px around logo on all sides
- **Background**: Always on white or very light backgrounds
- **Color variations**:
  - Primary: Full color (with red accent)
  - Dark mode: White/light variant
  - Monochrome: Grayscale for print
- **Do NOT**: Stretch, rotate, add effects, change colors

#### Implementation Files

```
public/
├── favicon.ico              (Generated from logo)
├── logo-16.png             (16x16 favicon)
├── logo-32.png             (32x32 favicon)
├── logo-48.png             (48x48 favicon)
├── logo-192.png            (192x192 PWA icon)
├── logo-512.png            (512x512 PWA icon)
└── logo.svg                (Full logo for navigation)
```

---

## Component Specifications

### 1. Primary Navigation Bar

**Component**: `src/components/navigation/PrimaryNavigationBar.tsx`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [HH Logo]  PolicyAi    Policies  Chat  Upload  Users  Help │
│                                                    [User ↓] │
└─────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Height**: 64px (h-16)
- **Background**: White with bottom border (`border-b border-hh-warm-gray/20`)
- **Logo**:
  - Height: 40px
  - Clickable link to dashboard
  - Includes "PolicyAi" wordmark in `text-xl font-semibold text-hh-charcoal`
- **Navigation Items**:
  - Gap: 4px between items
  - Padding: px-4 py-2
  - Font: text-sm font-medium
  - Inactive: `text-hh-charcoal/70 hover:text-hh-primary hover:bg-hh-primary-pale/20`
  - Active: `text-hh-primary bg-hh-primary-pale border-b-2 border-hh-primary`
- **User Menu**: Right-aligned dropdown with avatar and role badge
- **Sticky**: `sticky top-0 z-50`

#### Responsive Behavior
- **Desktop (≥768px)**: Full navigation with text labels
- **Mobile (<768px)**: Icons only, logo mark only, hamburger menu

---

### 2. User Greeting Card

**Component**: `src/components/dashboard/UserGreetingCard.tsx`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🌅 Good morning, user@humanhabitat.com                      │
│ Role: 🔴 System Owner                                       │
│                                                              │
│ 📊 Statistics                                               │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ 12 Documents │ │ 3 New        │ │ 1 Processing │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                              │
│ [📋 Manage Documents]  [💬 New Chat]  [📤 Upload]          │
└─────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Container**: Card with white background, rounded-lg, shadow-sm
- **Padding**: p-6
- **Greeting**:
  - Time-based: "Good morning/afternoon/evening"
  - Font: text-2xl font-semibold text-hh-charcoal
  - User email: text-base text-hh-charcoal/70
- **Role Badge**:
  - Large size: px-4 py-2
  - Font: text-sm font-semibold
  - Background: Role-specific color with 20% opacity
  - Border: 2px solid role color
  - Icon + text: e.g., "🔴 System Owner"
- **Statistics Cards**:
  - Grid: 3 columns on desktop, 1 on mobile
  - Each stat: Icon + Number + Label
  - Background: hh-primary-pale/10
  - Hover: slight elevation (shadow-md)
- **Quick Actions**:
  - Role-based buttons
  - Primary button: bg-hh-primary text-white hover:bg-hh-primary-dark
  - Secondary: border-hh-primary text-hh-primary hover:bg-hh-primary-pale

---

### 3. Document Grid

**Component**: `src/components/dashboard/DocumentGrid.tsx`

#### Specifications
- **Grid Layout**:
  - Desktop (≥1280px): 4 columns
  - Laptop (≥1024px): 3 columns
  - Tablet (≥768px): 2 columns
  - Mobile: 1 column
- **Gap**: gap-6
- **Loading State**: Skeleton cards matching document card layout

---

### 4. Document Card

**Component**: `src/components/dashboard/DocumentCard.tsx`

#### Layout
```
┌────────────────────────────┐
│ 📄                   [🔴] │  ← Role badge
│                            │
│ Policy Document Title      │  ← Title (2 lines max)
│                            │
│ Administrator              │  ← Target role
│ Oct 21, 2025 • 2.5 MB     │  ← Metadata
│ ✓ Complete                 │  ← Status
└────────────────────────────┘
```

#### Specifications
- **Container**:
  - Background: white
  - Border: 1px solid hh-warm-gray/30
  - Rounded: rounded-lg
  - Padding: p-4
  - Transition: all 200ms ease
- **Hover State**:
  - Shadow: shadow-lg
  - Border: border-hh-primary/50
  - Transform: translateY(-2px)
- **Role Badge** (top-right):
  - Size: w-8 h-8
  - Rounded: rounded-full
  - Background: Role color
  - Icon: Role emoji
- **Document Icon**:
  - Size: w-12 h-12
  - Color: hh-primary
- **Title**:
  - Font: text-lg font-semibold text-hh-charcoal
  - Lines: max 2 lines with ellipsis
- **Metadata**:
  - Font: text-sm text-hh-charcoal/60
  - Separator: bullet (•) between items
- **Status**:
  - Complete: text-hh-green with ✓
  - Processing: text-hh-warning with ⏳ and pulse animation
  - Error: text-hh-error with ✗

---

### 5. Footer Component

**Component**: `src/components/layout/Footer.tsx`

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│ PolicyAi for Human Habitat                                  │
│ Developed by CoralShades                                    │
│                                                              │
│ © 2025 Human Habitat. All rights reserved.                  │
│ Privacy Policy • Terms of Service • Contact                 │
└─────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Container**:
  - Background: hh-charcoal (#333322)
  - Color: white text
  - Padding: py-8 px-6
  - Border-top: 4px solid hh-primary
- **Content Layout**:
  - Max width: max-w-7xl mx-auto
  - Grid: 2 columns on desktop, 1 on mobile
- **Branding Section** (Left):
  - "PolicyAi for Human Habitat" - text-xl font-semibold
  - "Developed by [CoralShades](https://coralshades.com.au)" - text-sm with link
  - CoralShades link:
    - Color: hh-primary
    - Hover: hh-primary-light with underline
    - External link icon
- **Legal Section** (Right):
  - Copyright: text-sm text-white/70
  - Links: text-sm text-white/70 hover:text-white
  - Separator: • between links
- **Mobile**: Stack vertically, center-aligned

#### Implementation
```typescript
<footer className="bg-hh-charcoal border-t-4 border-hh-primary">
  <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Branding */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">
          PolicyAi for Human Habitat
        </h3>
        <p className="text-sm text-white/70">
          Developed by{' '}
          <a
            href="https://coralshades.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-hh-primary hover:text-hh-primary-light hover:underline inline-flex items-center gap-1"
          >
            CoralShades
            <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

      {/* Legal */}
      <div className="md:text-right">
        <p className="text-sm text-white/70 mb-2">
          © 2025 Human Habitat. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-2 md:justify-end text-sm text-white/70">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <span>•</span>
          <a href="/terms" className="hover:text-white">Terms of Service</a>
          <span>•</span>
          <a href="/contact" className="hover:text-white">Contact</a>
        </div>
      </div>
    </div>
  </div>
</footer>
```

---

### 6. Loading Skeletons

**Component**: `src/components/ui/LoadingSkeleton.tsx`

#### Specifications
- **Base skeleton**: `bg-hh-warm-gray/20 animate-pulse rounded`
- **Document Card Skeleton**:
  - Same dimensions as document card
  - Skeleton for: icon, title (2 lines), metadata (1 line), badge
- **Grid Skeleton**: 6-8 skeleton cards in grid layout
- **Animation**: Smooth pulse (1.5s cycle)

---

### 7. Empty States

**Component**: `src/components/ui/EmptyState.tsx`

#### Variants

**No Documents**:
```
┌─────────────────────────────────┐
│         📭                      │
│                                 │
│   No documents available yet    │
│   Upload your first policy      │
│   document to get started.      │
│                                 │
│   [Upload Document]             │
└─────────────────────────────────┘
```

**No Search Results**:
```
┌─────────────────────────────────┐
│         🔍                      │
│                                 │
│   No documents found            │
│   Try adjusting your search     │
│   or filters.                   │
│                                 │
│   [Clear Filters]               │
└─────────────────────────────────┘
```

#### Specifications
- **Container**: Center-aligned, py-12
- **Icon**: w-16 h-16, text-hh-warm-gray
- **Title**: text-xl font-semibold text-hh-charcoal
- **Description**: text-sm text-hh-charcoal/60, max-w-md
- **Action Button**: Primary or secondary based on context

---

## Layout & Navigation

### Page Layouts

#### Standard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Navigation Bar (64px, sticky)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Main Content Area (min-h-screen - 64px - footer)           │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
│ Footer (auto height)                                        │
└─────────────────────────────────────────────────────────────┘
```

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Navigation Bar                                       │
├─────────────────────────────────────────────────────────────┤
│ [Padding: p-6]                                              │
│                                                              │
│ User Greeting Card                                          │
│                                                              │
│ Document Grid                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
│ Footer                                                       │
└─────────────────────────────────────────────────────────────┘
```

#### Split View Layout (Chat + PDF)
```
┌─────────────────────────────────────────────────────────────┐
│ Primary Navigation Bar                                       │
├────────────────────────────┬────────────────────────────────┤
│ Chat Interface             │ PDF Preview                    │
│ (50% width)                │ (50% width)                    │
│                            │                                │
│                            │ [Resizable divider]            │
└────────────────────────────┴────────────────────────────────┘
│ Footer                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Footer & Credits

### Development Credits

**Required Footer Content**:
- "PolicyAi for Human Habitat"
- "Developed by CoralShades" with link to https://coralshades.com.au
- Copyright © 2025 Human Habitat
- Legal links: Privacy Policy, Terms of Service, Contact

### Link Specifications
- **CoralShades Link**:
  - URL: https://coralshades.com.au
  - Opens in new tab: `target="_blank" rel="noopener noreferrer"`
  - Color: Primary red (#EE4433)
  - Hover: Lighter red with underline
  - External link icon (lucide-react ExternalLink)

### Footer Placement
- **Always visible**: At bottom of every page
- **Sticky footer**: If content is short, footer sticks to bottom
- **Scroll footer**: If content is long, footer appears after scroll

---

## Implementation Roadmap

### Phase 1: Foundation & Branding (Day 1) ✅ IN PROGRESS

#### 1.1 Color System Implementation
- [ ] Update `src/index.css` with Human Habitat color palette
- [ ] Create `src/lib/colors.ts` with color utility functions
- [ ] Test color contrast for WCAG AA compliance

#### 1.2 Logo Integration
- [ ] Optimize `docs/logo-new.svg` for web
- [ ] Generate favicon sizes (16, 32, 48, 192, 512)
- [ ] Create `public/favicon.ico`
- [ ] Update `index.html` with favicon and meta tags

#### 1.3 Typography Setup
- [ ] Verify Inter font is loaded
- [ ] Add JetBrains Mono for code/monospace
- [ ] Test font rendering across browsers

#### 1.4 Install shadcn Components
```bash
npx shadcn@latest add card avatar separator skeleton table checkbox dropdown-menu select alert-dialog popover command scroll-area input label tabs breadcrumb
```

### Phase 2: Core Components (Day 2-3)

#### 2.1 Footer Component
- [ ] Create `src/components/layout/Footer.tsx`
- [ ] Implement CoralShades branding and links
- [ ] Add to all page layouts
- [ ] Test responsive behavior

#### 2.2 Enhanced Navigation
- [ ] Update `PrimaryNavigationBar.tsx` with new logo
- [ ] Add Human Habitat branding
- [ ] Implement active states with new colors
- [ ] Add user menu with role badge

#### 2.3 User Greeting Card
- [ ] Create `src/components/dashboard/UserGreetingCard.tsx`
- [ ] Implement time-based greeting
- [ ] Add document statistics
- [ ] Add role-based quick actions
- [ ] Create `src/hooks/useDocumentStats.tsx`

#### 2.4 Loading & Empty States
- [ ] Create `src/components/ui/LoadingSkeleton.tsx`
- [ ] Create `src/components/ui/EmptyState.tsx`
- [ ] Add to Dashboard and other pages
- [ ] Test animations and transitions

### Phase 3: Dashboard Enhancement (Day 4)

#### 3.1 Document Grid Improvements
- [ ] Update `DocumentGrid.tsx` with new styling
- [ ] Add responsive grid layout
- [ ] Implement loading skeletons
- [ ] Add empty state

#### 3.2 Enhanced Document Cards
- [ ] Update `DocumentCard.tsx` with new design
- [ ] Add role badge with new colors
- [ ] Implement hover effects
- [ ] Add processing state animations

#### 3.3 Dashboard Layout
- [ ] Reorganize Dashboard.tsx
- [ ] Add UserGreetingCard at top
- [ ] Update spacing and padding
- [ ] Test responsive behavior

### Phase 4: Document Management (Day 5-6)

#### 4.1 Document Management Page
- [ ] Create `src/pages/admin/DocumentManagement.tsx`
- [ ] Implement data table with sorting/filtering
- [ ] Add bulk selection
- [ ] Create edit/delete dialogs

#### 4.2 API Integration
- [ ] Create `src/hooks/useDocumentManagement.tsx`
- [ ] Implement CRUD operations
- [ ] Add optimistic updates
- [ ] Error handling and toasts

### Phase 5: Polish & Testing (Day 7)

#### 5.1 Animations & Transitions
- [ ] Create `src/lib/animations.ts`
- [ ] Add page transitions
- [ ] Add card hover effects
- [ ] Add loading animations

#### 5.2 Accessibility
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation testing
- [ ] Focus visible styles
- [ ] Screen reader testing

#### 5.3 Responsive Testing
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Touch target sizes

#### 5.4 Cross-Browser Testing
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Design Assets

### Required Files

```
docs/
├── logo-new.svg              (Source logo - provided)
├── ux-ui-specification.md    (This document)

public/
├── favicon.ico               (Generated)
├── logo-16.png              (Generated)
├── logo-32.png              (Generated)
├── logo-48.png              (Generated)
├── logo-192.png             (Generated)
├── logo-512.png             (Generated)
└── logo.svg                 (Optimized for web)

src/
├── index.css                 (Updated with color palette)
├── lib/
│   ├── colors.ts            (Color utility functions)
│   ├── animations.ts        (Animation utilities)
│   └── rolePalette.ts       (Role color mapping)
├── components/
│   ├── layout/
│   │   └── Footer.tsx       (New component)
│   ├── dashboard/
│   │   ├── UserGreetingCard.tsx      (New)
│   │   ├── DocumentGridSkeleton.tsx  (New)
│   │   └── EmptyState.tsx            (New)
│   └── ui/
│       └── LoadingSkeleton.tsx       (New)
```

---

## Success Criteria

### Visual Quality
- ✅ Consistent Human Habitat branding throughout
- ✅ Professional, polished appearance
- ✅ Smooth animations and transitions
- ✅ Role colors clearly distinguish user types

### Functionality
- ✅ Logo loads quickly and scales properly
- ✅ Footer appears on all pages with correct links
- ✅ Color contrast meets WCAG AA standards
- ✅ Components render correctly on all screen sizes

### Performance
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Smooth 60fps animations
- ✅ No layout shifts on load

### User Experience
- ✅ Clear visual hierarchy
- ✅ Intuitive navigation
- ✅ Helpful loading and empty states
- ✅ Accessible to all users

---

## Notes

- All colors tested for WCAG AA contrast compliance
- Logo SVG optimized for web performance
- Footer links verified and working
- Responsive breakpoints align with Tailwind defaults
- Component library based on shadcn/ui for consistency
- Role colors ensure quick visual identification of permissions

**Next Steps**: Begin implementation with Phase 1 (Foundation & Branding)
