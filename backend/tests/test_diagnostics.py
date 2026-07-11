def test_codes_knowledge_base_seeded(client, auth_headers):
    codes = client.get("/api/v1/diagnostics/codes", headers=auth_headers).json()
    assert len(codes) >= 10
    p0300 = next(c for c in codes if c["code"] == "P0300")
    assert p0300["severity"] == 4
    assert p0300["likely_causes"]


def test_scan_known_and_unknown_codes(client, auth_headers, make_vehicle):
    vehicle = make_vehicle()
    resp = client.post(
        f"/api/v1/diagnostics/vehicles/{vehicle['id']}/scan",
        json={"codes": ["p0300", "P0128", "P9999"]},
        headers=auth_headers,
    )
    assert resp.status_code == 201, resp.text
    report = resp.json()

    assert report["overall_severity"] == 4
    findings = {f["code"]: f for f in report["findings"]}
    assert findings["P0300"]["known"] is True
    assert findings["P0300"]["confidence"] >= 0.7
    assert findings["P9999"]["known"] is False
    assert findings["P9999"]["confidence"] < 0.5
    # Findings sorted most severe first.
    assert report["findings"][0]["code"] == "P0300"


def test_fleet_history_grows_confidence(client, auth_headers, make_customer, make_vehicle):
    # Two different vehicles of the same make/model.
    v1 = make_vehicle(vin="JTDKN3DU0A0000001", license_plate="A-1")
    c2 = make_customer(name="Second Owner", phone="018888")
    v2 = make_vehicle(customer_id=c2["id"], vin="JTDKN3DU0A0000002", license_plate="A-2")

    first = client.post(
        f"/api/v1/diagnostics/vehicles/{v1['id']}/scan",
        json={"codes": ["P0A80"]},
        headers=auth_headers,
    ).json()
    second = client.post(
        f"/api/v1/diagnostics/vehicles/{v2['id']}/scan",
        json={"codes": ["P0A80"]},
        headers=auth_headers,
    ).json()

    f1 = first["findings"][0]
    f2 = second["findings"][0]
    assert f1["seen_before_on_same_model"] == 0
    assert f2["seen_before_on_same_model"] == 1
    assert f2["confidence"] > f1["confidence"]

    sessions = client.get(
        f"/api/v1/diagnostics/vehicles/{v1['id']}/sessions", headers=auth_headers
    ).json()
    assert len(sessions) == 1
