# Survey360 - Product Requirements Document

## Original Problem Statement
Pull the Survey360 project from GitHub for preview

## What's Been Implemented
- **Date**: Feb 10, 2026
- Cloned Survey360 repository from GitHub
- Configured environment variables (MONGO_URL, DB_NAME, REACT_APP_BACKEND_URL)
- Installed backend (Python) and frontend (Node.js) dependencies
- Services running: Backend (FastAPI on 8001), Frontend (React on 3000), MongoDB

## Architecture
- **Frontend**: React 19 + TailwindCSS + Shadcn UI + Recharts
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB with survey360_ prefixed collections
- **Auth**: JWT-based authentication

## Key Features
1. **DataPulse** - Enterprise data collection platform
   - Advanced statistical analysis
   - CATI/CAPI field operations
   - AI quality monitoring
   - Offline-first PWA

2. **Survey360** - Simplified survey product
   - Survey builder (10 question types)
   - Response collection
   - Basic analytics
   - CSV export

## Demo Credentials
- DataPulse: demo@datapulse.io / Test123!
- Survey360: demo@survey360.io / Test123!

## Access URLs
- Main App: /
- Survey360: /solutions/survey360

## Backlog (P1/P2)
- [ ] Add Excel export option
- [ ] Survey scheduling (auto-publish/close)
- [ ] Email invitation system
- [ ] Quick-start template library

---

## Survey360 Template Library (Feb 10, 2026) - COMPLETE

### Feature: Quick-Start Templates
Added a template library with 6 pre-built survey templates to help users get started faster.

### Templates Available:
1. **Customer Satisfaction** - 7 questions (rating, NPS, quality, support, improvements)
2. **Employee Feedback** - 8 questions (department, satisfaction, work-life balance, benefits)
3. **Event Registration** - 10 questions (contact info, attendance, sessions, dietary)
4. **Product Feedback** - 7 questions (usage duration, features, usability, requests)
5. **Market Research** - 8 questions (demographics, purchasing behavior, brand)
6. **Website Feedback** - 7 questions (purpose, navigation, design, performance)

### Backend Endpoints:
- `GET /api/survey360/templates` - List all templates
- `GET /api/survey360/templates/{id}` - Get specific template
- `POST /api/survey360/templates/{id}/create` - Create survey from template

### Frontend Components:
- `TemplateLibrary` component in Survey360SurveysPage.jsx
- Category filtering (All, Feedback, HR & Team, Events, Research)
- One-click creation with instant redirect to editor

### Test Results: 100% (Backend & Frontend)

### Files Modified:
- `/app/backend/routes/survey360_routes.py` - Added SURVEY_TEMPLATES and 3 endpoints
- `/app/frontend/src/pages/solutions/Survey360SurveysPage.jsx` - Added TemplateLibrary component

### Backlog:
- [ ] Add template name customization before creation
- [ ] Add template preview feature
- [ ] Add favorites/starred templates
- [ ] Add custom template creation from existing surveys

---

## Survey360 Landing Page Redesign (Feb 10, 2026) - COMPLETE

### Changes Made to Match FieldForce Layout:
- Navigation: Pill-style nav buttons with Demo button
- Hero: Centered layout with logo, floating icons, stats row  
- How It Works: 4-step cards with mini UI mockups
- Features: 4x2 grid with colored icon circles
- Use Cases: 6 industry cards with example tags
- Pricing: 3-tier section (Free/Pro/$99)
- CTA: Clean bottom call-to-action

### Files Modified:
- `/app/frontend/src/pages/solutions/Survey360LandingPage.jsx` - Complete rewrite

### Design Elements:
- Dark theme (#0a1628)
- Teal accent (#14b8a6)
- Floating animated icons
- Card-based layouts
- Section badges

---

## Survey360 High-Traffic Scalability (Feb 10, 2026) - COMPLETE

### Features Implemented:

#### 1. Redis Caching Layer
- File: `/app/backend/utils/cache.py`
- Memory fallback when Redis unavailable
- TTL configuration: templates 1hr, surveys 60s, analytics 1min
- Cache invalidation on CRUD operations

#### 2. Background Job Queue
- File: `/app/backend/utils/background_jobs.py`
- Celery with async fallback
- Tasks: export_responses, generate_analytics, bulk_send_invitations
- Job status/progress tracking

#### 3. Database Optimizations
- File: `/app/backend/utils/db_optimization.py`
- Optimized indexes for all collections
- Aggregation pipelines for analytics
- Connection pool monitoring

#### 4. Response Caching Middleware
- File: `/app/backend/utils/response_cache.py`
- Automatic GET request caching
- Rate limiting per route

### New API Endpoints:
- `GET /api/health` - Shows cache & pool status
- `POST /api/survey360/jobs` - Create background job
- `GET /api/survey360/jobs` - List user jobs
- `GET /api/survey360/jobs/{id}` - Job status
- `POST /api/survey360/surveys/{id}/export-async` - Async export
- `GET /api/survey360/cache/stats` - Cache statistics

### Test Results: 100% (9/9 tests passed)

### Production Requirements:
- [ ] Deploy Redis server
- [ ] Configure Celery workers
- [ ] Set up monitoring dashboards
- [ ] Configure Kubernetes auto-scaling

---

## Redis & Celery Production Deployment (Feb 11, 2026) - COMPLETE

### Redis Server Configuration
- Port: 6379 (localhost only)
- Max Memory: 256MB
- Eviction Policy: allkeys-lru
- Supervisor managed

### Celery Configuration
- Broker: redis://127.0.0.1:6379/0
- Backend: redis://127.0.0.1:6379/0
- Workers: 2 concurrent
- Queues: default, high_priority

### Registered Tasks
1. `export_responses` - Export survey responses to CSV
2. `generate_analytics` - Generate comprehensive analytics
3. `bulk_send_invitations` - Send bulk email invitations
4. `cleanup_old_jobs` - Clean up jobs older than 7 days (daily at 2 AM)

### Files Created/Modified
- `/etc/supervisor/conf.d/survey360_workers.conf` - Supervisor config
- `/app/backend/.env` - Added REDIS_URL
- `/app/backend/utils/background_jobs.py` - Added Celery task wrappers

### Test Results: 100% passed

### Services Running
- redis: RUNNING (port 6379)
- celery-worker: RUNNING (2 concurrency)
- celery-beat: RUNNING (scheduler)
- backend: RUNNING (cache: connected)

### Future Improvements
- [ ] Redis persistence (RDB/AOF)
- [ ] Redis Sentinel for HA
- [ ] Celery Flower monitoring
- [ ] Auto-scaling workers

---

## Redis Persistence & HA Monitoring (Feb 11, 2026) - COMPLETE

### Redis Persistence Configuration
- **RDB Snapshots**: 
  - save 900 1 (15 min if 1+ changes)
  - save 300 10 (5 min if 10+ changes)
  - save 60 10000 (1 min if 10K+ changes)
- **AOF**: appendfsync everysec, auto-rewrite at 100%/64mb
- **Auth**: requirepass survey360_redis_secret_2026

### Celery Flower Dashboard
- Port: 5555
- Auth: admin:survey360flower2026
- Persistent: /var/lib/redis/flower.db

### Redis HA Monitoring API
- GET /api/redis-ha/health
- GET /api/redis-ha/replication
- GET /api/redis-ha/slowlog
- POST /api/redis-ha/force-persist
- GET /api/redis-ha/metrics

### Files Created
- /app/backend/config/redis.conf
- /app/backend/utils/redis_ha.py
- /etc/supervisor/conf.d/survey360_workers.conf (updated)

### Test Results: 100% (9/9 tests passed)

### Production HA Options
- AWS ElastiCache Multi-AZ
- Redis Cluster mode
- External Sentinel deployment

---

## Survey360 Demo & Sandbox Pages (Feb 11, 2026) - COMPLETE

### Pages Added:
1. **Demo Page** (`/solutions/survey360/demo`)
   - Hero section with "Experience Survey360 Before You Sign Up"
   - Stats: 6 tabs, 3 surveys, 2,847 responses, 47 users
   - Feature cards grid
   - Dashboard preview in browser frame

2. **Interactive Sandbox** (`/solutions/survey360/demo/sandbox`)
   - Full dashboard simulation
   - 6 tabs: Dashboard, Surveys, Responses, Analytics, Team, Settings
   - Browser frame with Live Demo badge
   - Sample data: 3 surveys, recent activity feed
   - Demo Mode card with CTA

### Files Created:
- `/app/frontend/src/pages/solutions/Survey360DemoPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360DemoSandbox.jsx`

### Routes Added:
- `/solutions/survey360/demo`
- `/solutions/survey360/demo/sandbox`

### Test Results: 100% (19/19 frontend tests)

---

## Survey360 Guided Tour (Feb 11, 2026) - COMPLETE

### Tour Implementation:
- 7-step guided tour for interactive demo
- Auto-starts on first visit
- Spotlight effect on highlighted sections
- Progress tracking with animated bar
- LocalStorage persistence

### Tour Steps:
1. Welcome - Introduction
2. Dashboard Overview - Stats cards
3. Active Surveys - Survey list
4. Recent Activity - Activity feed
5. Navigation - Sidebar menu
6. Analytics - Analytics tab
7. Completion - Success message

### Features:
- Next/Back navigation
- Skip Tour option
- "Take a Tour" restart button
- CSS spotlight with teal glow

### Test Results: 95% (15/15 tests)

### Files Modified:
- `/app/frontend/src/pages/solutions/Survey360DemoSandbox.jsx`
  - Added GuidedTour component
  - Added TOUR_STEPS configuration
  - Added data-tour attributes
  - Added tour state management

---

## Survey360 Light/Dark Mode Theme Toggle (Feb 11, 2026) - COMPLETE

### Implementation Summary:
Added theme-aware styling to all Survey360 pages, allowing users to switch between light and dark modes.

### Components Updated:
1. **Survey360AppLayout.jsx** - Already had theme support with isDark pattern
2. **Survey360DashboardPage.jsx** - Added isDark conditional classes
3. **Survey360SurveysPage.jsx** - Added isDark conditional classes
4. **Survey360SettingsPage.jsx** - Updated Theme tab with isDark support
5. **Survey360ResponsesPage.jsx** - Added isDark conditional classes
6. **Survey360BillingPage.jsx** - Added isDark conditional classes
7. **Survey360BuilderPage.jsx** - Added theme hook (partial implementation)

### Theme System:
- State stored in `useUIStore` in `/app/frontend/src/store/index.js`
- Toggle button in header: `data-testid="theme-toggle-btn"`
- Options: Light / Dark / System (in Settings > Theme tab)
- Pattern: `isDark ? 'dark-class' : 'light-class'`

### Color Scheme:
- **Dark Mode**: bg-[#0a1628] / bg-[#0f1d32], text-white, border-white/10
- **Light Mode**: bg-gray-50 / bg-white, text-gray-900, border-gray-200

### Test Results: 100% (12/12 frontend tests)

### Files Modified:
- `/app/frontend/src/pages/solutions/Survey360DashboardPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360SurveysPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360SettingsPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360ResponsesPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360BillingPage.jsx`
- `/app/frontend/src/pages/solutions/Survey360BuilderPage.jsx`

---

## Backlog (Updated Feb 11, 2026)

### P0 (Completed)
- [x] Light/Dark Mode Theme Toggle

### P1 (Next)
- [ ] Verify landing page redirect issue (user confirmation pending)

### P2 (Future)
- [ ] Increase Celery worker concurrency (--concurrency=4)
- [ ] Implement CDN for static assets
- [ ] MongoDB sharding (for very large scale)
- [ ] Configure Celery Flower with better security

### P3 (Backlog)
- [ ] Redis Sentinel for true high availability
- [ ] Add Excel export option
- [ ] Survey scheduling (auto-publish/close)
- [ ] Email invitation system

---

## Survey360 Advanced Analytics (Feb 12, 2026) - COMPLETE

### Features Added:

#### 1. Response Trends Chart (Line/Area Chart)
- 14-day response history visualization
- SVG-based line chart with area fill
- Data points with hover states
- Shows total and average statistics

#### 2. Completion Rate Over Time (Bar Chart)
- Daily completion percentage bars
- Color-coded performance:
  - Green (≥70%): Excellent
  - Yellow (40-69%): Average
  - Red (<40%): Needs attention
- Y-axis percentage scale with legend

#### 3. Average Time per Question (Horizontal Bar Chart)
- Time estimate for each question type:
  - Short Text: 15s
  - Long Text: 45s
  - Single Choice: 8s (+2s per option >4)
  - Multiple Choice: 12s
  - Dropdown: 6s
  - Date: 10s
  - Number: 8s
  - Email: 12s
  - Phone: 15s
  - Rating: 5s
- Answer count displayed per question
- Total estimated survey time

#### 4. Export Analytics Options
- **Export Image (PNG)**: Visual summary with charts
- **Export Report (TXT)**: Comprehensive text report
- **Export JSON**: Raw analytics data for further processing

### Summary Stats Cards:
- Total Responses (with icon)
- Completion Rate % (with icon)
- Avg. Completion Time (with icon)
- Completed Count (with icon)

### Backend Changes:
- File: `/app/backend/routes/survey360_routes.py`
- Enhanced `GET /api/survey360/surveys/{id}/analytics` endpoint
- New response fields:
  - `response_trends` (14 days)
  - `completion_rate_trends` (14 days)
  - `question_times` (per question)
  - `overall_completion_rate`
  - `avg_completion_time`
  - `completed_responses`

### Frontend Changes:
- File: `/app/frontend/src/pages/solutions/Survey360ResponsesPage.jsx`
- New chart components:
  - `TrendChart` - SVG line/area chart
  - `CompletionRateChart` - Color-coded bar chart
  - `QuestionTimeChart` - Horizontal bar chart
- Export handler: `handleExportAnalytics(format)`
- Analytics ref for export capture

### Test Results: Backend API verified, Frontend rendering confirmed

### Backlog:
- [ ] Add real-time tracking per question (requires paradata)
- [ ] PDF export with styled charts
- [ ] Comparison analytics (vs previous period)
- [ ] Drill-down by respondent segment

---

## Reusable DashboardHeader Component (Feb 12, 2026) - COMPLETE

### Features Implemented:

#### 1. Search Bar
- Full-width search input with placeholder
- Keyboard shortcut hint (⌘K)
- Form submission handler

#### 2. Help Menu Dropdown
- Documentation link with external icon
- Contact Support link
- Keyboard Shortcuts modal trigger

#### 3. Theme Toggle
- Sun/Moon icon toggle button
- Tooltip with current mode indicator
- Smooth theme transition

#### 4. Notifications Panel
- Notification badge with unread count
- Three sample notifications with:
  - Title, description, timestamp
  - Read/unread status indicator
  - Mark all read functionality
- "View all notifications" link

#### 5. User Menu
- User avatar with fallback initials
- User name and email display
- Profile navigation link
- Settings navigation link
- Sign out option (red)

#### 6. Keyboard Shortcuts Modal
- Animated modal with shortcuts list
- Shows common shortcuts (Ctrl+K, Ctrl+N, etc.)
- Close on escape or X button

### Files Created:
- `/app/frontend/src/components/ui/dashboard-header.jsx`

### Files Modified:
- `/app/frontend/src/pages/solutions/Survey360AppLayout.jsx` - Integrated DashboardHeader

### Props Available:
- `user`: User object with name, email, avatar
- `theme`: 'dark' | 'light'
- `onThemeToggle`: Theme toggle callback
- `onLogout`: Logout callback
- `onMenuClick`: Mobile menu callback
- `showMobileMenu`: Boolean to show mobile menu button
- `searchPlaceholder`: Custom search placeholder
- `onSearch`: Search callback
- `notifications`: Custom notifications array
- `onNotificationClick`: Notification click handler
- `onClearNotifications`: Clear all handler
- `helpLinks`: Custom help links array

### Test Results: Verified via screenshot testing

---

## Interactive Demo Screen Enhancement (Feb 12, 2026) - COMPLETE

### Features Implemented:

#### 1. "Try Survey" Tab
- New navigation item with "NEW" badge
- Interactive survey filling experience
- Multiple survey options to try
- Star rating, single choice, multiple choice, text inputs
- Progress bar with percentage
- Submit flow with success animation
- "Try Another Survey" option

#### 2. Live Response Simulation
- Real-time response generation every 8 seconds
- Toast notifications for new responses
- Animated row entries with highlight
- Play/Pause simulation toggle
- Live counter updates on dashboard

#### 3. Interactive Analytics
- Hover tooltips on bar charts showing exact counts
- Hover effects on satisfaction breakdown
- Animated progress bars
- Key metrics cards with hover animations

#### 4. Enhanced Dashboard
- Live response counter
- Hover animations on stats cards
- Real-time activity feed updates

### Files Updated:
- `/app/frontend/src/pages/solutions/Survey360DemoSandbox.jsx`

### Test Results: Verified via screenshot testing ✅

---

## Backlog (Updated Feb 12, 2026)

### P0 (Completed)
- [x] Light/Dark Mode Theme Toggle
- [x] Advanced Analytics (Trends, Completion Rate, Time per Question, Export)
- [x] Reusable DashboardHeader Component with Language Selector
- [x] Link Shortener Integration (Surveys List + Builder)
- [x] Interactive Demo Screen

### P1 (Completed - Feb 12, 2026)
- [x] Excel export for survey responses
- [x] Survey scheduling (advanced with recurring, timezone support)
- [x] Email invitations using Resend (placeholder key)

### P2 (Future)
- [ ] PDF export with styled charts
- [ ] Team collaboration features

### P3 (Backlog)
- [ ] Third-party integrations (Zapier, Mailchimp)
- [ ] Redis Sentinel for true high availability
- [ ] Comparison analytics (vs previous period)

---

## Excel Export Feature (Feb 12, 2026) - COMPLETE

### Implementation:
- Backend endpoint: `GET /api/survey360/surveys/{survey_id}/export/excel`
- Generates .xlsx file with two sheets:
  - Summary: Survey metadata (name, description, status, response count)
  - Responses: All response data with question headers
- Styled headers with teal color theme
- Auto-width columns

### Files Updated:
- `/app/backend/routes/survey360_routes.py` (added export endpoint)
- `/app/frontend/src/pages/solutions/Survey360SurveysPage.jsx` (added Export Excel menu item)

---

## Survey Scheduling Feature (Feb 12, 2026) - COMPLETE

### Implementation:
- Backend endpoints:
  - `POST /api/survey360/surveys/{survey_id}/schedule` - Set schedule
  - `GET /api/survey360/surveys/{survey_id}/schedule` - Get schedule
  - `DELETE /api/survey360/surveys/{survey_id}/schedule` - Remove schedule
  - `POST /api/survey360/schedules/process` - Process scheduled surveys (cron)

### Features:
- Timezone support (UTC, US, Europe, Asia, Australia)
- Publish date/time
- Close date/time
- Recurring surveys:
  - Daily, Weekly, Monthly intervals
  - End date or max occurrences
  - Auto-creates new survey copies

### Files Updated:
- `/app/backend/routes/survey360_routes.py`
- `/app/frontend/src/pages/solutions/Survey360SurveysPage.jsx` (ScheduleModal component)

---

## Email Invitations Feature (Feb 12, 2026) - COMPLETE

### Implementation:
- Backend endpoints:
  - `POST /api/survey360/surveys/{survey_id}/invite` - Send invitations
  - `GET /api/survey360/surveys/{survey_id}/invitations` - Get sent invitations
  - `POST /api/survey360/invitations/send-reminders` - Send reminders (cron)

### Features:
- Bulk email sending
- Custom subject and message
- Beautiful HTML email template
- Reminder scheduling
- Invitation tracking

### Integration:
- Resend API (placeholder key: `re_placeholder_key`)
- Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` env vars for production

### Files Updated:
- `/app/backend/routes/survey360_routes.py`
- `/app/frontend/src/pages/solutions/Survey360SurveysPage.jsx` (EmailInvitationModal component)


---

## User Manual / Help Center (Feb 13, 2026) - COMPLETE

### Feature: Comprehensive User Manual
Implemented a full-featured Help Center accessible from the app header, providing self-service documentation to reduce support requests.

### Access Points:
- Help icon (?) in DashboardHeader → "User Manual" dropdown item
- Direct URL: `/solutions/survey360/help`

### Features:
1. **Home Tab**
   - Search functionality
   - Popular Articles section
   - Browse by Category grid
   - Quick links to FAQ, Troubleshooting, Shortcuts

2. **FAQ Tab**
   - Expandable accordion-style questions
   - Organized by category (General, Surveys, Responses & Analytics, Account & Billing)

3. **Troubleshooting Tab**
   - Common issues with symptoms tags
   - Step-by-step solutions
   - Issues covered: Survey loading, Responses not showing, Export issues, Email delivery, Login problems

4. **Shortcuts Tab**
   - Keyboard shortcuts organized by category
   - Navigation, Survey Builder, General shortcuts

5. **What's New Tab**
   - Release notes with version history
   - Feature announcements and improvements

### Article Content:
- Welcome to Survey360
- Creating Your First Survey
- Using the Survey Builder
- Question Types Explained
- Sharing via Link
- Exporting Responses to Excel
- Analytics Dashboard Overview

### Files Updated:
- `/app/frontend/src/App.js` - Added route for Help Center
- `/app/frontend/src/pages/solutions/Survey360AppLayout.jsx` - Updated helpLinks in DashboardHeader
- `/app/frontend/src/components/ui/dashboard-header.jsx` - Modified to always include Keyboard Shortcuts

### Files Already Present:
- `/app/frontend/src/pages/solutions/Survey360HelpCenter.jsx` - Comprehensive Help Center component

---

## Backlog (Updated Feb 13, 2026)

### P0 (Completed)
- [x] Light/Dark Mode Theme Toggle
- [x] Advanced Analytics
- [x] Reusable DashboardHeader Component
- [x] Link Shortener Integration
- [x] Interactive Demo Screen
- [x] Excel Export
- [x] Survey Scheduling
- [x] Email Invitations (placeholder)
- [x] **User Manual / Help Center**

### P1 (Next)
- [ ] QR Code Generation in ShareSurveyDialog
- [ ] Resend Email Integration (make email invitations functional)
- [ ] Integrate Real LLM for AI Assistant (replace mocked responses)

### P2 (Future)
- [ ] Apply i18n translations across entire UI
- [ ] Team collaboration features
- [ ] PDF export with styled charts
- [ ] Admin Dashboard for AI Analytics (FAQ improvements)

### P3 (Backlog)
- [ ] Third-party integrations (Zapier, Mailchimp)
- [ ] Comparison analytics (vs previous period)

---

## Help Center Package Export (Feb 15, 2026) - COMPLETE

### Feature: Reusable Help Center Package
Created a self-contained, portable Help Center package that can be copied and integrated into other applications.

### Package Contents:
- **README.md** - Comprehensive documentation with setup instructions
- **frontend/components/HelpAssistant.jsx** - AI chat widget component
- **frontend/pages/HelpCenter.jsx** - Main Help Center page component  
- **backend/routes/help_assistant.py** - FastAPI backend routes

### Package Location:
- Directory: `/app/help-center-package/`
- Zip Archive: `/app/help-center-package.zip` (17 KB)

### Features Included:
1. **Two-column layout** with expandable categories sidebar
2. **AI Assistant** chat widget with:
   - Suggested questions for quick access
   - Markdown link parsing and clickable links
   - "Was this helpful?" feedback mechanism
   - Session-based conversation history
3. **FAQ Section** with expandable accordion
4. **Troubleshooting Guide** with step-by-step solutions
5. **Keyboard Shortcuts** reference
6. **What's New** changelog section
7. **Search functionality** across all articles
8. **Dark/Light theme** support

### Integration Steps (for other projects):
1. Copy the frontend components to your project
2. Copy the backend route to your FastAPI app
3. Install dependencies: `lucide-react`, `framer-motion`, `emergentintegrations`
4. Set `EMERGENT_LLM_KEY` environment variable
5. Customize categories, FAQ, and articles for your app

### Files Created:
- `/app/help-center-package/README.md`
- `/app/help-center-package/frontend/components/HelpAssistant.jsx`
- `/app/help-center-package/frontend/pages/HelpCenter.jsx`
- `/app/help-center-package/backend/routes/help_assistant.py`
- `/app/help-center-package.zip`

### Note:
The AI Assistant currently uses **real LLM integration** via the emergentintegrations library with the Emergent LLM Key. The backend at `/app/backend/routes/help_assistant_routes.py` is already configured to use GPT-5.2 for intelligent responses.
