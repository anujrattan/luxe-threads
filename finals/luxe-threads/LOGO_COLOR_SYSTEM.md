# Tinge Clothing - Logo & Webapp Color System

## Logo Color Palette

### Primary Colors

- **Brand Purple**: `#9333EA` (Primary brand color - main logo text, CTAs, accents)
- **Deep Purple**: `#7C3AED` (Hover states, darker variants)
- **Bright Purple**: `#C056F0` (Dark theme accent, highlights)

### Secondary Colors

- **Pink Accent**: `#EC4899` (Gradients, secondary accents)
- **Coral**: `#F97316` (Warm accent, sale badges)
- **Yellow Highlight**: `#F5E04E` or `#FACC15` (Tiny details only - dot on "i", micro accents)

### Neutral Colors

- **Dark Background**: `#0F172A` or `#020617` (Dark theme backgrounds)
- **Dark Surface**: `#191333` (Dark theme cards, surfaces)
- **Light Background**: `#FFFFFF` (Light theme background)
- **Light Surface**: `#F9FAFB` or `#F5F5F5` (Light theme cards, sections)
- **Text Dark**: `#111827` (Light theme primary text)
- **Text Light**: `#F9FAFB` or `#FFFFFF` (Dark theme primary text)
- **Text Secondary Dark**: `#4B5563` (Light theme secondary text)
- **Text Secondary Light**: `#A9A2C2` (Dark theme secondary text)

## Webapp Color System

### Light Theme

```css
Background: #FFFFFF
Surface: #F9FAFB
Primary Text: #111827
Secondary Text: #4B5563
Accent: #9333EA
Accent Hover: #7C3AED
Border: #E5E7EB
Card Background: #FFFFFF
Card Border: #D1D5DB
```

### Dark Theme

```css
Background: #0D091F
Surface: #191333
Primary Text: #FFFFFF
Secondary Text: #A9A2C2
Accent: #C056F0
Accent Hover: #a845d0
Border: rgba(255, 255, 255, 0.1)
Card Background: #191333
Card Border: rgba(255, 255, 255, 0.1)
```

### Interactive Elements

- **Primary Button**: `#9333EA` → `#7C3AED` (hover)
- **Secondary Button**: Transparent with `#9333EA` border
- **Success**: `#10B981` (green)
- **Warning**: `#F59E0B` (amber)
- **Error**: `#EF4444` (red)
- **Info**: `#3B82F6` (blue)

### Status Colors

- **Sale Badge**: `#F472B6` (pink)
- **New Badge**: `#10B981` (green)
- **Featured Badge**: Gradient `#9333EA` → `#EC4899`

### Typography Scale

- **Display Font**: Sora (headings, hero text)
- **Body Font**: Inter (body text, UI elements)
- **Accent Font**: For logo only - see logo prompts below

---

## Logo Usage Rules

### On Light Backgrounds

- Logo text: `#9333EA` (purple) or `#111827` (dark gray)
- Accent elements: `#9333EA` or `#EC4899`
- Yellow: Only for micro-details (dot on "i", tiny underline)

### On Dark Backgrounds

- Logo text: `#FFFFFF` or `#F9FAFB` (white/off-white)
- Accent elements: `#C056F0` (bright purple) or `#EC4899` (pink)
- Optional: Add subtle purple glow/shadow

### On Hero Images

- Use white text with purple accent
- Add dark overlay (60-70% opacity) behind logo for readability
- Consider adding subtle drop shadow or outline

---

## Accessibility

### Contrast Ratios (WCAG AA minimum)

- Primary text on background: **4.5:1** minimum
- Large text (18pt+): **3:1** minimum
- Interactive elements: **3:1** minimum

### Color Combinations

✅ **Good Contrast:**

- Purple (`#9333EA`) on white
- White on purple
- Dark gray (`#111827`) on white
- White on dark (`#0D091F`)

❌ **Avoid:**

- Yellow on white (low contrast)
- Light gray on white
- Similar shades next to each other
