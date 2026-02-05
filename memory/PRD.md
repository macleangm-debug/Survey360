# DataPulse - Product Requirements Document

## Original Problem Statement
Build a modern, secure, scalable data collection platform similar to SurveyCTO, optimized for research, monitoring & evaluation, and field data collection. Support for online/offline data collection, strong data quality controls, and advanced analytics integrations.

## Target Users
- Research institutions
- NGOs
- Government agencies
- Market research firms
- Health & education programs

## User Personas & Roles
1. **Super Admin** - Platform owner with full access
2. **Organization Admin** - Manages org settings, users, billing
3. **Project Manager** - Creates/manages projects and forms
4. **Data Analyst** - Views data, creates exports, analyzes quality
5. **Field Enumerator** - Collects data using mobile/web app
6. **Read-Only Stakeholder** - Views dashboards and reports

## Architecture
- **Frontend**: React + TailwindCSS + Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (multi-tenant)
- **Auth**: JWT + SSO (Software Galaxy integration ready)

## What's Been Implemented (Feb 5, 2026)

### Authentication & Organizations
- [x] User registration (email/password)
- [x] User login with JWT tokens
- [x] SSO integration architecture (Software Galaxy ready)
- [x] Multi-tenant organization system
- [x] Organization CRUD operations
- [x] Organization member management
- [x] Role-based access control (RBAC)

### Form Builder
- [x] Form CRUD operations
- [x] Multi-field type support:
  - Text, Number, Date, Textarea
  - Select, Radio, Checkbox (single/multi)
  - GPS Location, Photo, Audio, Video
  - Barcode, Signature, Calculate, Note
  - Group, Repeat (nested fields)
- [x] Multi-language support (English + Swahili)
- [x] Validation rules (required, min/max, patterns)
- [x] Skip logic architecture
- [x] Form versioning
- [x] Form publishing workflow

### Data Collection
- [x] Submission API (online)
- [x] Bulk submission sync
- [x] GPS capture and storage
- [x] Quality scoring algorithm
- [x] Quality flags detection
- [x] Submission review workflow (approve/reject/flag)

### Dashboard & Analytics
- [x] Organization-level dashboard
- [x] Statistics cards (projects, forms, submissions, reviews)
- [x] Submission trends chart (14-day view)
- [x] Data quality metrics panel
- [x] Recent activity feed
- [x] GPS location visualization (API ready)

### Exports & Integration
- [x] CSV export
- [x] Excel (XLSX) export
- [x] JSON export
- [x] Export history tracking

### Case Management
- [x] Case creation with unique respondent IDs
- [x] Case status tracking
- [x] Case assignment to enumerators
- [x] Multi-visit/longitudinal data support

## Backlog - P0 (Critical)
- [ ] Mobile PWA for offline data collection
- [ ] Offline sync engine with conflict resolution
- [ ] Form preview in builder
- [ ] Media file upload (photos, audio, video)

## Backlog - P1 (High Priority)
- [ ] Calculated fields evaluation
- [ ] Advanced skip logic editor
- [ ] Audit logs viewing UI
- [ ] User invitation emails
- [ ] GPS accuracy visualization on map
- [ ] Duplicate detection alerts

## Backlog - P2 (Medium Priority)
- [ ] Form templates library
- [ ] Custom dashboard widgets
- [ ] Webhook configuration
- [ ] API keys management
- [ ] Stata/SPSS export formats
- [ ] Batch case import from CSV

## Backlog - P3 (Nice to Have)
- [ ] AI-assisted form creation
- [ ] AI data anomaly detection
- [ ] Real-time collaboration
- [ ] Custom branding per organization
- [ ] Subscription & billing

## Tech Debt
- Add proper HTTP status codes (201 for POST)
- Add useCallback for effect dependencies
- Add comprehensive API rate limiting
- Add request logging middleware

## Next Steps
1. Build Mobile PWA with offline-first architecture
2. Add form preview functionality
3. Implement media file upload with cloud storage
4. Add map visualization for GPS submissions
