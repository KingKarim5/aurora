"""Unit tests for the digital twin engine (no HTTP, no DB writes)."""

from datetime import UTC, datetime, timedelta

from app.models.vehicle import Vehicle, VehicleHealthSnapshot
from app.services.digital_twin import _linear_trend, build_digital_twin


def make_snapshot(days_ago: int, battery: float, **kw) -> VehicleHealthSnapshot:
    return VehicleHealthSnapshot(
        vehicle_id=1,
        recorded_at=datetime.now(UTC) - timedelta(days=days_ago),
        mileage_km=60000,
        battery_health=battery,
        brake_health=kw.get("brake", 90),
        tire_health=kw.get("tire", 90),
        oil_life=kw.get("oil", 90),
    )


def test_linear_trend_slope():
    slope = _linear_trend([(0, 100), (10, 90), (20, 80)])
    assert abs(slope - (-1.0)) < 1e-9


def test_declining_battery_produces_prediction():
    vehicle = Vehicle(id=1, customer_id=1, license_plate="X", make="Toyota",
                      model="Aqua", year=2019, mileage_km=60000)
    snapshots = [
        make_snapshot(180, battery=80),
        make_snapshot(90, battery=70),
        make_snapshot(0, battery=60),
    ]
    twin = build_digital_twin(vehicle, snapshots)
    battery = next(c for c in twin.components if c.component == "battery")
    # Losing ~10 points per 90 days from 60 -> critical(40) in ~180 days ≈ 6 months.
    assert battery.prediction is not None
    assert "month" in battery.prediction


def test_stable_component_has_no_prediction():
    vehicle = Vehicle(id=1, customer_id=1, license_plate="X", make="Toyota",
                      model="Aqua", year=2019, mileage_km=60000)
    snapshots = [make_snapshot(90, battery=85), make_snapshot(0, battery=85)]
    twin = build_digital_twin(vehicle, snapshots)
    battery = next(c for c in twin.components if c.component == "battery")
    assert battery.prediction is None
    assert twin.status == "good"
