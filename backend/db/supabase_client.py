from supabase import create_client, Client
from core.config import get_settings
from typing import Optional
from datetime import datetime


settings = get_settings()

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


async def insert_message(
    user_id: str,
    recipient_email: str,
    encrypted_content: str,
    scheduled_date: datetime
) -> dict:
    """
    Insert a new message into the database
    
    Args:
        user_id: UUID of the user creating the message
        recipient_email: Email of the recipient
        encrypted_content: Encrypted message content
        scheduled_date: When the message should be sent
        
    Returns:
        Created message data
        
    Raises:
        Exception: If database operation fails
    """
    response = supabase.table("messages").insert({
        "user_id": user_id,
        "recipient_email": recipient_email,
        "encrypted_content": encrypted_content,
        "scheduled_date": scheduled_date.isoformat(),
        "status": "scheduled"
    }).execute()
    
    if not response.data:
        raise Exception("Failed to create message")
    
    return response.data[0]


async def get_user_messages(user_id: str, status: Optional[str] = None) -> list[dict]:
    """
    Get all messages for a user
    
    Args:
        user_id: UUID of the user
        status: Optional filter by message status
        
    Returns:
        List of message records
    """
    query = supabase.table("messages").select("*").eq("user_id", user_id)
    
    if status:
        query = query.eq("status", status)
    
    response = query.order("created_at", desc=True).execute()
    
    return response.data if response.data else []


async def get_message_by_id(message_id: str, user_id: str) -> Optional[dict]:
    """
    Get a specific message by ID, ensuring it belongs to the user
    
    Args:
        message_id: UUID of the message
        user_id: UUID of the user
        
    Returns:
        Message data if found and belongs to user, None otherwise
    """
    response = supabase.table("messages").select("*").eq("id", message_id).eq("user_id", user_id).execute()
    
    return response.data[0] if response.data else None
