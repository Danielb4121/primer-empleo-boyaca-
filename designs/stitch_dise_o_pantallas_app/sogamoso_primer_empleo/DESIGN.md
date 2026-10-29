---
name: Sogamoso Primer Empleo
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3e4942'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7a71'
  outline-variant: '#bdcac0'
  surface-tint: '#006c47'
  primary: '#006b47'
  on-primary: '#ffffff'
  primary-container: '#00875a'
  on-primary-container: '#ffffff'
  inverse-primary: '#71dba6'
  secondary: '#525d80'
  on-secondary: '#ffffff'
  secondary-container: '#cad6ff'
  on-secondary-container: '#515c7f'
  tertiary: '#006a61'
  on-tertiary: '#ffffff'
  tertiary-container: '#00857a'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8df7c1'
  primary-fixed-dim: '#71dba6'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005235'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#bac5ee'
  on-secondary-fixed: '#0d1a39'
  on-secondary-fixed-variant: '#3a4667'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
This design system is tailored for university students and recent graduates in Sogamoso and its surrounding Boyacá region who are taking their first steps into the labor market. The ethos is empowering, clear, grounded, and optimistic: it replaces the intimidation and gatekeeping of traditional corporate job portals with radical clarity and confidence.

The design philosophy combines **Clean Modern Utility** with **Tactile Youthful Professionalism**:
- **Clarity over noise:** Every job post foregrounds transparency—salary range, exact location (e.g., Sogamoso Centro, El Laguito), schedule flexibility (Medio tiempo, Prácticas), and an explicit confirmation that zero prior experience is required.
- **Approachable authority:** Clean geometric typography paired with an emerald and deep indigo palette brings an energetic balance of growth, stability, and regional pride.
- **Tactile efficiency:** Generously radiused cards (`rounded-2xl`), responsive pill tags, and soft ambient elevation make mobile navigation fast and stress-free on one-handed mobile devices.

## Colors
The palette balances vibrant growth and institutional trust:
- **Primary (`#00875A` - Emerald Growth):** Drives core action points, application triggers, verification badges, and primary status indicators signifying opportunity and success.
- **Secondary (`#1E2A4A` - Deep Boyacá Indigo):** Anchors headers, structural framing, high-contrast title typography, and key navigational surfaces, providing grounding and professionalism.
- **Tertiary (`#0D9488` - Fresh Teal):** Highlights active filters, tags such as *Sin experiencia* or *Medio tiempo*, and interactive micro-states.
- **Neutral Palette (`#0F172A` to `#F8FAFC`):** Backgrounds utilize `#F8FAFC` (Canvas Tint) with stark `#FFFFFF` card surfaces. Text ranges from high-contrast `#0F172A` (titles) to slate `#64748B` (metadata and labels).
- **Semantic Accents:** Amber (`#D97706`) for application deadlines, and Soft Rose (`#E11D48`) for saved/bookmarked indicators.

## Typography
The system balances the geometric warmth of **Plus Jakarta Sans** for titles, metric displays, and badge labels with the neutral legibility of **Inter** for descriptions, requirements, and form fields.

- Headings focus on scannable salary figures and job titles at a glance without truncating essential context.
- Body copy guarantees high contrast ratios against light backgrounds (minimum 4.5:1 for standard text, 7:1 for headline components).
- Compact tag labels use uppercase tracking (`label-sm`) with 700 weight for immediate identification of critical qualifiers like "SIN EXPERIENCIA".

## Layout & Spacing
Designed mobile-first with an ergonomic 4-column layout for portrait handheld views, expanding to 8 columns on tablets.
- **Canvas Margins:** Mobile screens maintain a minimum `1rem` (16px) margin, expanding to `1.25rem` on larger screen viewports.
- **Touch Targets:** Interactive areas maintain a strict minimum bounding box of 44x44px.
- **Feed Rhythm:** Vacancy cards stack with `space-md` (16px) vertical gaps. Badge clusters and metadata lines utilize `space-xs` (4px) to `space-sm` (8px) flex wrapping to adapt cleanly across screen widths.

## Elevation & Depth
Depth is established primarily through crisp tonal contrast and delicate ambient shadows rather than harsh outlines:
- **Surface Level 0 (Canvas):** `#F8FAFC`, a soft off-white canvas that prevents glare during extended browsing.
- **Surface Level 1 (Card Default):** `#FFFFFF` paired with an ultra-soft ambient shadow: `0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)` with a hairline border of `1px solid #E2E8F0`.
- **Surface Level 2 (Floating Action & Filter Bar):** `#FFFFFF` with glassmorphic backdrop-blur (`backdrop-filter: blur(12px)`) and a directional drop shadow: `0 10px 24px -4px rgba(30, 42, 74, 0.08)`.
- **Surface Level 3 (Modals & Bottom Sheets):** Deep scrim overlay (`rgba(15, 23, 42, 0.45)`) combined with bottom-sheet entry elevation `0 -8px 30px rgba(0, 0, 0, 0.12)`.

## Shapes
A friendly, modern curve is uniform across all interactive touchpoints:
- **Base Cards & Modules:** Styled with standard `rounded-2xl` (1rem / 16px) corner radiuses, giving the interface a welcoming, accessible feel.
- **Pills and Tags:** Fully rounded pill shapes (`border-radius: 9999px`) to visually differentiate metadata badges from container surfaces.
- **Primary Buttons & Form Inputs:** Uniform `rounded-xl` (12px) curvature to optimize thumb feel and maintain strong button presence.

## Components

### 1. Job Cards
- **Container:** Pure `#FFFFFF` background, `rounded-2xl` border radius, `1px solid #E2E8F0`, padded with `1.25rem`.
- **Header:** Company avatar/icon placeholder (40x40px, `rounded-xl`), job role title in Plus Jakarta Sans 600 (`#1E2A4A`), and bookmark icon button anchored top-right.
- **Badge Ribbon:** Horizontal flex row of pills:
  - *Sin experiencia*: Emerald tint (`#ECFDF5`), emerald text (`#00875A`), emerald hairline border.
  - *Jornada / Horario*: Neutral tint (`#F1F5F9`), slate text (`#475569`).
  - *Ubicación*: Subtle indigo tint (`#EEF2FF`), text (`#3730A3`).
- **Footer:** Highlights the stipend or salary clearly (e.g., "$1.300.000 COP" or "A convenir / Por horas") alongside publication recency.

### 2. Tag Pills
- **Style:** Compact, height of 28px, padding `0.25rem 0.75rem`, font `label-sm` or `label-md`.
- **States:** Active filter state transitions to solid `#00875A` with white typography.

### 3. Primary & Secondary Buttons
- **Primary:** Full width on mobile bottom bar, solid `#00875A` background, `#FFFFFF` text, `rounded-xl`, height of 48px, active tap scale `0.98`.
- **Secondary / Ghost:** `#F1F5F9` background, `#1E2A4A` text, or transparent with `1.5px solid #CBD5E1`.

### 4. Input Fields & Search Bars
- **Surface:** `#FFFFFF` background with `1.5px solid #E2E8F0` border, `rounded-xl` corners, 48px height.
- **States:** Focused state adopts `#00875A` border and `0 0 0 3px rgba(0, 135, 90, 0.15)` ring glow. Integrated clear-text action and leading search icon.

### 5. Checkboxes & Filter Selectors
- Custom 20x20px checkboxes with `rounded-md` (6px) corners. Active state transitions to emerald background with crisp white checkmark icon.

### 6. Vacancy Details Bottom Sheet
- Draggable top bar with handle (`36px x 4px`, `#CBD5E1`), distinct sections for *Requisitos*, *Funciones del cargo*, and *Condiciones*, concluding with a persistent floating "Guardar Vacante" or "Contactar / Ver Datos" CTA.