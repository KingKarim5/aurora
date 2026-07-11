"""Rule-based diagnostics engine.

Looks up scanned OBD codes in the knowledge base, enriches them with fleet
history (how often the same code appeared on the same make/model), and produces
an explainable report with per-finding confidence. Designed so an LLM layer can
be added later without changing the API contract.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.diagnostics import DiagnosticSession, ObdCode
from app.models.vehicle import Vehicle
from app.schemas.diagnostics import DiagnosticFinding

SEVERITY_LABELS = {
    1: "informational",
    2: "minor",
    3: "moderate — service soon",
    4: "serious — service immediately",
    5: "critical — do not drive",
}


def _same_model_history(db: Session, vehicle: Vehicle, code: str) -> int:
    """Count past sessions on the same make/model (any vehicle) reporting this code.

    JSON membership is checked in Python so the query stays portable across
    SQLite (dev/tests) and PostgreSQL (production).
    """
    sessions = db.scalars(
        select(DiagnosticSession)
        .join(Vehicle, DiagnosticSession.vehicle_id == Vehicle.id)
        .where(Vehicle.make == vehicle.make, Vehicle.model == vehicle.model)
    )
    return sum(1 for s in sessions if code in (s.codes or []))


def run_diagnosis(db: Session, vehicle: Vehicle, codes: list[str]) -> DiagnosticSession:
    normalized = [c.strip().upper() for c in codes if c.strip()]
    findings: list[DiagnosticFinding] = []

    for code in normalized:
        entry = db.get(ObdCode, code)
        history = _same_model_history(db, vehicle, code)
        if entry is None:
            findings.append(
                DiagnosticFinding(
                    code=code,
                    known=False,
                    confidence=0.2,
                    recommended_actions=["Code not in knowledge base — verify with manual scan"],
                    seen_before_on_same_model=history,
                )
            )
            continue
        # Base confidence from having a KB entry; grows with fleet history, capped at 0.99.
        confidence = min(0.99, 0.7 + 0.05 * min(history, 5))
        findings.append(
            DiagnosticFinding(
                code=code,
                known=True,
                title=entry.title,
                system=entry.system,
                severity=entry.severity,
                likely_causes=entry.likely_causes,
                recommended_actions=entry.recommended_actions,
                seen_before_on_same_model=history,
                confidence=round(confidence, 2),
            )
        )

    findings.sort(key=lambda f: f.severity or 0, reverse=True)
    overall = max((f.severity or 1 for f in findings), default=1)
    known = sum(1 for f in findings if f.known)
    summary = (
        f"{len(findings)} code(s) scanned, {known} matched in knowledge base. "
        f"Overall severity: {SEVERITY_LABELS[overall]}."
    )

    session = DiagnosticSession(
        vehicle_id=vehicle.id,
        codes=normalized,
        report={
            "overall_severity": overall,
            "summary": summary,
            "findings": [f.model_dump() for f in findings],
        },
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
