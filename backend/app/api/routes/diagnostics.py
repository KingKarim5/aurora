from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.models.diagnostics import DiagnosticSession, ObdCode
from app.models.vehicle import Vehicle
from app.schemas.diagnostics import (
    DiagnosticReportOut,
    DiagnosticRequest,
    DiagnosticSessionOut,
    ObdCodeOut,
)
from app.services.diagnostics import run_diagnosis

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


@router.get("/codes", response_model=list[ObdCodeOut])
def list_codes(db: DbSession, _: CurrentUser, q: str | None = None):
    stmt = select(ObdCode).order_by(ObdCode.code)
    if q:
        stmt = stmt.where(ObdCode.code.ilike(f"%{q}%"))
    return db.scalars(stmt).all()


@router.post(
    "/vehicles/{vehicle_id}/scan", response_model=DiagnosticReportOut, status_code=201
)
def scan_vehicle(db: DbSession, _: CurrentUser, vehicle_id: int, body: DiagnosticRequest):
    vehicle = db.get(Vehicle, vehicle_id)
    if vehicle is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    session = run_diagnosis(db, vehicle, body.codes)
    return DiagnosticReportOut(
        session_id=session.id,
        vehicle_id=session.vehicle_id,
        created_at=session.created_at,
        overall_severity=session.report["overall_severity"],
        summary=session.report["summary"],
        findings=session.report["findings"],
    )


@router.get("/vehicles/{vehicle_id}/sessions", response_model=list[DiagnosticSessionOut])
def vehicle_sessions(db: DbSession, _: CurrentUser, vehicle_id: int):
    if db.get(Vehicle, vehicle_id) is None:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db.scalars(
        select(DiagnosticSession)
        .where(DiagnosticSession.vehicle_id == vehicle_id)
        .order_by(DiagnosticSession.created_at.desc())
    ).all()
