import unittest
from datetime import datetime
from hardware import HardwareManager

# Mock hardware for testing
class MockHardware(HardwareManager):
    def __init__(self):
        super().__init__()
        self.mock_mode = True
        self.state = {"heat1": False, "heat2": False, "light1": False, "light2": False}

class TestControlLogic(unittest.TestCase):
    def test_thermostat_logic(self):
        hw = MockHardware()
        target_temp = 28.0
        
        # Case 1: Temp is low -> Heater ON
        current_temp = 27.0
        if current_temp < target_temp - 0.5:
            hw.set_relay('heat1', True)
        else:
            hw.set_relay('heat1', False)
            
        self.assertTrue(hw.state['heat1'], "Heater should be ON when temp is low")

        # Case 2: Temp is high -> Heater OFF
        current_temp = 29.0
        if current_temp < target_temp - 0.5:
            hw.set_relay('heat1', True)
        elif current_temp > target_temp:
            hw.set_relay('heat1', False)
            
        self.assertFalse(hw.state['heat1'], "Heater should be OFF when temp is high")

    def test_time_range(self):
        def check_time(start, end, current):
            if start < end:
                return start <= current < end
            else:
                return start <= current or current < end
        
        # Normal day case
        self.assertTrue(check_time("08:00", "20:00", "12:00"))
        self.assertFalse(check_time("08:00", "20:00", "21:00"))
        
        # Overnight case
        self.assertTrue(check_time("20:00", "08:00", "23:00"))
        self.assertTrue(check_time("20:00", "08:00", "05:00"))
        self.assertFalse(check_time("20:00", "08:00", "12:00"))

if __name__ == '__main__':
    unittest.main()
