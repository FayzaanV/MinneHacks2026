import eel
from backend.scanner import getCpu, getBatteryPer, getTopThree, isCharging, getRamPerc, getDiskUsage
import backend.logic as logic

eel.init('frontend')

@eel.expose
def get_overall_data():
    return{
        "cpu": getCpu(),
        "ram": getRamPerc(),
        "battery": getBatteryPer(),
        "isCharging": isCharging(),
        "apps": getTopThree(),
        "disk": getDiskUsage()
    }

@eel.expose
def get_alerts():
    alerts = []
    
    if logic.check_overheating():
        alerts.append({
            "title": "Overheating Warning",
            "why": "Sustained high temperatures can degrade your CPU and lead to system crashes",
            "steps": [
                "Check if cooling fans are blocked by dust", 
                "Place laptop on a hard, flat surface", 
                "Close heavy background applications"
            ],
            "type": "danger"
        })
        
    if logic.check_battery_overcharge():
        alerts.append({
            "title": "Battery Strain",
            "why": "Keeping your battery plugged after sufficiently charged reduces it's overall capacity over time",
            "steps": [
                "Unplug your charger now.",
                "Discharge battery to around 40-80%.",
                "Enable 'Optimized Battery Charging' in system settings."
            ],
            "type": "warning"
        })
        
    if logic.check_disk_full():
        alerts.append({
            "type": "danger",
            "title": "Storage Critical",
            "why": "Low disk space prevents the OS from creating temporary files, causing slowdowns and potential data corruption.",
            "steps": [
                "Empty your Trash/Recycle Bin.",
                "Delete large files in your Downloads folder.",
                "Uninstall unused applications."
            ]
        })

    if logic.check_high_ram():
        alerts.append({
            "type": "warning",
            "title": "High Memory Pressure",
            "why": "When RAM is full, your computer swaps data to the hard drive, which drastically slows down performance.",
            "steps": [
                "Close unused browser tabs (Chrome/Safari).",
                "Quit apps running in the background.",
                "Restart your computer to clear memory leaks."
            ]
        })

    if logic.check_high_cpu():
        alerts.append({
            "type": "danger", # Changed to 'danger' because >90% is critical
            "title": "Processor Overload",
            "why": "Running at maximum capacity causes system freezes, input lag, and generates excessive heat that can throttle performance.",
            "steps": [
                "Check the 'Top Apps' list on this dashboard.",
                "Close video editing software or games running in the background.",
                "Restart your browser if it has many active tabs."
            ]
        })
        
    return alerts

eel.start('index.html', size=(1024, 768))