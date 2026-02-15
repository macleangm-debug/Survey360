"""Help Center AI Assistant Routes - With MongoDB Persistence"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
from datetime import datetime, timezone
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

# Store active chat sessions in memory (for LLM context)
# Session metadata stored in MongoDB for persistence
chat_sessions = {}


async def get_db(request: Request):
    """Get database from request state"""
    return request.app.state.db


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: Request, chat_message: ChatMessage):
    """Chat with the Help Center AI Assistant"""
    try:
        db = await get_db(request)
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
            
            # Store session metadata in MongoDB
            await db.help_assistant_sessions.insert_one({
                "session_id": session_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "message_count": 0,
                "last_activity": datetime.now(timezone.utc).isoformat()
            })
        else:
            chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_message.message)
        response = await chat.send_message(user_message)
        
        # Update session activity in MongoDB
        await db.help_assistant_sessions.update_one(
            {"session_id": session_id},
            {
                "$inc": {"message_count": 1},
                "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        # Store chat message for analytics
        await db.help_assistant_messages.insert_one({
            "session_id": session_id,
            "question": chat_message.message,
            "response_length": len(response),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
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


@router.post("/feedback")
async def submit_feedback(request: Request, feedback: FeedbackRequest):
    """Submit feedback for an AI response and track questions"""
    try:
        db = await get_db(request)
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store feedback in MongoDB
        await db.help_assistant_feedback.insert_one({
            "session_id": feedback.session_id,
            "message_id": feedback.message_id,
            "is_helpful": feedback.is_helpful,
            "question": feedback.question,
            "timestamp": timestamp
        })
        
        # Update question analytics in MongoDB
        if feedback.question:
            question_lower = feedback.question.lower().strip()
            
            # Upsert question analytics
            update_ops = {
                "$inc": {
                    "count": 1,
                    "helpful_count": 1 if feedback.is_helpful else 0,
                    "not_helpful_count": 0 if feedback.is_helpful else 1
                },
                "$setOnInsert": {
                    "question": feedback.question,
                    "question_key": question_lower,
                    "first_asked": timestamp
                },
                "$set": {
                    "last_asked": timestamp
                }
            }
            
            await db.help_assistant_analytics.update_one(
                {"question_key": question_lower},
                update_ops,
                upsert=True
            )
        
        return {"message": "Feedback recorded", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record feedback: {str(e)}")


@router.get("/analytics")
async def get_question_analytics(request: Request):
    """Get analytics on most asked questions (for FAQ improvements)"""
    try:
        db = await get_db(request)
        
        # Get all question analytics from MongoDB
        cursor = db.help_assistant_analytics.find(
            {},
            {"_id": 0}
        ).sort("count", -1)
        
        all_questions = await cursor.to_list(length=100)
        
        # Calculate totals
        total_questions = sum(q.get("count", 0) for q in all_questions)
        total_helpful = sum(q.get("helpful_count", 0) for q in all_questions)
        total_not_helpful = sum(q.get("not_helpful_count", 0) for q in all_questions)
        
        # Get questions needing improvement
        needs_improvement = [
            q for q in all_questions 
            if q.get("not_helpful_count", 0) > q.get("helpful_count", 0) and q.get("count", 0) >= 2
        ][:5]
        
        return {
            "total_questions": total_questions,
            "total_helpful": total_helpful,
            "total_not_helpful": total_not_helpful,
            "top_questions": all_questions[:10],
            "needs_improvement": needs_improvement
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")


@router.get("/analytics/admin")
async def get_admin_analytics(request: Request):
    """Get comprehensive analytics for admin dashboard"""
    try:
        db = await get_db(request)
        
        # Get question analytics
        questions_cursor = db.help_assistant_analytics.find(
            {},
            {"_id": 0}
        ).sort("count", -1)
        all_questions = await questions_cursor.to_list(length=100)
        
        # Get session statistics
        total_sessions = await db.help_assistant_sessions.count_documents({})
        
        # Get feedback statistics
        total_feedback = await db.help_assistant_feedback.count_documents({})
        helpful_feedback = await db.help_assistant_feedback.count_documents({"is_helpful": True})
        not_helpful_feedback = await db.help_assistant_feedback.count_documents({"is_helpful": False})
        
        # Get message statistics
        total_messages = await db.help_assistant_messages.count_documents({})
        
        # Get daily activity (last 14 days)
        from datetime import timedelta
        daily_activity = []
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        for i in range(14):
            day_start = today - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            messages_count = await db.help_assistant_messages.count_documents({
                "timestamp": {
                    "$gte": day_start.isoformat(),
                    "$lt": day_end.isoformat()
                }
            })
            
            feedback_count = await db.help_assistant_feedback.count_documents({
                "timestamp": {
                    "$gte": day_start.isoformat(),
                    "$lt": day_end.isoformat()
                }
            })
            
            daily_activity.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "messages": messages_count,
                "feedback": feedback_count
            })
        
        daily_activity.reverse()  # Oldest first
        
        # Calculate totals from questions
        total_questions_asked = sum(q.get("count", 0) for q in all_questions)
        
        # Get questions needing improvement
        needs_improvement = [
            q for q in all_questions 
            if q.get("not_helpful_count", 0) > q.get("helpful_count", 0) and q.get("count", 0) >= 2
        ][:10]
        
        # Get recent feedback with questions
        recent_feedback_cursor = db.help_assistant_feedback.find(
            {"question": {"$ne": None}},
            {"_id": 0}
        ).sort("timestamp", -1).limit(20)
        recent_feedback = await recent_feedback_cursor.to_list(length=20)
        
        # Calculate satisfaction rate
        satisfaction_rate = 0
        if total_feedback > 0:
            satisfaction_rate = round((helpful_feedback / total_feedback) * 100, 1)
        
        return {
            "summary": {
                "total_sessions": total_sessions,
                "total_messages": total_messages,
                "total_feedback": total_feedback,
                "total_questions_asked": total_questions_asked,
                "helpful_count": helpful_feedback,
                "not_helpful_count": not_helpful_feedback,
                "satisfaction_rate": satisfaction_rate
            },
            "top_questions": all_questions[:15],
            "needs_improvement": needs_improvement,
            "daily_activity": daily_activity,
            "recent_feedback": recent_feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get admin analytics: {str(e)}")


@router.post("/reset")
async def reset_chat_session(request: Request, session_id: str):
    """Reset a chat session"""
    db = await get_db(request)
    
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    
    # Update session status in MongoDB
    await db.help_assistant_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"status": "reset", "reset_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Session reset", "session_id": session_id}


@router.delete("/analytics/clear")
async def clear_analytics_data(request: Request):
    """Clear all analytics data (admin only - use with caution)"""
    try:
        db = await get_db(request)
        
        # Clear all collections
        await db.help_assistant_feedback.delete_many({})
        await db.help_assistant_analytics.delete_many({})
        await db.help_assistant_messages.delete_many({})
        await db.help_assistant_sessions.delete_many({})
        
        # Clear in-memory sessions
        chat_sessions.clear()
        
        return {"message": "All analytics data cleared", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear analytics: {str(e)}")
