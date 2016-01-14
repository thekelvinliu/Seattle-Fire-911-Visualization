from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def index():
    return 'Hello World'

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html')
