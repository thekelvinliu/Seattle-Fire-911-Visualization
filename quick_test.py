#!/usr/bin/env python3

import time
from classes import ApiPoller

def main():
    ap = ApiPoller("https://data.seattle.gov/resource/grwu-wqtk.json",
                   uid_field="incident_number")
    #sleep 5 mins
    time.sleep(5*60)
    print("stopping ap")
    ap.stop()
    ap.join()

if __name__ == '__main__':
    main()
