from pydantic import BaseModel
from typing import Optional


# Old auth routes ke liye
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: Optional[str] = "student"

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# New role-based system ke liye
class CurrentUserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str


class UpdateRoleRequest(BaseModel):
    role: str