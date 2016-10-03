# -*- coding: utf-8 -*-

import sys
import json
import os
from datetime import datetime
import time

from functools import wraps, update_wrapper

import pandas

from flask import Flask, redirect, request, send_from_directory, make_response
from werkzeug.utils import secure_filename

# globals
app = Flask(__name__)
data = None

def init():
    global data
    datafile = '../data/cards.txt'
    # fichero cards.txt recortado para desarrollar con más agilidad
    # $ head -300 cards.txt >head.txt
    # datafile = '../data/head.txt'   
    print "reading data"
    t0 = time.time()
    data = pandas.read_csv(datafile, sep='|', header=0, parse_dates=['DIA'], decimal=',')
    t1 = time.time()
    print "ok %.2fseg" % (t1-t0)

    # enrich data
    data['DIA_SEMANA'] = data['DIA'].dt.dayofweek # 0 = lunes
    data['MES'] = data['DIA'].dt.month
    data['IMPORTE_MEDIO'] = data['IMPORTE'] / data['NUM_OP']


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


@app.route('/query_csv')
def query_csv():
    # aqui se pueden filtrar o procesar los datos antes de devolverlos
    sector = request.args.get('sector') or 'MODA Y COMPLEMENTOS'
    result = data if sector == '*' else data[data['SECTOR']== sector] 
    result = result[0:100]
    return result.to_csv(index=False, sep='|', float_format="%.2f")


if __name__ == "__main__":
    init()
    app.run(debug=True, port=5001)
