# Put functions to get CPU and RAM data in here
import psutil
import platform
from collections import OrderedDict
import subprocess
import re
if platform.system == 'Windows':
    import wmi


def getCpu(): #returns the current cpu usage as a percentage
    cpuPercent = psutil.cpu_percent(0.1)
    print("CPU usage:", cpuPercent, '%')
    return cpuPercent

def getRamUsage(): #returns the current ram usage in megabytes
    ramUsed = psutil.virtual_memory().total - psutil.virtual_memory().available
    print("RAM Usage:", ramUsed, 'MB')
    return ramUsed

def getRamPerc(): #return RAM usage as a percent of available RAM
    return psutil.virtual_memory().percent

def getBatteryPer(): #returns an int battery percentage
    battery = psutil.sensors_battery()
    if battery is None: return 100
    print("Battery:", battery.percent, '%')
    return battery.percent

def isCharging(): #returns a boolean true if the computer is plugged in and false if not
    battery = psutil.sensors_battery()
    isPlugged = battery.power_plugged
    if isPlugged:
        print("The charger is plugged in")
        return True
    else:
        print('The charger is not plugged in')
        return False

def getTemp(): #returns the current temperature of the cpu in celsius
    if platform.system() == 'Darwin':
        print("Temperature information not available on macOS")
        return None
    if hasattr(psutil, 'sensors_temperatures'):
        try:
            temp = psutil.sensors_temperatures()
            if 'coretemp' in temp:
                cpu_temp = temp['coretemp'][0].current
                print("CPU Temperature:", cpu_temp, '°C')
                return cpu_temp
            elif 'cpu_thermal' in temp:
                cpu_temp = temp['cpu_thermal'][0].current
                print("CPU Temperature:", cpu_temp, '°C')
                return cpu_temp
        except Exception as e:
            print(f"Could not read sensors: {e}")

    print("Temperature information not available")
    return 0

    
def batteryHealth(): #returns the percentage of battery capacity currently held compared to new
                     #returns 0 if battery health is not supported, WINDOWS only
    subprocess.run(["powercfg", "/batteryreport", "/output", "batteryReport.html"])
    with open('batteryReport.html', 'r', encoding="utf-8", errors="ignore") as f:
        file = f.read() 
    def find_value(target):
        match = re.search(target + r".*?([0-9,]+) mWh", file)
        if match:
            return int(match.group(1).replace(",", ""))
        else:
            return None
    designCap = find_value('DESIGN CAPACITY')
    fullCap = find_value('FULL CHARGE CAPACITY')
    if designCap and fullCap: 
        health = fullCap / designCap * 100
        return health
    return 0
    
def getDiskUsage(): #returns the percentage of space used on the disk
    diskPercent = psutil.disk_usage('/').used / psutil.disk_usage('/').total * 100
    print(diskPercent, "percent of disk used")
    return diskPercent
    
def getTopThree(): 
    bigBadThree = [('First', 0), ('Second', 0), ('Third', 0)]
    for proc in psutil.process_iter(['name', 'memory_info']):
        try:
            if proc.info['memory_info'] is None:
                continue
            memMb = proc.info['memory_info'].rss / (1024 * 1024)
            if memMb > bigBadThree[2][1]:
                if memMb > bigBadThree[1][1]:
                    if memMb > bigBadThree[0][1]:
                        bigBadThree.insert(0, (proc.info['name'], memMb))
                        bigBadThree.pop()
                        continue
                    bigBadThree.insert(1, (proc.info['name'], memMb))
                    bigBadThree.pop() 
                    continue 
                bigBadThree.insert(2, (proc.info['name'], memMb))
                bigBadThree.pop()
            
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    dictThree = OrderedDict()
    for i in bigBadThree:
        if i[0] in ['First', 'Second', 'Third'] and i[1] == 0:
            continue
        dictThree[i[0]] = i[1]
    return dictThree