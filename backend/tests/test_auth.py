import pytest

from app.core.config import get_settings
from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD

GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com"


@pytest.fixture
def google_enabled(monkeypatch):
    monkeypatch.setattr(get_settings(), "google_client_id", GOOGLE_CLIENT_ID)


@pytest.fixture
def google_claims(monkeypatch):
    """Stub Google's tokeninfo verification; the token 'valid-token' succeeds."""
    claims = {
        "aud": GOOGLE_CLIENT_ID,
        "iss": "https://accounts.google.com",
        "email": "new.mechanic@gmail.com",
        "email_verified": "true",
        "name": "New Mechanic",
    }

    def fake_verify(credential, client_id):
        if credential == "valid-token" and client_id == GOOGLE_CLIENT_ID:
            return claims
        return None

    monkeypatch.setattr("app.api.routes.auth.verify_google_id_token", fake_verify)
    return claims


def test_login_success(client):
    resp = client.post(
        "/api/v1/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    resp = client.post(
        "/api/v1/auth/login", data={"username": ADMIN_EMAIL, "password": "wrong-password"}
    )
    assert resp.status_code == 401


def test_me(client, auth_headers):
    resp = client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == ADMIN_EMAIL
    assert resp.json()["role"] == "admin"


def test_refresh_flow(client):
    login = client.post(
        "/api/v1/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    ).json()
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": login["refresh_token"]})
    assert resp.status_code == 200
    assert resp.json()["access_token"]


def test_access_token_rejected_as_refresh(client):
    login = client.post(
        "/api/v1/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    ).json()
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": login["access_token"]})
    assert resp.status_code == 401


def test_protected_route_requires_token(client):
    assert client.get("/api/v1/customers").status_code == 401


def test_admin_can_create_user_but_mechanic_cannot(client, auth_headers):
    resp = client.post(
        "/api/v1/auth/users",
        json={
            "email": "mech@aurora.dev",
            "full_name": "Mika Mechanic",
            "password": "mechpass123",
            "role": "mechanic",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201

    mech_login = client.post(
        "/api/v1/auth/login", data={"username": "mech@aurora.dev", "password": "mechpass123"}
    ).json()
    mech_headers = {"Authorization": f"Bearer {mech_login['access_token']}"}
    resp = client.post(
        "/api/v1/auth/users",
        json={
            "email": "x@aurora.dev",
            "full_name": "X",
            "password": "password123",
            "role": "mechanic",
        },
        headers=mech_headers,
    )
    assert resp.status_code == 403


def test_google_login_unconfigured_returns_503(client):
    resp = client.post("/api/v1/auth/google", json={"credential": "anything"})
    assert resp.status_code == 503


def test_google_login_creates_least_privilege_user(client, google_enabled, google_claims):
    resp = client.post("/api/v1/auth/google", json={"credential": "valid-token"})
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["access_token"]

    me = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"}
    ).json()
    assert me["email"] == "new.mechanic@gmail.com"
    assert me["role"] == "mechanic"
    assert me["full_name"] == "New Mechanic"


def test_google_login_reuses_existing_user(client, google_enabled, google_claims):
    first = client.post("/api/v1/auth/google", json={"credential": "valid-token"})
    second = client.post("/api/v1/auth/google", json={"credential": "valid-token"})
    assert first.status_code == 200 and second.status_code == 200

    def user_id(resp):
        token = resp.json()["access_token"]
        return client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
        ).json()["id"]

    assert user_id(first) == user_id(second)


def test_google_login_invalid_credential_rejected(client, google_enabled, google_claims):
    resp = client.post("/api/v1/auth/google", json={"credential": "forged-token"})
    assert resp.status_code == 401


def test_duplicate_email_rejected(client, auth_headers):
    payload = {
        "email": "dup@aurora.dev",
        "full_name": "Dup",
        "password": "password123",
        "role": "manager",
    }
    assert client.post("/api/v1/auth/users", json=payload, headers=auth_headers).status_code == 201
    assert client.post("/api/v1/auth/users", json=payload, headers=auth_headers).status_code == 409

