"""Help Center AI Assistant Routes"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/help-assistant", tags=["Help Assistant"])

# Base URL for help center articles
HELP_CENTER_BASE = "/solutions/survey360/help"

# Help Center knowledge base for context with article links
HELP_CENTER_CONTEXT = """
You are the Survey360 Help Assistant. You help users with questions about Survey360, a comprehensive survey management platform.

IMPORTANT: When answering questions, include relevant article links using this format: [Article Title](LINK)
Use the exact links provided below for each topic.

## Article Links Reference:

### Getting Started
- Welcome to Survey360: [Welcome Guide]({base}?tab=article&category=getting-started&article=welcome)
- Creating Your First Survey: [First Survey Guide]({base}?tab=article&category=getting-started&article=first-survey)
- Dashboard Overview: [Dashboard Guide]({base}?tab=article&category=getting-started&article=dashboard-overview)

### Surveys
- Using the Survey Builder: [Survey Builder Guide]({base}?tab=article&category=surveys&article=survey-builder)
- Question Types Explained: [Question Types Guide]({base}?tab=article&category=surveys&article=question-types)
- Survey Templates: [Templates Guide]({base}?tab=article&category=surveys&article=templates)

### Sharing & Distribution
- Sharing via Link: [Link Sharing Guide]({base}?tab=article&category=sharing&article=sharing-link)
- Using QR Codes: [QR Code Guide]({base}?tab=article&category=sharing&article=qr-codes)
- Email Invitations: [Email Guide]({base}?tab=article&category=sharing&article=email-invitations)
- Website Embed: [Embed Guide]({base}?tab=article&category=sharing&article=embed-website)

### Responses
- Viewing Responses: [View Responses Guide]({base}?tab=article&category=responses&article=viewing-responses)
- Filtering & Searching: [Filter Guide]({base}?tab=article&category=responses&article=filtering-responses)
- Exporting to Excel: [Export Guide]({base}?tab=article&category=responses&article=export-excel)

### Analytics & Reports  
- Analytics Dashboard Overview: [Analytics Guide]({base}?tab=article&category=analytics&article=analytics-dashboard)
- Understanding Response Charts: [Charts Guide]({base}?tab=article&category=analytics&article=response-charts)
- Creating Custom Reports: [Reports Guide]({base}?tab=article&category=analytics&article=custom-reports)

### Team & Collaboration
- Managing Team Members: [Team Guide]({base}?tab=article&category=team&article=managing-members)
- Roles & Permissions: [Permissions Guide]({base}?tab=article&category=team&article=roles-permissions)

### Account & Settings
- Profile Settings: [Profile Guide]({base}?tab=article&category=settings&article=profile-settings)
- Notification Preferences: [Notifications Guide]({base}?tab=article&category=settings&article=notifications)
- Security Settings: [Security Guide]({base}?tab=article&category=settings&article=security-settings)

### Billing & Plans
- Understanding Pricing Plans: [Pricing Guide]({base}?tab=article&category=billing&article=pricing-plans)
- Upgrading Your Plan: [Upgrade Guide]({base}?tab=article&category=billing&article=upgrade-plan)

## About Survey360
Survey360 is a platform for creating, distributing, and analyzing surveys. Key features include:
- Drag-and-drop survey builder with multiple question types
- Survey distribution via links, QR codes, email invitations, and website embeds
- Real-time response tracking and analytics
- Team collaboration with role-based permissions
- Export responses to Excel

## Common Topics:

### Getting Started
- Create surveys by clicking "New Survey" from the dashboard
- Use templates or build from scratch
- Add questions using the drag-and-drop builder
- Preview before publishing
- Share via link, QR code, or email

### Question Types Available
- Short Text, Long Text
- Single Choice (Radio), Multiple Choice (Checkbox)
- Rating (Stars), Scale (NPS)
- Number, Email, Date, Phone
- Dropdown

### Sharing Options
- Direct link sharing
- QR code generation for print/events
- Email invitations with tracking
- Website embed (inline, popup, slide-in)

### Responses & Analytics
- View responses in real-time
- Filter and search responses
- Export to Excel with formatted headers
- Analytics dashboard with charts
- Completion rate tracking

### Team & Collaboration
- Roles: Owner, Admin, Editor, Viewer
- Invite team members via email
- Manage permissions per role

### Billing & Plans
- Free plan: 3 surveys, 100 responses/month
- Paid plans: Unlimited surveys, more responses
- Upgrade anytime from Settings > Billing

## Response Guidelines:
1. Be helpful and concise
2. Provide step-by-step instructions when needed
3. ALWAYS include 1-2 relevant article links at the end of your response
4. Format links as: [Article Name](link)
5. If unsure, recommend checking the Help Center
6. Keep responses friendly and professional
""".format(base=HELP_CENTER_BASE)

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Store active chat sessions (in production, use Redis or database)
chat_sessions = {}

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: Request, chat_message: ChatMessage):
    """Chat with the Help Center AI Assistant"""
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Get or create session
        session_id = chat_message.session_id or str(uuid.uuid4())
        
        # Create or get chat instance
        if session_id not in chat_sessions:
            chat = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=HELP_CENTER_CONTEXT
            ).with_model("openai", "gpt-5.2")
            chat_sessions[session_id] = chat
        else:
            chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_message.message)
        response = await chat.send_message(user_message)
        
        return ChatResponse(
            response=response,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")

class FeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    message_id: str
    is_helpful: bool
    question: Optional[str] = None

# Store feedback and question analytics (in production, use MongoDB)
feedback_store = []
question_analytics = {}

@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Submit feedback for an AI response and track questions"""
    try:
        # Store feedback
        feedback_entry = {
            "session_id": feedback.session_id,
            "message_id": feedback.message_id,
            "is_helpful": feedback.is_helpful,
            "question": feedback.question,
            "timestamp": str(uuid.uuid4())  # Simple timestamp proxy
        }
        feedback_store.append(feedback_entry)
        
        # Track question frequency for FAQ improvements
        if feedback.question:
            question_lower = feedback.question.lower().strip()
            if question_lower not in question_analytics:
                question_analytics[question_lower] = {
                    "question": feedback.question,
                    "count": 0,
                    "helpful_count": 0,
                    "not_helpful_count": 0
                }
            question_analytics[question_lower]["count"] += 1
            if feedback.is_helpful:
                question_analytics[question_lower]["helpful_count"] += 1
            else:
                question_analytics[question_lower]["not_helpful_count"] += 1
        
        return {"message": "Feedback recorded", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {str(e)}")

@router.get("/analytics")
async def get_question_analytics():
    """Get analytics on most asked questions (for FAQ improvements)"""
    # Sort by count descending
    sorted_questions = sorted(
        question_analytics.values(),
        key=lambda x: x["count"],
        reverse=True
    )
    
    return {
        "total_questions": sum(q["count"] for q in sorted_questions),
        "total_helpful": sum(q["helpful_count"] for q in sorted_questions),
        "total_not_helpful": sum(q["not_helpful_count"] for q in sorted_questions),
        "top_questions": sorted_questions[:10],
        "needs_improvement": [
            q for q in sorted_questions 
            if q["not_helpful_count"] > q["helpful_count"] and q["count"] >= 2
        ][:5]
    }

@router.post("/reset")
async def reset_chat_session(session_id: str):
    """Reset a chat session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"message": "Session reset", "session_id": session_id}
