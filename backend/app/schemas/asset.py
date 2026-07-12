from typing import Optional
from pydantic import BaseModel
from app.models.asset import AssetStatus

# Shared properties
class AssetBase(BaseModel):
    name: Optional[str] = None
    serial_number: Optional[str] = None
    model: Optional[str] = None
    status: Optional[AssetStatus] = AssetStatus.available
    description: Optional[str] = None

# Properties to receive via API on creation
class AssetCreate(AssetBase):
    name: str
    serial_number: str
    model: str

# Properties to receive via API on update
class AssetUpdate(AssetBase):
    pass

# Properties shared by models stored in DB
class AssetInDBBase(AssetBase):
    id: Optional[int] = None

    model_config = {"from_attributes": True}

# Properties to return to client
class Asset(AssetInDBBase):
    pass
