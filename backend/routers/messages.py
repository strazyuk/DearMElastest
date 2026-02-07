from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from models.message import MessageCreate, MessageResponse, MessageListResponse
from core.security import get_current_user, encrypt_message
from db.supabase_client import insert_message, get_user_messages, get_message_by_id


router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new encrypted time-locked message
    
    - Requires authentication via Bearer token
    - Encrypts message content before storage
    - Returns created message data
    """
    try:
        # Encrypt the message content
        encrypted_content = encrypt_message(message.content)
        
        # Insert into database
        created_message = await insert_message(
            user_id=current_user["user_id"],
            recipient_email=message.recipient_email,
            encrypted_content=encrypted_content,
            scheduled_date=message.scheduled_date
        )
        
        return MessageResponse(**created_message)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create message: {str(e)}"
        )


@router.get("", response_model=MessageListResponse)
async def get_messages(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all messages for the authenticated user
    
    - Requires authentication via Bearer token
    - Optional filter by status (scheduled, sent, failed)
    - Returns list of messages (content remains encrypted)
    """
    try:
        messages = await get_user_messages(
            user_id=current_user["user_id"],
            status=status_filter
        )
        
        return MessageListResponse(
            messages=[MessageResponse(**msg) for msg in messages],
            total=len(messages)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve messages: {str(e)}"
        )


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific message by ID
    
    - Requires authentication via Bearer token
    - Verifies message belongs to authenticated user
    - Returns message data
    """
    message = await get_message_by_id(message_id, current_user["user_id"])
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found or access denied"
        )
    
    return MessageResponse(**message)
