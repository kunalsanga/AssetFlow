
class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
