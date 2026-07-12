"""Idempotent seed data: first admin user and the OBD code knowledge base."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.diagnostics import ObdCode
from app.models.user import User, UserRole

OBD_KNOWLEDGE_BASE = [
    {
        "code": "P0300",
        "title": "Random/Multiple Cylinder Misfire Detected",
        "system": "ignition",
        "severity": 4,
        "likely_causes": [
            "Worn spark plugs or ignition coils",
            "Vacuum leak",
            "Low fuel pressure",
            "Clogged fuel injectors",
        ],
        "recommended_actions": [
            "Inspect and replace spark plugs/coils as needed",
            "Perform smoke test for vacuum leaks",
            "Check fuel pressure and injector balance",
        ],
    },
    {
        "code": "P0171",
        "title": "System Too Lean (Bank 1)",
        "system": "fuel/air",
        "severity": 3,
        "likely_causes": [
            "Dirty or faulty MAF sensor",
            "Vacuum leak",
            "Weak fuel pump or clogged filter",
        ],
        "recommended_actions": [
            "Clean MAF sensor",
            "Inspect intake for leaks",
            "Test fuel pressure",
        ],
    },
    {
        "code": "P0420",
        "title": "Catalyst System Efficiency Below Threshold (Bank 1)",
        "system": "emissions",
        "severity": 3,
        "likely_causes": [
            "Aging catalytic converter",
            "Faulty downstream O2 sensor",
            "Exhaust leak",
        ],
        "recommended_actions": [
            "Check for exhaust leaks",
            "Test O2 sensor response",
            "Replace catalytic converter if confirmed",
        ],
    },
    {
        "code": "P0301",
        "title": "Cylinder 1 Misfire Detected",
        "system": "ignition",
        "severity": 4,
        "likely_causes": [
            "Faulty cylinder 1 spark plug or coil",
            "Low compression in cylinder 1",
            "Faulty injector",
        ],
        "recommended_actions": [
            "Swap coil with another cylinder to confirm",
            "Compression test cylinder 1",
        ],
    },
    {
        "code": "P0128",
        "title": "Coolant Thermostat Below Regulating Temperature",
        "system": "cooling",
        "severity": 2,
        "likely_causes": ["Stuck-open thermostat", "Faulty coolant temperature sensor"],
        "recommended_actions": ["Replace thermostat", "Verify sensor reading against IR gun"],
    },
    {
        "code": "P0455",
        "title": "Evaporative Emission System Leak Detected (Large)",
        "system": "emissions",
        "severity": 2,
        "likely_causes": ["Loose or faulty fuel cap", "Cracked EVAP hose", "Faulty purge valve"],
        "recommended_actions": ["Tighten/replace fuel cap", "Smoke test the EVAP system"],
    },
    {
        "code": "P0562",
        "title": "System Voltage Low",
        "system": "electrical",
        "severity": 3,
        "likely_causes": [
            "Failing alternator",
            "Aging battery",
            "Corroded battery terminals or ground strap",
        ],
        "recommended_actions": [
            "Load-test battery",
            "Measure charging voltage at idle and 2000 rpm",
            "Clean terminals and grounds",
        ],
    },
    {
        "code": "P0A80",
        "title": "Replace Hybrid Battery Pack",
        "system": "hybrid",
        "severity": 5,
        "likely_causes": [
            "Degraded hybrid battery module(s)",
            "Cell voltage imbalance",
            "Cooling fan blockage causing overheating",
        ],
        "recommended_actions": [
            "Read individual block voltages",
            "Clean hybrid battery cooling fan",
            "Recondition or replace battery pack",
        ],
    },
    {
        "code": "C1201",
        "title": "Engine Control System Malfunction (ABS/VSC cutoff)",
        "system": "brakes/stability",
        "severity": 3,
        "likely_causes": [
            "Stored engine code disabling VSC/ABS",
            "Faulty brake light switch",
        ],
        "recommended_actions": [
            "Resolve underlying powertrain codes first",
            "Inspect brake light switch",
        ],
    },
    {
        "code": "U0100",
        "title": "Lost Communication With ECM/PCM",
        "system": "network",
        "severity": 4,
        "likely_causes": ["CAN bus wiring fault", "Failing ECM", "Poor ECM power/ground"],
        "recommended_actions": [
            "Check CAN high/low resistance",
            "Inspect ECM connectors, power and grounds",
        ],
    },
]


def seed_initial_data(db: Session) -> None:
    settings = get_settings()

    if not db.scalar(select(User).where(User.email == settings.first_admin_email)):
        db.add(
            User(
                email=settings.first_admin_email,
                full_name="AURORA Admin",
                hashed_password=hash_password(settings.first_admin_password),
                role=UserRole.ADMIN,
            )
        )

    for entry in OBD_KNOWLEDGE_BASE:
        if db.get(ObdCode, entry["code"]) is None:
            db.add(ObdCode(**entry))

    db.commit()


if __name__ == "__main__":
    # One-shot seeding for production databases: python -m app.db.seed
    from app.db.session import SessionLocal

    with SessionLocal() as session:
        seed_initial_data(session)
    print("Seed complete: admin user and OBD knowledge base are in place.")
