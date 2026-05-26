---
name: PitchZone
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c7c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#46464c'
  surface-tint: '#c2c6db'
  primary: '#c2c6db'
  on-primary: '#2b3040'
  primary-container: '#0a0f1e'
  on-primary-container: '#777b8e'
  inverse-primary: '#595e70'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#dfc1a7'
  on-tertiary: '#3f2d1a'
  tertiary-container: '#1a0c01'
  on-tertiary-container: '#907760'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dee1f7'
  primary-fixed-dim: '#c2c6db'
  on-primary-fixed: '#161b2b'
  on-primary-fixed-variant: '#414658'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#fdddc1'
  tertiary-fixed-dim: '#dfc1a7'
  on-tertiary-fixed: '#281807'
  on-tertiary-fixed-variant: '#58432f'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style
The design system is engineered for the high-performance world of professional cricket and the fans who live it. It bridges the gap between a high-end gaming dashboard and a premium sports broadcast experience. The aesthetic is defined as **Modern Tech-Athleticism**: a fusion of Nike’s raw energy and Apple’s precision.

The emotional response should be one of "The Pulse"—the feeling of being under stadium lights. This is achieved through a dark-mode-first approach, utilizing deep atmospheric gradients, glassmorphism for layered depth, and neon accents that simulate digital scoreboards. The UI is cinematic, immersive, and built for speed, reflecting the tactical intensity of the sport.

## Colors
The palette is rooted in the "After Dark" stadium experience.
- **Primary (Deep Navy):** Used for the structural base and deep backgrounds to provide an infinite canvas feel.
- **Secondary (Electric Blue):** Used for interaction states, active navigation, and primary branding elements.
- **Accent (Neon Green):** Reserved for high-priority actions, live statuses (e.g., "Live Match"), and performance metrics.
- **Surface Strategy:** Utilize semi-transparent layers of the primary color with `backdrop-filter: blur(12px)` to create a glassmorphic hierarchy over the background gradients.

## Typography
Typography in the design system strikes a balance between authoritative sports media and modern SaaS. 

**Montserrat** is used exclusively for headlines and data callouts. Its geometric, bold nature evokes the feeling of jersey numbers and stadium signage. Use uppercase styling for section headers and "Display" sizes to maximize impact.

**Plus Jakarta Sans** provides a sophisticated, readable contrast for body text, commentary, and descriptions. Its soft curves ensure that the UI remains approachable and "human" despite the technical dark-mode aesthetic.

## Layout & Spacing
The layout follows a **Fluid Dashboard Grid**. Content is organized into modular cards that adapt to the viewport.
- **Desktop:** 12-column grid with a 1440px max-width. Use 24px gutters to allow the glassmorphism effects enough "air" to be effective.
- **Mobile:** 4-column grid with 16px margins. 
- **Rhythm:** All spacing must be multiples of 4px. Use generous `stack-lg` (32px) and `stack-xl` (64px) between major sections to maintain a premium, editorial feel that avoids information density overload.

## Elevation & Depth
Elevation is not conveyed through traditional shadows, but through **Tonal Opacity and Blur**.
- **Level 1 (Base):** Background gradient (#0A0F1E to Black).
- **Level 2 (Cards):** Primary color at 40-60% opacity with a 12px-20px backdrop blur. Borders should be 1px solid white at 10% opacity to define the edge.
- **Level 3 (Overlays/Modals):** Primary color at 80% opacity with a 40px backdrop blur.
- **Glow Effects:** Use the Accent (Neon Green) or Secondary (Electric Blue) as a soft "Outer Glow" (0px 0px 20px) for active match indicators or high-priority CTA buttons.

## Shapes
The design system uses a dual-radius strategy to balance sportiness with modern tech:
- **Major Containers (Cards, Modals):** Use `rounded-lg` (16px) or `rounded-xl` (24px) for a soft, premium feel.
- **Interactive Elements (Buttons, Inputs, Chips):** Use `rounded-md` (8px) for a sharper, more precise appearance.
- **Data Visuals:** Charts and progress bars should use rounded caps to maintain the "human" aspect of the brand.

## Components
- **Glass Cards:** The signature component. Semi-transparent dark navy background, subtle top-down white border-gradient (1px), and 20px blur.
- **Performance Buttons:** 
    - **Primary:** Solid Electric Blue with Montserrat SemiBold text. On hover, apply a Neon Green glow.
    - **Ghost:** Transparent background with a 1px white border at 20% opacity.
- **Score Chips:** Small capsules with Neon Green text for live indicators, using a subtle pulse animation for "Live" status.
- **Inputs:** Darker than the card background with a 1px border that glows Electric Blue on focus.
- **Stat Widgets:** High-contrast data points using Montserrat Bold for the numbers and Plus Jakarta Sans for the labels, often paired with a circular progress indicator in Neon Green.
- **Match Timeline:** A vertical or horizontal track using thin lines and high-contrast pips to show wickets and milestones.