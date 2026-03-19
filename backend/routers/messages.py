from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from models.message import MessageCreate, MessageResponse, MessageListResponse
from core.security import get_current_user, encrypt_message, decrypt_message
from db.supabase_client import insert_message, get_user_messages, get_message_by_id, delete_message


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
            title=message.title,
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
    - Returns list of messages
    - Decrypts content for sent messages so users can read them
    """
    try:
        messages = await get_user_messages(
            user_id=current_user["user_id"],
            email=current_user["email"],
            status=status_filter
        )
        
        # Decrypt content for messages, but ONLY if they are 'sent' (delivered)
        # Scheduled messages (in-transit) should not have their content revealed
        response_messages = []
        for msg in messages:
            msg_response = MessageResponse(**msg)
            
            if msg["status"] == "sent":
                try:
                    msg_response.decrypted_content = decrypt_message(msg["encrypted_content"])
                except Exception as decrypt_err:
                    # Log the error but return None so frontend shows a graceful message
                    print(f"[DECRYPT ERROR] Message {msg.get('id')}: {decrypt_err}")
                    msg_response.decrypted_content = None
            else:
                msg_response.decrypted_content = None
                
            response_messages.append(msg_response)
        
        return MessageListResponse(
            messages=response_messages,
            total=len(response_messages)
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


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message_by_id(
    message_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific message by ID

    - Requires authentication via Bearer token
    - Only the message owner can delete it
    - Returns 204 on success, 404 if not found
    """
    deleted = await delete_message(message_id, current_user["user_id"])

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found or access denied"
        )
