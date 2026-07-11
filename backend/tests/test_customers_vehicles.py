def test_customer_crud(client, auth_headers, make_customer):
    customer = make_customer(name="Rahim Uddin", phone="01711112222")

    resp = client.get(f"/api/v1/customers/{customer['id']}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Rahim Uddin"

    resp = client.get("/api/v1/customers", params={"q": "rahim"}, headers=auth_headers)
    assert len(resp.json()) == 1

    resp = client.patch(
        f"/api/v1/customers/{customer['id']}",
        json={"address": "Mirpur, Dhaka"},
        headers=auth_headers,
    )
    assert resp.json()["address"] == "Mirpur, Dhaka"

    assert client.get("/api/v1/customers/9999", headers=auth_headers).status_code == 404


def test_vehicle_creation_and_vin_uniqueness(client, auth_headers, make_customer, make_vehicle):
    customer = make_customer()
    make_vehicle(customer_id=customer["id"], vin="JTDKN3DU0A0123456")

    resp = client.post(
        "/api/v1/vehicles",
        json={
            "customer_id": customer["id"],
            "vin": "JTDKN3DU0A0123456",
            "license_plate": "DHA-9999",
            "make": "Toyota",
            "model": "Prius",
            "year": 2015,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 409

    vehicles = client.get(
        f"/api/v1/customers/{customer['id']}/vehicles", headers=auth_headers
    ).json()
    assert len(vehicles) == 1


def test_vehicle_search(client, auth_headers, make_vehicle):
    make_vehicle(license_plate="CHA-5566", make="Honda", model="Vezel")
    resp = client.get("/api/v1/vehicles", params={"q": "vezel"}, headers=auth_headers)
    assert len(resp.json()) == 1


def test_health_snapshots_and_digital_twin(client, auth_headers, make_vehicle):
    vehicle = make_vehicle()

    # No snapshots yet: twin is unknown.
    twin = client.get(
        f"/api/v1/vehicles/{vehicle['id']}/digital-twin", headers=auth_headers
    ).json()
    assert twin["status"] == "unknown"
    assert twin["overall_health"] is None

    resp = client.post(
        f"/api/v1/vehicles/{vehicle['id']}/health-snapshots",
        json={
            "mileage_km": 66000,
            "battery_health": 72,
            "brake_health": 55,
            "tire_health": 80,
            "oil_life": 35,
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201

    twin = client.get(
        f"/api/v1/vehicles/{vehicle['id']}/digital-twin", headers=auth_headers
    ).json()
    assert twin["snapshot_count"] == 1
    # 0.3*72 + 0.25*55 + 0.25*80 + 0.2*35 = 62.35
    assert abs(twin["overall_health"] - 62.4) < 0.2
    by_name = {c["component"]: c for c in twin["components"]}
    assert by_name["brakes"]["status"] == "attention"
    assert by_name["oil"]["status"] == "critical"
    assert by_name["tires"]["status"] == "good"

    # Snapshot mileage propagates to the vehicle record.
    v = client.get(f"/api/v1/vehicles/{vehicle['id']}", headers=auth_headers).json()
    assert v["mileage_km"] == 66000
