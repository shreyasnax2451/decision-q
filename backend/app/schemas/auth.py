from pydantic import BaseModel, EmailStr
from datetime import datetime


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str = ""
    last_name: str = ""

    model_config = {"json_schema_extra": {"example": {"email": "user@example.com", "password": "strongpassword123", "first_name": "Jane", "last_name": "Doe"}}}


class VerifyRequest(BaseModel):
    email: EmailStr
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str | None
    last_name: str | None
    is_verified: bool
    created_at: datetime
    decisions_used: int
    decisions_remaining: int
    referral_code: str | None = None

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str
