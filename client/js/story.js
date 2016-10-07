(function(){
"use strict";

var module = angular.module('story',[]);

module.constant('theStory', [
    {description: '', filters: {"sector":["MODA Y COMPLEMENTOS"],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[[0,"6"]],"calendar":[],"mapSelection.cpComercio":null}},
    {description: '', filters: {"sector":["ALIMENTACION"],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":["rain"],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":'04001'}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":'04002'}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":'04003'}},
    {description: '', filters: {"sector":[],"month":[],"timeofday":[],"weather":[],"dayofweek":[],"calendar":[],"mapSelection.cpComercio":null}},
]);

})();

