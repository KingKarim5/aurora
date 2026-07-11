from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ObdCodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    title: str
    system: str
    severity: int
    likely_causes: list[str]
    recommended_actions: list[str]


class DiagnosticRequest(BaseModel):
    codes: list[str] = Field(min_length=1, max_length=50)


class DiagnosticFinding(BaseModel):
    code: str
    known: bool
    title: str | None = None
    system: str | None = None
    severity: int | None = None
    likely_causes: list[str] = []
    recommended_actions: list[str] = []
    seen_before_on_same_model: int = 0
    confidence: float


class DiagnosticReportOut(BaseModel):
    session_id: int
    vehicle_id: int
    created_at: datetime
    overall_severity: int
    summary: str
    findings: list[DiagnosticFinding]


class DiagnosticSessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    created_at: datetime
    codes: list[str]
    report: dict
