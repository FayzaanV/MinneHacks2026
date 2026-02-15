import eel
from backend.scanner import getCpu, getBatteryPer, getTopThree, isCharging, getDiskUsage

eel.init('frontend')
@eel.expose
def get_overall_data():
    return{
        "cpu": getCpu(),
        "battery": getBatteryPer(),
        "isCharging": isCharging(),
        "apps": getTopThree(),
        "disk": getDiskUsage()
    }
eel.start('index.html', size=(1024, 768))