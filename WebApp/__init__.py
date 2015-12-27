from __future__ import print_function
import json
from flask import Flask
from flask import render_template
from flask import request
from WebApp.classes import ApiPoller

app = Flask(__name__)
poller = ApiPoller("https://data.seattle.gov/resource/grwu-wqtk.json",
                   init_load=24,
                   uid_field="incident_number")

@app.route('/')
def index():
    return render_template('index.html', lu=str(poller.updated), d=poller.data)

@app.route('/refresh')
def refresh():
    print "sending new data"
    return json.dumps(poller.get_new_data())

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html')
