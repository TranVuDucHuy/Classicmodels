from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..database import get_db
from ..models import Order, OrderDetail, Product, Customer
from ..schemas import PivotResponse, PivotItem, ChartResponse, ChartPoint, TopCustomerResponse, OrderStatusResponse, LatencyPoint, RetentionPoint
from typing import List

router = APIRouter()

@router.get("/pivot", response_model=PivotResponse)
def get_pivot_revenue(
    detail: str = Query("productLine", regex="^(productLine|productName)$"),
    db: Session = Depends(get_db)
):
    group_col = Product.productLine if detail == "productLine" else Product.productName
    
    results = db.query(
        group_col.label("name"),
        extract('year', Order.orderDate).label("year"),
        func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).label("revenue")
    ).join(OrderDetail, Order.orderNumber == OrderDetail.orderNumber) \
     .join(Product, OrderDetail.productCode == Product.productCode) \
     .group_by(group_col, extract('year', Order.orderDate)) \
     .order_by(group_col, "year") \
     .all()
    
    data = [PivotItem(name=r.name, year=int(r.year), revenue=float(r.revenue)) for r in results]
    years = sorted(list(set(r.year for r in data)))
    
    return PivotResponse(data=data, years=years)

@router.get("/chart", response_model=ChartResponse)
def get_chart_revenue(
    year: str = "all",
    db: Session = Depends(get_db)
):
    if year == "all":
        results = db.query(
            extract('year', Order.orderDate).label("label"),
            func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).label("revenue")
        ).join(OrderDetail, Order.orderNumber == OrderDetail.orderNumber) \
         .group_by(extract('year', Order.orderDate)) \
         .order_by("label") \
         .all()
        data = [ChartPoint(label=str(int(r.label)), revenue=float(r.revenue)) for r in results]
    else:
        results = db.query(
            extract('month', Order.orderDate).label("month_num"),
            func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).label("revenue")
        ).join(OrderDetail, Order.orderNumber == OrderDetail.orderNumber) \
         .filter(extract('year', Order.orderDate) == int(year)) \
         .group_by(extract('month', Order.orderDate)) \
         .order_by("month_num") \
         .all()
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        data = [ChartPoint(label=months[int(r.month_num) - 1], revenue=float(r.revenue)) for r in results]
        
    return ChartResponse(data=data)

@router.get("/years", response_model=List[int])
def get_revenue_years(db: Session = Depends(get_db)):
    years = db.query(extract('year', Order.orderDate).distinct()).order_by(extract('year', Order.orderDate)).all()
    return [int(y[0]) for y in years]

@router.get("/top-customers", response_model=List[TopCustomerResponse])
def get_top_customers(db: Session = Depends(get_db)):
    results = db.query(
        Customer.customerName.label("name"),
        func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).label("revenue")
    ).join(Order, Customer.customerNumber == Order.customerNumber) \
     .join(OrderDetail, Order.orderNumber == OrderDetail.orderNumber) \
     .group_by(Customer.customerName) \
     .order_by(func.sum(OrderDetail.quantityOrdered * OrderDetail.priceEach).desc()) \
     .limit(10) \
     .all()
    
    return [TopCustomerResponse(name=r.name, revenue=float(r.revenue)) for r in results]

@router.get("/order-status", response_model=List[OrderStatusResponse])
def get_order_status(db: Session = Depends(get_db)):
    results = db.query(
        Order.status.label("status"),
        func.count(Order.orderNumber).label("count")
    ).group_by(Order.status) \
     .all()
    
    return [OrderStatusResponse(status=r.status, count=r.count) for r in results]

@router.get("/latency", response_model=List[LatencyPoint])
def get_shipping_latency(db: Session = Depends(get_db)):
    results = db.query(
        extract('year', Order.orderDate).label("year"),
        extract('month', Order.orderDate).label("month"),
        func.avg(func.datediff(Order.shippedDate, Order.orderDate)).label("avg_days")
    ).filter(Order.shippedDate.isnot(None)) \
     .group_by("year", "month") \
     .order_by("year", "month") \
     .all()
    
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return [
        LatencyPoint(
            label=f"{months[int(r.month)-1]} {int(r.year)}",
            avgDays=round(float(r.avg_days), 1)
        ) for r in results
    ]

@router.get("/retention", response_model=List[RetentionPoint])
def get_customer_retention(db: Session = Depends(get_db)):
    subquery = db.query(
        Order.customerNumber,
        func.count(Order.orderNumber).label("order_count")
    ).group_by(Order.customerNumber).subquery()
    
    results = db.query(
        subquery.c.order_count,
        func.count().label("customer_count")
    ).group_by(subquery.c.order_count).all()
    
    buckets = {"1 Order": 0, "2-3 Orders": 0, "4+ Orders": 0}
    for r in results:
        if r.order_count == 1:
            buckets["1 Order"] += r.customer_count
        elif 2 <= r.order_count <= 3:
            buckets["2-3 Orders"] += r.customer_count
        else:
            buckets["4+ Orders"] += r.customer_count
            
    return [RetentionPoint(bucket=k, count=v) for k, v in buckets.items()]
