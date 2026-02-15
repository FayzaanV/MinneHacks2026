# Put functions to get CPU and RAM data in here
import psutil
from collections import OrderedDict
import subprocess
import re
#import asyncio
#from bleak import BleakScanner

def getCpu(): #returns the current cpu usage as a percentage
    cpuPercent = psutil.cpu_percent(1)
    print("CPU usage:", cpuPercent, '%')
    return cpuPercent

def getRamUsage(): #returns the current ram usage in megabytes
    ramUsed = psutil.virtual_memory().total - psutil.virtual_memory().available
    print("RAM Usage:", ramUsed, 'MB')
    return ramUsed

def getBatteryPer(): #returns an int battery percentage
    battery = psutil.sensors_battery()
    print("Battery:", battery.percent, '%')
    return battery

def isCharging(): #returns a boolean true if the computer is plugged in and false if not
    battery = psutil.sensors_battery()
    isPlugged = battery.power_plugged
    if isPlugged:
        print("The charger is plugged in")
        return True
    else:
        print('The charger is not plugged in')
        return False
    
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

'''
async def strongestBT(): 
    #returns a list of the names of the strongest bluetooth signals or an empty list if none
    #are strong
    #this function MUST be called with syntax "asyncio.run(strongestBT())" to work
    signals = await BleakScanner.discover()
    topSignals = [('FirstDevice', -100), ('SecondDevice', -100), ('ThirdDevice', -100)]
    for device in signals:
        rssi = device.metadata.get("rssi")
        if rssi and rssi > -65:
            if rssi > topSignals[2][1]:
                if rssi > topSignals[1][1]:
                    if rssi > topSignals[0][1]:
                        topSignals.insert(0, (device.name, device.rssi))
                        topSignals.pop()
                        continue
                    topSignals.insert(1, (device.name, device.rssi))
                    topSignals.pop()
                    continue
                topSignals.insert(2, (device.name, device.rssi))
                topSignals.pop()
    topDevices = []
    for entry in topSignals:
        if entry[0] == "FirstDevice":
            return topDevices
        topDevices.append(entry[0])
    return topDevices
'''
    
def getTopThree(): #returns an ordered dictionary of the top three ram using programs running
    bigBadThree = [('First', 0), ('Second', 0), ('Third', 0)]
    for proc in psutil.process_iter(['pid', 'name', 'memory_info']):
        try:
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
        dictThree[i[0]] = i[1]
    return dictThree

getDiskUsage()
print('Battery health:', batteryHealth())

'''
print("The top three most intensive programs on memory are:")
topThree = getTopThree()
for entry in topThree:
    print(entry[0], ':', entry[1], 'MB')
'''
