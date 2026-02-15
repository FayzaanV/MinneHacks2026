# advanced.py
import eel
import backend.scanner as scanner
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

# In backend/advanced.py

@eel.expose
def get_advanced_data():
    # Get the dictionary of all processes
    all_apps = scanner.processDict()
    
    # Sort them by memory usage (value) in descending order and take the top 10
    top_ten = sorted(all_apps.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Convert list of tuples back to a list of dictionaries for easy JS use
    # Result looks like: [{"name": "Chrome", "mem": 450}, ...]
    formatted_apps = [{"name": name, "mem": round(mem, 1)} for name, mem in top_ten]
    
    # Get the history log we built earlier
    history = get_history_data() 
    
    return {
        "history": history,
        "top_apps": formatted_apps
    }

# Start the background thread immediately when imported
t = threading.Thread(target=data_collection_loop, daemon=True)
t.start()

@eel.expose
def get_history_data():
    return dataLog