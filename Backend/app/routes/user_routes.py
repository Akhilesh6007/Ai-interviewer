from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.services.clerk_auth_service import verify_clerk_token
from app.services.clerk_user_service import get_or_create_clerk_user
from app.schemas.user_schema import CurrentUserResponse, UpdateRoleRequest


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=CurrentUserResponse)
def get_current_user(
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    user = get_or_create_clerk_user(db, clerk_user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


@router.put("/role", response_model=CurrentUserResponse)
def update_user_role(
    data: UpdateRoleRequest,
    db: Session = Depends(get_db),
    clerk_user: dict = Depends(verify_clerk_token)
):
    allowed_roles = ["student", "company", "recruiter"]

    if data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = get_or_create_clerk_user(db, clerk_user)

    user.role = data.role

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }