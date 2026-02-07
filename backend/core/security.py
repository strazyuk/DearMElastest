from cryptography.fernet import Fernet
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from core.config import get_settings


settings = get_settings()
security = HTTPBearer()

# Initialize Supabase client for auth verification
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


# Initialize Fernet cipher with the encryption key
def get_cipher():
    """Get Fernet cipher instance"""
    return Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_message(content: str) -> str:
    """
    Encrypt message content using AES-256 (Fernet)
    
    Args:
        content: Plain text message to encrypt
        
    Returns:
        Encrypted message as base64 string
    """
    cipher = get_cipher()
    encrypted_bytes = cipher.encrypt(content.encode())
    return encrypted_bytes.decode()


def decrypt_message(encrypted_content: str) -> str:
    """
    Decrypt message content
    
    Args:
        encrypted_content: Encrypted message as base64 string
        
    Returns:
        Decrypted plain text message
    """
    cipher = get_cipher()
    decrypted_bytes = cipher.decrypt(encrypted_content.encode())
    return decrypted_bytes.decode()


def verify_supabase_token(token: str) -> dict:
    """
    Verify Supabase JWT token using Supabase's auth.get_user()
    
    This method works with Supabase's new JWT signing key system.
    
    Args:
        token: JWT token string
        
    Returns:
        User data from verified token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Use Supabase client to verify the token
        user_response = supabase.auth.get_user(token)
        
        if user_response and user_response.user:
            return {
                "sub": user_response.user.id,
                "email": user_response.user.email,
                "user": user_response.user
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authentication token"
            )
    except Exception as e:
        error_message = str(e)
        print(f"Supabase auth error: {error_message}")
        
        if "expired" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid authentication token: {error_message}"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    FastAPI dependency to get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials from Authorization header
        
    Returns:
        User data from verified token
        
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    payload = verify_supabase_token(token)
    
    # Extract user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid token payload"
        )
    
    return {
        "user_id": user_id,
        "email": payload.get("email"),
        "payload": payload
    }

