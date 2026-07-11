from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.billing import Invoice
from app.models.workshop import JobCard


def next_job_card_number(db: Session) -> str:
    year = datetime.now(UTC).year
    prefix = f"JC-{year}-"
    count = db.scalar(
        select(func.count(JobCard.id)).where(JobCard.number.like(f"{prefix}%"))
    ) or 0
    return f"{prefix}{count + 1:04d}"


def next_invoice_number(db: Session) -> str:
    year = datetime.now(UTC).year
    prefix = f"INV-{year}-"
    count = db.scalar(
        select(func.count(Invoice.id)).where(Invoice.number.like(f"{prefix}%"))
    ) or 0
    return f"{prefix}{count + 1:04d}"
