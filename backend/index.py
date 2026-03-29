"""Vercel entry point for the Flask application"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from app import app

# Export the app for Vercel
__all__ = ['app']
