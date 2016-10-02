# estructura

* `client` : html, css, js...
* `server` : aplicación python/flask para servir el cliente y filtrar los datos: la idea es cargar el fichero `cards.txt` en un dataframe de pandas, enriquecerlo y servirlo en json cuando el cliente lo vaya pidiendo
* `data`   : directorio donde copiar los ficheros de datos (no incluidos)

# cómo empezar

## 1. instalar las dependencias del cliente

```
cd client
bower install
```

## 2. instalar las dependencias del servidor

```
mkvirtualenv cajamar
cd server
pip install -r requirements
```

## 3. copiar los datos en `data` 
(no están incluidos para no incumplir las condiciones del hackathon)
 
## 4. arrancar el servidor
```
cd server
python server.py
```
