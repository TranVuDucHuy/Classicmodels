from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class ProductLine(Base):
    __tablename__ = "productlines"
    productLine = Column(String(50), primary_key=True)
    textDescription = Column(String(4000))

class Product(Base):
    __tablename__ = "products"
    productCode = Column(String(15), primary_key=True)
    productName = Column(String(70), nullable=False)
    productLine = Column(String(50), ForeignKey("productlines.productLine"), nullable=False)
    buyPrice = Column(Numeric(10, 2), nullable=False)

class Customer(Base):
    __tablename__ = "customers"
    customerNumber = Column(Integer, primary_key=True)
    customerName = Column(String(50), nullable=False)
    contactLastName = Column(String(50), nullable=False)
    contactFirstName = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=False)
    country = Column(String(50), nullable=False)
    creditLimit = Column(Numeric(10, 2))

class Order(Base):
    __tablename__ = "orders"
    orderNumber = Column(Integer, primary_key=True)
    orderDate = Column(Date, nullable=False)
    shippedDate = Column(Date)
    status = Column(String(15), nullable=False)
    customerNumber = Column(Integer, ForeignKey("customers.customerNumber"), nullable=False)
    details = relationship("OrderDetail", back_populates="order")

class OrderDetail(Base):
    __tablename__ = "orderdetails"
    orderNumber = Column(Integer, ForeignKey("orders.orderNumber"), primary_key=True)
    productCode = Column(String(15), ForeignKey("products.productCode"), primary_key=True)
    quantityOrdered = Column(Integer, nullable=False)
    priceEach = Column(Numeric(10, 2), nullable=False)
    order = relationship("Order", back_populates="details")
    product = relationship("Product")
