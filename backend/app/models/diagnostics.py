from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle


class ObdCode(Base):
    """Knowledge-base entry for an OBD-II diagnostic trouble code."""

    __tablename__ = "obd_codes"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    system: Mapped[str] = mapped_column(String(100))  # e.g. powertrain, ignition, emissions
    severity: Mapped[int] = mapped_column(Integer)  # 1 (info) .. 5 (stop driving)
    likely_causes: Mapped[list] = mapped_column(JSON)  # list[str]
    recommended_actions: Mapped[list] = mapped_column(JSON)  # list[str]


class DiagnosticSession(Base):
    """A scan/diagnosis event for a vehicle, with the generated report stored as JSON."""

    __tablename__ = "diagnostic_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    codes: Mapped[list] = mapped_column(JSON)  # list[str] of raw OBD codes scanned
    report: Mapped[dict] = mapped_column(JSON)

    vehicle: Mapped["Vehicle"] = relationship()
