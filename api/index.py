"""Vercel serverless API entry point"""
import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app

# Export for Vercel
handler = app
