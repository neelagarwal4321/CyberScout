# CyberScout — Theme Reskin Prompt (CSS/Theme ONLY)

## Paste this into Claude Code. It will ONLY modify theme files and inline styles. No logic, no components, no navigation, no state.

---

I need you to reskin the CyberScout app to match a new visual aesthetic I'm providing as a reference image. The reference shows a **deep purple glass-morphism** style — very different from the current navy-blue + cyan theme.

## CRITICAL CONSTRAINTS

**ONLY modify these files:**
1. `src/theme/colors.js` — color tokens
2. `src/theme/typography.js` — font families and weights
3. `src/theme/spacing.js` — border radius and shadow values
4. `src/context/ThemeContext.jsx` — ONLY the color mapping object, not the logic

**Then update ONLY the `StyleSheet` definitions and inline `style` props** in these screen/component files — touch nothing else in them (no imports, no state, no hooks, no navigation, no JSX structure, no event handlers):
- `src/screens/auth/LoginScreen.jsx`
- `src/screens/auth/SignupScreen.jsx`
- `src/screens/dashboard/DashboardScreen.jsx`
- `src/screens/chat/ChatScreen.jsx`
- `src/screens/courses/CourseCatalogScreen.jsx`
- `src/screens/courses/CourseDetailScreen.jsx`
- `src/screens/settings/SettingsScreen.jsx`
- `src/screens/settings/SubscriptionScreen.jsx`
- `src/screens/profile/ProfileScreen.jsx`
- `src/components/FeatureGate.jsx`

**DO NOT touch:**
- Any `useState`, `useEffect`, `useReducer`, `useContext` calls
- Any function bodies (event handlers, async functions, navigation calls)
- Any JSX structure (don't add, remove, or reorder components)
- Any imports (don't add new libraries)
- `src/services/*`, `src/hooks/*`, `src/utils/*`, `src/navigation/*`
- `App.js`, `app.json`, `package.json`

If a style change requires a new component or import, **skip it** — only use what's already available.

---

## NEW DESIGN LANGUAGE (extracted from reference image)

### Aesthetic: "Dark Purple Glass-Morphism"
The reference shows a rich, premium app with deep purple-black backgrounds, translucent frosted-glass cards with subtle purple-tinted borders, soft purple/violet accent colors, and warm amber/gold highlights. It feels luxurious, not techy — more beauty/fashion than hacker terminal.

### New Color Palette

**Backgrounds:**
- `bg` (deepest): `#0D0B1A` — near-black with purple undertone (not navy)
- `bgSecondary`: `#141025` — slightly lighter purple-black (tab bars, panels)
- `bgTertiary`: `#1C1633` — used inside nested containers, thumbnails

**Surfaces (cards):**
- `surface`: `rgba(30, 22, 56, 0.65)` — translucent dark purple (glass effect)
- `surfaceHover`: `rgba(40, 30, 72, 0.7)` — slightly lighter on press
- `surfaceSolid`: `#1E1638` — opaque fallback where transparency isn't supported

**Borders:**
- `border`: `rgba(80, 60, 140, 0.3)` — subtle purple-tinted border
- `borderLight`: `rgba(120, 90, 180, 0.2)` — very faint purple separator
- `borderGlow`: `rgba(160, 100, 240, 0.15)` — for highlighted/active card borders

**Primary accent — Violet/Purple (replaces cyan everywhere):**
- `primary`: `#A855F7` — vibrant violet (buttons, active states, links, CTAs)
- `primaryDim`: `#8B3FD9` — slightly muted for secondary actions
- `primaryGlow`: `rgba(168, 85, 247, 0.2)` — glow behind primary elements
- `primarySurface`: `rgba(168, 85, 247, 0.12)` — tinted backgrounds for badges/pills

**Secondary accent — Warm Gold/Amber:**
- `accent`: `#E8A838` — warm gold (streak badges, star ratings, premium indicators)
- `accentDim`: `#C48E2F`
- `accentGlow`: `rgba(232, 168, 56, 0.15)`

**Status colors:**
- `success`: `#4ADE80` — soft green (completed, checkmarks) — less neon than before
- `error`: `#F87171` — soft red (errors, danger)
- `warning`: `#FBBF24` — amber yellow
- `info`: `#A855F7` — same as primary (not cyan)
- `live`: `#F87171` — live badges

**Text:**
- `textPrimary`: `#F0ECF9` — very light lavender-white (not pure white)
- `textSecondary`: `#9B8FBB` — muted purple-grey
- `textMuted`: `#655C80` — dark purple-grey for placeholders

**Subscription tiers:**
- `tierFree`: `#9B8FBB` — muted text color
- `tierPro`: `#A855F7` — primary violet
- `tierMax`: `#E8A838` — gold

**Transparency/Glass:**
- `overlay`: `rgba(13, 11, 26, 0.88)`
- `glassBg`: `rgba(30, 22, 56, 0.55)` — card glass background
- `glassBorder`: `rgba(80, 60, 140, 0.25)` — card glass border

**Gradients:**
- `primary` gradient: `['#A855F7', '#6D28D9']` — violet to deep violet
- `cardGradient`: `['rgba(30, 22, 56, 0.7)', 'rgba(20, 16, 37, 0.8)']`
- `hero`: `['#0D0B1A', '#141025', '#1C1633']`
- `buttonGradient`: `['#A855F7', '#7C3AED']` — for primary buttons

### New Typography

**Replace monospace headings with elegant serif/display font.** The reference uses a refined, high-contrast serif for hero text (like "Reveal Your Best Shades"). Since we're in React Native without custom fonts loaded, use the system serif as close as possible:

- **Display/Hero headings:** Change from monospace to system serif
  - iOS: `Georgia` (elegant, high contrast)
  - Android: `serif`
- **H1, H2:** Also serif — gives the premium/editorial feel
- **H3, H4, Body, Button, Caption:** Keep system sans-serif but adjust weights:
  - H3: weight `'700'` instead of `'600'` (bolder)
  - Body: keep `'400'`
  - Button: weight `'700'` with slight letter-spacing increase

**Font-specific changes:**
```
hero:      serif, 34px, '800', letterSpacing: -0.5 (was: mono 32px, -1)
h1:        serif, 28px, '700', letterSpacing: -0.3 (was: mono 26px, -0.5)
h2:        serif, 24px, '700', letterSpacing: -0.2 (was: mono 22px, -0.3)
h3:        sans, 18px, '700' (was: '600')
h4:        sans, 16px, '600' (unchanged)
body:      sans, 15px, '400', lineHeight: 23 (was: 22)
bodySmall: sans, 13px, '400', lineHeight: 19 (was: 18)
caption:   sans, 11px, '600', letterSpacing: 0.8 (was: '500', 0.5)
button:    sans, 15px, '700', letterSpacing: 0.5 (was: '600', 0.3)
badge:     sans, 10px, '700', letterSpacing: 1.2 (was: mono, 1)
code:      mono, 13px, '400' (unchanged — code blocks keep monospace)
tab:       sans, 11px, '700', letterSpacing: 0.8 (was: '600', 0.5)
```

### New Border Radius

The reference uses **more rounded corners** than the current design. Cards have large radius, buttons are very rounded (almost pill-shaped), and icons sit in circles.

```
xs: 6      (was 4)
sm: 10     (was 8)
md: 14     (was 12)
lg: 20     (was 16)
xl: 24     (was 20)
xxl: 28    (was 24)
full: 999  (unchanged)
```

### New Shadow Style

The reference uses **purple-tinted glows** instead of pure black shadows. Cards have a subtle purple ambient glow, not a hard drop shadow.

```
sm: shadowColor: '#6D28D9', shadowOpacity: 0.15, shadowRadius: 8, offset: {0, 2}
md: shadowColor: '#6D28D9', shadowOpacity: 0.2, shadowRadius: 12, offset: {0, 4}
lg: shadowColor: '#6D28D9', shadowOpacity: 0.25, shadowRadius: 20, offset: {0, 8}
glow: (color) => shadowColor: color, shadowOpacity: 0.35, shadowRadius: 16, offset: {0, 0}
```

---

## SPECIFIC STYLE CHANGES PER SCREEN

Apply these in addition to the global token swap. These are ONLY style adjustments — no structural JSX changes.

### LoginScreen
- Background: `#0D0B1A` (deep purple-black)
- Accent lines at top: change from `colors.cyan` to `colors.primary` (`#A855F7`), increase opacity slightly to 0.04-0.02
- Logo icon border and fill: `#A855F7` instead of `#00E5FF`
- Logo icon background: `rgba(168, 85, 247, 0.1)`
- "CyberScout" hero text: change to serif font
- Login button: background `#A855F7` (was `#00E5FF`), text stays `#0D0B1A`
- "Forgot password?" link: `#A855F7`
- "Sign Up" link: `#A855F7`
- Input field borders: `rgba(80, 60, 140, 0.3)` instead of `#2A3362`
- Input field backgrounds: `rgba(30, 22, 56, 0.65)` instead of `#1E2545`
- Input icon color: `#655C80` instead of `#5A6599`
- Divider line: `rgba(80, 60, 140, 0.3)`
- OAuth buttons border: `rgba(80, 60, 140, 0.3)`

### DashboardScreen
- Progress ring color: `#A855F7` (was `#00E5FF`)
- Progress ring track: `rgba(168, 85, 247, 0.12)` (was `rgba(0, 229, 255, 0.12)`)
- Streak badge: keep `#E8A838` gold (same as before, orange is close)
- Continue learning card thumbnail background: `rgba(168, 85, 247, 0.1)`
- Continue learning play icon: `#A855F7`
- Continue learning progress bar fill: `#A855F7`, track: `rgba(168, 85, 247, 0.12)`
- Caption "Module 3: Cross-Site Scripting": `#A855F7` (was `#00E5FF`)
- Recommendation icon sparkles: keep `#A855F7`
- Recommendation arrow-forward-circle: `#A855F7`
- Weekly activity bar current day: `#A855F7`, other days: `rgba(168, 85, 247, 0.25)`
- Quick actions:
  - "Ask AI" icon color: `#A855F7` (was `#00E5FF`)
  - "Courses" icon: keep `#A855F7`
  - "Certs" icon: `#E8A838` (was `#FF9F1C`, close but warmer)
  - "Profile" icon: `#4ADE80` (was `#39FF14`, softer)
- All card backgrounds: use the glass `rgba(30, 22, 56, 0.65)` with `rgba(80, 60, 140, 0.3)` border
- Notification dot: `#F87171` (was `#FF3B5C`)

### ChatScreen
- AI avatar: border `rgba(168, 85, 247, 0.25)`, background `rgba(168, 85, 247, 0.1)`, icon color `#A855F7`
- User bubble: background `#A855F7` (was `#00E5FF`)
- AI bubble: background `rgba(30, 22, 56, 0.65)`, border `rgba(80, 60, 140, 0.3)`
- Citation card: background `rgba(168, 85, 247, 0.08)`, border `rgba(168, 85, 247, 0.2)`, icon + text `#A855F7`
- Suggested topic chips: border `rgba(168, 85, 247, 0.3)`, text `#A855F7`
- Quick action pills: border `rgba(80, 60, 140, 0.3)`, text `#9B8FBB`
- Send button active: background `#A855F7` (was `#00E5FF`)
- Send button inactive: `rgba(168, 85, 247, 0.2)`
- Input bar background: `#141025`
- Input border: `rgba(80, 60, 140, 0.3)`, input bg: `rgba(30, 22, 56, 0.65)`
- Level badge: background `rgba(74, 222, 128, 0.1)`, text `#4ADE80` (softer green)
- Header border bottom: `rgba(80, 60, 140, 0.3)`
- "CyberScout AI" text keeps `#A855F7`

### CourseCatalogScreen
- Search bar: background `rgba(30, 22, 56, 0.65)`, border `rgba(80, 60, 140, 0.3)`
- Track filter pills active: border and text use each track's color (keep track colors but shift them):
  - Foundations: `#A855F7` (was `#00E5FF`)
  - Blue Team: `#60A5FA` (was `#3B82F6`, slightly lighter)
  - Red Team: `#F87171` (was `#FF3B5C`)
  - Advanced Ops: `#C084FC` (was `#A855F7`, lighter violet)
  - GRC: `#FBBF24` (was `#FF9F1C`)
- Track pill "All" active: `#A855F7`
- Course card tier badges: PRO → `#A855F7`, MAX → `#E8A838`
- Course card backgrounds: glass effect
- Star rating icon: `#E8A838` (was `#FF9F1C`)

### CourseDetailScreen
- Tab active underline: `#A855F7` (was `#00E5FF`)
- Tab active text: `#A855F7`
- Checkmark icons in "What you'll learn": `#4ADE80` (was `#39FF14`)
- Enroll button: `#A855F7` (was `#00E5FF`)
- Upgrade button: `#E8A838` (was `#A855F7`)
- Star icon: `#E8A838`
- Completed lecture icons: `#4ADE80`
- Lock icons: `#655C80`

### SettingsScreen
- Row icon backgrounds: `rgba(168, 85, 247, 0.1)` (was `rgba(0, 229, 255, 0.1)`)
- Row icon colors: `#A855F7` (was `#00E5FF`)
- Toggle switch track on: `rgba(168, 85, 247, 0.3)` (was `rgba(0, 229, 255, 0.25)`)
- Toggle thumb on: `#A855F7` (was `#00E5FF`)
- Tier badge pill: `rgba(168, 85, 247, 0.1)`, text `#A855F7` for Pro
- Danger row icons: `#F87171` (was `#FF3B5C`)
- Profile card border: `rgba(80, 60, 140, 0.3)`
- Section containers: glass background

### SubscriptionScreen
- Pro plan accent color: `#A855F7` (was `#00E5FF`)
- "MOST POPULAR" badge: `#A855F7` background
- "CURRENT" pill: `rgba(168, 85, 247, 0.1)`, text `#A855F7`
- Max plan accent: `#E8A838` (was `#FFD700`)
- Feature checkmarks: `#4ADE80` (was `#39FF14`)
- Feature close-circles: `#655C80` (was `#5A6599`)
- Plan card borders active: `#A855F7` for Pro, `#E8A838` for Max
- Button backgrounds: Pro → `#A855F7`, Max → `#E8A838`
- Free plan accent: `#9B8FBB` (was `#8B95C9`)

### ProfileScreen
- Avatar border: `rgba(168, 85, 247, 0.25)`, bg `rgba(168, 85, 247, 0.1)`
- Level badge: `rgba(168, 85, 247, 0.1)`, text `#A855F7`
- XP bar: fill `#A855F7`, track `rgba(168, 85, 247, 0.1)`
- Stat card icon colors:
  - Streak: `#E8A838` (was `#FF9F1C`)
  - Learned: `#A855F7` (was `#00E5FF`)
  - Courses: `#C084FC` (was `#A855F7`, lighter)
  - Badges: `#4ADE80` (was `#39FF14`)
- Skill bars:
  - Networking: `#A855F7` (was `#00E5FF`)
  - Web Security: `#60A5FA`
  - System Sec: `#C084FC`
  - Social Eng: `#E8A838` (was `#FF9F1C`)
  - Cryptography: `#4ADE80` (was `#39FF14`)
  - Forensics: `#F87171` (was `#FF3B5C`)

### FeatureGate component
- Lock icon color: uses `tierColor` — this auto-updates from the tier color changes above
- Upgrade button: uses `tierColor` — auto-updates

---

## SUMMARY OF THE TRANSFORMATION

| Element | OLD | NEW |
|---------|-----|-----|
| Aesthetic | Hacker terminal + navy | Premium purple glass-morphism |
| Background | Navy `#0A0E1A` | Purple-black `#0D0B1A` |
| Primary accent | Cyan `#00E5FF` | Violet `#A855F7` |
| Secondary accent | Orange `#FF9F1C` | Gold `#E8A838` |
| Success green | Neon `#39FF14` | Soft `#4ADE80` |
| Error red | Hot `#FF3B5C` | Soft `#F87171` |
| Card background | Solid `#1E2545` | Glass `rgba(30,22,56,0.65)` |
| Card border | Solid `#2A3362` | Glass `rgba(80,60,140,0.3)` |
| Text primary | Blue-white `#EAEEFF` | Lavender `#F0ECF9` |
| Text secondary | Blue-grey `#8B95C9` | Purple-grey `#9B8FBB` |
| Text muted | Blue-grey `#5A6599` | Purple-grey `#655C80` |
| Heading font | Monospace (terminal) | Serif (editorial/luxury) |
| Border radius | Tight (8-16px) | Rounder (10-20px) |
| Shadows | Pure black | Purple-tinted glow |
| Overall feel | Techy, utilitarian | Premium, luxurious, warm |

**Start with `src/theme/colors.js`, then `typography.js`, then `spacing.js`, then `ThemeContext.jsx`, then each screen file's StyleSheet. Show me each file as you complete it.**
