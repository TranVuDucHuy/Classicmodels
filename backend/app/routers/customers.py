from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Customer
from ..schemas import CustomerSearchResult, CustomerRow
from typing import List, Optional

router = APIRouter()

@router.get("/search", response_model=CustomerSearchResult)
def search_customers(
    keyword: Optional[str] = "",
    country: Optional[str] = "",
    limit: int = 25,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if keyword:
        query = query.filter(Customer.customerName.ilike(f"%{keyword}%"))
    if country:
        query = query.filter(Customer.country == country)
    
    total = query.count()
    customers = query.offset(offset).limit(limit).all()
    
    items = [
        CustomerRow(
            customerNumber=c.customerNumber,
            customerName=c.customerName,
            contactName=f"{c.contactFirstName} {c.contactLastName}",
            phone=c.phone,
            country=c.country,
            creditLimit=float(c.creditLimit or 0)
        ) for c in customers
    ]
    
    return CustomerSearchResult(total=total, items=items)

@router.get("/countries", response_model=List[str])
def get_countries(db: Session = Depends(get_db)):
    countries = db.query(Customer.country).distinct().order_by(Customer.country).all()
    return [c[0] for c in countries]
