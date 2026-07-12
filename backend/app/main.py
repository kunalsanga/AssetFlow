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
from app.models.audit import AuditCycle, AuditCycleStatus, AuditItem, AuditItemStatus
from app.models.maintenance_request import MaintenanceRequest
from app.core.security import get_password_hash
from datetime import date, datetime

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
                User(email="employee2@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="Jane Smith", role=UserRole.employee),
                User(email="arao@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="A. Rao", role=UserRole.employee),
                User(email="siqbal@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="S. Iqbal", role=UserRole.employee),
                User(email="rvarma@assetflow.com", hashed_password=get_password_hash("employee123"), full_name="R. Varma", role=UserRole.employee),
            ]
            for user in users_to_seed:
                db.add(user)
            db.commit()
            print("Successfully seeded users.")
            
        # Seed assets if empty
        if db.query(Asset).count() == 0:
            assets_to_seed = [
                Asset(asset_tag="AF-003", name="Dell laptop", serial_number="SN-DELL-003", model="Dell Latitude", status=AssetStatus.available, location="Desk E12", description="Core i7, 16GB RAM"),
                Asset(asset_tag="AF-9921", name="Office chair", serial_number="SN-CHAIR-9921", model="Herman Miller", status=AssetStatus.available, location="Desk E14", description="Ergonomic Office Chair"),
                Asset(asset_tag="AF-9838", name="Monitor", serial_number="SN-MONITOR-9838", model="Dell UltraSharp 27\"", status=AssetStatus.available, location="Desk E15", description="4K Monitor"),
                Asset(asset_tag="AF-0062", name="Projector bulb", serial_number="SN-PROJ-0062", model="Epson", status=AssetStatus.available, location="Conference Room A", description="Replacement bulb"),
                Asset(asset_tag="AF-0003", name="ac unit", serial_number="SN-AC-0003", model="Carrier", status=AssetStatus.under_maintenance, location="Server Room", description="Split AC Unit"),
                Asset(asset_tag="AF-0078", name="forklift", serial_number="SN-FORK-0078", model="Toyota", status=AssetStatus.under_maintenance, location="Warehouse B", description="Electric Forklift"),
                Asset(asset_tag="AF-897", name="Printer Jam", serial_number="SN-PRINT-0897", model="HP LaserJet", status=AssetStatus.under_maintenance, location="Mailroom", description="Office Printer"),
                Asset(asset_tag="AF-873", name="Chair repair", serial_number="SN-CHAIR-0873", model="Steelcase", status=AssetStatus.available, location="Breakroom", description="Task Chair"),
            ]
            for asset in assets_to_seed:
                db.add(asset)
            db.commit()
            print("Successfully seeded assets.")

        # Seed Audit Cycles if empty
        if db.query(AuditCycle).count() == 0:
            auditor = db.query(User).filter(User.email == "arao@assetflow.com").first()
            if auditor:
                cycle = AuditCycle(
                    name="Q3 audit: Engineering dept - 1-15 jul",
                    start_date=date(2026, 7, 1),
                    status=AuditCycleStatus.active,
                    auditor_id=auditor.id
                )
                db.add(cycle)
                db.commit()
                db.refresh(cycle)
                
                # Seed Audit Items for the cycle
                assets = db.query(Asset).all()
                for asset in assets:
                    status = AuditItemStatus.pending
                    notes = None
                    if asset.asset_tag == "AF-003":
                        status = AuditItemStatus.verified
                        notes = "Verified"
                    elif asset.asset_tag == "AF-9921":
                        status = AuditItemStatus.missing
                        notes = "Missing"
                    elif asset.asset_tag == "AF-9838":
                        status = AuditItemStatus.damaged
                        notes = "Damaged"
                        
                    item = AuditItem(
                        cycle_id=cycle.id,
                        asset_id=asset.id,
                        status=status,
                        notes=notes,
                        verified_at=datetime.utcnow() if status == AuditItemStatus.verified else None
                    )
                    db.add(item)
                db.commit()
                print("Successfully seeded audit cycles and items.")

        # Seed Maintenance Requests if empty
        if db.query(MaintenanceRequest).count() == 0:
            requester = db.query(User).filter(User.role == UserRole.employee).first()
            if requester:
                # Get seeded assets
                bulb = db.query(Asset).filter(Asset.asset_tag == "AF-0062").first()
                ac = db.query(Asset).filter(Asset.asset_tag == "AF-0003").first()
                forklift = db.query(Asset).filter(Asset.asset_tag == "AF-0078").first()
                printer = db.query(Asset).filter(Asset.asset_tag == "AF-897").first()
                chair = db.query(Asset).filter(Asset.asset_tag == "AF-873").first()
                
                reqs = []
                if bulb:
                    reqs.append(MaintenanceRequest(
                        asset_id=bulb.id,
                        requester_id=requester.id,
                        description="Projector bulb not turning on",
                        priority="HIGH",
                        status="PENDING"
                    ))
                if ac:
                    reqs.append(MaintenanceRequest(
                        asset_id=ac.id,
                        requester_id=requester.id,
                        description="ac unit noisy compressor",
                        priority="MEDIUM",
                        status="APPROVED"
                    ))
                if forklift:
                    reqs.append(MaintenanceRequest(
                        asset_id=forklift.id,
                        requester_id=requester.id,
                        description="forklift tech: R varma",
                        priority="HIGH",
                        status="ASSIGNED",
                        technician_name="R. Varma",
                        scheduled_date=date(2026, 7, 12)
                    ))
                if printer:
                    reqs.append(MaintenanceRequest(
                        asset_id=printer.id,
                        requester_id=requester.id,
                        description="Printer Jam parts ordered",
                        priority="MEDIUM",
                        status="IN_PROGRESS",
                        technician_name="R. Varma",
                        scheduled_date=date(2026, 7, 10)
                    ))
                if chair:
                    reqs.append(MaintenanceRequest(
                        asset_id=chair.id,
                        requester_id=requester.id,
                        description="Chair repair resolved 7 Jul",
                        priority="LOW",
                        status="RESOLVED",
                        scheduled_date=date(2026, 7, 7)
                    ))
                
                for r in reqs:
                    db.add(r)
                db.commit()
                print("Successfully seeded maintenance requests.")
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

