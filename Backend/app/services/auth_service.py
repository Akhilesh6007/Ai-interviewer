from sqlalchemy.orm import Session

from app.models.user_model import User
from app.schemas.user_schema import UserCreate
from app.utils.password_hash import hash_password

from app.utils.password_hash import verify_password


def create_user(db: Session, user: UserCreate):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        return None

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    return user