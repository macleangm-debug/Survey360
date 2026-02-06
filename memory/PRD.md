# DataPulse - Product Requirements Document

## Original Problem Statement
Build a modern, secure, scalable data collection platform similar to SurveyCTO, optimized for research, monitoring & evaluation, and field data collection. Support for online/offline data collection, strong data quality controls, and advanced analytics integrations.

## Target Users
- Research institutions
- NGOs
- Government agencies
- Market research firms
- Health & education programs

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (multi-tenant)
- **Auth**: JWT + SSO (Software Galaxy integration ready)
- **PWA**: Service Worker + IndexedDB for offline support

## What's Been Implemented (Feb 5, 2026)

### Advanced Analytics Dashboard (NEW - Feb 5, 2026)
- [x] Analytics page with comprehensive metrics
- [x] Overview tab with submission counts, active forms, quality score, team members
- [x] Submissions tab with time series trends and top forms chart
- [x] Quality tab with score distribution and common issues breakdown
- [x] Performance tab with team metrics and regional statistics
- [x] Period filters: Today, 7 days, 30 days, 90 days, This year
- [x] CSV export functionality
- [x] Recharts integration for interactive charts

### Role-Based Access Control (NEW - Feb 5, 2026)
- [x] RBAC management page at /rbac
- [x] 5 System Roles: Owner, Administrator, Supervisor, Enumerator, Viewer
- [x] 31 granular permissions across 7 categories
- [x] Custom role creation with permission selection
- [x] User role assignments tab
- [x] Permission categories: Organization, Projects, Forms, Submissions, Cases, Analytics, Settings
- [x] System role protection (cannot edit/delete)

### Workflow Automation (NEW - Feb 5, 2026)
- [x] Workflows page at /workflows
- [x] 7 Trigger types: submission_created, submission_updated, quality_below, quality_above, field_value_changed, form_assigned, time_based
- [x] 9 Action types: flag_review, auto_approve, auto_reject, notify_team, send_email, send_sms, update_field, assign_case, trigger_webhook
- [x] 8 Condition operators: equals, not_equals, contains, starts_with, ends_with, greater_than, less_than, is_empty
- [x] 4 Pre-built templates: Quality Control, Auto-Approval, Team Notifications, Follow-up
- [x] Workflow enable/disable toggle
- [x] Duplicate workflow functionality
- [x] Execution statistics tracking

### Multi-Language Support (NEW - Feb 5, 2026)
- [x] Translations page at /translations
- [x] 14 Supported languages: English, Swahili, French, Spanish, Portuguese, Arabic, Hindi, Chinese, Amharic, Yoruba, Hausa, Igbo, Zulu, Xhosa
- [x] RTL support for Arabic
- [x] Translation progress tracking per language
- [x] Quick Translate dialog for instant translations
- [x] Form Translations tab for batch form translation
- [x] Translation Glossary management
- [x] Set default language functionality

### Form Logic Visualization (NEW - Feb 6, 2026)
- [x] React Flow integration for interactive flowcharts
- [x] Accessible from Form Builder > Settings > Logic Visualization
- [x] Visual representation of form flow (START → Fields → END)
- [x] Field nodes with type indicators and badges
- [x] Condition nodes for skip logic (diamond shapes)
- [x] Calculation nodes with formula display
- [x] Toggle controls for Skip Logic and Calculations visibility
- [x] Stats badges showing Fields, Skip Rules, Calculations count
- [x] Interactive zoom, pan, and minimap controls
- [x] Color-coded legend for node and edge types
- [x] Fullscreen mode support

### API Security & Rate Limiting (NEW - Feb 6, 2026)
- [x] Security page at /security
- [x] API Key Management:
  - Create, list, update, revoke API keys
  - Configurable scopes (read, write, delete, admin)
  - Rate limit tiers per key (Free: 100/min, Pro: 1000/min, Enterprise: 10000/min)
  - Key expiration settings (30, 90, 365 days or never)
  - IP whitelist per key
- [x] Rate Limit Status:
  - Real-time usage monitoring
  - Requests per minute tracking
  - Visual progress indicator
- [x] Audit Logs:
  - Request logging with timestamp, method, path, status, IP
  - Filtering by method and path
  - Pagination support
  - Export functionality
- [x] Security Settings:
  - Two-Factor Authentication toggle
  - Session timeout configuration (30min - 8hrs)
  - Max failed login attempts (3, 5, 10)
  - Password policy (min length, special chars, numbers)

### Super Admin / Multi-tenant Billing (NEW - Feb 6, 2026)
- [x] Super Admin Dashboard at /admin
- [x] Software Galaxy SSO Management integration
- [x] Dashboard Overview:
  - Total Organizations, Users, Submissions stats
  - Monthly Revenue calculation
  - Active organizations (30 days)
  - Billing tier distribution chart
  - Recent signups list
- [x] Organization Management:
  - List all organizations with usage data
  - Search and filter by tier
  - View organization details with monthly trends
  - Change organization billing tier
  - Generate invoices
- [x] Billing Plans:
  - Free tier: 3 users, 2 projects, 1000 submissions/mo, 1GB storage
  - Pro tier ($49/mo): 25 users, 10 projects, 25000 submissions/mo, 25GB storage
  - Enterprise tier ($199/mo): Unlimited users/projects/submissions, 500GB storage, SSO
- [x] Invoice Management:
  - Generate, list, and manage invoices
  - Status tracking (pending, paid, overdue, cancelled)
- [x] Usage Alerts:
  - Automatic alerts for organizations approaching limits
  - Severity levels (warning at 80%, critical at 100%)
- [x] System Analytics:
  - Daily submissions trend (30 days)
  - Daily new users chart
  - API calls tracking

### Advanced Form Logic (NEW - Feb 5, 2026)
- [x] Form Templates Library with 5 pre-built templates:
  - Household Survey (Demographics)
  - Health Screening (Health)
  - Customer Feedback (Business)
  - Event Registration (Events)
  - Agriculture Survey (Agriculture)
- [x] Calculated Fields Engine with functions:
  - Math: round, abs, min, max, sqrt, pow, floor, ceil
  - Conditional: iif, gte, gt, lte, lt, eq, ne
  - Date: today, now, year, month, day, age
  - String: concat, upper, lower, contains
  - Selection: selected, count_selected, coalesce
- [x] Skip Logic Engine with operators:
  - ==, !=, >, >=, <, <=
  - contains, not_contains
  - is_empty, is_not_empty
  - selected, not_selected
- [x] GPS Map Visualization with:
  - Cluster/Points view modes
  - Project and time period filters
  - Enumerator coverage stats
  - Accuracy distribution

### Core Features
- [x] User registration and JWT authentication
- [x] Multi-tenant organization system
- [x] Role-based access control
- [x] Project management
- [x] Drag-and-drop Form Builder with 14+ field types
- [x] Data submission and review workflow
- [x] Quality scoring and flagging
- [x] Export (CSV, XLSX, JSON)
- [x] Case management for longitudinal tracking
- [x] Quality Dashboard with comprehensive metrics
- [x] Settings page with API key management

### PWA & Offline Support (NEW - Feb 5, 2026)
- [x] PWA manifest.json with app icons
- [x] Service Worker for caching and offline support
- [x] IndexedDB storage for offline forms and submissions
- [x] Sync manager for background synchronization
- [x] Network status indicator
- [x] PWA install prompt
- [x] Offline fallback page

### Form Preview (NEW - Feb 5, 2026)
- [x] Mobile/Desktop device preview toggle
- [x] Language toggle (English/Swahili)
- [x] All field type renderers:
  - Text, Number, Date, Textarea
  - Select, Radio, Checkbox
  - GPS Location capture
  - Photo capture/upload
  - Audio/Video placeholders
  - Note display
  - Group/Repeat structures
- [x] Form validation with error display
- [x] Test Submit simulation
- [x] Reset form functionality
- [x] Debug panel showing form data

### Media Upload (NEW - Feb 5, 2026)
- [x] File upload API with chunked upload support
- [x] File type validation:
  - Photos: JPEG, PNG, WebP, HEIC (10MB limit)
  - Audio: MP3, WAV, OGG, WebM (25MB limit)
  - Video: MP4, WebM, MOV, AVI (50MB limit)
  - Documents: PDF, DOC, DOCX (25MB limit)
- [x] Progress indicator during upload
- [x] File preview after upload
- [x] Delete uploaded files
- [x] Audio recorder component

## File Upload Limits (Industry Standard)
| Type | Limit | Formats |
|------|-------|---------|
| Photo | 10MB | JPEG, PNG, WebP, HEIC |
| Audio | 25MB | MP3, WAV, OGG, WebM |
| Video | 50MB | MP4, WebM, MOV, AVI |
| Document | 25MB | PDF, DOC, DOCX |

## API Endpoints

### Media API
- `POST /api/media/upload` - Upload single file
- `POST /api/media/upload/init` - Initialize chunked upload
- `POST /api/media/upload/chunk/{upload_id}/{chunk_index}` - Upload chunk
- `POST /api/media/upload/complete/{upload_id}` - Complete chunked upload
- `GET /api/media/file/{file_id}` - Get file
- `GET /api/media/thumbnail/{file_id}` - Get thumbnail
- `DELETE /api/media/{file_id}` - Delete file
- `GET /api/media/limits` - Get upload limits

## Backlog - P0 (Critical)
- [x] Calculated fields evaluation ✅ (Feb 5, 2026)
- [x] Advanced skip logic editor ✅ (Feb 5, 2026)
- [x] GPS accuracy visualization on map ✅ (Feb 5, 2026)
- [x] Form templates library ✅ (Feb 5, 2026)
- [x] Integrate Skip Logic Editor into Form Builder ✅ (Feb 5, 2026)
- [x] Integrate Calculated Field Editor into Form Builder ✅ (Feb 5, 2026)
- [x] Complete offline sync with conflict resolution ✅ (Feb 5, 2026)
- [x] Webhook configuration ✅ (Feb 5, 2026)
- [x] Audio/Video recording components ✅ (Feb 5, 2026)
- [x] GPS, Audio, Video capture in Form Preview ✅ (Feb 5, 2026)
- [x] Custom dashboard widgets ✅ (Feb 5, 2026)
- [x] Stata/SPSS export formats ✅ (Feb 5, 2026)
- [x] Batch case import from CSV ✅ (Feb 5, 2026)
- [x] Real-time collaboration features ✅ (Feb 5, 2026)
- [x] Duplicate detection alerts ✅ (Feb 5, 2026)
- [x] Form versioning comparison view ✅ (Feb 5, 2026)
- [x] Enhanced offline conflict resolution UI ✅ (Feb 5, 2026)

## Backlog - P1 (High Priority)
- [x] Advanced analytics and reporting ✅ (Feb 5, 2026)
- [x] Role-based access control refinement ✅ (Feb 5, 2026)
- [x] Submission workflow automation ✅ (Feb 5, 2026)

## Backlog - P2 (Medium Priority)
- [ ] Native mobile app
- [x] Multi-language AI translations ✅ (Feb 5, 2026)
- [x] Advanced form logic branching visualization ✅ (Feb 6, 2026)
- [x] API Rate Limiting and Security ✅ (Feb 6, 2026)
- [x] Multi-tenant Billing (Super Admin) ✅ (Feb 6, 2026)

## Backlog - P0 Data Collection Module (NEW - Feb 6, 2026)
- [x] Paradata/Audit Trail System ✅
- [x] Submission Revision Chain ✅  
- [x] Lookup Datasets Module ✅

## Test Credentials
- **Email**: test@datapulse.io
- **Password**: password123
- **Organization**: Test Organization
- **Project**: Health Survey 2026

## Key Files
- `/app/frontend/public/manifest.json` - PWA manifest
- `/app/frontend/public/sw.js` - Service worker
- `/app/frontend/src/lib/offlineStorage.js` - IndexedDB service with conflict resolution
- `/app/frontend/src/pages/FormPreviewPage.jsx` - Form preview with GPS/Audio/Video capture
- `/app/frontend/src/pages/FormBuilderPage.jsx` - Form builder with integrated logic editors, versioning, duplicate detection
- `/app/frontend/src/pages/FormTemplatesPage.jsx` - Templates library
- `/app/frontend/src/pages/GPSMapPage.jsx` - GPS visualization
- `/app/frontend/src/pages/SettingsPage.jsx` - Settings with webhooks configuration
- `/app/frontend/src/pages/CaseImportPage.jsx` - Batch CSV import wizard
- `/app/frontend/src/pages/DashboardPage.jsx` - Dashboard with widgets toggle
- `/app/frontend/src/components/SkipLogicEditor.jsx` - Skip logic UI
- `/app/frontend/src/components/CalculatedFieldEditor.jsx` - Calculation UI
- `/app/frontend/src/components/GpsCapture.jsx` - GPS capture component
- `/app/frontend/src/components/AudioRecorder.jsx` - Audio recording component
- `/app/frontend/src/components/VideoRecorder.jsx` - Video recording component
- `/app/frontend/src/components/CustomDashboard.jsx` - Custom dashboard widgets
- `/app/frontend/src/components/CollaborationIndicator.jsx` - Real-time collaboration
- `/app/frontend/src/components/DuplicateDetection.jsx` - Duplicate detection UI
- `/app/frontend/src/components/FormVersioning.jsx` - Version comparison UI
- `/app/frontend/src/components/OfflineSync.jsx` - Enhanced offline sync UI
- `/app/frontend/src/components/MediaUpload.jsx` - Media upload
- `/app/backend/routes/media_routes.py` - Media API
- `/app/backend/routes/template_routes.py` - Templates API
- `/app/backend/routes/logic_routes.py` - Logic/Calculate API
- `/app/backend/routes/gps_routes.py` - GPS API
- `/app/backend/routes/widget_routes.py` - Dashboard widgets API
- `/app/backend/routes/export_routes.py` - Export API with Stata/SPSS
- `/app/backend/routes/case_import_routes.py` - CSV import API
- `/app/backend/routes/collaboration_routes.py` - WebSocket collaboration
- `/app/backend/routes/duplicate_routes.py` - Duplicate detection API
- `/app/backend/routes/versioning_routes.py` - Form versioning API
- `/app/backend/logic_engine.py` - Calculation & skip logic engine

### NEW Feature Files (Feb 5, 2026)
- `/app/frontend/src/pages/AnalyticsPage.jsx` - Analytics dashboard page
- `/app/frontend/src/pages/RBACPage.jsx` - Roles & permissions management
- `/app/frontend/src/pages/WorkflowsPage.jsx` - Workflow automation page
- `/app/frontend/src/pages/TranslationsPage.jsx` - Multi-language support page
- `/app/frontend/src/components/AnalyticsDashboard.jsx` - Analytics charts component
- `/app/backend/routes/analytics_routes.py` - Analytics API endpoints
- `/app/backend/routes/rbac_routes.py` - RBAC management API
- `/app/backend/routes/workflow_routes.py` - Workflow automation API
- `/app/backend/routes/translation_routes.py` - Translation API

### NEW Feature Files (Feb 6, 2026)
- `/app/frontend/src/components/FormLogicVisualization.jsx` - React Flow form visualization
- `/app/frontend/src/pages/SecurityPage.jsx` - API Security management
- `/app/frontend/src/pages/SuperAdminPage.jsx` - Super Admin Dashboard
- `/app/backend/routes/security_routes.py` - API key, rate limiting, audit logs
- `/app/backend/routes/admin_routes.py` - Super Admin billing and organization management

### P0 Data Collection Module Files (Feb 6, 2026)
- `/app/backend/routes/paradata_routes.py` - Industry-standard paradata capture (time on question, navigation, edits, pauses, GPS trail)
- `/app/backend/routes/revision_routes.py` - Submission revision chain (v1→v2→v3, diffs, locking, correction workflow)
- `/app/backend/routes/dataset_routes.py` - Lookup datasets (schools, facilities, sampling frames with offline support)
- `/app/frontend/src/components/ParadataViewer.jsx` - Paradata visualization component
- `/app/frontend/src/pages/DatasetsPage.jsx` - Lookup datasets management page
