# Backend Endpoints المطلوبة لإدارة المستخدمين والإحصائيات

## 📋 الإحصائيات في Dashboard

### 1. احصائيات عامة (مطلوبة)
```python
@api_router.get("/admin/stats")
async def get_admin_stats():
    return {
        "orders_count": await orders_collection.count_documents({}),
        "products_count": await products_collection.count_documents({}),
        "users_count": await users_collection.count_documents({}),
        "total_revenue_qar": await calculate_total_revenue()  # حساب الإيرادات
    }
```

### 2. إحصائيات المستخدمين
```python
@api_router.get("/admin/users/stats")
async def get_users_stats():
    total = await users_collection.count_documents({})
    admins = await users_collection.count_documents({"role": "admin"})
    customers = await users_collection.count_documents({"role": "customer"})
    active = await users_collection.count_documents({"isActive": True})
    verified = await users_collection.count_documents({"isVerified": True})
    
    return {
        "total": total,
        "admins": admins,
        "customers": customers,
        "active": active,
        "inactive": total - active,
        "verified": verified,
        "unverified": total - verified
    }
```

### 3. عدد المستخدمين (للتوافق القديم)
```python
@api_router.get("/admin/users/count")
async def get_users_count():
    count = await users_collection.count_documents({})
    return {"count": count}
```

---

## 👥 إدارة المستخدمين

### 1. جلب قائمة المستخدمين
```python
@api_router.get("/admin/users")
async def get_users(
    search: Optional[str] = None,
    role: Optional[str] = None
):
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    if role:
        query["role"] = role
    
    users = await users_collection.find(query).to_list(1000)
    
    # تحويل ObjectId إلى string
    for user in users:
        user["user_id"] = str(user["_id"])
        del user["_id"]
        # لا ترسل كلمة المرور!
        if "password" in user:
            del user["password"]
    
    return users
```

### 2. جلب مستخدم واحد
```python
@api_router.get("/admin/users/{user_id}")
async def get_user_by_id(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["user_id"] = str(user["_id"])
    del user["_id"]
    
    # لا ترسل كلمة المرور!
    if "password" in user:
        del user["password"]
    
    return user
```

### 3. **تحديث دور المستخدم (الأهم!) - منح/إزالة Admin**
```python
from pydantic import BaseModel

class RoleUpdate(BaseModel):
    role: str  # "admin" أو "customer"

@api_router.put("/admin/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_update: RoleUpdate,
    current_user: dict = Depends(get_current_user)
):
    # تأكد أن المستخدم الحالي هو admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # لا تسمح بتغيير دور نفسك
    if str(current_user.get("_id")) == user_id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    
    # التحقق من الدور الجديد
    if role_update.role not in ["admin", "customer"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    # تحديث الدور
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": role_update.role, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Role updated successfully", "role": role_update.role}
```

### 4. حظر/إلغاء حظر المستخدم
```python
class BlockUpdate(BaseModel):
    isBlocked: bool

@api_router.put("/admin/users/{user_id}/block")
async def toggle_user_block(
    user_id: str,
    block_update: BlockUpdate,
    current_user: dict = Depends(get_current_user)
):
    # تأكد أن المستخدم الحالي هو admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # لا تسمح بحظر نفسك
    if str(current_user.get("_id")) == user_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")
    
    # تحديث حالة الحظر
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"isBlocked": block_update.isBlocked, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Block status updated", "isBlocked": block_update.isBlocked}
```

### 5. جلب طلبات المستخدم
```python
@api_router.get("/admin/users/{user_id}/orders")
async def get_user_orders(user_id: str):
    orders = await orders_collection.find({"user_id": user_id}).to_list(100)
    
    # تحويل ObjectId
    for order in orders:
        order["order_id"] = str(order["_id"])
        del order["_id"]
    
    return orders
```

### 6. حذف مستخدم
```python
@api_router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    # تأكد أن المستخدم الحالي هو admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # لا تسمح بحذف نفسك
    if str(current_user.get("_id")) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}
```

---

## 📊 بقية Endpoints الإحصائيات

### إحصائيات المحلات
```python
@api_router.get("/admin/shops/stats")
async def get_shops_stats():
    total = await shops_collection.count_documents({})
    jewelry = await shops_collection.count_documents({"type": "jewelry"})
    gifts = await shops_collection.count_documents({"type": "gifts"})
    active = await shops_collection.count_documents({"isActive": True})
    
    return {
        "total": total,
        "jewelry": jewelry,
        "gifts": gifts,
        "active": active,
        "inactive": total - active
    }
```

### إحصائيات المصممات
```python
@api_router.get("/admin/designers/stats")
async def get_designers_stats():
    total = await designers_collection.count_documents({})
    # حساب عدد المنتجات لكل المصممات
    total_products = await products_collection.count_documents({"designer_id": {"$exists": True}})
    
    return {
        "total": total,
        "active": total,  # يمكنك إضافة حقل isActive للمصممات
        "total_products": total_products
    }
```

### إحصائيات المنتجات
```python
@api_router.get("/admin/products/stats")
async def get_products_stats():
    total = await products_collection.count_documents({})
    jewelry = await products_collection.count_documents({"type": "jewelry"})
    designer = await products_collection.count_documents({"type": "designer"})
    gifts = await products_collection.count_documents({"type": "gift"})
    in_stock = await products_collection.count_documents({"stock": {"$gt": 0}})
    
    return {
        "total": total,
        "jewelry": jewelry,
        "designer": designer,
        "gifts": gifts,
        "in_stock": in_stock,
        "out_of_stock": total - in_stock
    }
```

---

## 🔧 كيفية التطبيق في `backend/server.py`

### 1. أضف هذه الـ imports في البداية:
```python
from datetime import datetime
from bson import ObjectId
from typing import Optional
```

### 2. أضف الـ endpoints في قسم Admin Routes
```python
# بعد @app.on_event("startup")
# وقبل if __name__ == "__main__"

# ضع كل الـ endpoints أعلاه هنا
```

### 3. تأكد من وجود middleware للتحقق من Admin:
```python
async def get_current_user(request: Request):
    # استخرج token من header أو cookie
    # تحقق من صحة token
    # أرجع بيانات المستخدم
    pass
```

---

## ✅ التحقق من عمل الـ Endpoints

### اختبار باستخدام curl:
```bash
# 1. جلب الإحصائيات
curl http://localhost:8000/api/admin/stats

# 2. جلب المستخدمين
curl http://localhost:8000/api/admin/users

# 3. تغيير دور مستخدم
curl -X PUT http://localhost:8000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## 🚨 المشكلة الحالية

**السبب:**
- الـ Backend لا يحتوي على هذه الـ endpoints
- Frontend يحاول الاتصال لكن يفشل
- لذلك القراءات تظهر 0 أو 1 فقط

**الحل:**
1. أضف الـ endpoints أعلاه في `backend/server.py`
2. أعد تشغيل Backend
3. سيعمل كل شيء بشكل صحيح!

---

## 📝 ملاحظات مهمة

1. **لا ترسل كلمة المرور في API responses**
2. **تحقق دائماً من صلاحيات Admin**
3. **لا تسمح للمستخدم بتعديل نفسه**
4. **استخدم ObjectId للتحويل من/إلى MongoDB**
5. **أضف timestamps (createdAt, updatedAt)**
