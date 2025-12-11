from typing import List, Optional
import io

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import Base, engine, get_db
from app.models import (
    User,
    Product,
    Order,
    OrderItem,
    UserRole,
    OrderStatus,
)
from app.schemas import (
    UserCreate,
    UserRead,
    UserUpdate,
    LoginResponse,
    ProductCreate,
    ProductUpdate,
    ProductRead,
    ProductImportItem,
    OrderCreate,
    OrderUpdate,
    OrderRead,
    OrderItemUpdate,
)
from app.auth import create_user, verify_password, create_access_token, get_current_user

Base.metadata.create_all(bind=engine)

from app.initial_admin import init_admin
init_admin()

app = FastAPI(title="Supply Backend (FastAPI + Postgres)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- AUTH ----------

@app.post("/auth/register", response_model=UserRead)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, user_in)
    return user


@app.post("/auth/login", response_model=LoginResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(subject=user.id)
    return LoginResponse(access_token=access_token, token_type="bearer", user=user)


@app.get("/auth/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

# ---------- USERS (ADMIN) ----------

@app.get("/users", response_model=List[UserRead])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can list users")
    return db.query(User).order_by(User.id).all()


@app.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can view user")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.patch("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.auth import get_password_hash

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can update users")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.email is not None and user_in.email != user.email:
        exists = db.query(User).filter(User.email == user_in.email).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = user_in.email

    if user_in.name is not None:
        user.name = user_in.name

    if user_in.role is not None:
        user.role = user_in.role

    if user_in.password is not None and user_in.password.strip():
        user.password_hash = get_password_hash(user_in.password)

    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can delete users")

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

# ---------- PRODUCTS ----------

@app.post("/products", response_model=ProductRead)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.DRIVER:
        raise HTTPException(status_code=403, detail="Driver cannot create products")

    existing = db.query(Product).filter(Product.name == product_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this name exists")

    product = Product(**product_in.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.get("/products", response_model=List[ProductRead])
def list_products(
    query: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Product)
    if query:
        q = q.filter(Product.name.ilike(f"%{query}%"))
    return q.order_by(Product.name).all()


@app.get("/products/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.patch("/products/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only seller or admin can update products")

    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    data = product_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(product, k, v)

    db.commit()
    db.refresh(product)
    return product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only seller or admin can delete products")

    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}

# --- IMPORT PRODUCTS FROM EXCEL ---

@app.post("/products/import")
async def import_products(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only seller or admin can import products")

    try:
        import pandas as pd
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pandas is required. Run: pip install pandas openpyxl",
        )

    content = await file.read()
    buffer = io.BytesIO(content)

    try:
        df = pd.read_excel(buffer)
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to read Excel file")

    if "name" not in df.columns:
        raise HTTPException(status_code=400, detail="Excel file must contain 'name' column")

    imported = 0
    for _, row in df.iterrows():
        name = str(row["name"]).strip()
        if not name:
            continue
        unit = str(row.get("unit", "шт")).strip() or "шт"

        existing = db.query(Product).filter(Product.name == name).first()
        if existing:
            existing.unit = unit
        else:
            product = Product(name=name, unit=unit, is_active=True)
            db.add(product)
            imported += 1

    db.commit()
    return {"detail": f"Imported/updated products. New added: {imported}"}

# --- IMPORT PRODUCTS FROM JSON (под фронт) ---

@app.post("/products/import-json")
def import_products_json(
    items: List[ProductImportItem],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only seller or admin can import products")

    imported = 0
    for it in items:
        name = it.name.strip()
        if not name:
            continue
        unit = (it.unit or "шт").strip()

        existing = db.query(Product).filter(Product.name == name).first()
        if existing:
            existing.unit = unit
        else:
            product = Product(name=name, unit=unit, is_active=True)
            db.add(product)
            imported += 1

    db.commit()
    return {"detail": f"Imported/updated products. New added: {imported}"}

# ---------- ORDERS ----------

@app.post("/orders", response_model=OrderRead)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.CLIENT:
        raise HTTPException(status_code=403, detail="Only clients can create orders")

    order = Order(
        title=order_in.title,
        request_date=order_in.request_date,
        delivery_date=order_in.delivery_date,
        status=OrderStatus.NEW,
        comment=order_in.comment,
        delivery_address=order_in.delivery_address,
        project_name=order_in.project_name,
        created_by_id=current_user.id,
        created_by_role=current_user.role,
    )
    db.add(order)
    db.flush()

    for item_in in order_in.items:
        item = OrderItem(
            order_id=order.id,
            product_id=item_in.product_id,
            product_name=item_in.product_name,
            quantity=item_in.quantity,
            stock_status=item_in.stock_status,
            seller_comment=item_in.seller_comment,
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return order


@app.get("/orders", response_model=List[OrderRead])
def list_orders(
    status_filter: Optional[OrderStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Order)

    if current_user.role == UserRole.CLIENT:
        q = q.filter(Order.created_by_id == current_user.id)

    if current_user.role == UserRole.DRIVER:
        q = q.filter(
            Order.status.in_(
                [OrderStatus.TO_DRIVER, OrderStatus.ON_DELIVERY]
            )
        )

    if status_filter:
        q = q.filter(Order.status == status_filter)

    return q.order_by(Order.request_date.desc()).all()


@app.get("/orders/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role == UserRole.CLIENT and order.created_by_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if current_user.role == UserRole.DRIVER and order.status not in [
        OrderStatus.TO_DRIVER,
        OrderStatus.ON_DELIVERY,
        OrderStatus.DELIVERED,
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    return order


@app.patch("/orders/{order_id}", response_model=OrderRead)
def update_order(
    order_id: int,
    order_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    data = order_in.dict(exclude_unset=True)

    if current_user.role == UserRole.CLIENT:
        if order.created_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        data.pop("status", None)

    if current_user.role == UserRole.DRIVER and "status" in data:
        new_status = data["status"]
        if new_status not in [OrderStatus.ON_DELIVERY, OrderStatus.DELIVERED]:
            raise HTTPException(
                status_code=403,
                detail="Driver can only set status ON_DELIVERY or DELIVERED",
            )

    for k, v in data.items():
        setattr(order, k, v)

    db.commit()
    db.refresh(order)
    return order


@app.patch("/orders/{order_id}/items/{item_id}", response_model=OrderRead)
def update_order_item(
    order_id: int,
    item_id: int,
    item_in: OrderItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    item = db.get(OrderItem, item_id)
    if not item or item.order_id != order.id:
        raise HTTPException(status_code=404, detail="Order item not found")

    if current_user.role not in (UserRole.SELLER, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only seller or admin can update order items")

    data = item_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(item, k, v)

    db.commit()
    db.refresh(order)
    return order
