# Put functions to get CPU and RAM data in here
import psutil
from collections import OrderedDict

cpuPercent = psutil.cpu_percent(1)
print("CPU usage:", cpuPercent, '%')

ramUsed = psutil.virtual_memory().total - psutil.virtual_memory().available
print("RAM Usage:", ramUsed, 'MB')



battery = psutil.sensors_battery()
print("Battery:", battery.percent, '%')
isPlugged = battery.power_plugged
if isPlugged:
    print("The charger is plugged in")
else:
    print('The charger is not plugged in')

def getTopThree():
    bigBadThree = [('First', 0), ('Second', 0), ('Third', 0)]
    for proc in psutil.process_iter(['pid', 'name', 'memory_info']):
        try:
            mem_mb = proc.info['memory_info'].rss / (1024 * 1024)
            
            if mem_mb > bigBadThree[2][1]:
                if mem_mb > bigBadThree[1][1]:
                    if mem_mb > bigBadThree[0][1]:
                        bigBadThree.insert(0, (proc.info['name'], mem_mb))
                        bigBadThree.pop()
                        continue
                    bigBadThree.insert(1, (proc.info['name'], mem_mb))
                    bigBadThree.pop() 
                    continue 
                bigBadThree.insert(2, (proc.info['name'], mem_mb))
                bigBadThree.pop()
            
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    dictThree = OrderedDict()
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
