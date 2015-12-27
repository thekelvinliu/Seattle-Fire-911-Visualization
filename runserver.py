#!/usr/bin/env python

from os import environ
from WebApp import app as application

if __name__ == "__main__":
    application.debug = False
    application.run(port=int(environ.get('PORT', 5000)))
