from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./terrarium.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Reading(Base):
    __tablename__ = "readings"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.now)
    zone1_temp = Column(Float)
    zone1_humidity = Column(Float)
    zone2_temp = Column(Float)
    zone2_humidity = Column(Float)

class Settings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    # Zone 1
    zone1_target_temp_day = Column(Float, default=28.0)
    zone1_target_temp_night = Column(Float, default=22.0)
    # Zone 2
    zone2_target_temp_day = Column(Float, default=30.0)
    zone2_target_temp_night = Column(Float, default=24.0)
    
    # Timing
    day_start_hour = Column(Integer, default=8)
    night_start_hour = Column(Integer, default=20)
    
    # Lights
    light1_on_time = Column(String, default="08:00") # HH:MM
    light1_off_time = Column(String, default="20:00")

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Create default settings if not exists
    db = SessionLocal()
    if not db.query(Settings).first():
        default_settings = Settings()
        db.add(default_settings)
        db.commit()
    db.close()
