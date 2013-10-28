'use strict';

var miniPowerpcApp = angular.module('miniPowerpcApp', [
    'ngRoute',
    'miniPowerPCControllers',
    'miniPowerPCAssembler',
    'miniPowerPCFilters',
    'memoryProvider',
    'miniPowerPCLoader',
    'sysconvProvider',
    'uiSlider'
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


