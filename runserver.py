#!/usr/bin/env python

from os import environ
from WebApp import app as application

if __name__ == "__main__":
    application.debug = True
    # application.run(host='0.0.0.0', port=int(environ.get('PORT', 5000)))
    application.run(port=int(environ.get('PORT', 5000)))
