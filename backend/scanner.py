# Put functions to get CPU and RAM data in here
import psutil
import platform
from collections import OrderedDict
import subprocess
import re
if platform.system == 'Windows':
    import wmi


def getCpu(): 
    '''
    returns a float representing the current cpu usage as a percentage
    '''
    cpuPercent = psutil.cpu_percent(0.1)
    print("CPU usage:", cpuPercent, '%')
    return cpuPercent

def getRamUsage():
    '''
    returns an int representing the amount of ram in use in megabytes
    '''
    ramUsed = psutil.virtual_memory().total - psutil.virtual_memory().available
    print("RAM Usage:", ramUsed, 'MB')
    return ramUsed

def getRamPerc(): 
    '''
    returns a float representing the amount of RAM in use as a percentage
    '''
    return psutil.virtual_memory().percent

def getBatteryPer(): 
    '''
    returns an int representing the percentage of battery available
    '''
    battery = psutil.sensors_battery()
    if battery is None: return 100
    print("Battery:", battery.percent, '%')
    return battery.percent

def isCharging():
    '''
    returns a boolean of true if the computer is plugged in to a charger and false if not
    '''
    battery = psutil.sensors_battery()
    isPlugged = battery.power_plugged
    if isPlugged:
        print("The charger is plugged in")
        return True
    else:
        print('The charger is not plugged in')
        return False

def getTemp(): 
    '''
    returns a float representing the current temperature of the cpu in celcius
    '''
    if platform.system() == 'Darwin':
        print("Temperature information not available on macOS")
        return None
    if hasattr(psutil, 'sensors_temperatures'):
        try:
            temp = psutil.sensors_temperatures()
            if not temp:
                return None
            
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
    return None

    
def batteryHealth():
    '''
    returns a float representing the percentage of battery capacity currently available to the
    battery compared to when it was new
    returns None if the function is not supported
    Only compatible with Windows
    '''
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
    return None
    
def getDiskUsage():
    '''
    returns a float representing the percent of space used on the disk
    '''
    diskPercent = psutil.disk_usage('/').used / psutil.disk_usage('/').total * 100
    print(diskPercent, "percent of disk used")
    return diskPercent
    
def getTopThree(): 
    '''
    returns and ordered dictionary with the names of the three processes using the most memory
    in descending order
    '''
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

def processDict():
    '''
    returns a dictionary with the name of every process running andthe amount of memory each
    one is using
    '''
    dictOut = {}
    for proc in psutil.process_iter(['name', 'memory_info']):
        try:
            if proc.info['memory_info'] is not None:
                dictOut[proc.info['name']] = proc.info['memory_info'].rss / (1024 * 1024)
            else:
                continue
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return dictOut