from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import Order, OrderDetail, Customer
from ..schemas import OrderSearchResponse, OrderSearchItem
from typing import Optional

router = APIRouter()

@router.get("/search", response_model=OrderSearchResponse)
def search_orders(
    customerName: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(
        Order.orderNumber,
        Order.orderDate,
        Order.shippedDate,
        Order.status,
        Customer.customerName,
        func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).label("totalAmount")
    ).join(Customer, Order.customerNumber == Customer.customerNumber) \
     .join(OrderDetail, Order.orderNumber == OrderDetail.orderNumber)
    
    if customerName:
        query = query.filter(Customer.customerName.like(f"%{customerName}%"))
    if startDate:
        query = query.filter(Order.orderDate >= startDate)
    if endDate:
        query = query.filter(Order.orderDate <= endDate)
        
    results = query.group_by(Order.orderNumber, Customer.customerName).all()
    
    items = [
        OrderSearchItem(
            orderNumber=r.orderNumber,
            orderDate=str(r.orderDate),
            shippedDate=str(r.shippedDate) if r.shippedDate else None,
            status=r.status,
            customerName=r.customerName,
            totalAmount=float(r.totalAmount)
        ) for r in results
    ]
    
    return OrderSearchResponse(items=items, total=len(items))
