# React Native Best Practices

> NativeWind + gluestack + Reanimated

## Tech Stack

| Category | Choice | Why |
|----------|--------|-----|
| **Styling** | NativeWind v5 | Tailwind for RN, fast, familiar |
| **Components** | gluestack-ui v2 | Accessible, customizable |
| **Animations** | Reanimated 4 + Moti | 60fps, native thread |
| **Gestures** | Gesture Handler 2 | Native gestures |
| **Lists** | FlashList | 10x faster than FlatList |
| **Navigation** | React Navigation 7 | Native stack, type-safe |
| **State** | Zustand | Simple, performant |
| **Icons** | Lucide React Native | Consistent, lightweight |

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Base primitives (gluestack)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   ├── common/          # Shared components
│   │   ├── Balance.tsx
│   │   ├── AddressDisplay.tsx
│   │   └── SessionCard.tsx
│   └── screens/         # Screen-specific
├── screens/             # Screen components
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
└── utils/               # Helpers
```

---

## NativeWind Usage

```tsx
<View className="flex-1 bg-black px-6 pt-12">
  <Text className="text-white text-3xl font-bold">
    Balance
  </Text>
  <Text className="text-gold-400 text-5xl font-bold tabular-nums">
    $1,234.56
  </Text>
</View>
```

---

## Animations

### Principles

| Principle | Value |
|-----------|-------|
| **Speed** | 200-350ms for transitions |
| **Easing** | Native spring physics |
| **Purpose** | Every animation needs a reason |

### Presets

```tsx
// Spring config for buttons
const buttonSpring = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

// Fade in (Moti)
const fadeIn = {
  from: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { type: 'timing', duration: 200 },
};

// Slide up (Moti)
const slideUp = {
  from: { opacity: 0, translateY: 20 },
  animate: { opacity: 1, translateY: 0 },
  transition: { type: 'spring', damping: 20, stiffness: 150 },
};

// Scale bounce
const scaleBounce = {
  from: { scale: 0.9 },
  animate: { scale: 1 },
  transition: { type: 'spring', damping: 12, stiffness: 200 },
};
```

### Micro-interactions

| Action | Animation |
|--------|-----------|
| Button press | Scale down (0.96) + haptic |
| Success | Checkmark draw + scale bounce |
| Error | Shake + red flash |
| Copy | Pulse + "Copied" toast |
| Toggle | Spring physics slide |

### Screen Transitions

```tsx
<Stack.Navigator
  screenOptions={{
    animation: 'slide_from_right',
    animationDuration: 300,
  }}
/>
```

---

## Performance

1. **Use FlashList** instead of FlatList
2. **Enable useNativeDriver** for Animated
3. **Remove console.log** in production
4. **Memoize** expensive components
5. **Batch state updates**
6. **Test on low-end Android**

---

## Resources

### Docs
- [NativeWind](https://www.nativewind.dev/)
- [gluestack-ui](https://gluestack.io/ui/docs/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Moti](https://moti.fyi/)
- [FlashList](https://shopify.github.io/flash-list/)

### Design References
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)

---

*Load for implementation tasks. See ui.md for visual specs.*
