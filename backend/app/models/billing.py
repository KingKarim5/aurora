import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, utcnow

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.workshop import JobCard


class InvoiceStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    VOID = "void"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    MOBILE = "mobile"


class Invoice(TimestampMixin, Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    job_card_id: Mapped[int] = mapped_column(ForeignKey("job_cards.id"), unique=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), index=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 4))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    status: Mapped[InvoiceStatus] = mapped_column(
        Enum(InvoiceStatus, native_enum=False, length=32), default=InvoiceStatus.UNPAID
    )
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    job_card: Mapped["JobCard"] = relationship()
    customer: Mapped["Customer"] = relationship()
    payments: Mapped[list["Payment"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )

    @property
    def amount_paid(self) -> Decimal:
        return sum((p.amount for p in self.payments), Decimal("0"))

    @property
    def balance_due(self) -> Decimal:
        return self.total - self.amount_paid


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id"), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=32)
    )
    reference: Mapped[str | None] = mapped_column(String(255))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    invoice: Mapped["Invoice"] = relationship(back_populates="payments")
