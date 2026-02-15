from backend.scanner import getCpu, getBatteryPer, getDiskUsage, getRamPerc, isCharging, getTemp

def check_overheating():
    if getTemp() is None:
        return False
    if getTemp() > 95:
        return True
    else:
        return False
    
def check_battery_overcharge():
    if getBatteryPer() >= 80 and isCharging:
        return True
    else:
        return False

def check_disk_full():
    if getDiskUsage() > 90:
        return True
    else:
        return False

def check_high_ram():
    if getRamPerc() > 90:
        return True
    else: 
        return False
    
def check_high_cpu():
    if getCpu() > 90:
        return True
    else:
        return False