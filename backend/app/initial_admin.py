from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models import User, UserRole
from app.auth import get_password_hash


def init_admin():
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin:
            print("Admin already exists ✔")
            return

        print("Creating initial admin user...")
        user = User(
            name="Admin",
            email="admin@961.kz",
            role=UserRole.ADMIN,
            password_hash=get_password_hash("admin123"),
        )
        db.add(user)
        db.commit()
        print("Admin created successfully! ✔ email=admin@961.kz | password=admin123")
    finally:
        db.close()


if __name__ == "__main__":
    init_admin()
