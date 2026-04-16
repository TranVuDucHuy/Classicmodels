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
