# Help Center Package

A reusable, self-contained Help Center module with AI-powered assistant for any web application.

## Features

- **Two-column layout** with expandable categories
- **AI Assistant** chat widget with suggested questions
- **Markdown link support** in AI responses
- **Feedback mechanism** ("Was this helpful?")
- **FAQ section** with expandable accordion
- **Troubleshooting guide** with step-by-step solutions
- **Keyboard shortcuts** reference
- **What's New** changelog section
- **Search functionality** across all articles
- **Dark/Light theme** support

## Directory Structure

```
help-center-package/
├── README.md                 # This file
├── frontend/
│   ├── components/
│   │   └── HelpAssistant.jsx # AI chat widget component
│   └── pages/
│       └── HelpCenter.jsx    # Main Help Center page
└── backend/
    └── routes/
        └── help_assistant.py # Backend API routes
```

## Installation

### Frontend (React)

1. Copy `frontend/components/HelpAssistant.jsx` to your components directory
2. Copy `frontend/pages/HelpCenter.jsx` to your pages directory
3. Install required dependencies:

```bash
yarn add lucide-react framer-motion react-router-dom
```

4. Import and use in your app:

```jsx
import { HelpCenter } from './pages/HelpCenter';

// In your routes:
<Route path="/help" element={<HelpCenter />} />
```

### Backend (FastAPI/Python)

1. Copy `backend/routes/help_assistant.py` to your routes directory
2. Install required dependencies:

```bash
pip install emergentintegrations
```

3. Add the router to your FastAPI app:

```python
from routes.help_assistant import router as help_assistant_router
app.include_router(help_assistant_router, prefix="/api")
```

4. Set the required environment variable:

```bash
EMERGENT_LLM_KEY=your_api_key_here
```

## Configuration

### Customizing Categories

Edit the `HELP_CATEGORIES` array in `HelpCenter.jsx`:

```jsx
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics',
    color: 'teal',
    articles: [
      { id: 'welcome', title: 'Welcome Guide', readTime: '2 min' },
      // Add more articles...
    ]
  },
  // Add more categories...
];
```

### Customizing FAQ

Edit the `FAQ_DATA` array:

```jsx
const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      { q: 'What is this product?', a: 'Your answer here...' },
      // Add more questions...
    ]
  },
  // Add more categories...
];
```

### Customizing AI Context

Edit the `HELP_CENTER_CONTEXT` string in `help_assistant.py` to provide relevant knowledge about your application.

## Theme Support

The components support both dark and light themes. Pass the theme via a store or context:

```jsx
// Using Zustand store
const { theme } = useUIStore();
const isDark = theme === 'dark';

// Or via props
<HelpCenter isDark={true} />
```

## API Endpoints

### POST /api/help-assistant/chat
Send a message to the AI assistant.

**Request:**
```json
{
  "message": "How do I create a survey?",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "response": "To create a survey, click the 'New Survey' button...",
  "session_id": "generated-or-existing-id"
}
```

### POST /api/help-assistant/feedback
Submit feedback for an AI response.

**Request:**
```json
{
  "session_id": "session-id",
  "message_id": "message-id",
  "is_helpful": true,
  "question": "How do I create a survey?"
}
```

### GET /api/help-assistant/analytics
Get analytics on most asked questions (for FAQ improvements).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EMERGENT_LLM_KEY` | API key for AI assistant | Yes |
| `REACT_APP_BACKEND_URL` | Backend API URL | Yes |

## Dependencies

### Frontend
- React 18+
- lucide-react (icons)
- framer-motion (animations)
- react-router-dom (navigation)
- tailwindcss (styling)

### Backend
- FastAPI
- emergentintegrations (LLM integration)
- pydantic

## License

MIT License - Feel free to use and modify for your projects.
