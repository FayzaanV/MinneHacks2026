from scanner import getBatteryPer, getTemp
import time
import threading
import platform
from datetime import datetime

dataLog = []
stop = False

def dataOverTime():
    while not stop:
        if getBatteryPer() and getTemp():
            dataLog.append({'Time': datetime.now().strftime("%H:%M:%S"),
                            'Percent': getBatteryPer(),
                            'Temperature': getTemp()})
        elif getBatteryPer():
            dataLog.append({'Time': datetime.now().strftime("%H:%M:%S"), 
                            'Percent': getBatteryPer()})
        else:
            return None
        print(dataLog)
        time.sleep(30)

if platform.system == "Darwin":
    def dataOverTime():
        if getBatteryPer():
                dataLog.append({'Time': time.time(), 'Percent': getBatteryPer()})
        else: 
            return None


t = threading.Thread(target=dataOverTime)
t.start()


try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    stop = True
    t.join()
    print('stopped')

dataOverTime()





