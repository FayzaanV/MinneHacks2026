'''
this file is used to see if data from scanner.py satisfies certain conditions in order to
notify the user 
'''

from backend.scanner import getCpu, getBatteryPer, getDiskUsage, getRamPerc, isCharging, getTemp

def check_overheating():
    '''
    returns a boolean True if the cpu temperature is above 95 degrees and false if not
    '''
    if getTemp() is None:
        return False
    if getTemp() > 95:
        return True
    else:
        return False
    
def check_battery_overcharge():
    '''
    returns a boolean True if the battery is overcharging and false if not
    '''
    if getBatteryPer() >= 80 and isCharging():
        return True
    else:
        return False

def check_disk_full():
    '''
    returns a boolean True if the disk is over 90% full and false if not
    '''
    if getDiskUsage() > 90:
        return True
    else:
        return False

def check_high_ram():
    '''
    returns a boolean True if the RAM is over 90% used and false if not
    '''
    if getRamPerc() > 90:
        return True
    else: 
        return False
    
def check_high_cpu():
    '''
    returns a boolean True if the CPU usage is over 90% and false if not
    '''
    if getCpu() > 90:
        return True
    else:
        return False