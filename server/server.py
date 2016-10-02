import sys
import json
import os
from datetime import datetime

from functools import wraps, update_wrapper

from flask import Flask, redirect, request, send_from_directory, make_response
from werkzeug.utils import secure_filename

app = Flask(__name__)


# from http://arusahni.net/blog/2014/03/flask-nocache.html
def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)


@app.route('/')
def index():
    return redirect('/index.html')


@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('../client', path)

@app.route('/query_data')
def query_data():

    return json.dumps({
        'msg': "ok",
    })


if __name__ == "__main__":
    app.run(debug=True, port=5001)
