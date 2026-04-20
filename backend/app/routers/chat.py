import os
import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from ..schemas import ChatRequest, ChatResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemma-3-4b-it')

DB_SCHEMA_CONTEXT = """
You are a data assistant for the ClassicModels database. 
IMPORTANT: MySQL on this system is CASE-SENSITIVE for table names. Use LOWERCASE for tables.
Table Names: customers, products, productlines, orders, orderdetails (ALWAYS LOWERCASE)
Column Names: use exact casing (e.g., customerNumber, quantityOrdered).

Database Schema:
- customers: customerNumber (PK), customerName, contactLastName, contactFirstName, phone, country, creditLimit
- products: productCode (PK), productName, productLine, buyPrice
- productlines: productLine (PK), textDescription
- orders: orderNumber (PK), orderDate, shippedDate, status, customerNumber (FK)
- orderdetails: orderNumber (PK, FK), productCode (PK, FK), quantityOrdered, priceEach

Examples:
- Top 5 products: SELECT p.productName, SUM(od.quantityOrdered) as total FROM products p JOIN orderdetails od ON p.productCode = od.productCode GROUP BY p.productCode ORDER BY total DESC LIMIT 5;
- Top customers: SELECT c.customerName, SUM(od.quantityOrdered * od.priceEach) as spent FROM customers c JOIN orders o ON c.customerNumber = o.customerNumber JOIN orderdetails od ON o.orderNumber = od.orderNumber GROUP BY c.customerNumber ORDER BY spent DESC LIMIT 5;
"""

@router.post("", response_model=ChatResponse)
async def chat_with_data(request: ChatRequest, db: Session = Depends(get_db)):
    if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
        return ChatResponse(response="Chào bạn! Chatbot chưa được cấu hình API Key. Vui lòng thêm GEMINI_API_KEY vào file .env nhé.")

    user_query = request.message

    # Step 1: Generate SQL
    sql_prompt = f"""
    {DB_SCHEMA_CONTEXT}
    Question: {user_query}
    Generate a valid MySQL SELECT query to answer this question. 
    Return ONLY the SQL query string, no markdown, no explanation.
    """
    
    try:
        sql_response = model.generate_content(sql_prompt)
        sql_query = sql_response.text.strip().replace("```sql", "").replace("```", "").strip()
        
        # Security Check: Only allow SELECT
        if not sql_query.upper().startswith("SELECT"):
            return ChatResponse(response="Xin lỗi, tôi chỉ có thể thực hiện các truy vấn truy xuất dữ liệu (SELECT).")

        # Step 2: Execute SQL
        result = db.execute(text(sql_query))
        rows = result.fetchall()
        data_str = str([dict(row._mapping) for row in rows])

        # Step 3: Generate Natural Language Answer
        answer_prompt = f"""
        {DB_SCHEMA_CONTEXT}
        User Question: {user_query}
        SQL Query Used: {sql_query}
        SQL Result Data: {data_str}
        
        Based on the data provided, answer the user's question in a friendly and professional manner in Vietnamese.
        If the data is empty, mention that no records were found.
        """
        
        final_response = model.generate_content(answer_prompt)
        
        return ChatResponse(
            response=final_response.text.strip(),
            sql=sql_query
        )
    except Exception as e:
        return ChatResponse(response=f"Đã có lỗi xảy ra khi xử lý yêu cầu: {str(e)}")
