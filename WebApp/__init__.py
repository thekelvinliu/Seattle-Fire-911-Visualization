from __future__ import print_function
import json
from flask import Flask
from flask import render_template
from flask import request
from WebApp.classes import ApiPoller

app = Flask(__name__)
poller = ApiPoller("https://data.seattle.gov/resource/grwu-wqtk.json",
                   uid_field="incident_number")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/refresh')
def refresh():
    return json.dumps(poller.data)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html')
