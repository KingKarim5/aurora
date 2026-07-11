from tests.conftest import ADMIN_EMAIL, ADMIN_PASSWORD


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


def test_duplicate_email_rejected(client, auth_headers):
    payload = {
        "email": "dup@aurora.dev",
        "full_name": "Dup",
        "password": "password123",
        "role": "manager",
    }
    assert client.post("/api/v1/auth/users", json=payload, headers=auth_headers).status_code == 201
    assert client.post("/api/v1/auth/users", json=payload, headers=auth_headers).status_code == 409

