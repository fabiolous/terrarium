# Deployment Guide for Raspberry Pi 3 Model B

## Prerequisites
- Raspberry Pi 3 Model B
- MicroSD Card (8GB+) with Raspberry Pi OS Lite
- 5V 2.5A+ Power Supply (Pi 3B requires more power than Pi Zero)
- 2x DHT21 (AM2301) Sensors
- 4-Channel Relay Module (Solid State or Mechanical)
- **Dual MOS Trigger Switch Module** (e.g., Amazon B095KTBXKC) for LED Dimming
- 12V LED Strip & Power Supply
- Internet connection

## Wiring (Default Configuration)

### 1. Sensors & Relays
| Device | GPIO Pin (BCM) | Physical Pin |
|--------|----------------|--------------|
| DHT Zone 1 | 4 | 7 |
| DHT Zone 2 | 17 | 11 |
| Heater 1 Relay | 27 | 13 |
| Heater 2 Relay | 22 | 15 |
| **Light (PWM)** | **18** | **12** |
| VCC | 5V / 3.3V | 2 / 1 |
| GND | GND | 6 / 9 |

### 2. LED Dimming (Dual MOS Module)
You have a module with two sections: **PWM IN** (2 pins) and **VOLTAGE OUT** (4 pins).

**1. PWM IN Section (Signal from Pi)**
This section connects to the Raspberry Pi to control the dimming.
-   **PWM / TRIG / +**: Connect to **GPIO 18** (Physical Pin 12).
    -   *Note: GPIO 18 is a special "Hardware PWM" pin, which is better for smooth dimming.*
-   **GND / -**: Connect to **Raspberry Pi GND** (Physical Pin 6, 9, 14, 20, or 25).

**2. VOLTAGE OUT Section (Power & LED)**
This section acts as a bridge. Power comes IN from your supply, goes through the module, and goes OUT to the LED.
-   **VIN+ / DC+**: Connect to **+12V** from your Power Supply.
-   **VIN- / DC-**: Connect to **GND** from your Power Supply.
-   **OUT+ / LOAD+**: Connect to **LED Strip Positive (+) wire**.
-   **OUT- / LOAD-**: Connect to **LED Strip Negative (-) wire**.

> [!TIP]
> Think of the "VOLTAGE OUT" block as having two sides: Input (from power supply) and Output (to LED).

## Installation Steps

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3-pip git nodejs npm libgpiod3
   ```

2. **Clone Repository**
   Copy the `terrarium` folder to your Pi (e.g., `/home/pi/terrarium`).

3. **Backend Setup**
   ```bash
   cd ~/terrarium/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Frontend Setup**
   ```bash
   cd ~/terrarium/frontend
   npm install
   npm run build
   ```

5. **Running the App**
   ```bash
   cd ~/terrarium/backend
   source venv/bin/activate
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

6. **Access the Application**
   - Open a browser and navigate to: `http://[pi-ip-address]:8000/`
   - Or use hostname: `http://hugo.local:8000/`

## Troubleshooting

### Frontend Build: "vite: Permission denied"
If you encounter `sh: 1: vite: Permission denied` during `npm run build`, this is caused by incorrect file permissions in `node_modules`.

**Solution:**
```bash
cd ~/terrarium/frontend
# Fix ownership (important: do NOT use sudo for npm)
sudo chown -R pi:pi node_modules
# Make binaries executable
chmod -R +x node_modules/.bin
# Try building again
npm run build
```

**Alternative:** Use `npx vite build` instead of `npm run build`.

> [!CAUTION]
> Never run `sudo npm install` - it causes permission conflicts. Always run npm commands as your regular user.

## Auto-Start (Systemd)
Create `/etc/systemd/system/terrarium.service`:
```ini
[Unit]
Description=Terrarium Control
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/terrarium/backend
ExecStart=/home/pi/terrarium/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable terrarium
sudo systemctl start terrarium
sudo systemctl status terrarium
```