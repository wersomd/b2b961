from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Enum,
    Text,
    Boolean,
    ForeignKey,
    Float,
)
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CLIENT = "CLIENT"
    SELLER = "SELLER"
    DRIVER = "DRIVER"


class OrderStatus(str, enum.Enum):
    NEW = "NEW"
    UNDER_CHECK = "UNDER_CHECK"
    APPROVED = "APPROVED"
    ASSEMBLING = "ASSEMBLING"
    TO_DRIVER = "TO_DRIVER"
    ON_DELIVERY = "ON_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class StockStatus(str, enum.Enum):
    UNKNOWN = "UNKNOWN"
    IN_STOCK = "IN_STOCK"
    NEED_TO_PURCHASE = "NEED_TO_PURCHASE"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)

    orders = relationship("Order", back_populates="creator")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    unit = Column(String, default="шт")
    is_active = Column(Boolean, default=True)

    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    request_date = Column(Date, nullable=False)
    delivery_date = Column(Date, nullable=True)
    status = Column(
        Enum(OrderStatus, name="order_status"),
        default=OrderStatus.NEW,
        nullable=False,
    )
    comment = Column(Text, nullable=True)
    delivery_address = Column(Text, nullable=True)
    project_name = Column(String, nullable=True)

    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_role = Column(Enum(UserRole, name="creator_role"), nullable=True)

    creator = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    stock_status = Column(
        Enum(StockStatus, name="stock_status"),
        default=StockStatus.UNKNOWN,
        nullable=False,
    )
    seller_comment = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
