from datetime import date
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from app.models import UserRole, OrderStatus, StockStatus


# ----- USERS / AUTH -----

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    user: UserRead


# ----- PRODUCTS -----

class ProductBase(BaseModel):
    name: str
    unit: str = "шт"
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    is_active: Optional[bool] = None


class ProductRead(ProductBase):
    id: int

    class Config:
        orm_mode = True


class ProductImportItem(BaseModel):
    name: str
    unit: str = "шт"


# ----- ORDER ITEMS -----

class OrderItemBase(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    quantity: float
    stock_status: StockStatus = StockStatus.UNKNOWN
    seller_comment: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemUpdate(BaseModel):
    product_id: Optional[int] = None
    product_name: Optional[str] = None
    quantity: Optional[float] = None
    stock_status: Optional[StockStatus] = None
    seller_comment: Optional[str] = None


class OrderItemRead(OrderItemBase):
    id: int

    class Config:
        orm_mode = True


# ----- ORDERS -----

class OrderBase(BaseModel):
    title: str
    request_date: date
    delivery_date: Optional[date] = None
    status: OrderStatus = OrderStatus.NEW
    comment: Optional[str] = None
    delivery_address: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    title: Optional[str] = None
    request_date: Optional[date] = None
    delivery_date: Optional[date] = None
    status: Optional[OrderStatus] = None
    comment: Optional[str] = None
    delivery_address: Optional[str] = None


class OrderRead(OrderBase):
    id: int
    created_by_id: int
    created_by_role: Optional[UserRole] = None
    items: List[OrderItemRead] = []

    class Config:
        orm_mode = True
