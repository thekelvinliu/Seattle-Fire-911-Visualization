# Seattle-Fire-911-Visualization
a visualization of seattle's fire 911 calls
🗺🔥🚒

## Getting Started
First, clone this repository and navigate into the folder.
```
$ git clone https://github.com/thekelvinliu/Seattle-Fire-911-Visualization.git
$ cd Seattle-Fire-911-Visualization
```
Next, create a Python [Virtual Environment](http://docs.python-guide.org/en/latest/dev/virtualenvs/) in this directory, and activate it.
Please make sure to use python2.7.
```
$ virtualenv -p python2.7 venv
$ source venv/bin/activate
```
Sometimes when the absolute path to the directory contains spaces, `pip` gest messed up.
Ensure that `pip` is working properly.
```
$ pip list
pip (7.1.2)
setuptools (18.2)
wheel (0.24.0)
```
If you get some sort of bad interpreter error, edit the shebang (`#!`) line in `venv/bin/pip`.
Something like `#!/usr/bin/env python` should work, since you've already activated the virtual env.
Now, install this project's dependencies.
```
$ pip install flask
```
Finally, start the server!
```
$ ./runserver.py
```

## Notes
This project began as homework for the Nordstrom Technology Internship 2016.
Check out the `nordstrom-save` branch for the version of the app that was shown.
Known to work on very recent versions of Chrome and Firefox.
Mobile and safari support is iffy 😁.
