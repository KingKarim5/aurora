from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.billing import InvoiceStatus, PaymentMethod


class InvoiceCreate(BaseModel):
    job_card_id: int
    tax_rate: Decimal | None = Field(default=None, ge=0, le=1)


class PaymentCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    method: PaymentMethod
    reference: str | None = Field(default=None, max_length=255)


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_id: int
    amount: Decimal
    method: PaymentMethod
    reference: str | None
    paid_at: datetime


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: str
    job_card_id: int
    customer_id: int
    subtotal: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    total: Decimal
    status: InvoiceStatus
    issued_at: datetime
    payments: list[PaymentOut]
    amount_paid: Decimal
    balance_due: Decimal
