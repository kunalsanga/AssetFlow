from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.session import engine
from app.db.base_class import Base
import app.models
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.asset import Asset, AssetStatus
from app.core.security import get_password_hash

# Create all tables in the database
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        # Seed users if empty
        if db.query(User).count() == 0:
            users_to_seed = [
                User(email="admin@assetflow.com", hashed_password=get_password_hash("admin123"), full_name="Admin User", role=UserRole.admin),
                User(email="manager@assetflow.com", hashed_password=get_password_hash("manager123"), full_name="Asset Manager", role=UserRole.asset_manager),
                User(email="employee@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="John Doe", role=UserRole.employee),
                User(email="employee2@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="Jane Smith", role=UserRole.employee)
            ]
            for user in users_to_seed:
                db.add(user)
            db.commit()
            print("Successfully seeded users.")
            
        # Seed assets if empty
        if db.query(Asset).count() == 0:
            assets_to_seed = [
                Asset(asset_tag="MAC-001", name="MacBook Pro 16\"", serial_number="SN-MBP16-001", model="Apple MacBook Pro", status=AssetStatus.available, description="M2 Max, 32GB RAM, 1TB SSD"),
                Asset(asset_tag="DEL-001", name="Dell XPS 15", serial_number="SN-XPS15-002", model="Dell XPS", status=AssetStatus.available, description="Intel i9, 32GB RAM, 1TB SSD"),
                Asset(asset_tag="IPA-001", name="iPad Pro 12.9\"", serial_number="SN-IPAD-003", model="Apple iPad Pro", status=AssetStatus.available, description="M1, 256GB, Wi-Fi"),
                Asset(asset_tag="THI-001", name="ThinkPad X1 Carbon", serial_number="SN-TPAD-004", model="Lenovo ThinkPad", status=AssetStatus.available, description="Intel i7, 16GB RAM, 512GB SSD"),
                Asset(asset_tag="SON-001", name="Sony WH-1000XM4", serial_number="SN-SONY-005", model="Sony Headphones", status=AssetStatus.available, description="Active Noise Cancelling Headphones")
            ]
            for asset in assets_to_seed:
                db.add(asset)
            db.commit()
            print("Successfully seeded assets.")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

seed_db()

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

from fastapi.responses import JSONResponse
from app.exceptions import AssetFlowException

@app.exception_handler(AssetFlowException)
async def assetflow_exception_handler(request, exc: AssetFlowException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message
        }
    )


@app.get("/")
def root():
    return {"message": "Welcome to AssetFlow API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

