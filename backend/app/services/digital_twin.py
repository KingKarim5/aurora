"""Digital Twin engine.

Derives a vehicle's current condition and simple degradation forecasts from its
series of health snapshots. Pure functions over stored data — nothing here is
persisted, so the twin is always consistent with the underlying records.
"""

from app.models.vehicle import Vehicle, VehicleHealthSnapshot
from app.schemas.vehicle import ComponentTwin, DigitalTwinOut

# Weights reflect how much each component drives roadworthiness, not cost.
COMPONENT_WEIGHTS = {
    "battery": 0.30,
    "brakes": 0.25,
    "tires": 0.25,
    "oil": 0.20,
}

ATTENTION_THRESHOLD = 60.0
CRITICAL_THRESHOLD = 40.0


def _status(score: float) -> str:
    if score < CRITICAL_THRESHOLD:
        return "critical"
    if score < ATTENTION_THRESHOLD:
        return "attention"
    return "good"


def _linear_trend(points: list[tuple[float, float]]) -> float | None:
    """Least-squares slope (score units per day). None if not enough spread."""
    if len(points) < 2:
        return None
    n = len(points)
    mean_x = sum(p[0] for p in points) / n
    mean_y = sum(p[1] for p in points) / n
    denom = sum((p[0] - mean_x) ** 2 for p in points)
    if denom == 0:
        return None
    return sum((p[0] - mean_x) * (p[1] - mean_y) for p in points) / denom


def _predict(component: str, points: list[tuple[float, float]]) -> str | None:
    """Human-readable forecast of when the component crosses the critical line."""
    slope = _linear_trend(points)
    if slope is None or slope >= 0:
        return None
    current = points[-1][1]
    if current <= CRITICAL_THRESHOLD:
        return f"{component} is already below the critical threshold — service now"
    days_left = (current - CRITICAL_THRESHOLD) / -slope
    if days_left > 730:
        return None
    months = max(1, round(days_left / 30))
    return f"{component} projected to reach critical level in ~{months} month(s)"


def build_digital_twin(vehicle: Vehicle, snapshots: list[VehicleHealthSnapshot]) -> DigitalTwinOut:
    if not snapshots:
        return DigitalTwinOut(
            vehicle_id=vehicle.id,
            overall_health=None,
            status="unknown",
            components=[],
            snapshot_count=0,
            last_updated=None,
        )

    ordered = sorted(snapshots, key=lambda s: s.recorded_at)
    latest = ordered[-1]
    t0 = ordered[0].recorded_at

    def series(attr: str) -> list[tuple[float, float]]:
        return [
            ((s.recorded_at - t0).total_seconds() / 86400.0, getattr(s, attr)) for s in ordered
        ]

    component_map = {
        "battery": "battery_health",
        "brakes": "brake_health",
        "tires": "tire_health",
        "oil": "oil_life",
    }

    components: list[ComponentTwin] = []
    overall = 0.0
    for name, attr in component_map.items():
        score = getattr(latest, attr)
        overall += COMPONENT_WEIGHTS[name] * score
        components.append(
            ComponentTwin(
                component=name,
                score=round(score, 1),
                status=_status(score),
                prediction=_predict(name, series(attr)),
            )
        )

    return DigitalTwinOut(
        vehicle_id=vehicle.id,
        overall_health=round(overall, 1),
        status=_status(overall),
        components=components,
        snapshot_count=len(ordered),
        last_updated=latest.recorded_at,
    )
