from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps import AdminOnly, CurrentUser, DbSession
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RefreshRequest, Token, UserCreate, UserOut, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(db: DbSession, form: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = db.scalar(select(User).where(User.email == form.username))
    if user is None or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/refresh", response_model=Token)
def refresh(db: DbSession, body: RefreshRequest):
    user_id = decode_token(body.refresh_token, expected_type="refresh")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user = db.get(User, int(user_id))
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user


@router.post("/users", response_model=UserOut, status_code=201, dependencies=[AdminOnly])
def create_user(db: DbSession, body: UserCreate):
    if db.scalar(select(User).where(User.email == body.email)):
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users", response_model=list[UserOut], dependencies=[AdminOnly])
def list_users(db: DbSession):
    return db.scalars(select(User).order_by(User.id)).all()


@router.patch("/users/{user_id}", response_model=UserOut, dependencies=[AdminOnly])
def update_user(db: DbSession, user_id: int, body: UserUpdate):
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    data = body.model_dump(exclude_unset=True)
    if "password" in data:
        user.hashed_password = hash_password(data.pop("password"))
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
