# advanced.py
import eel
from backend.scanner import getBatteryPer, getTemp
import time
import threading
from datetime import datetime

dataLog = []
stop_thread = False

def data_collection_loop():
    global stop_thread
    while not stop_thread:
        # Get current stats
        batt = getBatteryPer()
        temp = getTemp()
        
        # Log data with a timestamp
        entry = {'Time': datetime.now().strftime("%H:%M:%S")}
        if batt is not None: entry['Percent'] = batt
        if temp is not None: entry['Temperature'] = temp
        
        dataLog.append(entry)
        
        # Keep only the last 20 entries to prevent memory bloat
        if len(dataLog) > 20:
            dataLog.pop(0)
            
        time.sleep(30) # Collect every 30 seconds

# Start the background thread immediately when imported
t = threading.Thread(target=data_collection_loop, daemon=True)
t.start()

@eel.expose
def get_history_data():
    return dataLog