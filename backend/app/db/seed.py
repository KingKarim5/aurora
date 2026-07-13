"""Idempotent seed data: admin user, OBD knowledge base, and parts catalog."""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.diagnostics import ObdCode
from app.models.user import User, UserRole
from app.models.workshop import Part

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


# Common workshop stock, tuned for the Toyota/Honda/Nissan-heavy Bangladeshi fleet.
# (sku, name, category, quantity, unit_price, reorder_level, supplier)
PARTS_CATALOG = [
    ("FLT-OIL-T01", "Oil filter — Toyota 90915-YZZE1", "Filters", 40, "4.50", 10, "Toyota Genuine"),
    ("FLT-OIL-H01", "Oil filter — Honda 15400-RTA-003", "Filters", 25, "5.20", 8, "Honda Genuine"),
    ("FLT-AIR-T02", "Air filter — Corolla/Premio 17801-21050", "Filters", 20, "9.80", 6, "Denso"),
    ("FLT-CAB-U01", "Cabin AC filter (universal 215mm)", "Filters", 30, "6.00", 8, "Bosch"),
    ("FLT-FUEL-N1", "Fuel filter — Nissan 16400-4M405", "Filters", 12, "14.00", 4, "Nissan"),
    ("PLG-IRD-NG4", "Iridium spark plug — NGK ILKAR7B11", "Ignition", 48, "13.50", 16, "NGK"),
    ("COIL-IGN-T1", "Ignition coil — Toyota 90919-02258", "Ignition", 10, "38.00", 4, "Denso"),
    ("BRK-PAD-T01", "Front brake pads — Premio/Allion set", "Brakes", 16, "32.00", 6, "Akebono"),
    ("BRK-PAD-H01", "Front brake pads — CR-V/Civic set", "Brakes", 10, "36.00", 4, "Nisshinbo"),
    ("BRK-DSC-T01", "Brake disc rotor — Corolla (pair)", "Brakes", 8, "58.00", 3, "Aisin"),
    ("BRK-FLD-D31", "Brake fluid DOT-3 (500 ml)", "Brakes", 36, "4.20", 12, "Toyota Genuine"),
    ("OIL-ENG-0W20", "Engine oil 0W-20 full synthetic (4 L)", "Fluids", 50, "28.00", 15, "Castrol"),
    ("OIL-ENG-5W30", "Engine oil 5W-30 synthetic (4 L)", "Fluids", 40, "24.00", 12, "Mobil"),
    ("OIL-CVT-TC1", "CVT fluid TC (4 L)", "Fluids", 18, "34.00", 6, "Aisin"),
    ("CLNT-SLL-P1", "Super long-life coolant pink (2 L)", "Fluids", 22, "12.50", 8, "Toyota"),
    ("BAT-AGM-S95", "Battery S-95 EFB (start-stop)", "Electrical", 6, "145.00", 2, "GS Yuasa"),
    ("BAT-NS60-ST", "Battery NS60 maintenance-free", "Electrical", 8, "72.00", 3, "Hamko"),
    ("BLT-SRP-6PK", "Serpentine belt 6PK-1230", "Engine", 14, "16.00", 5, "Gates"),
    ("WPR-BLD-26P", 'Wiper blade set 26"/14"', "Body", 24, "9.00", 8, "Bosch"),
    ("SUS-SHK-F01", "Front shock — Axio/Fielder (pair)", "Suspension", 6, "96.00", 2, "KYB"),
    ("SUS-LNK-S01", "Stabilizer link — Toyota (pair)", "Suspension", 12, "22.00", 4, "555 Japan"),
    ("SNS-O2-DN01", "Oxygen sensor — Denso 89465 series", "Sensors", 7, "54.00", 3, "Denso"),
    ("AC-GAS-134A", "AC refrigerant R-134a (450 g)", "AC", 20, "11.00", 6, "Honeywell"),
    ("CV-BOOT-T01", "CV joint boot kit — Toyota FWD", "Drivetrain", 15, "8.50", 5, "Maruichi"),
    # Genuine lines for the wider BD fleet
    ("FLT-OIL-HY1", "Oil filter — Hyundai 26300-35505", "Filters", 18, "5.00", 6, "Hyundai"),
    ("BRK-PAD-HY1", "Front brake pads — Tucson/Creta", "Brakes", 8, "34.00", 3, "Hyundai"),
    ("FLT-OIL-MT1", "Oil filter — Mitsubishi MD135737", "Filters", 14, "5.50", 5, "Mitsubishi"),
    ("GLW-PLG-MT1", "Glow plug — Pajero 4M41 diesel", "Ignition", 12, "19.00", 4, "Mitsubishi"),
    ("FLT-AIR-N01", "Air filter — X-Trail 16546-4BA1B", "Filters", 10, "12.00", 4, "Nissan"),
    ("PAD-BRK-N01", "Front brake pads — X-Trail set", "Brakes", 8, "38.00", 3, "Nissan"),
    # JDM aftermarket / performance
    ("AFT-HKS-AF1", "HKS Super Air Filter — panel", "Aftermarket", 10, "42.00", 3, "HKS"),
    ("AFT-KNN-A33", "K&N 33-series drop-in air filter", "Aftermarket", 12, "58.00", 4, "K&N"),
    ("AFT-PMU-B01", "Project Mu B-Force pads — front", "Aftermarket", 6, "128.00", 2, "Project Mu"),
    ("AFT-CSC-SB1", "Cusco strut bar — Corolla/Axio", "Aftermarket", 4, "115.00", 2, "Cusco"),
    ("AFT-BLZ-BOV", "Blitz blow-off valve", "Aftermarket", 3, "165.00", 1, "Blitz"),
    ("AFT-TEN-D01", "Tein shock set — Premio/Allion", "Aftermarket", 3, "310.00", 1, "Tein"),
    ("AFT-MUG-M01", "Mugen oil filler cap — Honda", "Aftermarket", 8, "36.00", 2, "Mugen"),
    ("AFT-NIS-S01", "Nismo engine oil 5W-30 (4 L)", "Aftermarket", 10, "52.00", 3, "Nismo"),
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

    for sku, name, category, qty, price, reorder, supplier in PARTS_CATALOG:
        if not db.scalar(select(Part).where(Part.sku == sku)):
            db.add(
                Part(
                    sku=sku,
                    name=name,
                    category=category,
                    quantity=qty,
                    unit_price=Decimal(price),
                    reorder_level=reorder,
                    supplier=supplier,
                )
            )

    db.commit()


if __name__ == "__main__":
    # One-shot seeding for production databases: python -m app.db.seed
    from app.db.session import SessionLocal

    with SessionLocal() as session:
        seed_initial_data(session)
    print("Seed complete: admin user and OBD knowledge base are in place.")
