# Deployment Guide for Raspberry Pi Zero

## Prerequisites
- Raspberry Pi Zero W (with headers)
- MicroSD Card (8GB+) with Raspberry Pi OS Lite
- 2x DHT21 (AM2301) Sensors
- 4-Channel Relay Module (Solid State or Mechanical)
- Internet connection

## Wiring (Default Configuration)
| Device | GPIO Pin (BCM) | Physical Pin |
|--------|----------------|--------------|
| DHT Zone 1 | 4 | 7 |
| DHT Zone 2 | 17 | 11 |
| Heater 1 Relay | 27 | 13 |
| Heater 2 Relay | 22 | 15 |
| Light Relay | 23 | 16 |
| VCC | 5V / 3.3V | 2 / 1 |
| GND | GND | 6 / 9 |

## Installation Steps

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3-pip git nodejs npm
   ```

2. **Clone Repository**
   Copy the `terrarium` folder to your Pi (e.g., `/home/pi/terrarium`).

3. **Backend Setup**
   ```bash
   cd ~/terrarium/backend
   # Install system dependencies for Adafruit_DHT
   sudo apt install -y libgpiod2
   # Create venv (optional but recommended)
   python3 -m venv venv
   source venv/bin/activate
   # Install requirements
   pip install -r requirements.txt
   # Note: If Adafruit_DHT fails, you might need to install it via apt or use specific guide for Pi Zero
   ```

4. **Frontend Setup**
   The frontend is built on your main machine and served by the backend or a separate web server (nginx).
   For simplicity, we can build it locally and copy the `dist` folder.
   
   **On your PC:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   Copy the `frontend/dist` folder to the Pi.

5. **Running the App**
   You can run the backend and serve the frontend static files.
   (Note: The current backend code needs a small update to serve static files if you want a single-server deployment).

   **Update `backend/main.py` to serve static files:**
   ```python
   from fastapi.staticfiles import StaticFiles
   # ... after app creation ...
   app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
   ```

   **Run Server:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 80
   ```

## Auto-Start (Systemd)
Create `/etc/systemd/system/terrarium.service`:
```ini
[Unit]
Description=Terrarium Control
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/terrarium/backend
ExecStart=/home/pi/terrarium/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 80
Restart=always

[Install]
WantedBy=multi-user.target
```
Enable it: `sudo systemctl enable terrarium`
