"""Vercel serverless entrypoint.

Vercel's Python runtime detects the ASGI `app` object exported here; all
routes are rewritten to this function via vercel.json.
"""

from app.main import app

__all__ = ["app"]
