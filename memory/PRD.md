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

## P1 Essential Field Features (NEW - Feb 6, 2026)

### Token/Panel Surveys
- [x] Token Surveys page at /token-surveys
- [x] Survey Distribution Management:
  - Create distributions with unique access tokens
  - Multiple modes: Token-based, CAWI, Panel, Public Link
  - Allow multiple submissions toggle
  - Save & continue functionality
  - Automated reminder settings
- [x] Invite Management:
  - Single and bulk invite creation
  - CSV import for invites
  - Status tracking (pending, sent, opened, started, complete, expired)
  - Response rate calculations
- [x] Panel Surveys:
  - Create panels for longitudinal studies
  - Configure total waves and wave intervals
  - Member management
  - Wave tracking

### CATI (Computer-Assisted Telephone Interviewing)
- [x] CATI Center page at /cati
- [x] CATI Project Management:
  - Create CATI projects with form selection
  - Configurable call attempt limits
  - Working hours settings
  - Project activation/deactivation
- [x] Interviewer Workstation:
  - Next call retrieval from queue
  - Call timer with start/end controls
  - Respondent information display
  - Call script reference
- [x] Call Disposition System (15 standard codes):
  - Complete, Partial Complete, Callback Requested
  - No Answer, Busy, Voicemail, Disconnected
  - Wrong Number, Respondent Unavailable, Language Barrier
  - Soft/Hard Refusal, Refused (Gatekeeper), Ineligible, System Error
- [x] Callback scheduling with date/time selection
- [x] Call queue management with priority
- [x] Statistics dashboard

### Back-check Quality Control
- [x] Back-check Center page at /backcheck
- [x] Back-check Configuration:
  - Sampling methods: Random, Stratified, Systematic, Targeted
  - Configurable sample percentage
  - Min/max checks per enumerator
  - Verification field selection
  - Key field designation (higher weight)
  - Auto-flag on critical discrepancies
  - Supervisor review requirement
- [x] Sample Generation:
  - Automated random sampling
  - Stratified by enumerator
  - Systematic (every Nth)
  - Manual selection
- [x] Discrepancy Detection:
  - Match rate calculation
  - Severity levels: Minor, Moderate, Major, Critical
  - Field-by-field comparison
  - Verification notes
- [x] Back-check Queue:
  - Status filters (pending, assigned, completed, verified, flagged)
  - Verifier assignment
  - Due date tracking
- [x] Quality Reports:
  - Summary statistics
  - Enumerator performance rankings
  - Common discrepancy fields
  - Weekly trends

### Preload & Write-back
- [x] Preload/Writeback page at /preload
- [x] Preload Configuration:
  - Multiple source types: Case, Dataset, Previous Submission, External API, Manual
  - Field mapping with transformations
  - Transformation types: Direct, Format, Calculate, Lookup, Conditional
  - Default values for missing data
  - Required field validation
- [x] Write-back Configuration:
  - Target types: Dataset, Case, External API
  - Trigger options: On Submit, On Approve, On Review, Manual
  - Field mappings with transformations
  - Match field specification for updates
  - Create if missing option
- [x] Execution Logging:
  - Preload execution history
  - Write-back execution history
  - Success/failure tracking
- [x] External API Integration:
  - API configuration management
  - Auth types: Bearer, Basic, API Key
  - Configurable headers and timeout

### P1 Feature Files
- `/app/frontend/src/pages/TokenSurveysPage.jsx` - Token/Panel Surveys UI
- `/app/frontend/src/pages/CATIPage.jsx` - CATI Center with workstation
- `/app/frontend/src/pages/BackcheckPage.jsx` - Back-check quality control UI
- `/app/frontend/src/pages/PreloadWritebackPage.jsx` - Preload/Write-back management
- `/app/backend/routes/survey_routes.py` - Token/Panel Survey API (~870 lines)
- `/app/backend/routes/cati_routes.py` - CATI API with workstation (~780 lines)
- `/app/backend/routes/backcheck_routes.py` - Back-check API (~600 lines)
- `/app/backend/routes/preload_routes.py` - Preload/Write-back API (~620 lines)

## Backlog - P1 (High Priority) - UPDATED
- [x] Advanced analytics and reporting ✅ (Feb 5, 2026)
- [x] Role-based access control refinement ✅ (Feb 5, 2026)
- [x] Submission workflow automation ✅ (Feb 5, 2026)
- [x] Token/Panel Surveys ✅ (Feb 6, 2026)
- [x] CATI Module ✅ (Feb 6, 2026)
- [x] Back-check Quality Control ✅ (Feb 6, 2026)
- [x] Preload/Write-back ✅ (Feb 6, 2026)

## Backlog - P2 (Quality & AI Features) - COMPLETED (Feb 6, 2026)

### Interview Speeding Detection
- [x] Quality AI page at /quality-ai
- [x] Speeding Detection Configuration:
  - Min expected completion time
  - Warning threshold (% of median)
  - Critical threshold (% of median)
  - Auto-flag critical submissions
  - Exclude specific fields from timing
- [x] Automatic median time calculation from recent submissions
- [x] Speed ratio calculation
- [x] Alert generation for speeding violations

### Audio Audit
- [x] Audio Audit Configuration:
  - Audio field selection
  - Minimum duration requirement
  - Sample percentage
  - Full recording requirement option
- [x] Audio compliance checking
- [x] Missing audio detection
- [x] Short audio detection
- [x] Audit queue management

### AI Monitoring Assistant (GPT-5.2)
- [x] AI Monitoring Configuration:
  - Detect speeding toggle
  - Detect straight-lining toggle
  - Detect response anomalies toggle
  - Detect GPS anomalies toggle
  - Detect duplicates toggle
- [x] Straight-lining Detection:
  - Pattern analysis for repeated responses
  - Same value threshold detection
- [x] Response Anomaly Detection:
  - Validation against field constraints
  - Suspicious short text detection
- [x] GPS Anomaly Detection:
  - Duplicate location detection
  - Office location flagging
- [x] AI Deep Analysis (GPT-5.2):
  - Configurable sample rate
  - Background processing
  - Quality score generation
  - Issue identification
  - Action recommendations

### Barcode Capture Widget
- [x] BarcodeCapture component (/app/frontend/src/components/BarcodeCapture.jsx)
- [x] Camera-based scanning using BarcodeDetector API
- [x] Manual entry fallback
- [x] Supported formats: EAN-13, EAN-8, Code 128, Code 39, QR Code, UPC-A, UPC-E
- [x] Format detection display
- [x] Rescan capability
- [x] **Integrated into Form Builder** - Drag-and-drop "Barcode" field type
- [x] Field validation options: accepted formats, barcode pattern regex

### Signature Capture Widget
- [x] SignatureCapture component (/app/frontend/src/components/SignatureCapture.jsx)
- [x] Canvas-based drawing
- [x] Touch support for mobile
- [x] Mouse support for desktop
- [x] Configurable stroke color and width
- [x] Signature line with X marker
- [x] Clear/Save/Edit/Remove actions
- [x] PNG export format
- [x] **Integrated into Form Builder** - Drag-and-drop "Signature" field type
- [x] Field settings: stroke color, stroke width

### Quality Alert System
- [x] Alert types: speeding, audio_missing, audio_short, pattern_anomaly, response_anomaly, gps_anomaly, duplicate_pattern, straight_lining
- [x] Severity levels: low, medium, high, critical
- [x] Alert listing with filters
- [x] Alert resolution workflow
- [x] Summary dashboard with trends

### P2 Feature Files
- `/app/frontend/src/pages/QualityAIPage.jsx` - Quality & AI Monitoring UI
- `/app/frontend/src/components/BarcodeCapture.jsx` - Barcode scanning widget
- `/app/frontend/src/components/SignatureCapture.jsx` - Signature capture widget
- `/app/backend/routes/quality_ai_routes.py` - Quality AI API (~700 lines)

## Backlog - P3 (Future)
- [ ] True Offline-First CAPI (encrypted local DB, resilient sync)
- [ ] Plugin/Widget SDK for custom question types
- [ ] CAWI enhancements
- [ ] Advanced security policies

