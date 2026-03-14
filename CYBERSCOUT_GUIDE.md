# CyberScout Mobile App - Implementation Guide

## Overview
CyberScout is a cybersecurity learning platform mobile web app with 16 fully interactive screens. The app features a dark theme with a "hacker terminal" aesthetic using monospace fonts for headings and a cyan accent color (#00E5FF).

## Tech Stack
- **Framework**: React with TypeScript
- **Routing**: React Router v7 (Data mode)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Device Target**: iPhone 15 Pro (393 x 852px)

## Color Palette
- Background Primary: `#0A0E1A`
- Background Secondary: `#111629`
- Surface: `#1E2545`
- Accent Cyan: `#00E5FF` (primary actions)
- Accent Green: `#39FF14` (success)
- Accent Red: `#FF3B5C` (errors, live)
- Accent Orange: `#FF9F1C` (warnings, streaks)
- Accent Purple: `#A855F7` (premium)
- Accent Gold: `#FFD700` (max tier)

## Screen Structure (16 Screens)

### Authentication Flow
1. **LoginScreen** (`/`) - Entry point with email/password and OAuth options
2. **SignupScreen** (`/signup`) - Registration with experience level and interests selection
3. **ForgotPasswordScreen** (`/forgot-password`) - Password reset flow

### Main App (with Tab Bar)
4. **DashboardScreen** (`/dashboard`) - Home hub with progress, recommendations, and quick actions
5. **CourseCatalogScreen** (`/courses`) - Browse courses with filters
6. **ChatScreen** (`/chat`) - AI tutor chatbot
7. **SettingsScreen** (`/settings`) - App settings and account management

### Secondary Screens
8. **NotificationsScreen** (`/notifications`) - Activity notifications
9. **CourseDetailScreen** (`/course/:courseId`) - Course overview, syllabus, and reviews
10. **LecturePlayerScreen** (`/lecture/:lectureId`) - Video player with notes
11. **LiveLectureScreen** (`/live/:sessionId`) - Live session with chat
12. **ChatHistoryScreen** (`/chat/history`) - Past AI conversations
13. **ProfileScreen** (`/profile`) - User stats, skills, and achievements
14. **SubscriptionScreen** (`/subscription`) - Pricing tiers (Free, Pro, Max)
15. **MentorListScreen** (`/mentors`) - 1:1 mentorship (Max tier feature)
16. **CertificatesScreen** (`/certificates`) - Earned certificates

## Navigation Flow

### Tab Bar Navigation (4 main screens)
- Dashboard → `/dashboard`
- Courses → `/courses`
- AI Tutor → `/chat`
- Settings → `/settings`

### Key User Flows
- **Login** → Dashboard
- **Dashboard** → Course Detail → Lecture Player
- **Dashboard** → AI Chat → Chat History
- **Settings** → Subscription Screen
- **Settings** → Profile Screen

## Component Structure

### Shared Components
- `TabBar.tsx` - Bottom navigation bar (appears on 4 main screens)

### Screen Components (all in `/src/app/screens/`)
- Each screen is a self-contained component
- Mobile-first design (max-width: 393px)
- Dark theme optimized
- Smooth transitions and active states

## Design Features

### Typography
- **Headings**: Monospace font (SF Mono, JetBrains Mono, Fira Code)
- **Body**: System sans-serif (SF Pro)
- Creates "hacker terminal" aesthetic

### UI Patterns
- **Pills**: Rounded full borders for tags and badges
- **Cards**: 16-20px border radius with subtle borders
- **Buttons**: Active scale transform (0.97) for tactile feedback
- **Progress Rings**: Circular progress indicators
- **Skill Bars**: Horizontal progress bars with color coding

### Interactions
- Tap/click navigation between screens
- Active states on buttons (scale down)
- Hover states on cards (surface-hover color)
- Smooth transitions (200ms)

## Subscription Tiers

### Free
- AI chatbot (50 msgs/day)
- Course roadmap
- Community forum
- First module of every course

### Pro ($19/mo)
- Everything in Free
- Unlimited AI chat
- Full lecture library
- Live batch lectures
- Hands-on labs
- Certificates

### Max ($49/mo)
- Everything in Pro
- 1:1 mentorship (4x/month)
- Priority AI responses
- Career coaching
- Private instructor channel
- Early access
- Custom learning paths

## Development Notes

### Styling
- Tailwind v4 with custom theme variables
- No shadcn/ui components used for custom design
- Mobile-optimized scrolling
- Safe area insets for notched devices

### State Management
- Local state with React hooks
- No external state management needed for prototype
- Navigation state managed by React Router

### Future Enhancements
- Connect to real backend API
- Implement real authentication
- Add video player functionality
- Enable live chat with WebSockets
- Integrate payment processing for subscriptions
