"""Verification of Google Identity Services ID tokens.

Uses Google's tokeninfo endpoint, which validates the signature server-side;
we still enforce audience, issuer, and verified-email claims ourselves.
"""

import httpx

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
_VALID_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


def verify_google_id_token(credential: str, client_id: str) -> dict | None:
    """Return the token claims if valid for our OAuth client, else None."""
    try:
        resp = httpx.get(GOOGLE_TOKENINFO_URL, params={"id_token": credential}, timeout=10)
    except httpx.HTTPError:
        return None
    if resp.status_code != 200:
        return None

    claims = resp.json()
    if claims.get("aud") != client_id:
        return None
    if claims.get("iss") not in _VALID_ISSUERS:
        return None
    if claims.get("email_verified") not in ("true", True):
        return None
    if not claims.get("email"):
        return None
    return claims
