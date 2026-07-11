from decimal import Decimal

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.core.config import get_settings
from app.models.billing import Invoice, InvoiceStatus, Payment
from app.models.workshop import JobCard, JobCardStatus
from app.schemas.billing import InvoiceCreate, InvoiceOut, PaymentCreate
from app.services.numbering import next_invoice_number

router = APIRouter(prefix="/invoices", tags=["invoices"])


def _get_invoice(db, invoice_id: int) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.post("", response_model=InvoiceOut, status_code=201)
def create_invoice(db: DbSession, _: CurrentUser, body: InvoiceCreate):
    job_card = db.get(JobCard, body.job_card_id)
    if job_card is None:
        raise HTTPException(status_code=404, detail="Job card not found")
    if job_card.status != JobCardStatus.COMPLETED:
        raise HTTPException(
            status_code=409, detail="Only completed job cards can be invoiced"
        )
    if db.scalar(select(Invoice).where(Invoice.job_card_id == job_card.id)):
        raise HTTPException(status_code=409, detail="Job card already invoiced")
    if not job_card.items:
        raise HTTPException(status_code=422, detail="Job card has no billable items")

    tax_rate = body.tax_rate if body.tax_rate is not None else Decimal(
        str(get_settings().default_tax_rate)
    )
    subtotal = job_card.total
    tax_amount = (subtotal * tax_rate).quantize(Decimal("0.01"))

    invoice = Invoice(
        number=next_invoice_number(db),
        job_card_id=job_card.id,
        customer_id=job_card.customer_id,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        total=subtotal + tax_amount,
    )
    job_card.status = JobCardStatus.INVOICED
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("", response_model=list[InvoiceOut])
def list_invoices(
    db: DbSession,
    _: CurrentUser,
    status: InvoiceStatus | None = None,
    customer_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
):
    stmt = select(Invoice).order_by(Invoice.id.desc()).offset(skip).limit(min(limit, 200))
    if status:
        stmt = stmt.where(Invoice.status == status)
    if customer_id:
        stmt = stmt.where(Invoice.customer_id == customer_id)
    return db.scalars(stmt).all()


@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(db: DbSession, _: CurrentUser, invoice_id: int):
    return _get_invoice(db, invoice_id)


@router.post("/{invoice_id}/payments", response_model=InvoiceOut, status_code=201)
def record_payment(db: DbSession, _: CurrentUser, invoice_id: int, body: PaymentCreate):
    invoice = _get_invoice(db, invoice_id)
    if invoice.status in (InvoiceStatus.PAID, InvoiceStatus.VOID):
        raise HTTPException(status_code=409, detail=f"Invoice is {invoice.status.value}")
    if body.amount > invoice.balance_due:
        raise HTTPException(
            status_code=422,
            detail=f"Payment exceeds balance due ({invoice.balance_due})",
        )
    # Compute the balance up front: the loaded payments collection will not
    # include the payment we are about to add.
    new_balance = invoice.balance_due - body.amount
    payment = Payment(invoice_id=invoice.id, **body.model_dump())
    db.add(payment)
    invoice.status = (
        InvoiceStatus.PAID if new_balance == 0 else InvoiceStatus.PARTIALLY_PAID
    )
    db.commit()
    db.refresh(invoice)
    return invoice


@router.post("/{invoice_id}/void", response_model=InvoiceOut)
def void_invoice(db: DbSession, _: CurrentUser, invoice_id: int):
    invoice = _get_invoice(db, invoice_id)
    if invoice.payments:
        raise HTTPException(status_code=409, detail="Cannot void an invoice with payments")
    invoice.status = InvoiceStatus.VOID
    db.commit()
    db.refresh(invoice)
    return invoice
