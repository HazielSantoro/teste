from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import aiofiles
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
SECRET_KEY = os.environ.get('JWT_SECRET', 'super-secret-key-3d-print-master-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Upload directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="3D Print Master API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = "client"  # admin or client

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class MaterialBase(BaseModel):
    name: str
    color: str
    price_per_gram: float
    available: bool = True
    description: Optional[str] = None

class MaterialCreate(MaterialBase):
    pass

class Material(MaterialBase):
    id: str
    created_at: datetime

class OrderBase(BaseModel):
    client_id: str
    client_name: str
    client_email: str
    material_id: str
    material_name: str
    file_name: str
    file_url: Optional[str] = None
    quantity: int = 1
    weight_grams: float
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None

class OrderCreate(BaseModel):
    material_id: str
    quantity: int = 1
    weight_grams: float
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    material_id: Optional[str] = None
    quantity: Optional[int] = None
    weight_grams: Optional[float] = None
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None
    total_price: Optional[float] = None

class Order(OrderBase):
    id: str
    status: str  # pending, printing, completed, delivered, cancelled
    total_price: float
    created_at: datetime
    updated_at: datetime

class DashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    printing_orders: int
    completed_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: float
    monthly_revenue: float
    total_clients: int
    orders_this_month: int

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas administradores.")
    return current_user

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "phone": user_data.phone,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token({"sub": user_id, "role": user_data.role})
    
    user_response = User(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        role=user_data.role,
        created_at=datetime.now(timezone.utc)
    )
    
    return Token(access_token=access_token, user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    
    created_at = user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    user_response = User(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        phone=user.get("phone"),
        role=user["role"],
        created_at=created_at
    )
    
    return Token(access_token=access_token, user=user_response)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    created_at = current_user["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return User(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        phone=current_user.get("phone"),
        role=current_user["role"],
        created_at=created_at
    )

# ==================== MATERIALS ROUTES ====================

@api_router.post("/materials", response_model=Material)
async def create_material(material: MaterialCreate, admin: dict = Depends(get_admin_user)):
    material_id = str(uuid.uuid4())
    material_doc = {
        "id": material_id,
        **material.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.materials.insert_one(material_doc)
    
    return Material(id=material_id, **material.model_dump(), created_at=datetime.now(timezone.utc))

@api_router.get("/materials", response_model=List[Material])
async def get_materials(current_user: dict = Depends(get_current_user)):
    materials = await db.materials.find({}, {"_id": 0}).to_list(100)
    result = []
    for m in materials:
        created_at = m["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        result.append(Material(**{**m, "created_at": created_at}))
    return result

@api_router.put("/materials/{material_id}", response_model=Material)
async def update_material(material_id: str, material: MaterialCreate, admin: dict = Depends(get_admin_user)):
    existing = await db.materials.find_one({"id": material_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    await db.materials.update_one(
        {"id": material_id},
        {"$set": material.model_dump()}
    )
    
    updated = await db.materials.find_one({"id": material_id}, {"_id": 0})
    created_at = updated["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return Material(**{**updated, "created_at": created_at})

@api_router.delete("/materials/{material_id}")
async def delete_material(material_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    return {"message": "Material excluído com sucesso"}

# ==================== ORDERS ROUTES ====================

@api_router.post("/orders", response_model=Order)
async def create_order(
    order: OrderCreate,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate material
    material = await db.materials.find_one({"id": order.material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ['.stl', '.obj', '.3mf', '.gcode']:
        raise HTTPException(status_code=400, detail="Formato de arquivo não suportado")
    
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Calculate price
    total_price = round(material["price_per_gram"] * order.weight_grams * order.quantity, 2)
    
    order_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    order_doc = {
        "id": order_id,
        "client_id": current_user["id"],
        "client_name": current_user["name"],
        "client_email": current_user["email"],
        "material_id": order.material_id,
        "material_name": material["name"],
        "file_name": file.filename,
        "file_url": str(file_path),
        "quantity": order.quantity,
        "weight_grams": order.weight_grams,
        "notes": order.notes,
        "delivery_date": order.delivery_date.isoformat() if order.delivery_date else None,
        "status": "pending",
        "total_price": total_price,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(
        **{k: v for k, v in order_doc.items() if k not in ['created_at', 'updated_at', 'delivery_date']},
        created_at=now,
        updated_at=now,
        delivery_date=order.delivery_date
    )

@api_router.post("/orders/admin", response_model=Order)
async def create_order_admin(
    client_id: str = Query(...),
    material_id: str = Query(...),
    file_name: str = Query(...),
    quantity: int = Query(1),
    weight_grams: float = Query(...),
    notes: Optional[str] = Query(None),
    delivery_date: Optional[str] = Query(None),
    admin: dict = Depends(get_admin_user)
):
    # Validate client
    client = await db.users.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Validate material
    material = await db.materials.find_one({"id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material não encontrado")
    
    # Calculate price
    total_price = round(material["price_per_gram"] * weight_grams * quantity, 2)
    
    order_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    parsed_delivery = None
    if delivery_date:
        try:
            parsed_delivery = datetime.fromisoformat(delivery_date.replace('Z', '+00:00'))
        except:
            pass
    
    order_doc = {
        "id": order_id,
        "client_id": client_id,
        "client_name": client["name"],
        "client_email": client["email"],
        "material_id": material_id,
        "material_name": material["name"],
        "file_name": file_name,
        "file_url": None,
        "quantity": quantity,
        "weight_grams": weight_grams,
        "notes": notes,
        "delivery_date": parsed_delivery.isoformat() if parsed_delivery else None,
        "status": "pending",
        "total_price": total_price,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(
        **{k: v for k, v in order_doc.items() if k not in ['created_at', 'updated_at', 'delivery_date']},
        created_at=now,
        updated_at=now,
        delivery_date=parsed_delivery
    )

@api_router.get("/orders", response_model=List[Order])
async def get_orders(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    
    # If not admin, only show user's orders
    if current_user["role"] != "admin":
        query["client_id"] = current_user["id"]
    
    if status:
        query["status"] = status
    
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    result = []
    for o in orders:
        created_at = o["created_at"]
        updated_at = o["updated_at"]
        delivery_date = o.get("delivery_date")
        
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        if isinstance(updated_at, str):
            updated_at = datetime.fromisoformat(updated_at)
        if isinstance(delivery_date, str):
            delivery_date = datetime.fromisoformat(delivery_date)
        
        result.append(Order(**{
            **{k: v for k, v in o.items() if k not in ['created_at', 'updated_at', 'delivery_date']},
            "created_at": created_at,
            "updated_at": updated_at,
            "delivery_date": delivery_date
        }))
    
    return result

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    query = {"id": order_id}
    if current_user["role"] != "admin":
        query["client_id"] = current_user["id"]
    
    order = await db.orders.find_one(query, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    created_at = order["created_at"]
    updated_at = order["updated_at"]
    delivery_date = order.get("delivery_date")
    
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    if isinstance(delivery_date, str):
        delivery_date = datetime.fromisoformat(delivery_date)
    
    return Order(**{
        **{k: v for k, v in order.items() if k not in ['created_at', 'updated_at', 'delivery_date']},
        "created_at": created_at,
        "updated_at": updated_at,
        "delivery_date": delivery_date
    })

@api_router.put("/orders/{order_id}", response_model=Order)
async def update_order(order_id: str, update: OrderUpdate, admin: dict = Depends(get_admin_user)):
    existing = await db.orders.find_one({"id": order_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    if "delivery_date" in update_data and update_data["delivery_date"]:
        update_data["delivery_date"] = update_data["delivery_date"].isoformat()
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # If material changed, update price
    if "material_id" in update_data:
        material = await db.materials.find_one({"id": update_data["material_id"]}, {"_id": 0})
        if material:
            update_data["material_name"] = material["name"]
            weight = update_data.get("weight_grams", existing.get("weight_grams", 0))
            qty = update_data.get("quantity", existing.get("quantity", 1))
            update_data["total_price"] = round(material["price_per_gram"] * weight * qty, 2)
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    created_at = updated["created_at"]
    updated_at = updated["updated_at"]
    delivery_date = updated.get("delivery_date")
    
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at)
    if isinstance(delivery_date, str):
        delivery_date = datetime.fromisoformat(delivery_date)
    
    return Order(**{
        **{k: v for k, v in updated.items() if k not in ['created_at', 'updated_at', 'delivery_date']},
        "created_at": created_at,
        "updated_at": updated_at,
        "delivery_date": delivery_date
    })

@api_router.delete("/orders/{order_id}")
async def delete_order(order_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return {"message": "Pedido excluído com sucesso"}

# ==================== CLIENTS ROUTES (ADMIN) ====================

@api_router.get("/clients", response_model=List[User])
async def get_clients(admin: dict = Depends(get_admin_user)):
    clients = await db.users.find({"role": "client"}, {"_id": 0, "password": 0}).to_list(1000)
    result = []
    for c in clients:
        created_at = c["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        result.append(User(**{**c, "created_at": created_at}))
    return result

@api_router.get("/clients/{client_id}", response_model=User)
async def get_client(client_id: str, admin: dict = Depends(get_admin_user)):
    client = await db.users.find_one({"id": client_id, "role": "client"}, {"_id": 0, "password": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    created_at = client["created_at"]
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return User(**{**client, "created_at": created_at})

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": client_id, "role": "client"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Also delete client's orders
    await db.orders.delete_many({"client_id": client_id})
    
    return {"message": "Cliente e pedidos excluídos com sucesso"}

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(admin: dict = Depends(get_admin_user)):
    # Get all orders
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    
    # Calculate stats
    total_orders = len(all_orders)
    pending = sum(1 for o in all_orders if o["status"] == "pending")
    printing = sum(1 for o in all_orders if o["status"] == "printing")
    completed = sum(1 for o in all_orders if o["status"] == "completed")
    delivered = sum(1 for o in all_orders if o["status"] == "delivered")
    cancelled = sum(1 for o in all_orders if o["status"] == "cancelled")
    
    total_revenue = sum(o["total_price"] for o in all_orders if o["status"] in ["completed", "delivered"])
    
    # Monthly stats
    now = datetime.now(timezone.utc)
    first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_orders = []
    for o in all_orders:
        created_at = o["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        if created_at >= first_day:
            monthly_orders.append(o)
    
    monthly_revenue = sum(o["total_price"] for o in monthly_orders if o["status"] in ["completed", "delivered"])
    orders_this_month = len(monthly_orders)
    
    # Total clients
    total_clients = await db.users.count_documents({"role": "client"})
    
    return DashboardStats(
        total_orders=total_orders,
        pending_orders=pending,
        printing_orders=printing,
        completed_orders=completed,
        delivered_orders=delivered,
        cancelled_orders=cancelled,
        total_revenue=round(total_revenue, 2),
        monthly_revenue=round(monthly_revenue, 2),
        total_clients=total_clients,
        orders_this_month=orders_this_month
    )

@api_router.get("/dashboard/chart-data")
async def get_chart_data(admin: dict = Depends(get_admin_user)):
    all_orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    
    # Group by month
    monthly_data = {}
    for o in all_orders:
        created_at = o["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        month_key = created_at.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {"orders": 0, "revenue": 0}
        
        monthly_data[month_key]["orders"] += 1
        if o["status"] in ["completed", "delivered"]:
            monthly_data[month_key]["revenue"] += o["total_price"]
    
    # Convert to list sorted by month
    chart_data = [
        {"month": k, "orders": v["orders"], "revenue": round(v["revenue"], 2)}
        for k, v in sorted(monthly_data.items())
    ][-12:]  # Last 12 months
    
    return chart_data

# ==================== PUBLIC TRACKING ====================

@api_router.get("/track/{order_id}")
async def track_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    # Return limited info for public tracking
    return {
        "id": order["id"],
        "status": order["status"],
        "material_name": order["material_name"],
        "created_at": order["created_at"],
        "delivery_date": order.get("delivery_date")
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "3D Print Master API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
