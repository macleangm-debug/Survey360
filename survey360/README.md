# Survey360

A complete survey lifecycle management platform extracted from DataPulse.

## Overview

Survey360 is a standalone survey management application focused on:
- Survey creation and design
- Response collection and management
- Basic analytics and reporting

## Features

### Frontend
- **Landing Page**: Marketing page with feature highlights
- **Authentication**: Login/Register with JWT-based auth
- **Dashboard**: Overview of surveys, responses, and activity
- **Survey Builder**: Drag-and-drop survey creation with 10 question types
- **Responses**: View, filter, and export survey responses
- **Settings**: User profile, appearance, notifications, security

### Backend
- **Auth**: JWT-based authentication with registration
- **Surveys**: CRUD operations, publish/duplicate functionality
- **Responses**: Collection, listing, and export
- **Dashboard**: Stats and activity feed

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS + Shadcn UI
- Framer Motion for animations
- Zustand for state management
- Recharts for data visualization
- Axios for API calls

### Backend
- FastAPI (Python)
- MongoDB with Motor (async driver)
- PyJWT for authentication

## Quick Start

### Frontend
```bash
cd frontend
yarn install
yarn dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8002/api
```

### Backend
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=survey360
JWT_SECRET=your-secret-key
```

## Demo Credentials
- Email: demo@survey360.io
- Password: Test123!

## Question Types Supported
1. Short Text
2. Long Text
3. Single Choice
4. Multiple Choice
5. Dropdown
6. Date
7. Number
8. Email
9. Phone
10. Rating (with configurable scale)

## API Endpoints

### Auth
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user

### Organizations
- GET `/api/organizations` - List organizations
- POST `/api/organizations` - Create organization

### Surveys
- GET `/api/surveys` - List surveys
- GET `/api/surveys/{id}` - Get survey
- POST `/api/surveys` - Create survey
- PUT `/api/surveys/{id}` - Update survey
- DELETE `/api/surveys/{id}` - Delete survey
- POST `/api/surveys/{id}/publish` - Publish survey
- POST `/api/surveys/{id}/duplicate` - Duplicate survey

### Responses
- GET `/api/surveys/{id}/responses` - List responses
- POST `/api/surveys/{id}/responses` - Submit response

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics
- GET `/api/dashboard/activity` - Get recent activity

## Project Structure

```
survey360/
├── frontend/
│   ├── src/
│   │   ├── components/ui/     # Shadcn UI components
│   │   ├── layouts/           # Dashboard layout
│   │   ├── lib/               # API client, utilities
│   │   ├── pages/             # Page components
│   │   ├── store/             # Zustand stores
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── server.py              # Main FastAPI app
    └── requirements.txt
```

## Differences from DataPulse

Survey360 is a focused subset of DataPulse that includes only survey-related functionality:

### Included
- Survey creation and management
- Response collection
- Basic dashboard and analytics
- User authentication

### Not Included (DataPulse features)
- Advanced statistical analysis
- CATI/CAPI features
- Quality AI monitoring
- Field operations tools
- Complex data analysis (regression, factor analysis, etc.)
- Offline-first PWA features
- Plugin SDK

## License

Proprietary - All rights reserved
