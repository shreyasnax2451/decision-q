import random
import string
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, VerificationCode
from app.models.decision import Decision
from app.schemas.auth import (
    SignupRequest, VerifyRequest, LoginRequest,
    TokenResponse, UserResponse, MessageResponse
)
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user
from app.services.email import send_verification_email
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user and send an email OTP."""
    existing = db.query(User).filter(User.email == body.email).first()

    if existing:
        if existing.is_verified:
            raise HTTPException(status_code=409, detail="Email already registered")
        # Resend OTP for unverified accounts
        user = existing
    else:
        if len(body.password) < 8:
            raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
        referral_code = f"{body.first_name.upper()}-{body.last_name.upper()}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
        user = User(
            email=body.email,
            hashed_password=hash_password(body.password),
            first_name=body.first_name or None,
            last_name=body.last_name or None,
            referral_code=referral_code,
        )
        db.add(user)
        db.flush()

    # Invalidate old codes
    db.query(VerificationCode).filter(
        VerificationCode.user_id == user.id,
        VerificationCode.used == False  # noqa: E712
    ).update({"used": True})

    code = _generate_otp()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    vc = VerificationCode(
        user_id=user.id,
        code_hash=hash_password(code),
        expires_at=expires,
    )
    db.add(vc)
    db.commit()

    send_verification_email(user.email, code)

    return {"message": f"Verification code sent to {body.email}"}


@router.post("/verify", response_model=TokenResponse)
def verify(body: VerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and return a JWT access token."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Account already verified")

    now = datetime.now(timezone.utc)
    vc = (
        db.query(VerificationCode)
        .filter(
            VerificationCode.user_id == user.id,
            VerificationCode.used == False,  # noqa: E712
            VerificationCode.expires_at > now,
        )
        .order_by(VerificationCode.created_at.desc())
        .first()
    )

    if not vc or not verify_password(body.code, vc.code_hash):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")

    vc.used = True
    user.is_verified = True
    db.commit()

    token = create_access_token({"sub": user.id})
    return {"access_token": token}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login with email + password. Returns JWT."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")

    token = create_access_token({"sub": user.id})
    return {"access_token": token}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the authenticated user's profile."""
    decisions_used = db.query(Decision).filter(Decision.user_id == current_user.id).count()
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
        "referral_code": current_user.referral_code,
        "decisions_used": decisions_used,
        "decisions_remaining": max(0, 5 - decisions_used),
    }
