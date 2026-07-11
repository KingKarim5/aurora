from datetime import UTC, datetime
from decimal import Decimal

from fastapi import APIRouter
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbSession
from app.models.billing import Invoice, InvoiceStatus, Payment
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.workshop import Appointment, AppointmentStatus, JobCard, JobCardStatus, Part
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardStats)
def get_dashboard(db: DbSession, _: CurrentUser):
    now = datetime.now(UTC)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    revenue = db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0)).where(
            Payment.paid_at >= month_start
        )
    )

    unpaid_stmt = select(Invoice).where(
        Invoice.status.in_([InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID])
    )
    unpaid_invoices = db.scalars(unpaid_stmt).all()
    outstanding = sum((inv.balance_due for inv in unpaid_invoices), Decimal("0"))

    return DashboardStats(
        open_job_cards=db.scalar(
            select(func.count(JobCard.id)).where(JobCard.status == JobCardStatus.OPEN)
        )
        or 0,
        jobs_in_progress=db.scalar(
            select(func.count(JobCard.id)).where(
                JobCard.status.in_(
                    [JobCardStatus.IN_PROGRESS, JobCardStatus.AWAITING_PARTS]
                )
            )
        )
        or 0,
        revenue_this_month=Decimal(str(revenue or 0)),
        unpaid_invoices=len(unpaid_invoices),
        outstanding_balance=outstanding,
        low_stock_parts=db.scalar(
            select(func.count(Part.id)).where(Part.quantity <= Part.reorder_level)
        )
        or 0,
        upcoming_appointments=db.scalar(
            select(func.count(Appointment.id)).where(
                Appointment.scheduled_at >= now,
                Appointment.status.in_(
                    [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
                ),
            )
        )
        or 0,
        total_customers=db.scalar(select(func.count(Customer.id))) or 0,
        total_vehicles=db.scalar(select(func.count(Vehicle.id))) or 0,
    )
