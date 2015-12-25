#!/usr/bin/env python

from __future__ import print_function
import time
from classes import ApiPoller

def main():
    ap = ApiPoller("https://data.seattle.gov/resource/grwu-wqtk.json",
                   uid_field="incident_number")
    #sleep 20 seconds
    for i in range(20):
        print(i, ap.updated)
        time.sleep(1)
    #sleep 30 mins
    time.sleep(30*60)
    print("stopping ap")
    ap.stop()
    ap.join()

if __name__ == '__main__':
    main()
