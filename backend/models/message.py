from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class MessageCreate(BaseModel):
    """Schema for creating a new message"""
    recipient_email: EmailStr
    content: str = Field(..., min_length=1, max_length=10000)
    scheduled_date: datetime


class MessageResponse(BaseModel):
    """Schema for message response"""
    id: UUID
    user_id: UUID
    recipient_email: str
    encrypted_content: str
    decrypted_content: Optional[str] = None
    scheduled_date: datetime
    created_at: datetime
    updated_at: datetime
    sent_at: Optional[datetime] = None
    status: str
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Schema for list of messages"""
    messages: list[MessageResponse]
    total: int
