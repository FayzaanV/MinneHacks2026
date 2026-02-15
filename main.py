import eel
import psutil
from backend.scanner import getCpu, getBatteryPer, getTopThree, isCharging

eel.init('frontend')
@eel.expose
def get_overall_data():
    batteryInfo = getBatteryPer()
    return{
        "cpu": getCpu(),
        "battery": batteryInfo.percent if batteryInfo else 100,
        "isPlugged": isCharging(),
        "apps": getTopThree()
    }
eel.start('index.html', size=(1024, 768))