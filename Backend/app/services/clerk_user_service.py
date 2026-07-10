from sqlalchemy.orm import Session

from app.models.user_model import User


def get_or_create_clerk_user(db: Session, clerk_user: dict):
    clerk_user_id = clerk_user.get("sub")

    if not clerk_user_id:
        return None

    existing_user = db.query(User).filter(
        User.clerk_user_id == clerk_user_id
    ).first()

    if existing_user:
        return existing_user

    email = clerk_user.get("email")

    if not email:
        email = f"{clerk_user_id}@clerk.local"

    user = User(
        name="Clerk User",
        email=email,
        password=None,
        clerk_user_id=clerk_user_id
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user