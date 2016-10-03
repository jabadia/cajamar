(function(){
"use strict";

var app = angular.module('app', []);

app.service('backendApi', function($http)
{
	return {
		getCsv: function()
		{
			return $http.get('/query_csv').then(function(response)
			{
				return response.data;
			});
		},
	};
});
	
app.controller('MainCtrl', function($scope, backendApi)
{
	$scope.loading = true;
	backendApi.getCsv().then(function(csv)
	{
		$scope.csv = csv;
		$scope.loading = false;
	});
});

}())
