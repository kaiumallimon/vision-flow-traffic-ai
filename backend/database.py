from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root@localhost:3306/zul_ai_advisor"
# For now, let's use SQLite for faster testing, then swap to XAMPP MySQL later
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DetectionHistory(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    object_name = Column(String(100))
    advice = Column(Text)
    image_path = Column(String(255))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()