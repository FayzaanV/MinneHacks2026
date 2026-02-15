import eel
import psutil
from backend.scanner import cpuPercent, battery, getTopThree

eel.init('frontend')
@eel.expose
def get_overall_data():
    current_cpu = psutil.cpu_percent(interval=None) 
    current_battery = psutil.sensors_battery().percent
    return{
        "cpu": current_cpu,
        "battery": current_battery,
        "apps": getTopThree()
    }
eel.start('index.html', size=(1024, 768))