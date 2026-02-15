"""
Help Center AI Assistant Routes

A reusable FastAPI router for AI-powered help center assistant.

Features:
- Multi-turn conversation with session management
- Feedback tracking for quality improvement
- Question analytics for FAQ improvements
- LLM integration via emergentintegrations

Usage:
    from routes.help_assistant import router as help_assistant_router
    app.include_router(help_assistant_router, prefix="/api")

Environment Variables:
    EMERGENT_LLM_KEY: API key for the LLM service
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

router = APIRouter(prefix="/help-assistant", tags=["Help Assistant"])

# ============================================================
# CUSTOMIZE THIS: Update the base URL for your help center
# ============================================================
HELP_CENTER_BASE = "/help"

# ============================================================
# CUSTOMIZE THIS: Update the context with your app's knowledge
# ============================================================
HELP_CENTER_CONTEXT = """
You are a helpful AI Assistant for our application.

IMPORTANT: When answering questions, include relevant article links using this format: [Article Title](LINK)

## Article Links Reference:
- Welcome Guide: [Welcome Guide]({base}?tab=article&category=getting-started&article=welcome)
- First Steps: [First Steps]({base}?tab=article&category=getting-started&article=first-steps)
- FAQ: [FAQ]({base}?tab=faq)

## About This Application
[Add your application description here]

## Common Topics:
[Add common topics and answers here]

## Response Guidelines:
1. Be helpful and concise
2. Provide step-by-step instructions when needed
3. Include 1-2 relevant article links at the end of your response
4. Format links as: [Article Name](link)
5. If unsure, recommend checking the Help Center
6. Keep responses friendly and professional
""".format(base=HELP_CENTER_BASE)


# ============================================================
# Request/Response Models
# ============================================================

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class FeedbackRequest(BaseModel):
    session_id: Optional[str] = None
    message_id: str
    is_helpful: bool
    question: Optional[str] = None


# ============================================================
# In-memory storage (use Redis/MongoDB in production)
# ============================================================

# Store active chat sessions
chat_sessions = {}

# Store feedback entries
feedback_store = []

# Track question analytics
question_analytics = {}


# ============================================================
# API Endpoints
# ============================================================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: Request, chat_message: ChatMessage):
    """
    Chat with the Help Center AI Assistant.
    
    Maintains conversation context via session_id.
    Creates new session if session_id not provided.
    """
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


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Submit feedback for an AI response.
    
    Tracks user satisfaction and question patterns
    for continuous improvement of the Help Center.
    """
    try:
        # Store feedback
        feedback_entry = {
            "session_id": feedback.session_id,
            "message_id": feedback.message_id,
            "is_helpful": feedback.is_helpful,
            "question": feedback.question,
            "timestamp": str(uuid.uuid4())
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
    """
    Get analytics on most asked questions.
    
    Use this data to:
    - Improve FAQ section
    - Identify documentation gaps
    - Train AI assistant better
    """
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
    """Reset a chat session to start fresh."""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    return {"message": "Session reset", "session_id": session_id}
