import datetime as dt
from threading import Thread
import time
import requests

class ApiPoller(Thread):
    """An object to continuously poll an API at a given time interval.

    This class is designed to work nicely with the various API endpoints
    provided by data.seattle.gov.
    """
    def __init__(self, url, params=None, init_load=24, interval=1,
                 dt_field='datetime', uid_field=None):
        """Initializes an ApiPoller object.

        Given an API endpoint, `url`, this object will load data from the most
        recent `init_load` hours into a container. After, it will continuously
        check the API every `interval` minutes for new data.
        The data returned from the API must have a field related to date and/or
        time. This is specified in `dt_field`.
        Individual piece of data are differentiated by the field specified in
        `uid_field`. If no field is given, then `dt_field` is used.

        Args:
            url: The url of the API (string)
            params: Extra parameters for the API request (dict, default None)
            init_load: The number most recent hours to load upon instantiation
                (int, default 24)
            interval: The number of minutes to wait between polling (int,
                default 1)
            dt_field: The name of the field hoding date and/or time information
                (string, default 'datetime')
            uid_field: The name of the field which uniquely identifies data
            (string, default None)
        """
        # SAVE ARGUMENTS
        self.url = url
        self.params = params
        self.init_load = init_load
        self.interval = interval
        self.dt_field = dt_field
        self.uid_field = uid_field
        # INITIATE FIRST REQUEST
        #save current unix timestamp
        self.updated = int(time.time())
        #send request
        r = requests.get(self.url, params=self.create_payload(initial=True))
        print(r.url)
        #save response
        self.data = r.json()
        #add identifiers
        self.uids = set()
        if self.uid_field is not None:
            for d in self.data:
                self.uids.add(d[self.uid_field])
        else:
            for d in self.data:
                uid = dt.datetime.strptime(d[self.dt_field],
                                           "%Y-%m-%dT%H:%M:%S.%f")
                self.uids.add(int(uid.timestamp()))
        print(self.uids)
        # THREADING
        super(ApiPoller, self).__init__()
        self.daemon = True
        self.keep_going = True
        self.start()

    def create_payload(self, initial=False):
        """Creates a payload for the API request based on self.updated.

        Args:
            initial: Boolean indicating whether or not the initial payload
                should be created (bool, default False)
        Returns:
            A payload (python dictionary) for an API request
        """
        #dictionary to be returned
        ret = self.params if self.params is not None else dict()
        #start at self.init_load hours before right now
        if initial:
            start_dt = dt.datetime.now() - dt.timedelta(hours=self.init_load)
        #start at self.updated
        else:
            start_dt = dt.datetime.fromtimestamp(self.updated)
        #convert to string
        dt_string = start_dt.strftime("%Y-%m-%dT%H:%M:%S.%f")
        #add constriants
        ret["$where"] = "{} >= '{}'".format(self.dt_field, dt_string)
        ret["$order"] = "{} DESC".format(self.dt_field)
        return ret

    def run(self):
        """Continuously checks the API for new data"""
        while self.keep_going:
            #sleep first
            time.sleep(60*self.interval)
            #then update
            print("updating...")
            tmp_time = int(time.time())
            #send request
            r = requests.get(self.url, params=self.create_payload())
            #check for new data
            if self.uid_field is not None:
                for d in r.json():
                    if d[self.uid_field] not in self.uids:
                        self.uids.add(d[self.uid_field])
            else:
                for d in self.data:
                    uid = dt.datetime.strptime(d[self.dt_field],
                                               "%Y-%m-%dT%H:%M:%S.%f")
                    uid = int(uid.timestamp())
                    if uid not in self.uids:
                        self.uids.add(uid)
            #save current unix timestamp
            self.updated = tmp_time

    def stop(self):
        """Explicitly stops this object."""
        self.keep_going = False
