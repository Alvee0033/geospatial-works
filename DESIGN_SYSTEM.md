# DESIGN_SYSTEM.md — Geospatial Works Dark Emerald UI Design Tokens & Component Specification

> **Aesthetic Theme:** Dark Emerald Obsidian & High-Tech Radar HUD  
> **Visual Vibe:** Enterprise Surveying, Satellite Photogrammetry, Sub-Centimeter GNSS Precision.

---

## 1. Color Palette Tokens

### Primary Brand Palette

```css
:root {
  /* Main Backgrounds */
  --bg-primary:      #071D16; /* HSL(160, 55%, 9%)  - Deep Emerald Obsidian */
  --bg-secondary:    #0B2B20; /* HSL(160, 51%, 15%) - Dark Jade Glass Base */
  --bg-surface:      #10382A; /* HSL(161, 48%, 20%) - Forest Bio-Tech Surface */
  --bg-elevated:     #164736; /* Elevated Card Hover State */
  --bg-glass-card:   rgba(11, 43, 32, 0.85);

  /* Accents & Brand Colors */
  --accent-orange:   #FF8C00; /* HSL(33, 100%, 50%) - Precision Safety Orange */
  --accent-cyan:     #00D2FF; /* HSL(191, 100%, 50%)- Geo Cyan / Radar Blue */
  --brand-red:       #E53935; /* HSL(1, 77%, 55%)   - Geospatial Crimson */

  /* Text Hierarchy */
  --text-main:       #FAFAFA; /* Crisp Pure White */
  --text-muted:      #A3B8B0; /* Muted Silver Emerald */
  --text-dim:        #6E8A80; /* Subtle Secondary Subtext */

  /* Borders & Glow Effects */
  --border-subtle:   rgba(0, 210, 255, 0.12);
  --border-active:   rgba(0, 210, 255, 0.40);
  --border-orange:   rgba(255, 140, 0, 0.40);
  --shadow-cyan-glow: 0 0 20px rgba(0, 210, 255, 0.25);
  --shadow-orange-glow: 0 4px 25px rgba(255, 140, 0, 0.35);
}
```

---

## 2. Typography Hierarchy & Scale

```
Font Family Headers: "Outfit", "Rajdhani", sans-serif
Font Family Body:    "Inter", sans-serif
Font Family Mono:    "JetBrains Mono", monospace (GNSS coordinates, serial numbers, accuracy metrics)
```

| Element | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero H1** | `3.5rem` (56px) | `800` (ExtraBold) | `1.08` | `-0.02em` |
| **Section Title H2** | `2.75rem` (44px) | `800` (ExtraBold) | `1.15` | `-0.01em` |
| **Card Heading H3** | `1.4rem` (22px) | `700` (Bold) | `1.2` | `0.00em` |
| **Body Large** | `1.2rem` (19.2px) | `400` (Regular) | `1.6` | `0.00em` |
| **Body Regular** | `1.0rem` (16px) | `400` (Regular) | `1.5` | `0.00em` |
| **Tech Monospace Tag** | `0.75rem` (12px) | `600` (SemiBold) | `1.4` | `0.08em` |

---

## 3. Atomic UI Component Catalog

### 3.1 Buttons (`.btn`)
```html
<!-- Primary Orange CTA -->
<button class="btn btn-primary">
  Request Survey Quote ➔
</button>

<!-- Glassmorphic Outline Button -->
<button class="btn btn-outline">
  Explore UAV Fleet
</button>
```

### 3.2 Glassmorphic Card (`.glass-card`)
```html
<div class="glass-card">
  <div class="badge badge-orange">Sub-Centimeter Fix</div>
  <h3 class="card-title">CHCNAV i83 RTK GNSS</h3>
  <p class="card-desc">1408 Channels • Multi-Band GPS/GLONASS/Beidou</p>
</div>
```

### 3.3 Radar Visualizer Component
- Circular layered rings with 360° rotating conic-gradient sweep keyframe animation (`radarRotate 5s linear infinite`).

---

## 4. Animation Keyframes

```css
/* Radar Scanner 360 Rotation */
@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Floating Drone Card Effect */
@keyframes floatAnim {
  0%   { transform: translateY(0px); }
  100% { transform: translateY(-12px); }
}

/* Blinking GNSS Status Indicator */
@keyframes blinkPulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
```
