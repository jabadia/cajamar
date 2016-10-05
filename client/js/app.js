(function(){
"use strict";

var app = angular.module('app', []);

app.service('backendApi', function($http)
{
	var psv = d3.dsv('|','text/plain');

	return {
		getCardsData: function()
		{
			var params = {
				// sector: 'MODA Y COMPLEMENTOS',
				sector: '*',
			};
			return $http.get('/api/cards/', {params: params}).then(function(response)
			{
				var cards = psv.parse(response.data, function(r)
				{
					r.DIA = new Date(r.DIA);
					r.IMPORTE = +r.IMPORTE;
					r.IMPORTE_MEDIO = +r.IMPORTE_MEDIO;
					r.NUM_OP = + r.NUM_OP;
					r.MES = +r.MES;
					r.DIA_SEMANA = +r.DIA_SEMANA;
					return r;
				});

				return cards;
			});
		},
		getSectores: function()
		{
			return $http.get('/api/sectores/').then(function(response)
			{
				return response.data;
			});
		},
		getWeather: function()
		{
			return $http.get('/api/weather/').then(function(response)
			{
				var weather = psv.parse(response.data, function(r)
				{
					r.day = new Date(r.day);
					r.temp_min = +r.temp_min;
					r.temp_max = +r.temp_max;
					r.humidity = +r.humidity;
					r.moon_phase =  +r.moon_phase;
					return r;
				});

				return weather;
			});
		},
	};
});
	
app.controller('MainCtrl', function($scope, backendApi)
{
	$scope.loading = true;
	backendApi.getWeather().then(function(weather)
	{
		$scope.weather = weather;
		console.table(weather.slice(0,10));
	});
	backendApi.getSectores().then(function(sectores)
	{
		$scope.sectores = sectores;
		console.log(sectores);
	});
	backendApi.getCardsData().then(function(data)
	{
		$scope.loading = false;
		$scope.data = data;
		console.table($scope.data.slice(0,5));

		var ndx = crossfilter($scope.data);

		var timeofdayDim = ndx.dimension(dc.pluck('FRANJA_HORARIA')),
			dayofweekDim = ndx.dimension(dc.pluck('DIA_SEMANA')),
			monthDim     = ndx.dimension(dc.pluck('MES')),
			sectorDim    = ndx.dimension(dc.pluck('SECTOR')),
			calendarDim  = ndx.dimension(dc.pluck('DIA'));

		var all = ndx.groupAll();
		var countPerSector    = sectorDim.group().reduceSum(function(d) { return d.IMPORTE; }),
			countPerMonth     = monthDim.group().reduceSum(function(d) { return d.IMPORTE; }),
			countPerTimeofday = timeofdayDim.group().reduceSum(function(d) { return d.IMPORTE; }),
			countPerDayofweek = dayofweekDim.group().reduceSum(function(d) { return d.IMPORTE; }),
			countPerDay       = calendarDim.group().reduceSum(function(d) { return d.IMPORTE; });

		var sectorChart = dc.barChart('.sector-chart'),
			monthChart = dc.barChart('.month-chart'),
			timeofdayChart = dc.pieChart('.timeofday-chart'),
			dayofweekChart = dc.bubbleChart('.dayofweek-chart');

		var sectors = _.map(countPerSector.all(),'key');
		console.log(sectors);

		sectorChart
			.width(1200)
			.height(150)
			.dimension(sectorDim)
			.group(countPerSector)
			.xUnits(dc.units.ordinal)
			.x( d3.scale.ordinal().domain(sectors) )
			.elasticY(true);
			// .centerBar(true)
			// .round(dc.round.floor)
			// .alwaysUseRounding(true);

		monthChart
			.width(300)
			.height(150)
			.dimension(monthDim)
			.group(countPerMonth)
			.x( d3.scale.linear().domain([1,13]))
			.elasticY(true)
			// .centerBar(true)
			.round(dc.round.floor)
			.alwaysUseRounding(true);

		timeofdayChart
			.width(300)
			.height(150)
			.dimension(timeofdayDim)
			.group(countPerTimeofday)
			.innerRadius(20);

		var extent = d3.extent(countPerDayofweek.all(), function(d) { return d.value; });
		dayofweekChart
			.width(500)
			.height(150)
			.dimension(dayofweekDim)
			.group(countPerDayofweek)
			.x( d3.scale.ordinal().domain([0,1,2,3,4,5,6]))
			.xUnits(dc.units.ordinal)
			.y( d3.scale.linear().domain([-10000,10000]))
			.valueAccessor(function() { return 0; })
			// .r( d3.scale.log().base(10).domain([0,100]).range([0,50]))
			.r( d3.scale.linear().domain(extent).range([0,1]) ) // [0,10000000]
			.radiusValueAccessor(function(d) {
				// console.log(d);
				return d.value; /// 100000;
			})
			.elasticRadius(false);


		dc.renderAll();

		var calendarData = _.map(countPerDay.all(), function(d)
		{
			return {
				date: d.key,
				count: d.value,
			};
		});

		var calendar = calendarHeatmap()
			.data(calendarData)
			.selector('.calendar')
			.tooltipEnabled(true)
			.colorRange(['#f4f7f7', '#79a8a9'])
			.onClick(function (data) {
				console.log('data', data);
			});
		calendar();

		//http://bl.ocks.org/eesur/5fbda7f410d31da35e42  calendar
		//http://angularscript.com/angular-directive-for-d3-js-calendar-heatmap/
	});
});

}());
