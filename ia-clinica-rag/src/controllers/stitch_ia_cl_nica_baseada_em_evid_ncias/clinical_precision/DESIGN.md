---
name: Clinical Precision
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
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for high-stakes medical environments where clarity, evidence, and trust are paramount. The aesthetic follows a **Modern Corporate** direction with a focus on functional minimalism. It rejects decorative trends in favor of a "tools-not-toys" philosophy, ensuring that medical professionals can process complex AI-generated insights without cognitive overload.

The visual language is defined by structured data density, rigorous alignment, and a sober atmosphere. It evokes the feeling of a high-end medical instrument: precise, reliable, and unobtrusive. Whitespace is used strategically as a functional tool to separate distinct clinical observations and prevent eye fatigue during extended diagnostic sessions.

## Colors
The palette is rooted in medical sobriety. 
- **Primary:** Deep Navy (#0F172A) is used for headers, text, and primary navigation to establish authority and trust.
- **Secondary:** Teal / Petróleo (#0D9488) serves as the primary brand identifier, used for progress indicators, success states, and subtle branding elements.
- **Accent:** Vibrant Professional Blue (#2563EB) is strictly reserved for high-priority Call to Actions (CTAs) and primary interaction points to ensure they remain distinct from static clinical data.
- **Backgrounds:** Clinical White (#FFFFFF) and Slate Grays (#F8FAFC) provide a clean, sterile canvas that mimics a digital lab environment.

## Typography
This design system utilizes **Inter** for its exceptional legibility in technical contexts and neutral, systematic tone. 

- **Headlines:** Use tight letter spacing and heavier weights to provide structure to page sections.
- **Body Text:** Optimized for long-form clinical reading with generous line heights.
- **Labels:** Small caps or bolded 12px labels are used for metadata, evidence sourcing, and form field descriptors to maintain a clear distinction from patient data.
- **Data Display:** Numerical values and clinical metrics should use `code-data` styling for maximum character differentiation.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid Grid**. On desktop, content is contained within a 1440px max-width container to prevent line-lengths from becoming unreadable.

- **Grid:** A 12-column grid with 24px gutters is standard. 
- **Rhythm:** An 8px base unit drives all padding and margins. 
- **Sectioning:** Large vertical gaps (48px+) separate distinct diagnostic modules or patient history sections to reduce visual noise.
- **Responsive:** On mobile, margins reduce to 16px and the grid collapses to a single column, with data tables converting to cards.

## Elevation & Depth
To maintain a professional and clean appearance, this design system avoids heavy shadows. Depth is communicated through **Tonal Layering** and **Low-Contrast Outlines**.

- **Surface Levels:** The base page is #F8FAFC. Primary content containers (cards) are pure white (#FFFFFF).
- **Outlines:** Use 1px solid borders in #E2E8F0 for all containers.
- **Shadows:** Only use a single, very soft "resting" shadow for primary interaction cards (4px Blur, 2% Opacity Black).
- **Active State:** Elements being interacted with should not "lift" but rather change border color to the Secondary Teal or Accent Blue.

## Shapes
Shapes are conservative and precise. A **Soft (0.25rem)** corner radius is used for the majority of UI components, providing a modern feel while remaining professional and structured. 

- **Buttons/Inputs:** 4px (0.25rem) radius.
- **Cards/Modals:** 8px (0.5rem) radius for `rounded-lg`.
- **Search Bars:** Should remain squared or use the standard 4px radius; avoid pill-shapes as they appear too "consumer-oriented."

## Components
- **Buttons:** Primary CTAs use the Accent Blue. Secondary actions use an outline-only style with the Deep Navy text. All buttons use 44px minimum height for accessibility.
- **Clinical Cards:** White background, 1px #E2E8F0 border. Headers within cards should have a subtle #F8FAFC bottom border to separate titles from data.
- **Data Tables:** High-density, no vertical lines. Use subtle horizontal row separators. Header rows should be in the `label-bold` style.
- **Evidence Sources:** Small "Source" chips using the Teal color at 10% opacity with 100% opacity text to indicate AI-generated citations.
- **Inputs:** Clear, 1px bordered boxes. Focus state is a 2px solid Accent Blue ring. Error states use a professional deep red (#B91C1C), never neon.
- **Status Indicators:** Use small, solid circular dots (e.g., Green for "Verified", Amber for "Pending Review") rather than large icons to keep the interface sober.