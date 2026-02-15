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
            "message": "CPU is too hot! Check cooling fans.",
            "type": "danger"
        })
        
    if logic.check_battery_overcharge():
        alerts.append({
            "title": "Healthy Charging",
            "message": "Battery is above 80%. Unplug to extend battery life.",
            "type": "warning"
        })
        
    if logic.check_disk_full():
        alerts.append({
            "title": "Low Storage",
            "message": "Disk is almost full. Clean up large files.",
            "type": "danger"
        })

    if logic.check_high_ram():
        alerts.append({
            "title": "High Memory Usage",
            "message": "RAM is >90%. Close unused apps.",
            "type": "warning"
        })

    if logic.check_high_cpu():
        alerts.append({
            "title": "High CPU Usage",
            "message": "CPU is >90%. Close unused apps.",
            "type": "warning"
        })
        
    return alerts

eel.start('index.html', size=(1024, 768))