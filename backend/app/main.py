from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import customers, revenue

app = FastAPI(title="ClassicModels API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên giới hạn lại http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(revenue.router, prefix="/api/revenue", tags=["Revenue"])

@app.get("/")
def read_root():
    return {"message": "ClassicModels Dashboard API is running"}
