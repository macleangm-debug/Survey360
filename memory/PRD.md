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
- [ ] Real GPS capture in form preview (component ready, needs integration)

## Backlog - P1 (High Priority)
- [ ] Integrate GPS Capture component into Form Filling
- [ ] Integrate Audio Recorder into Form Filling
- [ ] Integrate Video Recorder into Form Filling
- [ ] Duplicate detection alerts
- [ ] Form versioning comparison

## Backlog - P2 (Medium Priority)
- [ ] Custom dashboard widgets
- [ ] Stata/SPSS export formats
- [ ] Batch case import from CSV
- [ ] Real-time collaboration

## Test Credentials
- **Email**: test@datapulse.io
- **Password**: password123
- **Organization**: Test Organization
- **Project**: Health Survey 2026

## Key Files
- `/app/frontend/public/manifest.json` - PWA manifest
- `/app/frontend/public/sw.js` - Service worker
- `/app/frontend/src/lib/offlineStorage.js` - IndexedDB service with conflict resolution
- `/app/frontend/src/pages/FormPreviewPage.jsx` - Form preview
- `/app/frontend/src/pages/FormBuilderPage.jsx` - Form builder with integrated logic editors
- `/app/frontend/src/pages/FormTemplatesPage.jsx` - Templates library
- `/app/frontend/src/pages/GPSMapPage.jsx` - GPS visualization
- `/app/frontend/src/pages/SettingsPage.jsx` - Settings with webhooks configuration
- `/app/frontend/src/components/SkipLogicEditor.jsx` - Skip logic UI
- `/app/frontend/src/components/CalculatedFieldEditor.jsx` - Calculation UI
- `/app/frontend/src/components/GpsCapture.jsx` - GPS capture component
- `/app/frontend/src/components/AudioRecorder.jsx` - Audio recording component
- `/app/frontend/src/components/VideoRecorder.jsx` - Video recording component
- `/app/frontend/src/components/MediaUpload.jsx` - Media upload
- `/app/backend/routes/media_routes.py` - Media API
- `/app/backend/routes/template_routes.py` - Templates API
- `/app/backend/routes/logic_routes.py` - Logic/Calculate API
- `/app/backend/routes/gps_routes.py` - GPS API
- `/app/backend/logic_engine.py` - Calculation & skip logic engine
