# WalrusCLI Design Guidelines

## 1. Design Philosophy
**"Modern Minimal Tech"**
- **Clarity over Density**: Interfaces should be clean, spacious, and focus on the primary action.
- **Trustworthy**: Use a professional blue palette to convey stability and security (Web3 context).
- **Function-First**: Domain management is utilitarian; the design should facilitate quick searching, buying, and linking.

## 2. Color Palette (Walrus / SaaS Blue Theme)

### Primary Colors
- **Primary**: `#2563EB` (Blue-600) - Main actions, buttons, active states.
- **Primary Hover**: `#1D4ED8` (Blue-700) - Hover states for primary actions.
- **Secondary**: `#F1F5F9` (Slate-100) - Secondary buttons, backgrounds.
- **Accent**: `#3B82F6` (Blue-500) - Highlights, focus rings.

### Neutral Colors
- **Background**: `#FFFFFF` (White) - Card backgrounds, main content areas.
- **App Background**: `#F8FAFC` (Slate-50) - Page background.
- **Foreground (Text)**: `#0F172A` (Slate-900) - Primary text, headings.
- **Muted Foreground**: `#64748B` (Slate-500) - Secondary text, descriptions.
- **Border**: `#E2E8F0` (Slate-200) - Dividers, card borders, input borders.

### Status Colors
- **Success**: `#22C55E` (Green-500) - Available domains, successful transactions.
- **Error/Destructive**: `#EF4444` (Red-500) - Unavailable domains, errors, delete actions.
- **Warning**: `#F59E0B` (Amber-500) - Expiring soon.

## 3. Typography
**Font Family**: `Inter`, sans-serif (Standard, legible, modern).

### Scale
- **H1 (Page Title)**: 24px (1.5rem) / Bold (700)
- **H2 (Section Title)**: 20px (1.25rem) / Semibold (600)
- **H3 (Card Title)**: 18px (1.125rem) / Semibold (600)
- **Body**: 14px (0.875rem) / Regular (400)
- **Small / Meta**: 12px (0.75rem) / Medium (500)

## 4. Spacing & Layout
**Grid System**: 4px base grid (Tailwind defaults).
- **Container**: Max width `1200px` (max-w-7xl), centered.
- **Padding**: `p-4` (16px) or `p-6` (24px) for cards and sections.
- **Gap**: `gap-4` (16px) standard between elements.
- **Radius**: `rounded-lg` (0.5rem) for cards and inputs, `rounded-md` (0.375rem) for buttons.

## 5. Components (shadcn/ui style)

### Buttons
- **Primary**: Blue-600 background, White text, Shadow-sm.
- **Secondary**: Slate-100 background, Slate-900 text.
- **Outline**: White background, Border Slate-200, Slate-900 text.

### Inputs
- White background, Border Slate-200.
- Focus: Ring-2 Ring-Blue-500 Ring-offset-2.

### Cards
- White background, Border Slate-200, Shadow-sm.
- Header/Content/Footer structure.

### Modals (Dialogs)
- Centered overlay (Black/50 backdrop).
- White modal content, rounded-lg, shadow-lg.
