import os

os.environ["DATABASE_URL"] = "sqlite:///./test_aurora.db"
os.environ["ENVIRONMENT"] = "test"
os.environ["SECRET_KEY"] = "test-secret-key"

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.seed import seed_initial_data
from app.db.session import SessionLocal, engine
from app.main import app

ADMIN_EMAIL = "admin@aurora.dev"
ADMIN_PASSWORD = "admin12345"


@pytest.fixture
def fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_initial_data(db)
    yield


@pytest.fixture
def client(fresh_db):
    with TestClient(app) as c:
        yield c


@pytest.fixture
def auth_headers(client):
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


@pytest.fixture
def make_customer(client, auth_headers):
    def _make(name="Jane Doe", phone="0123456789"):
        resp = client.post(
            "/api/v1/customers", json={"name": name, "phone": phone}, headers=auth_headers
        )
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_vehicle(client, auth_headers, make_customer):
    def _make(customer_id=None, **overrides):
        if customer_id is None:
            customer_id = make_customer()["id"]
        payload = {
            "customer_id": customer_id,
            "license_plate": "DHA-1234",
            "make": "Toyota",
            "model": "Aqua",
            "year": 2019,
            "fuel_type": "hybrid",
            "mileage_km": 65000,
        }
        payload.update(overrides)
        resp = client.post("/api/v1/vehicles", json=payload, headers=auth_headers)
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make
