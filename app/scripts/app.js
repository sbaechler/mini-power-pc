'use strict';

var miniPowerpcApp = angular.module('miniPowerpcApp', [
    'ngRoute',
    'miniPowerPCControllers',
    'miniPowerPCAssemblers',
    'miniPowerPCFilters',
    'memoryProvider',
]);


miniPowerpcApp.config(['$routeProvider',
     function ($routeProvider) {
        $routeProvider
          .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
          })
          .otherwise({
            redirectTo: '/'
          });
  }]);

