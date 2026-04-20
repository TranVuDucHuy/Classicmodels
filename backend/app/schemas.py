from pydantic import BaseModel
from typing import List, Optional

# --- Chức năng 1: Tra cứu Khách hàng ---
class CustomerRow(BaseModel):
    customerNumber: int
    customerName: str
    contactName: str
    phone: str
    country: str
    creditLimit: float

class CustomerSearchResult(BaseModel):
    total: int
    items: List[CustomerRow]

# --- Chức năng 2: Pivot ---
class PivotItem(BaseModel):
    name: str               
    year: int
    revenue: float

class PivotResponse(BaseModel):
    data: list[PivotItem]
    years: list[int]        

# --- Chức năng 3: Chart ---
class ChartPoint(BaseModel):
    label: str              
    revenue: float

class ChartResponse(BaseModel):
    data: list[ChartPoint]

# --- New Analysis Schemas ---
class TopCustomerResponse(BaseModel):
    name: str
    revenue: float

class OrderStatusResponse(BaseModel):
    status: str
    count: int

class LatencyPoint(BaseModel):
    label: str
    avgDays: float

class RetentionPoint(BaseModel):
    bucket: str
    count: int

# --- Order Lookup Schemas ---
class OrderSearchItem(BaseModel):
    orderNumber: int
    orderDate: str
    shippedDate: Optional[str] = None
    status: str
    customerName: str
    totalAmount: float

class OrderSearchResponse(BaseModel):
    items: List[OrderSearchItem]
    total: int

# --- Chatbot Schemas ---
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    sql: Optional[str] = None
