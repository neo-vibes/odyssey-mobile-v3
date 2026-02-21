# UI Design System

> Dark mode first. Space Grotesk. Odyssey gold.

## Typography

### Font: Space Grotesk

- Geometric, modern aesthetic
- Excellent legibility at all sizes
- Weights: 300-700
- Tabular figures for numbers

**Fallback:** System fonts (SF Pro / Roboto)

### Type Scale

| Name | Size | Line | Weight | Usage |
|------|------|------|--------|-------|
| Display | 48pt | 56 | Bold | Balance |
| H1 | 32pt | 40 | Semibold | Screen titles |
| H2 | 24pt | 32 | Semibold | Section headers |
| H3 | 20pt | 28 | Medium | Card titles |
| Body | 16pt | 24 | Regular | Primary text |
| Caption | 14pt | 20 | Regular | Labels |
| Micro | 12pt | 16 | Medium | Timestamps |

### Typography Rules

- **Monospace for addresses:** SF Mono or JetBrains Mono
- **Tabular figures:** Enable for all numbers
- **Truncation:** Middle-truncate addresses (7xKt...3nQm)

---

## Color System

### Dark Mode (Primary)

```
BACKGROUNDS
#000000  Black      (OLED black)
#0A0A0A  Base       (Primary background)
#141414  Elevated   (Cards, modals)
#1C1C1E  Subtle     (Input fields)
#262626  Hover      (Interactive states)

BRAND (Gold)
#FFB84D  Primary    (Main accent)
#F5A623  Hover      (Hover state)
#D4920A  Muted      (Disabled)
#2E1065  Subtle BG  (Tinted backgrounds)

TEXT
#FFFFFF  Primary    (Main text)
#A1A1AA  Secondary  (Supporting text)
#52525B  Muted      (Disabled text)

SEMANTIC
#22C55E  Success    (Green)
#EF4444  Error      (Red)
#F59E0B  Warning    (Amber)
```

### Why Gold?

- 🚀 Odyssey brand: adventure, exploration
- Distinct from Phantom purple
- High contrast on dark backgrounds
- Conveys warmth and approachability

### Color Rules

1. **Use varying dark grays** — Not pure black everywhere
2. **Reduce saturation** — Bright colors hurt in dark mode
3. **Elevate with lightness** — Higher = lighter
4. **Avoid pure white text** — Use #F4F4F5 or #E4E4E7
5. **Gradients sparingly** — Max one per screen, accent only

### Light Mode (Secondary)

```
#FFFFFF  Background
#F9FAFB  Elevated
#F3F4F6  Subtle
#111827  Text Primary
#6B7280  Text Secondary
```

---

## Components

### Buttons

```tsx
// Primary (filled)
<Button variant="solid" className="bg-gold-500">
  <ButtonText>Approve</ButtonText>
</Button>

// Secondary (outline)
<Button variant="outline" className="border-gold-500">
  <ButtonText className="text-gold-500">Cancel</ButtonText>
</Button>

// Ghost (text only)
<Button variant="ghost">
  <ButtonText className="text-zinc-400">Skip</ButtonText>
</Button>
```

### Cards

```tsx
<View className="bg-zinc-900 rounded-2xl p-4 gap-3">
  <Text className="text-white font-semibold">Title</Text>
  <Text className="text-zinc-400">Content</Text>
</View>
```

### Session Card

```tsx
<Pressable className="bg-zinc-900 rounded-xl p-4 flex-row items-center gap-3">
  <View className="w-10 h-10 bg-gold-900 rounded-full items-center justify-center">
    <Text>🤖</Text>
  </View>
  <View className="flex-1">
    <Text className="text-white font-medium">Neo</Text>
    <Text className="text-zinc-500 text-sm">0.5 SOL limit</Text>
  </View>
  <View className="items-end">
    <Text className="text-green-500 text-sm">Active</Text>
    <Text className="text-zinc-500 text-xs">45min left</Text>
  </View>
</Pressable>
```

---

## Haptic Feedback

```tsx
import * as Haptics from 'expo-haptics';

// Button press
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Success
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Error
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```

---

*Reference for visual design. Load react-native.md for implementation.*
