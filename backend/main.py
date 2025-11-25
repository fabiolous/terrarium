from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, time
import logging
from apscheduler.schedulers.background import BackgroundScheduler

from database import SessionLocal, init_db, Reading, Settings
from hardware import hardware

from fastapi.staticfiles import StaticFiles
import os

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("terrarium")

app = FastAPI(title="Terrarium Control System")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev, restrict in prod if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Background Task for Control Loop
def control_loop():
    db = SessionLocal()
    try:
        settings = db.query(Settings).first()
        if not settings:
            return

        now = datetime.now()
        current_hour = now.hour
        current_time_str = now.strftime("%H:%M")

        # --- 1. Read Sensors ---
        hum1, temp1 = hardware.read_dht(1)
        hum2, temp2 = hardware.read_dht(2)

        # Log reading
        if temp1 is not None and temp2 is not None:
            reading = Reading(
                zone1_temp=temp1, zone1_humidity=hum1,
                zone2_temp=temp2, zone2_humidity=hum2
            )
            db.add(reading)
            db.commit()
            logger.info(f"Readings: Z1={temp1}C/{hum1}%, Z2={temp2}C/{hum2}%")

        # --- 2. Determine Target Temps (Day/Night) ---
        is_day = settings.day_start_hour <= current_hour < settings.night_start_hour
        
        target_temp1 = settings.zone1_target_temp_day if is_day else settings.zone1_target_temp_night
        target_temp2 = settings.zone2_target_temp_day if is_day else settings.zone2_target_temp_night

        # --- 3. Control Heaters (Hysteresis +/- 0.5) ---
        # Zone 1
        if temp1 is not None:
            if temp1 < target_temp1 - 0.5:
                hardware.set_relay('heat1', True)
            elif temp1 > target_temp1:
                hardware.set_relay('heat1', False)
        
        # Zone 2
        if temp2 is not None:
            if temp2 < target_temp2 - 0.5:
                hardware.set_relay('heat2', True)
            elif temp2 > target_temp2:
                hardware.set_relay('heat2', False)

        # --- 4. Control Lights ---
        # Light follows Day/Night cycle
        if is_day:
            hardware.set_relay('light1', True)
        else:
            hardware.set_relay('light1', False)

    except Exception as e:
        logger.error(f"Error in control loop: {e}")
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    init_db()
    scheduler = BackgroundScheduler()
    scheduler.add_job(control_loop, 'interval', seconds=10) # Run every 10 seconds
    scheduler.start()

@app.get("/api/status")
def get_status(db: Session = Depends(get_db)):
    # Get latest reading
    latest = db.query(Reading).order_by(Reading.timestamp.desc()).first()
    return {
        "hardware": hardware.state,
        "readings": latest
    }

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    # 12 hours ago
    from datetime import timedelta
    since = datetime.now() - timedelta(hours=12)
    readings = db.query(Reading).filter(Reading.timestamp >= since).order_by(Reading.timestamp.asc()).all()
    return readings

@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    return db.query(Settings).first()

@app.post("/api/settings")
def update_settings(new_settings: dict, db: Session = Depends(get_db)):
    settings = db.query(Settings).first()
    for key, value in new_settings.items():
        if hasattr(settings, key):
            setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

# Mount static files if directory exists (for production/single-server mode)
# Must be at the end to avoid shadowing API routes
static_dir = "../frontend/dist"
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
