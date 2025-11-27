import platform
import logging
import random
import time

logger = logging.getLogger("terrarium")

# Detect if running on Raspberry Pi
IS_PI = platform.system() == "Linux" and platform.machine().startswith("arm")

if IS_PI:
    try:
        import RPi.GPIO as GPIO
        import Adafruit_DHT
    except ImportError:
        logger.warning("RPi.GPIO or Adafruit_DHT not found, falling back to Mock mode.")
        IS_PI = False

# Pin Configuration (BCM)
# Adjust these pins as needed
PIN_DHT_ZONE1 = 4
PIN_DHT_ZONE2 = 17
PIN_RELAY_HEAT1 = 27
PIN_RELAY_HEAT2 = 22
PIN_RELAY_LIGHT1 = 12 # Hardware PWM Pin

class HardwareManager:
    def __init__(self):
        self.mock_mode = not IS_PI
        self.state = {
            "heat1": False,
            "heat2": False,
            "light1": False,
            "light_pwm": 0
        }
        
        # Mock data simulation
        self.mock_temps = {1: 25.0, 2: 25.0}
        self.mock_hums = {1: 60.0, 2: 60.0}

        if not self.mock_mode:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(PIN_RELAY_HEAT1, GPIO.OUT)
            GPIO.setup(PIN_RELAY_HEAT2, GPIO.OUT)
            GPIO.setup(PIN_RELAY_LIGHT1, GPIO.OUT)
            # Initialize off
            self._write_gpio(PIN_RELAY_HEAT1, False)
            self._write_gpio(PIN_RELAY_HEAT2, False)
            
            # Initialize PWM for Light
            self.pwm_light = GPIO.PWM(PIN_RELAY_LIGHT1, 1000) # 1kHz frequency
            self.pwm_light.start(0)
            
            logger.info("Hardware initialized in PI mode")
        else:
            logger.info("Hardware initialized in MOCK mode")

    def _write_gpio(self, pin, value):
        if not self.mock_mode:
            GPIO.output(pin, GPIO.HIGH if value else GPIO.LOW)

    def set_relay(self, device, state: bool):
        """
        device: 'heat1', 'heat2'
        state: True (ON) or False (OFF)
        """
        self.state[device] = state
        
        pin = None
        if device == 'heat1': pin = PIN_RELAY_HEAT1
        elif device == 'heat2': pin = PIN_RELAY_HEAT2
        
        if pin:
            self._write_gpio(pin, state)
            if self.mock_mode:
                logger.info(f"[MOCK] Set {device} to {state}")
                # Simulate temp rise/fall
                if "heat" in device:
                    zone = 1 if "1" in device else 2
                    if state:
                        self.mock_temps[zone] += 0.5
                    else:
                        self.mock_temps[zone] -= 0.2

    def set_pwm(self, duty_cycle: int):
        """
        Set PWM duty cycle for Light (0-100)
        """
        self.state['light1'] = duty_cycle > 0 # For UI status
        self.state['light_pwm'] = duty_cycle
        
        if not self.mock_mode:
            self.pwm_light.ChangeDutyCycle(duty_cycle)
        else:
            logger.info(f"[MOCK] Set Light PWM to {duty_cycle}%")

    def read_dht(self, zone):
        """
        Returns (humidity, temperature)
        """
        if self.mock_mode:
            # Simulate slight fluctuation
            self.mock_temps[zone] += random.uniform(-0.1, 0.1)
            self.mock_hums[zone] += random.uniform(-0.5, 0.5)
            return self.mock_hums[zone], self.mock_temps[zone]
        else:
            pin = PIN_DHT_ZONE1 if zone == 1 else PIN_DHT_ZONE2
            sensor = Adafruit_DHT.DHT22 # User said DHT21 (AM2301), which is compatible with DHT22 protocol usually
            humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
            return humidity, temperature

    def cleanup(self):
        if not self.mock_mode:
            GPIO.cleanup()

hardware = HardwareManager()
