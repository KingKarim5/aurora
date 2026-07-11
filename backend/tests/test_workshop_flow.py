"""End-to-end workshop flow: part -> job card -> items -> completion -> invoice -> payment."""

import pytest


@pytest.fixture
def part(client, auth_headers):
    resp = client.post(
        "/api/v1/parts",
        json={
            "sku": "BP-FR-TOY-01",
            "name": "Front Brake Pads (Toyota Aqua)",
            "category": "brakes",
            "quantity": 4,
            "unit_price": "45.00",
            "reorder_level": 2,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest.fixture
def job_card(client, auth_headers, make_vehicle):
    vehicle = make_vehicle()
    resp = client.post(
        "/api/v1/job-cards",
        json={
            "customer_id": vehicle["customer_id"],
            "vehicle_id": vehicle["id"],
            "complaint": "Grinding noise when braking",
            "odometer_km": 66500,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_job_card_number_format(job_card):
    assert job_card["number"].startswith("JC-")
    assert job_card["status"] == "open"


def test_full_flow_to_paid_invoice(client, auth_headers, part, job_card):
    jc_id = job_card["id"]

    # Add a part item (uses part's price) and a labor item.
    resp = client.post(
        f"/api/v1/job-cards/{jc_id}/items",
        json={
            "item_type": "part",
            "part_id": part["id"],
            "description": "Front brake pads",
            "quantity": 2,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    resp = client.post(
        f"/api/v1/job-cards/{jc_id}/items",
        json={
            "item_type": "labor",
            "description": "Brake pad replacement labor",
            "quantity": 1,
            "unit_price": "30.00",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert float(resp.json()["total"]) == 120.00  # 2*45 + 30

    # Stock was decremented.
    stock = client.get(f"/api/v1/parts/{part['id']}", headers=auth_headers).json()
    assert stock["quantity"] == 2

    # Cannot invoice before completion.
    resp = client.post("/api/v1/invoices", json={"job_card_id": jc_id}, headers=auth_headers)
    assert resp.status_code == 409

    # open -> in_progress -> completed
    for status in ("in_progress", "completed"):
        resp = client.patch(
            f"/api/v1/job-cards/{jc_id}", json={"status": status}, headers=auth_headers
        )
        assert resp.status_code == 200, resp.text
    assert resp.json()["completed_at"] is not None

    # Invoice with 10% default tax.
    resp = client.post("/api/v1/invoices", json={"job_card_id": jc_id}, headers=auth_headers)
    assert resp.status_code == 201, resp.text
    invoice = resp.json()
    assert invoice["number"].startswith("INV-")
    assert float(invoice["subtotal"]) == 120.00
    assert float(invoice["tax_amount"]) == 12.00
    assert float(invoice["total"]) == 132.00
    assert invoice["status"] == "unpaid"

    # Job card is now invoiced and closed to edits.
    jc = client.get(f"/api/v1/job-cards/{jc_id}", headers=auth_headers).json()
    assert jc["status"] == "invoiced"
    resp = client.post(
        f"/api/v1/job-cards/{jc_id}/items",
        json={"item_type": "labor", "description": "x", "unit_price": "1.00"},
        headers=auth_headers,
    )
    assert resp.status_code == 409

    # Duplicate invoice rejected.
    resp = client.post("/api/v1/invoices", json={"job_card_id": jc_id}, headers=auth_headers)
    assert resp.status_code == 409

    # Partial then full payment.
    inv_id = invoice["id"]
    resp = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        json={"amount": "100.00", "method": "cash"},
        headers=auth_headers,
    )
    assert resp.json()["status"] == "partially_paid"
    resp = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        json={"amount": "32.00", "method": "card"},
        headers=auth_headers,
    )
    assert resp.json()["status"] == "paid"
    assert float(resp.json()["balance_due"]) == 0

    # Overpayment rejected.
    resp = client.post(
        f"/api/v1/invoices/{inv_id}/payments",
        json={"amount": "1.00", "method": "cash"},
        headers=auth_headers,
    )
    assert resp.status_code == 409  # already paid


def test_invalid_status_transition(client, auth_headers, job_card):
    resp = client.patch(
        f"/api/v1/job-cards/{job_card['id']}",
        json={"status": "completed"},  # open -> completed is not allowed
        headers=auth_headers,
    )
    assert resp.status_code == 409


def test_insufficient_stock(client, auth_headers, part, job_card):
    resp = client.post(
        f"/api/v1/job-cards/{job_card['id']}/items",
        json={
            "item_type": "part",
            "part_id": part["id"],
            "description": "Too many pads",
            "quantity": 99,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 409


def test_removing_part_item_restores_stock(client, auth_headers, part, job_card):
    resp = client.post(
        f"/api/v1/job-cards/{job_card['id']}/items",
        json={
            "item_type": "part",
            "part_id": part["id"],
            "description": "Front brake pads",
            "quantity": 2,
        },
        headers=auth_headers,
    )
    item_id = resp.json()["items"][0]["id"]
    assert client.get(f"/api/v1/parts/{part['id']}", headers=auth_headers).json()["quantity"] == 2

    client.delete(f"/api/v1/job-cards/{job_card['id']}/items/{item_id}", headers=auth_headers)
    assert client.get(f"/api/v1/parts/{part['id']}", headers=auth_headers).json()["quantity"] == 4


def test_vehicle_must_belong_to_customer(client, auth_headers, make_customer, make_vehicle):
    vehicle = make_vehicle()
    other = make_customer(name="Other Person", phone="0199999999")
    resp = client.post(
        "/api/v1/job-cards",
        json={
            "customer_id": other["id"],
            "vehicle_id": vehicle["id"],
            "complaint": "Test",
            "odometer_km": 1000,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_dashboard_stats(client, auth_headers, part, job_card):
    stats = client.get("/api/v1/dashboard", headers=auth_headers).json()
    assert stats["open_job_cards"] == 1
    assert stats["total_customers"] == 1
    assert stats["total_vehicles"] == 1
    assert stats["low_stock_parts"] == 0
