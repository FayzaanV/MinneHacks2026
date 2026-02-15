'''
collects data over time for the advanced page
'''
import eel
import backend.scanner as scanner
from backend.scanner import getBatteryPer, getTemp
import time
import threading
from datetime import datetime

dataLog = []
stop_thread = False

def dataCollectionLoop():
    '''
    loop modifies the list dataLog by adding a new dictionary with a time and battery percentage
    every 30 seconds
    '''
    global stop_thread
    while not stop_thread:

        batt = getBatteryPer()
        temp = getTemp()
        
        entry = {'Time': datetime.now().strftime("%H:%M:%S")}
        if batt is not None: entry['Percent'] = batt
        if temp is not None: entry['Temperature'] = temp
        
        dataLog.append(entry)
        
        if len(dataLog) > 20:
            dataLog.pop(0)
            
        time.sleep(30) 

@eel.expose
def get_advanced_data():
    '''
    returns a dictionary containing the battery history from dataCollectionLoop and the top 10
    most RAM-heavy processes running
    '''

    all_apps = scanner.processDict()
    top_ten = sorted(all_apps.items(), key=lambda x: x[1], reverse=True)[:10]
    formatted_apps = [{"name": name, "mem": round(mem, 1)} for name, mem in top_ten]
    history = get_history_data() 
    
    return {
        "history": history,
        "top_apps": formatted_apps
    }

@eel.expose
def force_log_entry():
    '''
    Manually triggers a data collection and adds it to the log
    '''
    batt = getBatteryPer()
    temp = getTemp()
    
    entry = {'Time': datetime.now().strftime("%H:%M:%S")}
    if batt is not None: entry['Percent'] = batt
    if temp is not None: entry['Temperature'] = temp
    
    dataLog.append(entry)
    
    if len(dataLog) > 20:
        dataLog.pop(0)
        
    return dataLog

t = threading.Thread(target=dataCollectionLoop, daemon=True)
t.start()

@eel.expose
def get_history_data():
    '''
    returns the last 20 battery percentages collected by dataCollectionLoop with timestamps 
    as a list of dictionaries
    '''
    return dataLog