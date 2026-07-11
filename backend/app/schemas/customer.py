from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=3, max_length=50)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=500)


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, min_length=3, max_length=50)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=500)


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    email: str | None
    address: str | None
    created_at: datetime
