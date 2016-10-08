(function(){
"use strict";

var module = angular.module('story',[]);

module.constant('theStory', [
    {
        description: '¡Hola! A continuación te vamos a mostrar algunos patrones de consumo en los comercios de Almería capital, con una muestra representativa de los datos de 2015',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'El sector de la moda tiene mayor demanda en los meses de Diciembre, Enero y Julio',
        filters: {"sector":["MODA Y COMPLEMENTOS"],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'como podemos ver en la gráfica de MES (segunda a la izquierda)',
        filters: {"sector":["MODA Y COMPLEMENTOS"],"month":[1,7,12],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'Sin embargo, el consumo en Alimentación es más regular a lo largo del año',
        filters: {"sector":['ALIMENTACION'],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'Los domingos, la mayor parte del gasto se realiza en RESTAURACION',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[[0,6]],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'y los días de lluvia (en Almería pocos...), la gente gasta menos',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":["rain"],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}
    },
    {
        description: 'Los habitantes de la provincia de Almería vienen al centro a comprar, sobre todo MODA',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":'04001'}
    },
    {
        description: 'Aunque hay distritos con mayor presencia de BARES y RESTAURANTES',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":'04002'}
    },
    {
        description: 'Como es de esperar, en las franjas horarias nocturnas la RESTAURACION es el principal gasto',
        filters: {"sector":[],"month":[],"timeofday":["22-24","00-02"],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null},
    },
    {
        description: 'y se concentra especialmente en los fines de semana',
        filters: {"sector":[],"month":[],"timeofday":["22-24","00-02"],"weather":[],"dayofweek":[[0,"5"]],"calendar":[],"mapSelection.cpComercio":null},
    },
    {
        description: 'en cualquier momento, puedes parar la historia y controlar la visualización de forma interactiva... ¡prueba!',
        filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null},
    },
]);

})();

