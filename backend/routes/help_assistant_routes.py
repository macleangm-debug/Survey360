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

# Help Center knowledge base for context
HELP_CENTER_CONTEXT = """
You are the Survey360 Help Assistant. You help users with questions about Survey360, a comprehensive survey management platform.

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

### Question Types
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
- Link shortener for SMS

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
3. Suggest relevant features
4. If unsure, recommend checking the Help Center articles
5. Keep responses friendly and professional
"""

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

@router.post("/reset")
async def reset_chat_session(session_id: str):
    """Reset a chat session"""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"message": "Session reset", "session_id": session_id}
