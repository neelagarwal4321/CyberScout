CYBERSCOUT — Complete Figma Make Prompt
Paste this entire prompt into Figma Make to generate the full clickable prototype

PROJECT OVERVIEW
Design a complete mobile app prototype for CyberScout — a cybersecurity learning platform. The app teaches cybersecurity from beginner to advanced through AI-powered chat tutoring, recorded/live video lectures, and 1:1 mentorship. It has three subscription tiers: Free, Pro ($19/mo), and Max ($49/mo).
Device frame: iPhone 15 Pro (393 x 852)
Total screens to create: 16 screens, all connected with clickable prototype flows

GLOBAL DESIGN SYSTEM
Color Palette (Dark Theme — Default)

Background primary: #0A0E1A (deepest navy)
Background secondary: #111629 (cards, tab bar)
Background tertiary: #1A2038 (inputs, thumbnails)
Surface (cards): #1E2545
Surface hover: #252D55
Border default: #2A3362
Border light: #353F72
Text primary: #EAEEFF (headings, body)
Text secondary: #8B95C9 (descriptions, labels)
Text muted: #5A6599 (placeholders, captions)
Accent cyan: #00E5FF (primary action, links, active states)
Accent green: #39FF14 (success, completed, checkmarks)
Accent red: #FF3B5C (errors, live badges, danger)
Accent orange: #FF9F1C (warnings, streak, stars)
Accent purple: #A855F7 (recommendations, premium)
Accent gold: #FFD700 (Max tier badge)
Overlay: rgba(10, 14, 26, 0.85)

Typography

Display/Headings: Use a monospace font (SF Mono, JetBrains Mono, or Fira Code) for all headings — this gives the "hacker terminal" aesthetic
Body text: System sans-serif (SF Pro on iOS) for readability
Hero: Monospace 32px Bold
H1: Monospace 26px Bold
H2: Monospace 22px Bold
H3: Sans-serif 18px Semibold
H4: Sans-serif 16px Semibold
Body: Sans-serif 15px Regular, line-height 22
Body small: Sans-serif 13px Regular, line-height 18
Caption: Sans-serif 11px Medium, letter-spacing 0.5
Badge: Monospace 10px Bold, letter-spacing 1, uppercase
Button: Sans-serif 15px Semibold, letter-spacing 0.3

Spacing Scale

xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48

Border Radius

Small: 8, Medium: 12, Large: 16, XL: 20, Full/Pill: 999

Iconography
Use Ionicons throughout. Key icons used:

shield-checkmark (app logo/AI avatar)
home / home-outline (dashboard tab)
library / library-outline (courses tab)
chatbubble-ellipses / chatbubble-ellipses-outline (chat tab)
cog / cog-outline (settings tab)
arrow-back (back navigation)
notifications-outline (notifications)
search (search bar)
star (ratings)
time-outline (duration)
people-outline (enrolled count)
play-circle (video lectures)
lock-closed (gated content)
checkmark-circle (completed items)
chevron-forward (navigation arrows)
sparkles (AI recommendations)
flame (streak)
trophy (achievements)
diamond-outline (subscription)


SCREEN 1: LOGIN SCREEN
Layout:

Full screen, background #0A0E1A
5 thin vertical accent lines (1.5px wide, #00E5FF at very low opacity 3-7%) positioned at varying left offsets across the top 300px of the screen, creating a subtle "matrix rain" feel
Content centered vertically

Logo section (centered):

Rounded square container (72x72, border-radius 20, border 2px #00E5FF, background rgba(0,229,255,0.08))
Shield-checkmark icon inside (36px, #00E5FF)
Below logo: "CyberScout" in Hero typography (monospace 32px bold, #EAEEFF)
Below that: "Your cybersecurity learning journey starts here" in Body small (#8B95C9)

Form section (24px horizontal padding, 12px gap between elements):
Error bar (hidden by default, shown on error):

Full width, padding 12px, border-radius 8, background rgba(255,59,92,0.08), border 1px #FF3B5C
Alert-circle icon (16px, #FF3B5C) + error text in Body small (#FF3B5C)

Email input field:

Full width, padding 16px, border-radius 12, background #1E2545, border 1px #2A3362
Mail-outline icon (18px, #5A6599) on left
Placeholder: "Email address" in #5A6599
Typed text in #EAEEFF

Password input field:

Same styling as email
Lock-closed-outline icon left
Placeholder: "Password"
Eye-outline icon (18px, #5A6599) on right (toggles to eye-off-outline)

Forgot password link:

Right-aligned, "Forgot password?" in Body small, #00E5FF

Login button:

Full width, padding 16px, border-radius 12, background #00E5FF
"Log In" text in Button typography, color #0A0E1A
On tap → navigate to Dashboard Screen

Divider:

Horizontal line (#2A3362) with "OR" text (Caption, #5A6599) centered between two lines

OAuth buttons (stacked, 12px gap):

"Continue with Google" — full width, padding 12px, border-radius 12, border 1px #2A3362, transparent background

Google logo icon (18px, #8B95C9) + text in Button (#EAEEFF)


"Continue with Apple" — same styling with Apple logo icon

Footer (centered, 32px below form):

"Don't have an account?" in Body (#8B95C9) + "Sign Up" in Body (#00E5FF, semibold)
"Sign Up" tap → navigate to Signup Screen

Prototype flows from Login:

Login button → Dashboard Screen
Sign Up text → Signup Screen
Forgot password → Forgot Password Screen


SCREEN 2: SIGNUP SCREEN
Layout:

Full screen, background #0A0E1A, scrollable
Padding: 24px horizontal, 48px top

Back button:

Arrow-back icon (24px, #EAEEFF), top-left
Tap → back to Login Screen

Header:

"Create Account" in H1 (monospace 26px bold, #EAEEFF)
"Join thousands learning cybersecurity" in Body (#8B95C9)

Form fields (each has an uppercase Caption label in #8B95C9 above it):
"FULL NAME" field:

Same input styling as login (person-outline icon, placeholder "Your name")

"EMAIL" field:

Mail-outline icon, placeholder "you@example.com"

"PASSWORD" field:

Lock-closed-outline icon, placeholder "Min 8 characters"

"EXPERIENCE LEVEL" selector:

3 horizontal pill buttons with 8px gap
Each pill: paddingH 16px, paddingV 8px, border-radius 999, border 1px
Options: "beginner", "intermediate", "advanced" (lowercase, capitalize first letter)
Selected state: border #00E5FF, background rgba(0,229,255,0.08), text #00E5FF
Unselected state: border #2A3362, text #8B95C9
Default selection: "beginner"

"INTERESTS (OPTIONAL)" tags:

5 pill buttons that wrap to multiple lines (8px gap)
Each pill has an icon + label:

shield-outline "Foundations" (color #00E5FF)
eye-outline "Blue Team" (color #3B82F6)
bug-outline "Red Team" (color #FF3B5C)
terminal-outline "Advanced Ops" (color #A855F7)
document-text-outline "GRC" (color #FF9F1C)


Selected state: border uses the track color, background rgba(trackColor, 0.08), icon and text use track color
Unselected: border #2A3362, icon #5A6599, text #8B95C9
Multi-select allowed

"Create Account" button:

Full width, padding 16px, border-radius 12, background #00E5FF
"Create Account" in Button, #0A0E1A
Tap → navigate to Dashboard Screen

Terms footer:

"By signing up, you agree to our Terms of Service and Privacy Policy" in Body small (#5A6599), centered

Prototype flows from Signup:

Back arrow → Login Screen
Create Account button → Dashboard Screen


SCREEN 3: FORGOT PASSWORD SCREEN
Layout:

Background #0A0E1A, centered content
Back arrow top-left → Login Screen

Content:

Lock-closed icon in a circle (64px, #00E5FF with rgba background)
"Reset Password" in H2 (#EAEEFF)
"Enter your email and we'll send a reset link" in Body (#8B95C9)
Email input field (same styling as login)
"Send Reset Link" button (full width, #00E5FF background)
"Back to Login" link (#00E5FF)


SCREEN 4: DASHBOARD SCREEN (Main Hub)
This is the primary home screen shown after login. Bottom tab bar is visible.
Status bar area: Light content on dark
Header section (padding 24px horizontal, 48px top):

Left side:

"Good evening," in Body small (#8B95C9)
"Alex Chen" in H2 (monospace 22px bold, #EAEEFF)


Right side (row, 16px gap):

Streak badge: pill shape (paddingH 12px, paddingV 4px, border-radius 999, background rgba(255,159,28,0.08), border 1px rgba(255,159,28,0.25))

Fire emoji 🔥 (14px) + "12" in Badge typography (#FF9F1C)


Notification bell icon (notifications-outline, 24px, #8B95C9)

Small red dot (8x8, #FF3B5C) positioned top-right of the bell icon





Progress Overview Card:

Margin 24px horizontal, padding 20px, border-radius 16, background #1E2545, border 1px #2A3362
Left: Circular progress ring (80px diameter)

Ring stroke 6px, track color rgba(0,229,255,0.12), filled color #00E5FF
"38%" text in center (H3, #00E5FF)


Right (3 stat columns evenly spaced):

"4" (H3, #EAEEFF) above "ENROLLED" (Caption, #5A6599)
"1" (H3, #39FF14) above "COMPLETED" (Caption, #5A6599)
"47h" (H3, #EAEEFF) above "LEARNED" (Caption, #5A6599)



"Continue Learning" section:

Section title: "Continue Learning" in H3 (#EAEEFF), marginH 24px, marginTop 32px
Card (marginH 24px, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362):

Row layout:

Left: Square thumbnail (56x56, border-radius 12, background #1A2038) with play-circle icon (32px, #00E5FF) centered
Middle (flex 1):

"Module 3: Cross-Site Scripting" in Caption (#00E5FF)
"Stored XSS Deep Dive" in H4 (#EAEEFF), single line truncated
"Web Application Security" in Body small (#8B95C9)
Progress bar below: full width, height 4px, border-radius 2, track rgba(0,229,255,0.12), fill #00E5FF at 62%


Right: chevron-forward icon (20px, #5A6599)


Tap → navigate to Course Detail Screen (for Web Application Security)



"Recommended For You" section:

Title: sparkles icon (16px, #A855F7) + " Recommended For You" in H3 (#EAEEFF), marginH 24px, marginTop 32px
3 recommendation cards stacked (8px gap), each:

Row layout, marginH 24px, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362, 12px gap
Left: Icon container (44x44, border-radius 12, background rgba(trackColor,0.08))

Card 1: bug-outline (20px, #FF3B5C) → "SQL Injection Masterclass" / "Builds on your web security progress"
Card 2: eye-outline (20px, #3B82F6) → "Network Traffic Analysis" / "Strengthen your networking fundamentals"
Card 3: shield-outline (20px, #00E5FF) → "Intro to Cryptography" / "Your weakest area — great time to start"


Middle: Title in H4 (#EAEEFF), reason in Body small (#8B95C9)
Right: arrow-forward-circle icon (24px, #00E5FF)
Each card tap → Course Catalog Screen



"Upcoming Live Sessions" section:

Title: "Upcoming Live Sessions" in H3 (#EAEEFF), marginH 24px, marginTop 32px
Horizontal scrolling row (extends beyond screen edges, 12px gap, 24px left padding):

Card 1 (200px wide, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362):

LIVE badge: pill (paddingH 8px, paddingV 3px, border-radius 999, background rgba(255,59,92,0.12))

Red dot (6x6, border-radius 3, #FF3B5C) + "LIVE" in Badge (#FF3B5C)


"Incident Response Workshop" in H4 (#EAEEFF), marginTop 12px, max 2 lines
"Sarah Kim" in Body small (#8B95C9), marginTop 4px
Footer row: people icon (14px, #5A6599) + "156 enrolled" in Caption (#5A6599), marginTop 12px


Card 2 (same structure):

"Red Team Operations Q&A" / "Marcus Rivera" / "89 enrolled"





"This Week" activity section:

Title: "This Week" in H3 (#EAEEFF), marginH 24px, marginTop 32px
Card (marginH 24px, padding 20px, border-radius 16, background #1E2545, border 1px #2A3362):

7 columns evenly spaced, bottom-aligned, total height 80px
Each column: a vertical bar (16px wide, border-radius 4) + day label below (Caption, #5A6599)
Days: M T W T F S S
Bar heights proportional to values [3, 5, 2, 4, 6, 1, 3] where max (6) = 60px
Current day bar (Friday) in solid #00E5FF, all others in rgba(0,229,255,0.25)



Quick Actions row:

4 cards in a row (marginH 24px, marginTop 32px, 8px gap):
Each: flex 1, alignItems center, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362

Icon container (44x44, border-radius 22, background rgba(color,0.08)) + icon (22px, color)
Label below (Caption, #8B95C9), marginTop 4px
Card 1: chatbubble-ellipses (#00E5FF), "Ask AI" → tap to Chat Screen
Card 2: library (#A855F7), "Courses" → tap to Course Catalog Screen
Card 3: trophy (#FF9F1C), "Certs" → tap to Certificates Screen
Card 4: person (#39FF14), "Profile" → tap to Profile Screen



Bottom Tab Bar (fixed at bottom, visible on all main screens):

Background #111629, borderTop 1px #2A3362, height 85px, paddingTop 8px
4 tabs equally spaced:

Dashboard (home icon): Active state — icon filled, #00E5FF; label "Dashboard" in Tab typography #00E5FF
Courses (library-outline icon): Inactive — #5A6599
AI Tutor (chatbubble-ellipses-outline icon): Inactive — #5A6599
Settings (cog-outline icon): Inactive — #5A6599


Tab taps navigate to: Dashboard Screen, Course Catalog Screen, Chat Screen, Settings Screen


SCREEN 5: NOTIFICATIONS SCREEN
Header:

Arrow-back (→ Dashboard) + "Notifications" in H2

Grouped notifications list:

Section: "Today" (Caption, #5A6599)

Notification row: cyan dot + "Your streak is 12 days! Keep going 🔥" + time "2h ago"
Notification row: purple dot + "New course: Advanced Cloud Security" + "5h ago"


Section: "This Week"

"Live session starts in 1 hour: Incident Response Workshop" + red dot
"You completed Module 2 of Cybersecurity Foundations 🎉"


Each notification: padding 16px, borderBottom 1px #2A3362


SCREEN 6: COURSE CATALOG SCREEN
Tab bar: Courses tab active (#00E5FF filled library icon)
Header:

Padding 24px horizontal, 48px top
"Courses" in H1 (monospace 26px bold, #EAEEFF)

Search bar:

MarginH 24px, marginTop 16px, padding 12px, border-radius 12, background #1E2545, border 1px #2A3362
Search icon (18px, #5A6599) + placeholder "Search courses..." (#5A6599)
Close-circle icon appears on right when text is entered

Track filter pills (horizontal scroll):

Padding 12px vertical, 24px left padding, 8px gap
6 pills: "All" (grid icon, #00E5FF), "Foundations" (shield-outline, #00E5FF), "Blue Team" (eye-outline, #3B82F6), "Red Team" (bug-outline, #FF3B5C), "Advanced Ops" (terminal-outline, #A855F7), "GRC" (document-text-outline, #FF9F1C)
"All" selected by default: border #00E5FF, background rgba(0,229,255,0.08), icon+text #00E5FF
Others unselected: border #2A3362, icon #5A6599, text #8B95C9
Tapping a pill filters the list below

Course cards (vertical scrolling list, 16px gap):
Card 1 — "Cybersecurity Foundations":

Full width (marginH 24px), border-radius 16, background #1E2545, border 1px #2A3362, overflow hidden
Thumbnail area (height 120px, background rgba(0,229,255,0.06)):

shield-outline icon centered (32px, #00E5FF)
No tier badge (this is a free course)


Info area (padding 16px):

Top row: two pills side by side

Track pill: "Foundations" (Caption, #00E5FF, background rgba(0,229,255,0.08), border-radius 999, paddingH 8px)
Difficulty pill: "Beginner" (Caption, #39FF14, background rgba(57,255,20,0.08))


Title: "Cybersecurity Foundations" in H4 (#EAEEFF), marginTop 8px
Description: "Start your cybersecurity journey. Learn networking basics, operating systems, and core security concepts." in Body small (#8B95C9), max 2 lines
Meta row (marginTop 12px, 16px gap):

Star icon (12px, #FF9F1C) + "4.8" (Caption, #EAEEFF) + "(342)" (Caption, #5A6599)
Time-outline (12px, #5A6599) + "12h" (Caption, #5A6599)
People-outline (12px, #5A6599) + "5,420" (Caption, #5A6599)


Instructor row (marginTop 12px):

Small avatar circle (22x22, background #1A2038, person icon 12px #5A6599)
"Dr. Lisa Park" in Body small (#8B95C9)




Tap → Course Detail Screen (Foundations)

Card 2 — "Web Application Security":

Same structure
Thumbnail: bug-outline (32px, #FF3B5C), background rgba(255,59,92,0.06)
PRO badge in top-right of thumbnail: small rectangle (paddingH 8px, paddingV 2px, border-radius 4, background #00E5FF), "PRO" in Badge (#0A0E1A)
Track pill: "Red Team" (#FF3B5C), Difficulty: "Intermediate" (#FF9F1C)
Title: "Web Application Security"
Rating 4.9 (218), 18h, 3,150 students
Instructor: Marcus Rivera
Tap → Course Detail Screen (Web App)

Card 3 — "Incident Response & Forensics":

Thumbnail: eye-outline (32px, #3B82F6), background rgba(59,130,246,0.06)
PRO badge
Track: "Blue Team" (#3B82F6), Difficulty: "Intermediate" (#FF9F1C)
Rating 4.7 (176), 15h, 2,280 students
Instructor: Sarah Kim
Tap → Course Detail Screen

Card 4 — "Advanced Malware Analysis":

Thumbnail: terminal-outline (32px, #A855F7), background rgba(168,85,247,0.06)
MAX badge: background #FFD700, "MAX" in Badge (#0A0E1A)
Track: "Advanced Ops" (#A855F7), Difficulty: "Advanced" (#FF3B5C)
Rating 4.9 (92), 24h, 890 students
Instructor: Dr. James Okonkwo
Tap → Course Detail Screen


SCREEN 7: COURSE DETAIL SCREEN (Cybersecurity Foundations)
Full screen, scrollable, no tab bar visible
Hero section:

Height 180px, background rgba(0,229,255,0.03)
shield-outline icon centered (64px, rgba(0,229,255,0.37))
Back button: top-left (marginTop 48px, marginLeft 24px), circle (40x40, background rgba(10,14,26,0.5), border-radius 20)

arrow-back icon (24px, #EAEEFF)
Tap → back to Course Catalog



Title section (padding 24px):

Row: "Foundations" pill (#00E5FF) — no tier badge for free course
"Cybersecurity Foundations" in H1 (#EAEEFF), marginTop 8px
Instructor row: avatar circle (28x28, #1A2038) + "Dr. Lisa Park" in Body (#8B95C9)
Stats row (marginTop 20px, borderTop 1px #2A3362, paddingTop 20px, 4 columns):

Star icon + "4.8" / "342 reviews"
Time icon + "12h" / "duration"
Layers icon + "6" / "modules"
People icon + "5,420" / "students"



Tab bar (underline style, marginH 24px):

3 tabs equally spaced: "Overview" | "Syllabus" | "Reviews"
Active tab: text #00E5FF, bottom border 2px #00E5FF
Inactive: text #5A6599, no border
Default: Overview active

TAB: Overview content (padding 24px):

Description text in Body (#8B95C9): "Start your cybersecurity journey..."
"What you'll learn" in H3 (#EAEEFF), marginTop 24px
5 items, each row: checkmark-circle (18px, #39FF14) + text in Body (#EAEEFF), 12px gap

"Understand core vulnerability classes"
"Perform real-world penetration tests"
"Build defense strategies"
"Analyze and respond to incidents"
"Earn completion certificate"


"Tags" in H3, marginTop 24px
Row of pills: "networking", "fundamentals", "CIA triad" — each with background #1E2545, border 1px #2A3362, border-radius 999, paddingH 12px, text Caption #8B95C9

TAB: Syllabus content (shown when Syllabus tab tapped):

Module 1: "What is Cybersecurity?" in H4 (#EAEEFF)

4 lecture rows stacked, each with borderBottom 1px #2A3362, padding 12px:

Row 1: play-circle (18px, #39FF14 — completed) + "The Cybersecurity Landscape" (Body, #EAEEFF) + "14 min · video" (Caption, #5A6599) + checkmark-circle (18px, #39FF14)
Row 2: play-circle (#39FF14) + "CIA Triad Explained" + "12 min · video" + checkmark-circle
Row 3: document-text (18px, #5A6599 — not completed) + "Types of Cyber Threats" + "10 min · reading"
Row 4: help-circle (18px, #5A6599) + "Module Quiz" + "5 min · quiz"




Module 2: "Networking Fundamentals" in H4

Row 1: play-circle (#5A6599) + "OSI Model Deep Dive" + "20 min · video"
Row 2: play-circle (#5A6599) + "TCP/IP Essentials" + "16 min · video"
Row 3: code-slash (18px, #5A6599) + "Hands-on: Packet Analysis" + "30 min · lab"



TAB: Reviews content (shown when Reviews tab tapped):

Centered: chatbubbles-outline icon (48px, #5A6599)
"342 reviews · 4.8 average" in Body (#5A6599)
"Reviews will load from backend API" in Body small (#5A6599)

Sticky bottom bar:

Fixed at bottom, padding 24px, paddingBottom 32px, background #111629, borderTop 1px #2A3362
Left: "Free" in Body small (#5A6599), "12 hours" in H4 (#EAEEFF) below
Right: "Enroll Now" button (paddingH 32px, paddingV 12px, border-radius 12, background #00E5FF, text Button #0A0E1A)
Tap → Lecture Player Screen (or stay with enrolled state)

Prototype flow for a PRO course:

If the course is Pro tier (like Web Application Security), the bottom bar instead shows:

Left: "$19/mo Pro" in Body small (#5A6599)
Right button: "Upgrade to Pro" (background #A855F7 instead of cyan)
Tap → Subscription Screen




SCREEN 8: LECTURE PLAYER SCREEN
Full screen, no tab bar
Video player area (top ~40% of screen):

Dark rectangle (#0A0E1A), height 220px
Centered play-circle icon (64px, #00E5FF, semi-transparent background)
Simulated video progress bar at bottom: thin line, track #2A3362, filled #00E5FF at ~35%
Back arrow top-left (overlay)

Below video:

Padding 24px
"Stored XSS Deep Dive" in H3 (#EAEEFF)
"Module 3: Cross-Site Scripting · Web Application Security" in Body small (#8B95C9)

Tabbed content below (underline tabs):

4 tabs: Notes | Transcript | Resources | Q&A
"Notes" active by default
Notes tab content: text area with "Tap to add timestamped notes..." placeholder (#5A6599)

"Next Lesson" button at bottom:

Full width (marginH 24px), padding 16px, border-radius 12, background #1E2545, border 1px #2A3362
"Next: Reflected XSS Attack Patterns" in Button (#00E5FF)
chevron-forward icon right


SCREEN 9: LIVE LECTURE SCREEN
Full screen, no tab bar
Live video area (top 45%):

Dark rectangle with a gradient overlay
"LIVE" badge top-left (red dot + "LIVE" text, same style as dashboard)
Participant count top-right: people icon + "156 watching" in Caption (#EAEEFF)

Below video — Live chat area:

Scrollable chat messages:

"Sarah K: Welcome everyone! Let's dive into incident response"
"User123: Excited for this one!"
"DevSec_Mike: Can you cover SOAR platforms?"


Each message: avatar initial circle (24x24) + name in bold Body small + message text

Bottom input bar:

Text input ("Type a message...") + Send button
"Raise Hand" button (hand-outline icon, border 1px #FF9F1C)


SCREEN 10: AI CHATBOT SCREEN
Tab bar: AI Tutor tab active
Header (paddingH 24px, paddingTop 48px, paddingBottom 12px, borderBottom 1px #2A3362):

Left: time-outline icon (22px, #8B95C9) — tap → Chat History Screen
Center: shield-checkmark icon (18px, #00E5FF) + "CyberScout AI" in H4 (#EAEEFF)
Right: level badge pill (background rgba(57,255,20,0.08), "INTERMEDIATE" in Badge #39FF14)

Chat messages area (scrollable, paddingTop 20px):
User message bubble:

Right-aligned, max-width 78%
Background #00E5FF, border-radius 16 (bottom-right radius 4 for tail effect)
Text: "How does SQL injection work?" in Body, color #0A0E1A
Padding 12px

AI message bubble (below user message, 12px gap):

Left-aligned with avatar
AI avatar: circle 28x28, background rgba(0,229,255,0.08), border 1px rgba(0,229,255,0.25), shield-checkmark icon 16px #00E5FF
Bubble: max-width 78%, background #1E2545, border 1px #2A3362, border-radius 16 (bottom-left radius 4)
Padding 12px
Content (rich text):

"Great question! SQL injection (SQLi) is one of the most common and dangerous web vulnerabilities." in Body (#EAEEFF)
[line break]
"How it works" as bold subheading
Explanation paragraph
Code block area (background #111629, border-radius 8, padding 12, monospace text in #39FF14):



    -- Normal login query
    SELECT * FROM users WHERE username = 'alice'
    -- Attacker input: ' OR '1'='1
    SELECT * FROM users WHERE username = '' OR '1'='1'

"Key defenses" as bold subheading
Numbered list: 1. Parameterized queries 2. Input validation 3. Least privilege 4. WAF rules
"Would you like me to walk through a hands-on example?"

Citation card (below AI bubble text, inside the bubble):

Small card: background rgba(168,85,247,0.08), border 1px rgba(168,85,247,0.19), border-radius 4, paddingH 8px, paddingV 3px
document-text icon (12px, #A855F7) + "OWASP Top 10 — A03:2021 - Injection" in Caption (#A855F7)

Suggested topic chips (below citation, inside bubble):

Row of 3 pills (flexWrap, 4px gap):

"Blind SQL injection" / "Prepared statements in Python" / "SQLMap tool"
Each: border 1px rgba(0,229,255,0.25), border-radius 999, paddingH 8px, paddingV 4px
Text in Caption (#00E5FF)
Tapping a chip puts that text into the input field



Quick action buttons (above input bar, paddingH 24px):

Row of 3 pills: "Quiz me" / "Explain simpler" / "Show example"
Each: border 1px #2A3362, border-radius 999, paddingH 12px, paddingV 4px, text Caption #8B95C9
Tapping puts text into input

Input bar (bottom, padding 12px sides, 24px bottom, background #111629, borderTop 1px #2A3362):

Input container: border-radius 20, border 1px #2A3362, background #1E2545

Left padding 16px, right padding 4px, vertical padding 4px
Placeholder: "Ask about cybersecurity..." in Body #5A6599
Send button (right side): circle 34x34, border-radius 17

When input empty: background rgba(0,229,255,0.19), arrow-up icon #5A6599
When input has text: background #00E5FF, arrow-up icon #0A0E1A





Typing indicator state (shown while AI is responding):

Left-aligned bubble with AI avatar
Smaller bubble with 3 animated dots (8x8 circles, #00E5FF at varying opacity 0.4, 0.6, 0.8)


SCREEN 11: CHAT HISTORY SCREEN
Header:

Arrow-back (→ Chat Screen) + "Chat History" in H2 + Search icon right

Grouped list:

Section: "This Week" (Caption #5A6599)

Row: "Understanding SQL Injection" in H4 (#EAEEFF)

"web-security" tag pill + "Mar 11" + "14 messages" in Caption (#5A6599)


Row: "OSI Model Layers"

"networking" tag + "Mar 10" + "8 messages"




Section: "Last Week"

Row: "Password Hashing Best Practices"

"cryptography" tag + "Mar 9" + "22 messages"




Each row: padding 16px, borderBottom 1px #2A3362
Swipe left reveals red "Delete" button
Tap any row → Chat Screen with that conversation loaded


SCREEN 12: PROFILE SCREEN
Full screen, scrollable, no tab bar
Header: Arrow-back (top-left, 24px padding, 48px top) → back to previous screen
Profile section (centered):

Avatar circle (88x88, border-radius 44, border 2px rgba(0,229,255,0.25), background rgba(0,229,255,0.08))

Large "A" letter centered (40px, #EAEEFF)


"Alex Chen" in H2 (#EAEEFF), marginTop 12px
"alex@example.com" in Body small (#8B95C9)

Level + XP card (centered, width 80%):

Padding 16px, border-radius 16, background #1E2545, border 1px #2A3362, marginTop 20px
Row: "INTERMEDIATE" badge pill (background rgba(0,229,255,0.08), text #00E5FF) on left, "2,450 / 3,000 XP" in Body small (#5A6599) on right
XP progress bar: height 6px, border-radius 3, track rgba(0,229,255,0.08), fill #00E5FF at 82%, marginTop 8px

Stats grid (2x2, marginH 24px, marginTop 20px, 8px gap):

Each card: flex 1, centered content, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362

Card 1: flame icon (22px, #FF9F1C) + "12" (H3, #EAEEFF) + "Day streak" (Caption, #5A6599)
Card 2: time icon (22px, #00E5FF) + "47h" + "Learned"
Card 3: school icon (22px, #A855F7) + "4" + "Courses"
Card 4: trophy icon (22px, #39FF14) + "3" + "Badges"



Skill Breakdown section:

Card (margin 24px, padding 20px, border-radius 16, background #1E2545, border 1px #2A3362):
"Skill Breakdown" in H3 (#EAEEFF)
6 horizontal skill bars (8px gap), each row:

Label (Body small, #8B95C9, width 100px) + progress bar (flex 1, height 6, border-radius 3) + percentage (Caption, #5A6599, width 32)
"Networking" — 72% bar fill in #00E5FF, track rgba(0,229,255,0.12)
"Web Security" — 65% in #3B82F6
"System Sec" — 55% in #A855F7
"Social Eng" — 48% in #FF9F1C
"Cryptography" — 40% in #39FF14
"Forensics" — 30% in #FF3B5C



Achievements section:

Card (margin 24px, padding 20px, border-radius 16, background #1E2545, border 1px #2A3362):
"Achievements" in H3 (#EAEEFF)
Grid of 6 items (3 columns, 12px gap), each 72px wide, centered:

🔐 "First Login" — full opacity (earned)
🔥 "7-Day Streak" — full opacity
🎓 "First Course Complete" — full opacity
💉 "SQL Injection Master" — 35% opacity (not earned)
⚡ "30-Day Streak" — 35% opacity
🏴‍☠️ "Red Team Certified" — 35% opacity
Each: emoji (28px) + name (Caption, #8B95C9, centered, max 2 lines)




SCREEN 13: SETTINGS SCREEN
Tab bar: Settings tab active (cog filled, #00E5FF)
Header: "Settings" in H1, paddingH 24px, paddingTop 48px
Profile card (margin 24px, padding 16px, border-radius 16, background #1E2545, border 1px #2A3362):

Row: Avatar circle (56x56, border-radius 28, background rgba(0,229,255,0.08)) with "A" (28px) + Info (flex 1) + chevron-forward (20px, #5A6599)
Info: "Alex Chen" in H3 (#EAEEFF), "alex@example.com" in Body small (#8B95C9)
Below name: tier pill (background rgba(0,229,255,0.08), border 1px rgba(0,229,255,0.25), "Pro Plan" in Badge #00E5FF)
Tap → Profile Screen

Section: "SUBSCRIPTION" (Caption #5A6599, marginH 24px, marginTop 24px):

Container (marginH 24px, border-radius 16, background #1E2545, border 1px #2A3362, overflow hidden):

Row 1: diamond-outline icon (18px, #00E5FF in rgba bg) + "Manage Plan" + "Pro" value text (#5A6599) + chevron-forward

Tap → Subscription Screen


Row 2: receipt-outline icon + "Billing History" + chevron-forward
Each row: padding 16px, borderBottom 1px #2A3362 (except last)



Section: "APPEARANCE":

Row 1: moon icon (since dark mode) + "Dark Mode" + Toggle switch (track: off=#2A3362 on=rgba(0,229,255,0.25), thumb: off=#5A6599 on=#00E5FF) — toggle is ON
Row 2: text-outline + "Font Size" + "Medium" value + chevron

Section: "LEARNING":

Row 1: flag-outline + "Daily Goal" + "30 min" + chevron
Row 2: notifications-outline + "Notifications" + chevron
Row 3: language-outline + "Language" + "English" + chevron

Section: "ACCOUNT":

Row 1: mail-outline + "Change Email" + chevron
Row 2: key-outline + "Change Password" + chevron
Row 3: finger-print + "Two-Factor Auth" + "Off" + chevron
Row 4: download-outline + "Export My Data" + chevron

Danger section (marginTop 24px):

Row 1: log-out-outline icon (18px, #FF3B5C in rgba(FF3B5C,0.08) bg) + "Log Out" in Body (#FF3B5C), no chevron

Tap → Login Screen


Row 2: trash-outline (#FF3B5C) + "Delete Account" (#FF3B5C), no chevron

Footer (centered, padding 32px bottom):

"CyberScout v1.0.0" in Caption (#5A6599)
"Terms · Privacy · Support" in Caption (#5A6599)


SCREEN 14: SUBSCRIPTION SCREEN
Full screen, scrollable, no tab bar
Header:

Arrow-back (→ Settings) + "Choose Your Plan" in H2 + "Invest in your cybersecurity career" in Body (#8B95C9)

3 plan cards stacked (marginH 24px, 16px gap):
Free plan card:

Padding 20px, border-radius 16, background #1E2545, border 1px #2A3362
"Free" in H3 (#8B95C9)
"$0" in Hero (#EAEEFF) + "forever" in Body (#5A6599)
7 feature rows (8px gap each):

checkmark-circle (#39FF14) + "AI chatbot tutor (50 msgs/day)" (#EAEEFF)
checkmark-circle (#39FF14) + "Course roadmap & progress"
checkmark-circle (#39FF14) + "Community forum"
checkmark-circle (#39FF14) + "First module of every course"
close-circle (#5A6599) + "Recorded lectures" (#5A6599, dimmed)
close-circle + "Live lectures" (dimmed)
close-circle + "1:1 Mentorship" (dimmed)


Button: "Current Plan" — border 1px #8B95C9, transparent bg, text #8B95C9 (disabled state for current user on Pro, but show as if Free user is viewing)

Pro plan card (CURRENT for this user):

Border 2px #00E5FF (thicker to indicate popular)
"MOST POPULAR" badge top: small rectangle (paddingH 8px, paddingV 3px, border-radius 4, background #00E5FF, text "MOST POPULAR" Badge #0A0E1A)
Header row: "Pro" in H3 (#00E5FF) + "CURRENT" pill (background rgba(0,229,255,0.08), text Badge #00E5FF)
"$19" in Hero (#EAEEFF) + "/month" in Body (#5A6599)
Features (all checkmarks #39FF14):

"Everything in Free"
"Unlimited AI chat"
"Full lecture library"
"Live batch lectures"
"Hands-on labs"
"Completion certificates"
close-circle + "1:1 Mentorship" (dimmed)


Button: "Current Plan" — border 1px #00E5FF, transparent bg, text #00E5FF

Max plan card:

Border 1px #2A3362
"Max" in H3 (#FFD700)
"$49" in Hero (#EAEEFF) + "/month" in Body (#5A6599)
All features with checkmarks:

"Everything in Pro"
"1:1 mentorship (4x/month)"
"Priority AI responses"
"Career coaching"
"Private instructor channel"
"Early access to courses"
"Custom learning paths"


Button: "Upgrade to Max" — solid background #FFD700, text #0A0E1A

Footer:

"Cancel anytime. All plans include a 7-day free trial." in Body small (#5A6599), centered


SCREEN 15: MENTOR LIST SCREEN (Max Only)
Header: "Mentors" in H1 + filter pills (Pentesting, IR, Cloud, etc.)
If user is not Max tier — show Feature Gate:

Centered card: lock-closed icon (28px) in circle (60x60, background rgba(FFD700,0.08)), #FFD700
"MAX Feature" in H4 (#EAEEFF)
"Upgrade to MAX to unlock this feature and accelerate your learning." in Body small (#8B95C9)
"Upgrade to MAX" button (background #FFD700, text #0A0E1A)
Tap → Subscription Screen

If user is Max tier — show mentor cards:

3 cards stacked:

Card: avatar initial circle (48x48) + "Sarah Kim" H4 + star 4.9 + "234 sessions"

Tags: "Incident Response", "SIEM", "Threat Hunting"
Green dot "Available"


"Marcus Rivera" + 4.8 + 189 sessions + "Penetration Testing", "Web Security", "Red Team" + Available
"Dr. James Okonkwo" + 5.0 + 156 sessions + "Malware Analysis", "Reverse Engineering", "Forensics" + Red "Unavailable"




SCREEN 16: CERTIFICATES SCREEN
Header: Arrow-back + "Certificates" in H2
If user has certificates:

Card: completion certificate style

Course name "Cybersecurity Foundations" in H4
"Completed March 1, 2026" in Body small (#8B95C9)
"Certificate ID: CS-2026-00142" in Caption (#5A6599)
"View Certificate" button + "Share to LinkedIn" button



If no certificates yet:

Centered empty state:

ribbon-outline icon (48px, #5A6599)
"No certificates yet" in Body (#5A6599)
"Complete a course to earn your first certificate" in Body small (#5A6599)
"Browse Courses" button → Course Catalog




PROTOTYPE FLOW MAP (Connect all screens)
Authentication flow:

Login Screen → (Login button) → Dashboard
Login Screen → (Sign Up link) → Signup Screen
Login Screen → (Forgot password) → Forgot Password Screen
Signup Screen → (Create Account) → Dashboard
Signup Screen → (Back arrow) → Login Screen
Forgot Password → (Back) → Login Screen

Dashboard flows:

Dashboard → (Notification bell) → Notifications Screen
Dashboard → (Continue Learning card) → Course Detail Screen
Dashboard → (Any recommendation card) → Course Catalog Screen
Dashboard → (Ask AI quick action) → Chat Screen
Dashboard → (Courses quick action) → Course Catalog Screen
Dashboard → (Certs quick action) → Certificates Screen
Dashboard → (Profile quick action) → Profile Screen

Tab bar navigation (on all 4 main screens):

Dashboard tab → Dashboard Screen
Courses tab → Course Catalog Screen
AI Tutor tab → Chat Screen
Settings tab → Settings Screen

Course flows:

Course Catalog → (Any course card) → Course Detail Screen
Course Detail → (Back arrow) → Course Catalog
Course Detail → (Enroll Now) → Lecture Player Screen
Course Detail → (Upgrade to Pro/Max) → Subscription Screen
Lecture Player → (Back) → Course Detail

Chat flows:

Chat Screen → (History icon) → Chat History Screen
Chat History → (Back) → Chat Screen
Chat History → (Any conversation) → Chat Screen

Settings flows:

Settings → (Profile card) → Profile Screen
Settings → (Manage Plan) → Subscription Screen
Settings → (Log Out) → Login Screen
Subscription → (Back) → Settings Screen
Profile → (Back) → Settings or Dashboard

Feature gating:

Mentor List (non-Max user) → (Upgrade button) → Subscription Screen
Course Detail (Pro course, Free user) → (Upgrade button) → Subscription Screen


INTERACTION STATES & MICRO-ANIMATIONS
Buttons:

Default → slightly scales down on press (0.97 scale)
Loading state: spinner replaces text (ActivityIndicator style)
Disabled state: 30% opacity

Cards:

Press/hold: surface brightens slightly (surfaceHover #252D55)

Tab bar:

Active icon: filled variant, #00E5FF
Inactive icon: outline variant, #5A6599
Transition: smooth 200ms

Toggle switches:

Track color transitions smoothly between off (#2A3362) and on (rgba(0,229,255,0.25))
Thumb slides with spring animation

Chat:

New messages slide up from bottom
Typing indicator dots pulse/bounce sequentially
Send button transitions from dim to cyan when input has text

Progress bars:

Animate from 0 to target width on screen load (300ms ease-out)

Course cards:

Fade in with stagger (each card 50ms delay after previous)

Scroll behavior:

All scrollable screens have momentum scrolling
Horizontal scroll sections (live sessions, track filters) have snap behavior


ADDITIONAL DESIGN NOTES

All screens use safe area insets — content never overlaps the status bar or home indicator
Bottom tab bar height is 85px with 8px top padding, consistent across all tabbed screens
Card elevation: Use subtle dark shadows (not drop shadows — dark theme). Cards differentiate from background via 1px border + slightly lighter fill
No images/photos are used — everything uses icons, initials, colored backgrounds, and geometric shapes. This is intentional for the prototype
Monospace font in headings is critical to the aesthetic — it creates the "hacker terminal" vibe that differentiates CyberScout from generic edu apps
Cyan (#00E5FF) is the dominant accent — used sparingly but consistently for CTAs, active states, and primary actions
Glass-morphism effects: Where card backgrounds use semi-transparent fills over the dark background, creating depth without being heavy
The app defaults to dark mode — this is deliberate for the cybersecurity audience and aesthetic


SUMMARY OF ALL 16 SCREENS

Login Screen
Signup Screen
Forgot Password Screen
Dashboard Screen (home tab)
Notifications Screen
Course Catalog Screen (courses tab)
Course Detail Screen (Foundations example)
Lecture Player Screen
Live Lecture Screen
AI Chatbot Screen (chat tab)
Chat History Screen
Profile Screen
Settings Screen (settings tab)
Subscription Screen
Mentor List Screen
Certificates Screen

All 16 screens are connected via the prototype flow map above. Every button, card, tab, and navigation element should be interactive and linked to its destination screen. The bottom tab bar appears on screens 4, 6, 10, and 13 (the four main tab screens).