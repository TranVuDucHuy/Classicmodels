from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..database import get_db
from ..models import Order, OrderDetail, Product
from ..schemas import PivotResponse, PivotItem, ChartResponse, ChartPoint
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
        data = [ChartPoint(label=f"T{int(r.month_num)}", revenue=float(r.revenue)) for r in results]
        
    return ChartResponse(data=data)

@router.get("/years", response_model=List[int])
def get_revenue_years(db: Session = Depends(get_db)):
    years = db.query(extract('year', Order.orderDate).distinct()).order_by(extract('year', Order.orderDate)).all()
    return [int(y[0]) for y in years]
