from fastapi import APIRouter, HTTPException
from sqlalchemy import or_, select

from app.api.deps import CurrentUser, DbSession
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerOut, CustomerUpdate
from app.schemas.vehicle import VehicleOut

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(db: DbSession, _: CurrentUser, body: CustomerCreate):
    customer = Customer(**body.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerOut])
def list_customers(
    db: DbSession, _: CurrentUser, q: str | None = None, skip: int = 0, limit: int = 50
):
    stmt = select(Customer).order_by(Customer.name).offset(skip).limit(min(limit, 200))
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(Customer.name.ilike(pattern), Customer.phone.ilike(pattern))
        )
    return db.scalars(stmt).all()


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(db: DbSession, _: CurrentUser, customer_id: int):
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/{customer_id}/vehicles", response_model=list[VehicleOut])
def customer_vehicles(db: DbSession, _: CurrentUser, customer_id: int):
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer.vehicles


@router.patch("/{customer_id}", response_model=CustomerOut)
def update_customer(db: DbSession, _: CurrentUser, customer_id: int, body: CustomerUpdate):
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    return customer
