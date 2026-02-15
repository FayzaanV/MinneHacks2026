# Put functions to get CPU and RAM data in here
import psutil
from collections import OrderedDict

def getCpu(): #returns the current cpu usage as a percentage
    cpuPercent = psutil.cpu_percent(0.1)
    print("CPU usage:", cpuPercent, '%')
    return cpuPercent
cpuPercent = psutil.cpu_percent(0.1)
print("CPU usage:", cpuPercent, '%')

def getRamUsage(): #returns the current ram usage in megabytes
    ramUsed = psutil.virtual_memory().total - psutil.virtual_memory().available
    print("RAM Usage:", ramUsed, 'MB')
    return ramUsed
ram_raw = psutil.virtual_memory().total - psutil.virtual_memory().available
ram_MB = ram_raw / (1024 ** 2)
print("RAM Usage:", ram_MB, 'MB')

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

def getTopThree(): #returns an ordered dictionary of the top three ram using programs running
    bigBadThree = [('First', 0), ('Second', 0), ('Third', 0)]
    for proc in psutil.process_iter(['pid', 'name', 'memory_info']):
        try:
            mem_info = proc.info.get('memory_info')
            if mem_info is None:
                continue
            memMb = mem_info.rss / (1024 * 1024)
            
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
    print(bigBadThree)
    for i in bigBadThree:
        dictThree[i[0]] = i[1]
    return dictThree

print(getTopThree())

'''
print("The top three most intensive programs on memory are:")
topThree = getTopThree()
for entry in topThree:
    print(entry[0], ':', entry[1], 'MB')
'''
