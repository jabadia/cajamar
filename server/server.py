# -*- coding: utf-8 -*-

import json
from datetime import datetime
import time

from functools import wraps, update_wrapper

import pandas

from flask import Flask, redirect, request, send_from_directory, make_response

# globals
app = Flask(__name__)
data = None
weather = None

def init():
    global data, weather

    # # read weather
    weatherfile = '../data/weather_simplified.csv'
    #
    print "reading weather"
    weather = pandas.read_csv(weatherfile,
                              sep='|',
                              header=0,
                              parse_dates=['day']).sort_values(by='day');

    datafile = '../data/cards.txt'
    # fichero cards.txt recortado para desarrollar con más agilidad
    # $ head -300 cards.txt >head.txt
    # datafile = '../data/head.txt'   
    print "reading data csv"
    t0 = time.time()
    data = pandas.read_csv(datafile, sep='|', header=0, parse_dates=['DIA'], decimal=',',
                              dtype={'CP_CLIENTE':str, 'CP_COMERCIO':str})
    t1 = time.time()
    print "ok %.2fseg" % (t1-t0)

    print data.shape

    # enrich data
    data['DIA_SEMANA'] = data['DIA'].dt.dayofweek # 0 = lunes
    data['MES'] = data['DIA'].dt.month
    data['IMPORTE_MEDIO'] = data['IMPORTE'] / data['NUM_OP']

    # mejor hacemos el merge en cliente
    # data = pandas.merge(data, weather, left_on='DIA', right_on='day')



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


@app.route('/api/cards/')
def query_csv():
    # aqui se pueden filtrar o procesar los datos antes de devolverlos
    sector = request.args.get('sector') or '*'
    month = request.args.get('month') or None
    result = data if sector == '*' else data[data['SECTOR']== sector]
    if month:
        result = result[result['MES']== int(month)]

    max_samples = 50000
    if result.shape[0] > max_samples:
        result = result.sample(max_samples) # muestra aleatoria, para ir más rápido
    print result.shape
    return result.to_csv(index=False, sep='|', float_format="%.2f")


@app.route('/api/sectores/')
def sectores():
    sectores = sorted(data['SECTOR'].unique().tolist())
    return json.dumps(sectores)

@app.route('/api/weather/')
def weather():
    return weather.to_csv(index=False, sep='|', float_format="%.2f")

@app.route('/api/weather_icons/')
def weather_icons():
    icons = weather['icon'].unique().tolist()
    return json.dumps(icons)

if __name__ == "__main__":
    init()
    app.run(debug=True, port=5001, host='0.0.0.0')
