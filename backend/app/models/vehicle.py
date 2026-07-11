import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, utcnow

if TYPE_CHECKING:
    from app.models.customer import Customer


class FuelType(str, enum.Enum):
    PETROL = "petrol"
    DIESEL = "diesel"
    HYBRID = "hybrid"
    ELECTRIC = "electric"
    CNG = "cng"


class Vehicle(TimestampMixin, Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    vin: Mapped[str | None] = mapped_column(String(17), unique=True)
    license_plate: Mapped[str] = mapped_column(String(20), index=True)
    make: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    year: Mapped[int] = mapped_column(Integer)
    fuel_type: Mapped[FuelType] = mapped_column(
        Enum(FuelType, native_enum=False, length=16), default=FuelType.PETROL
    )
    mileage_km: Mapped[int] = mapped_column(Integer, default=0)

    customer: Mapped["Customer"] = relationship(back_populates="vehicles")
    health_snapshots: Mapped[list["VehicleHealthSnapshot"]] = relationship(
        back_populates="vehicle",
        cascade="all, delete-orphan",
        order_by="VehicleHealthSnapshot.recorded_at",
    )


class VehicleHealthSnapshot(Base):
    """A point-in-time reading of vehicle component condition (0-100 scales).

    This is the storage layer of the Digital Twin: the twin's current state and
    trend predictions are derived from the snapshot series, never stored.
    """

    __tablename__ = "vehicle_health_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), index=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    mileage_km: Mapped[int] = mapped_column(Integer)

    battery_health: Mapped[float] = mapped_column(Float)  # 100 = new
    brake_health: Mapped[float] = mapped_column(Float)  # 100 = new pads/discs
    tire_health: Mapped[float] = mapped_column(Float)  # 100 = full tread
    oil_life: Mapped[float] = mapped_column(Float)  # 100 = just changed

    notes: Mapped[str | None] = mapped_column(String(1000))

    vehicle: Mapped["Vehicle"] = relationship(back_populates="health_snapshots")
