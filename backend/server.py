from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, BackgroundTasks
from fastapi.security import HTTPBearer
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
import bcrypt
import jwt
import httpx
import asyncio
import resend
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'zeina_khazina_secret_2024')
JWT_ALGORITHM = "HS256"

# Admin Config
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'eng.mohamed87@live.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Realmadridclub2011')

# Resend Config for email
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Gold price tracking
last_gold_prices = {}
price_update_subscribers = []

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    picture: Optional[str] = None
    created_at: datetime

class GoldPriceResponse(BaseModel):
    karat: int
    price_per_gram_qar: float
    change_amount: float
    change_percent: float
    updated_at: datetime

class ProductCreate(BaseModel):
    type: str  # jewelry, qatari, gift, investment_bar
    title: str
    description: str
    price_qar: float
    karat: Optional[int] = None
    weight_grams: Optional[float] = None
    image_url: str
    merchant_name: Optional[str] = None
    stock: int = 10
    category: Optional[str] = None

class ProductResponse(BaseModel):
    product_id: str
    type: str
    title: str
    description: str
    price_qar: float
    karat: Optional[int] = None
    weight_grams: Optional[float] = None
    image_url: str
    merchant_name: Optional[str] = None
    stock: int
    category: Optional[str] = None
    is_active: bool = True

class WalletResponse(BaseModel):
    user_id: str
    gold_grams_total: float
    cash_qar: float
    updated_at: datetime

class TransactionCreate(BaseModel):
    type: str  # buy, sell, deposit, withdraw
    grams: Optional[float] = None
    amount_qar: Optional[float] = None

class TransactionResponse(BaseModel):
    transaction_id: str
    user_id: str
    type: str
    grams: Optional[float]
    price_qar: float
    status: str
    created_at: datetime

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1

class CartItemResponse(BaseModel):
    product_id: str
    quantity: int
    product: Optional[ProductResponse] = None

class OrderCreate(BaseModel):
    items: List[CartItemCreate]
    delivery_address: Optional[str] = None
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    items: List[dict]
    total_qar: float
    status: str
    payment_method: Optional[str]
    delivery_address: Optional[str]
    created_at: datetime

class ShariaAcceptance(BaseModel):
    accepted: bool

class MerchantCreate(BaseModel):
    name: str
    logo_url: str
    description: Optional[str] = None

class MerchantResponse(BaseModel):
    merchant_id: str
    name: str
    logo_url: str
    description: Optional[str] = None
    is_active: bool = True

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    token = request.cookies.get("session_token")
    # Then check Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="غير مصرح")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الجلسة")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="رمز غير صالح")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="غير مسموح - صلاحيات الأدمن مطلوبة")
    return user

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    # Create admin user if not exists
    admin = await db.users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
    if not admin:
        admin_user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "name": "Admin",
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "picture": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Admin user created")
    
    # Initialize gold prices if empty
    prices_count = await db.gold_prices.count_documents({})
    if prices_count == 0:
        await update_gold_prices()
    
    # Seed sample products if empty
    products_count = await db.products.count_documents({})
    if products_count == 0:
        await seed_sample_products()
    
    # Seed merchants if empty
    merchants_count = await db.merchants.count_documents({})
    if merchants_count == 0:
        await seed_sample_merchants()
    
    # Seed designers if empty
    designers_count = await db.designers.count_documents({})
    if designers_count == 0:
        await seed_qatari_designers()

async def seed_sample_merchants():
    merchants = [
        {"merchant_id": f"merchant_{uuid.uuid4().hex[:8]}", "name": "الرميزان", "logo_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=100&fit=crop", "is_active": True},
        {"merchant_id": f"merchant_{uuid.uuid4().hex[:8]}", "name": "مجوهرات المها", "logo_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop", "is_active": True},
        {"merchant_id": f"merchant_{uuid.uuid4().hex[:8]}", "name": "كنوز الخليج", "logo_url": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=100&h=100&fit=crop", "is_active": True},
        {"merchant_id": f"merchant_{uuid.uuid4().hex[:8]}", "name": "مجوهرات الدوحة", "logo_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop", "is_active": True},
    ]
    await db.merchants.insert_many(merchants)
    logger.info("Sample merchants seeded")

async def seed_qatari_designers():
    designers = [
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "أسماء السعدي", "brand": "Clair De Lune / كلير دي لون", "logo_url": "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&h=100&fit=crop", "specialty": "تصاميم عصرية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "فاطمة المهندي", "brand": "De Trove / دي تروف", "logo_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&h=100&fit=crop", "specialty": "تصاميم فاخرة", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "حصة وجواهر المناعي", "brand": "Ghand Jewellery / مجوهرات غند", "logo_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop", "specialty": "تصاميم تراثية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "حمد المحمد", "brand": "H Jewellery / مجوهرات H", "logo_url": "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=100&h=100&fit=crop", "specialty": "تصاميم رجالية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "سميرة الملا", "brand": "Hessa Jewels / مجوهرات حصة", "logo_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop", "specialty": "تصاميم كلاسيكية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "ليلى أبو عيسى", "brand": "Layla Issam Jewellery / مجوهرات ليلى عصام", "logo_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=100&h=100&fit=crop", "specialty": "تصاميم عصرية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "عبد الله يوسف فخرو", "brand": "Midad Jewellery / مجوهرات مداد", "logo_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&h=100&fit=crop", "specialty": "تصاميم خط عربي", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "نوف المير", "brand": "Nouf Jewellery / مجوهرات نوف", "logo_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=100&h=100&fit=crop", "specialty": "تصاميم ناعمة", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "فجر العطية", "brand": "Trifoglio Jewellery / مجوهرات تريفوجليو", "logo_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=100&h=100&fit=crop", "specialty": "تصاميم إيطالية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "مريم ونورة المعضادي", "brand": "Thameen / مجوهرات ثمين", "logo_url": "https://images.unsplash.com/photo-1627656688426-927a5d6c1a1e?w=100&h=100&fit=crop", "specialty": "تصاميم راقية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "شيخة الغانم", "brand": "Al Ghara Jewellery / مجوهرات الغلا", "logo_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop", "specialty": "تصاميم خليجية", "is_active": True},
        {"designer_id": f"designer_{uuid.uuid4().hex[:8]}", "name": "الدانة حمد الحنزاب", "brand": "DW Jewellery", "logo_url": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=100&h=100&fit=crop", "specialty": "تصاميم حديثة", "is_active": True},
    ]
    await db.designers.insert_many(designers)
    logger.info("Qatari designers seeded")
    
    # Seed designer products
    await seed_designer_products()

async def seed_sample_products():
    products = [
        # Investment bars
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "investment_bar", "title": "سبيكة ذهب 10 جرام", "description": "سبيكة ذهب نقي عيار 24", "price_qar": 2850, "karat": 24, "weight_grams": 10, "image_url": "https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=400", "merchant_name": "خزينة للذهب", "stock": 50, "category": "سبائك", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "investment_bar", "title": "سبيكة ذهب 50 جرام", "description": "سبيكة ذهب نقي عيار 24", "price_qar": 14250, "karat": 24, "weight_grams": 50, "image_url": "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400", "merchant_name": "خزينة للذهب", "stock": 30, "category": "سبائك", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "investment_bar", "title": "سبيكة ذهب 100 جرام", "description": "سبيكة ذهب نقي عيار 24", "price_qar": 28500, "karat": 24, "weight_grams": 100, "image_url": "https://images.unsplash.com/photo-1637597383958-d777c022e241?w=400", "merchant_name": "خزينة للذهب", "stock": 20, "category": "سبائك", "is_active": True},
        # Jewelry - Rings
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "خاتم الماس ملكي", "description": "خاتم ذهب مرصع بالألماس", "price_qar": 3450, "karat": 21, "weight_grams": 5, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", "merchant_name": "مجوهرات الدوحة", "stock": 15, "category": "خواتم", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "خاتم رجالي فاخر", "description": "خاتم ذهب رجالي كلاسيكي", "price_qar": 4800, "karat": 21, "weight_grams": 8, "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400", "merchant_name": "الرميزان", "stock": 10, "category": "خواتم", "is_active": True},
        # Jewelry - Necklaces
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "سلسلة ذهب قطرية", "description": "سلسلة ذهب فاخرة", "price_qar": 2200, "karat": 22, "weight_grams": 6, "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", "merchant_name": "كنوز الخليج", "stock": 20, "category": "سلاسل", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "قلادة أطفال", "description": "قلادة ذهب للأطفال", "price_qar": 1150, "karat": 18, "weight_grams": 3, "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", "merchant_name": "مجوهرات المها", "stock": 25, "category": "سلاسل", "is_active": True},
        # Jewelry - Bracelets
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "سوار ذهب قطري", "description": "سوار ذهب تقليدي", "price_qar": 8200, "karat": 22, "weight_grams": 25, "image_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400", "merchant_name": "كنوز الخليج", "stock": 12, "category": "أساور", "is_active": True},
        # Jewelry - Earrings
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "jewelry", "title": "أقراط ذهب كلاسيكية", "description": "أقراط ذهب نسائية أنيقة", "price_qar": 1800, "karat": 21, "weight_grams": 4, "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", "merchant_name": "الرميزان", "stock": 18, "category": "أقراط", "is_active": True},
        # Gifts
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "gift", "title": "هدية الزواج", "description": "طقم ذهب للعروس", "price_qar": 15000, "karat": 21, "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400", "merchant_name": "زينة للهدايا", "stock": 10, "category": "أعراس", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "gift", "title": "هدية المواليد", "description": "سوار ذهب للمولود الجديد", "price_qar": 2500, "karat": 18, "image_url": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400", "merchant_name": "زينة للهدايا", "stock": 20, "category": "مواليد", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "gift", "title": "هدية النجاح", "description": "ميدالية ذهب للتخرج", "price_qar": 1800, "karat": 21, "image_url": "https://images.unsplash.com/photo-1627656688426-927a5d6c1a1e?w=400", "merchant_name": "زينة للهدايا", "stock": 25, "category": "نجاح", "is_active": True},
    ]
    await db.products.insert_many(products)
    logger.info("Sample products seeded")

async def seed_designer_products():
    """Seed products from Qatari designers"""
    designer_products = [
        # Clair De Lune - أسماء السعدي
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "خاتم ضوء القمر", "description": "تصميم عصري مستوحى من ضوء القمر", "price_qar": 5200, "karat": 21, "weight_grams": 6, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", "designer_name": "أسماء السعدي", "brand": "كلير دي لون", "stock": 8, "category": "خواتم", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "سوار النجوم", "description": "سوار ذهب مرصع بالنجوم", "price_qar": 7800, "karat": 22, "weight_grams": 12, "image_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400", "designer_name": "أسماء السعدي", "brand": "كلير دي لون", "stock": 5, "category": "أساور", "is_active": True},
        # De Trove - فاطمة المهندي
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "قلادة الكنز", "description": "قلادة ذهب فاخرة بتصميم فريد", "price_qar": 9500, "karat": 22, "weight_grams": 15, "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", "designer_name": "فاطمة المهندي", "brand": "دي تروف", "stock": 4, "category": "سلاسل", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "أقراط الجوهرة", "description": "أقراط ذهب بتصميم راقي", "price_qar": 4200, "karat": 21, "weight_grams": 5, "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", "designer_name": "فاطمة المهندي", "brand": "دي تروف", "stock": 10, "category": "أقراط", "is_active": True},
        # Ghand Jewellery - حصة وجواهر المناعي
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "طقم غند التراثي", "description": "طقم ذهب تراثي قطري أصيل", "price_qar": 18500, "karat": 21, "weight_grams": 35, "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400", "designer_name": "حصة وجواهر المناعي", "brand": "مجوهرات غند", "stock": 3, "category": "أطقم", "is_active": True},
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "سوار غند الخليجي", "description": "سوار ذهب بنقوش خليجية", "price_qar": 6800, "karat": 22, "weight_grams": 10, "image_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400", "designer_name": "حصة وجواهر المناعي", "brand": "مجوهرات غند", "stock": 7, "category": "أساور", "is_active": True},
        # H Jewellery - حمد المحمد
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "خاتم H الرجالي", "description": "خاتم ذهب رجالي فاخر", "price_qar": 5500, "karat": 21, "weight_grams": 9, "image_url": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400", "designer_name": "حمد المحمد", "brand": "مجوهرات H", "stock": 6, "category": "خواتم", "is_active": True},
        # Hessa Jewels - سميرة الملا
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "سلسلة حصة الكلاسيكية", "description": "سلسلة ذهب بتصميم كلاسيكي أنيق", "price_qar": 3800, "karat": 21, "weight_grams": 7, "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", "designer_name": "سميرة الملا", "brand": "مجوهرات حصة", "stock": 12, "category": "سلاسل", "is_active": True},
        # Layla Issam - ليلى أبو عيسى
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "أقراط ليلى العصرية", "description": "أقراط بتصميم عصري مبتكر", "price_qar": 3200, "karat": 18, "weight_grams": 4, "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", "designer_name": "ليلى أبو عيسى", "brand": "مجوهرات ليلى عصام", "stock": 15, "category": "أقراط", "is_active": True},
        # Midad - عبد الله يوسف فخرو
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "قلادة مداد بالخط العربي", "description": "قلادة مزينة بالخط العربي", "price_qar": 6200, "karat": 21, "weight_grams": 8, "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", "designer_name": "عبد الله يوسف فخرو", "brand": "مجوهرات مداد", "stock": 9, "category": "سلاسل", "is_active": True},
        # Nouf Jewellery - نوف المير
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "خاتم نوف الناعم", "description": "خاتم بتصميم ناعم وأنثوي", "price_qar": 2900, "karat": 18, "weight_grams": 4, "image_url": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", "designer_name": "نوف المير", "brand": "مجوهرات نوف", "stock": 18, "category": "خواتم", "is_active": True},
        # Trifoglio - فجر العطية
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "سوار تريفوجليو الإيطالي", "description": "سوار بتصميم إيطالي فاخر", "price_qar": 8900, "karat": 22, "weight_grams": 14, "image_url": "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400", "designer_name": "فجر العطية", "brand": "مجوهرات تريفوجليو", "stock": 5, "category": "أساور", "is_active": True},
        # Thameen - مريم ونورة المعضادي
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "طقم ثمين الراقي", "description": "طقم ذهب راقي للمناسبات", "price_qar": 22000, "karat": 22, "weight_grams": 40, "image_url": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400", "designer_name": "مريم ونورة المعضادي", "brand": "مجوهرات ثمين", "stock": 2, "category": "أطقم", "is_active": True},
        # Al Ghara - شيخة الغانم
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "قلادة الغلا الخليجية", "description": "قلادة بتصميم خليجي أصيل", "price_qar": 7500, "karat": 21, "weight_grams": 12, "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400", "designer_name": "شيخة الغانم", "brand": "مجوهرات الغلا", "stock": 6, "category": "سلاسل", "is_active": True},
        # DW Jewellery - الدانة حمد الحنزاب
        {"product_id": f"prod_{uuid.uuid4().hex[:8]}", "type": "designer", "title": "أقراط DW الحديثة", "description": "أقراط بتصميم حديث ومميز", "price_qar": 4500, "karat": 21, "weight_grams": 5, "image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", "designer_name": "الدانة حمد الحنزاب", "brand": "DW Jewellery", "stock": 10, "category": "أقراط", "is_active": True},
    ]
    await db.products.insert_many(designer_products)
    logger.info("Designer products seeded")

async def update_gold_prices():
    """Fetch gold prices from free API and convert to QAR"""
    try:
        # Using metals.live free API
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.metals.live/v1/spot/gold", timeout=10)
            if response.status_code == 200:
                data = response.json()
                # Get USD price per ounce
                usd_per_oz = float(data[0].get('price', 2380)) if isinstance(data, list) else 2380
            else:
                usd_per_oz = 2380  # Fallback price
    except Exception as e:
        logger.error(f"Error fetching gold price: {e}")
        usd_per_oz = 2380  # Fallback price
    
    # Convert to QAR (1 USD = 3.64 QAR)
    qar_per_oz = usd_per_oz * 3.64
    # Convert to grams (1 oz = 31.1035 grams)
    qar_per_gram_24k = qar_per_oz / 31.1035
    
    # Calculate different karats
    prices = [
        {"karat": 24, "price_per_gram_qar": round(qar_per_gram_24k, 2), "change_amount": 3.75, "change_percent": 1.2},
        {"karat": 22, "price_per_gram_qar": round(qar_per_gram_24k * 22/24, 2), "change_amount": 2.30, "change_percent": 0.8},
        {"karat": 21, "price_per_gram_qar": round(qar_per_gram_24k * 21/24, 2), "change_amount": 2.10, "change_percent": 0.8},
        {"karat": 18, "price_per_gram_qar": round(qar_per_gram_24k * 18/24, 2), "change_amount": 1.50, "change_percent": 0.7},
    ]
    
    for price in prices:
        await db.gold_prices.update_one(
            {"karat": price["karat"]},
            {"$set": {**price, "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
    logger.info("Gold prices updated")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user: UserCreate, response: Response):
    existing = await db.users.find_one({"email": user.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مسجل مسبقاً")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "name": user.name,
        "email": user.email,
        "password_hash": hash_password(user.password),
        "role": "user",
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create wallet for user
    wallet = {
        "user_id": user_id,
        "gold_grams_total": 0.0,
        "cash_qar": 0.0,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wallets.insert_one(wallet)
    
    token = create_token(user_id, user.email, "user")
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"message": "تم التسجيل بنجاح", "token": token, "user": {"user_id": user_id, "name": user.name, "email": user.email, "role": "user"}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    token = create_token(user["user_id"], user["email"], user["role"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"message": "تم تسجيل الدخول بنجاح", "token": token, "user": {"user_id": user["user_id"], "name": user["name"], "email": user["email"], "role": user["role"], "picture": user.get("picture")}}

@api_router.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Process Emergent OAuth session_id"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id مطلوب")
    
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient() as http_client:
        resp = await http_client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="فشل التحقق من الجلسة")
        
        oauth_data = resp.json()
    
    # Check if user exists
    existing = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    
    if existing:
        user_id = existing["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": oauth_data["name"], "picture": oauth_data.get("picture")}}
        )
        role = existing["role"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "name": oauth_data["name"],
            "email": oauth_data["email"],
            "password_hash": "",
            "role": "user",
            "picture": oauth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        
        # Create wallet
        wallet = {
            "user_id": user_id,
            "gold_grams_total": 0.0,
            "cash_qar": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.wallets.insert_one(wallet)
        role = "user"
    
    token = create_token(user_id, oauth_data["email"], role)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {"message": "تم تسجيل الدخول بنجاح", "token": token, "user": {"user_id": user_id, "name": oauth_data["name"], "email": oauth_data["email"], "role": role, "picture": oauth_data.get("picture")}}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return {"user_id": user["user_id"], "name": user["name"], "email": user["email"], "role": user["role"], "picture": user.get("picture")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="session_token", path="/")
    return {"message": "تم تسجيل الخروج بنجاح"}

# ==================== GOLD PRICES ====================

@api_router.get("/gold-prices", response_model=List[GoldPriceResponse])
async def get_gold_prices():
    prices = await db.gold_prices.find({}, {"_id": 0}).to_list(10)
    for p in prices:
        if isinstance(p.get("updated_at"), str):
            p["updated_at"] = datetime.fromisoformat(p["updated_at"])
    return prices

@api_router.post("/gold-prices/refresh")
async def refresh_gold_prices():
    await update_gold_prices()
    return {"message": "تم تحديث الأسعار"}

# ==================== PRODUCTS ====================

@api_router.get("/products")
async def get_products(type: Optional[str] = None, category: Optional[str] = None):
    query = {"is_active": True}
    if type:
        query["type"] = type
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return product

# ==================== MERCHANTS ====================

@api_router.get("/merchants")
async def get_merchants():
    merchants = await db.merchants.find({"is_active": True}, {"_id": 0}).to_list(50)
    return merchants

# ==================== DESIGNERS ====================

@api_router.get("/designers")
async def get_designers():
    designers = await db.designers.find({"is_active": True}, {"_id": 0}).to_list(50)
    return designers

# ==================== WALLET ====================

@api_router.get("/wallet")
async def get_wallet(request: Request):
    user = await get_current_user(request)
    wallet = await db.wallets.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not wallet:
        wallet_doc = {
            "user_id": user["user_id"],
            "gold_grams_total": 0.0,
            "cash_qar": 0.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.wallets.insert_one(wallet_doc)
        # Return a clean copy without _id
        wallet = {
            "user_id": user["user_id"],
            "gold_grams_total": 0.0,
            "cash_qar": 0.0,
            "updated_at": wallet_doc["updated_at"]
        }
    return wallet

@api_router.post("/wallet/buy-gold")
async def buy_gold(request: Request, transaction: TransactionCreate):
    user = await get_current_user(request)
    
    # Get current 24K price
    price = await db.gold_prices.find_one({"karat": 24}, {"_id": 0})
    if not price:
        raise HTTPException(status_code=500, detail="أسعار الذهب غير متوفرة")
    
    grams = transaction.grams or 0
    total_cost = grams * price["price_per_gram_qar"]
    
    # Create transaction
    tx = {
        "transaction_id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "type": "buy",
        "grams": grams,
        "price_qar": total_cost,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(tx)
    
    # Update wallet
    await db.wallets.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"gold_grams_total": grams}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "تم الشراء بنجاح", "transaction": {k: v for k, v in tx.items() if k != "_id"}}

@api_router.post("/wallet/sell-gold")
async def sell_gold(request: Request, transaction: TransactionCreate):
    user = await get_current_user(request)
    
    wallet = await db.wallets.find_one({"user_id": user["user_id"]}, {"_id": 0})
    grams = transaction.grams or 0
    
    if not wallet or wallet["gold_grams_total"] < grams:
        raise HTTPException(status_code=400, detail="رصيد الذهب غير كافي")
    
    price = await db.gold_prices.find_one({"karat": 24}, {"_id": 0})
    total_value = grams * price["price_per_gram_qar"]
    
    tx = {
        "transaction_id": f"tx_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "type": "sell",
        "grams": grams,
        "price_qar": total_value,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.transactions.insert_one(tx)
    
    await db.wallets.update_one(
        {"user_id": user["user_id"]},
        {"$inc": {"gold_grams_total": -grams, "cash_qar": total_value}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "تم البيع بنجاح", "transaction": {k: v for k, v in tx.items() if k != "_id"}}

@api_router.get("/transactions")
async def get_transactions(request: Request):
    user = await get_current_user(request)
    transactions = await db.transactions.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return transactions

# ==================== SHARIA ACCEPTANCE ====================

@api_router.get("/sharia-acceptance")
async def get_sharia_acceptance(request: Request):
    user = await get_current_user(request)
    acceptance = await db.sharia_acceptance.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"accepted": acceptance.get("accepted", False) if acceptance else False}

@api_router.post("/sharia-acceptance")
async def accept_sharia(request: Request, data: ShariaAcceptance):
    user = await get_current_user(request)
    await db.sharia_acceptance.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"accepted": data.accepted, "accepted_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    return {"message": "تم حفظ الموافقة", "accepted": data.accepted}

# ==================== CART ====================

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request)
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart:
        return {"items": [], "total": 0}
    
    # Populate product details
    items_with_products = []
    total = 0
    for item in cart.get("items", []):
        # Check if it's a custom gold investment
        if item.get("is_gold_investment"):
            item["product"] = {
                "product_id": item["product_id"],
                "title": item["title"],
                "price_qar": item["total_price"],
                "image_url": item["image_url"],
                "karat": item["karat"],
                "weight_grams": item["grams"],
                "merchant_name": "زينة وخزينة - استثمار"
            }
            total += item["total_price"]
            items_with_products.append(item)
        else:
            product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
            if product:
                item["product"] = product
                total += product["price_qar"] * item["quantity"]
                items_with_products.append(item)
    
    return {"items": items_with_products, "total": total}

@api_router.post("/cart/add")
async def add_to_cart(request: Request, item: CartItemCreate):
    user = await get_current_user(request)
    
    product = await db.products.find_one({"product_id": item.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    if cart:
        # Check if item exists
        existing_item = next((i for i in cart["items"] if i["product_id"] == item.product_id), None)
        if existing_item:
            await db.carts.update_one(
                {"user_id": user["user_id"], "items.product_id": item.product_id},
                {"$inc": {"items.$.quantity": item.quantity}}
            )
        else:
            await db.carts.update_one(
                {"user_id": user["user_id"]},
                {"$push": {"items": {"product_id": item.product_id, "quantity": item.quantity}}}
            )
    else:
        await db.carts.insert_one({
            "user_id": user["user_id"],
            "items": [{"product_id": item.product_id, "quantity": item.quantity}]
        })
    
    return {"message": "تمت الإضافة للسلة"}

@api_router.put("/cart/update")
async def update_cart_item(request: Request, item: CartItemCreate):
    user = await get_current_user(request)
    
    if item.quantity <= 0:
        await db.carts.update_one(
            {"user_id": user["user_id"]},
            {"$pull": {"items": {"product_id": item.product_id}}}
        )
    else:
        await db.carts.update_one(
            {"user_id": user["user_id"], "items.product_id": item.product_id},
            {"$set": {"items.$.quantity": item.quantity}}
        )
    
    return {"message": "تم تحديث السلة"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(request: Request, product_id: str):
    user = await get_current_user(request)
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "تم الحذف من السلة"}

@api_router.delete("/cart/clear")
async def clear_cart(request: Request):
    user = await get_current_user(request)
    await db.carts.delete_one({"user_id": user["user_id"]})
    return {"message": "تم تفريغ السلة"}

# Add custom gold investment to cart
class GoldInvestmentItem(BaseModel):
    karat: int
    grams: float
    price_per_gram: float

@api_router.post("/cart/add-gold")
async def add_gold_to_cart(request: Request, item: GoldInvestmentItem):
    user = await get_current_user(request)
    
    # Create a custom product ID for this gold investment
    custom_product_id = f"gold_{item.karat}k_{item.grams}g_{uuid.uuid4().hex[:8]}"
    total_price = item.grams * item.price_per_gram
    
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    
    cart_item = {
        "product_id": custom_product_id,
        "quantity": 1,
        "is_gold_investment": True,
        "karat": item.karat,
        "grams": item.grams,
        "price_per_gram": item.price_per_gram,
        "total_price": total_price,
        "title": f"سبيكة ذهب عيار {item.karat} - {item.grams} جرام",
        "image_url": "https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=400"
    }
    
    if cart:
        await db.carts.update_one(
            {"user_id": user["user_id"]},
            {"$push": {"items": cart_item}}
        )
    else:
        await db.carts.insert_one({
            "user_id": user["user_id"],
            "items": [cart_item]
        })
    
    return {"message": "تمت إضافة الذهب للسلة", "item": cart_item}

# ==================== ORDERS ====================

@api_router.post("/orders")
async def create_order(request: Request, order: OrderCreate):
    user = await get_current_user(request)
    
    # Get cart items
    cart = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="السلة فارغة")
    
    # Calculate total
    items_details = []
    total = 0
    for item in cart["items"]:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if product:
            item_total = product["price_qar"] * item["quantity"]
            total += item_total
            items_details.append({
                "product_id": item["product_id"],
                "title": product["title"],
                "quantity": item["quantity"],
                "price_qar": product["price_qar"],
                "subtotal": item_total
            })
    
    order_doc = {
        "order_id": f"order_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "items": items_details,
        "total_qar": total,
        "status": "pending",
        "payment_method": "cash_on_delivery",
        "delivery_address": order.delivery_address,
        "coupon_code": order.coupon_code,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.delete_one({"user_id": user["user_id"]})
    
    return {"message": "تم إنشاء الطلب بنجاح", "order": {k: v for k, v in order_doc.items() if k != "_id"}}

@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(request: Request, order_id: str):
    user = await get_current_user(request)
    order = await db.orders.find_one({"order_id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return order

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await get_admin_user(request)
    
    users_count = await db.users.count_documents({"role": "user"})
    orders_count = await db.orders.count_documents({})
    products_count = await db.products.count_documents({})
    
    # Get total revenue
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$total_qar"}}}]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    return {
        "users_count": users_count,
        "orders_count": orders_count,
        "products_count": products_count,
        "total_revenue_qar": total_revenue
    }

@api_router.get("/admin/orders")
async def admin_get_orders(request: Request):
    await get_admin_user(request)
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def admin_update_order_status(request: Request, order_id: str, status: str):
    await get_admin_user(request)
    result = await db.orders.update_one({"order_id": order_id}, {"$set": {"status": status}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return {"message": "تم تحديث حالة الطلب"}

@api_router.post("/admin/products")
async def admin_create_product(request: Request, product: ProductCreate):
    await get_admin_user(request)
    
    product_doc = {
        "product_id": f"prod_{uuid.uuid4().hex[:8]}",
        **product.model_dump(),
        "is_active": True
    }
    await db.products.insert_one(product_doc)
    return {"message": "تم إنشاء المنتج", "product": {k: v for k, v in product_doc.items() if k != "_id"}}

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(request: Request, product_id: str, product: ProductCreate):
    await get_admin_user(request)
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": product.model_dump()}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return {"message": "تم تحديث المنتج"}

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(request: Request, product_id: str):
    await get_admin_user(request)
    result = await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="المنتج غير موجود")
    return {"message": "تم حذف المنتج"}

@api_router.post("/admin/merchants")
async def admin_create_merchant(request: Request, merchant: MerchantCreate):
    await get_admin_user(request)
    
    merchant_doc = {
        "merchant_id": f"merchant_{uuid.uuid4().hex[:8]}",
        **merchant.model_dump(),
        "is_active": True
    }
    await db.merchants.insert_one(merchant_doc)
    return {"message": "تم إنشاء المتجر", "merchant": {k: v for k, v in merchant_doc.items() if k != "_id"}}

@api_router.get("/admin/users")
async def admin_get_users(request: Request):
    await get_admin_user(request)
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(100)
    return users

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "زينة وخزينة API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
