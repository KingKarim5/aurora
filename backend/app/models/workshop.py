import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.user import User
    from app.models.vehicle import Vehicle


class JobCardStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    AWAITING_PARTS = "awaiting_parts"
    COMPLETED = "completed"
    INVOICED = "invoiced"
    CANCELLED = "cancelled"


class JobCardItemType(str, enum.Enum):
    LABOR = "labor"
    PART = "part"


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    NO_SHOW = "no_show"
    CANCELLED = "cancelled"


class Part(TimestampMixin, Base):
    __tablename__ = "parts"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    category: Mapped[str] = mapped_column(String(100))
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    reorder_level: Mapped[int] = mapped_column(Integer, default=2)
    supplier: Mapped[str | None] = mapped_column(String(255))


class JobCard(TimestampMixin, Base):
    __tablename__ = "job_cards"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    assigned_mechanic_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    status: Mapped[JobCardStatus] = mapped_column(
        Enum(JobCardStatus, native_enum=False, length=32), default=JobCardStatus.OPEN
    )
    complaint: Mapped[str] = mapped_column(String(2000))
    diagnosis: Mapped[str | None] = mapped_column(String(2000))
    odometer_km: Mapped[int] = mapped_column(Integer)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    customer: Mapped["Customer"] = relationship()
    vehicle: Mapped["Vehicle"] = relationship()
    assigned_mechanic: Mapped["User | None"] = relationship()
    items: Mapped[list["JobCardItem"]] = relationship(
        back_populates="job_card", cascade="all, delete-orphan"
    )

    @property
    def total(self) -> Decimal:
        return sum((item.line_total for item in self.items), Decimal("0"))


class JobCardItem(Base):
    __tablename__ = "job_card_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_card_id: Mapped[int] = mapped_column(ForeignKey("job_cards.id"), index=True)
    item_type: Mapped[JobCardItemType] = mapped_column(
        Enum(JobCardItemType, native_enum=False, length=16)
    )
    part_id: Mapped[int | None] = mapped_column(ForeignKey("parts.id"))
    description: Mapped[str] = mapped_column(String(500))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))

    job_card: Mapped["JobCard"] = relationship(back_populates="items")
    part: Mapped["Part | None"] = relationship()

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class Appointment(TimestampMixin, Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    service_type: Mapped[str] = mapped_column(String(255))
    status: Mapped[AppointmentStatus] = mapped_column(
        Enum(AppointmentStatus, native_enum=False, length=32), default=AppointmentStatus.SCHEDULED
    )
    notes: Mapped[str | None] = mapped_column(String(1000))

    customer: Mapped["Customer"] = relationship()
    vehicle: Mapped["Vehicle"] = relationship()
