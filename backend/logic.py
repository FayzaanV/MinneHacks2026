from scanner import getCpu, getBatteryPer, getDiskUsage, getRamUsage, isCharging, getTemp

def overheating():
    if getTemp > 95:
        return True
    else:
        return False
    
def batteryOvercharge():
    if getBatteryPer >= 80 and isCharging:
        return True
    else:
        return False

def diskFull():
    if getDiskUsage > 95:
        return True
    else:
        return False

def highRam():
    if getRamUsage > 80:
        return True
    else: 
        return False