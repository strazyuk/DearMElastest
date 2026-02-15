import sys
import os

# Add the backend directory to Python's path so imports work on Vercel
# On Vercel, the serverless function runs from backend/api/
# but our modules (main.py, core/, routers/, etc.) are in backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app as app

# Vercel needs this handler
handler = app
