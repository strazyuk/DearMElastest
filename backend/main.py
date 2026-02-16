from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import messages, quote
from core.config import get_settings
import os


settings = get_settings()

# Initialize FastAPI application
app = FastAPI(
    title="DearME API",
    description="Backend API for encrypted time-locked messaging",
    version="1.0.0"
)

# Get allowed origins from environment variable or use defaults for local development
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )


# Include routers
app.include_router(messages.router)
app.include_router(quote.router)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint to verify API is running
    """
    return {
        "status": "healthy",
        "service": "DearME API",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Welcome to DearME API",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
