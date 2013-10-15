'use strict';
var miniPowerPCFilters = angular.module('miniPowerPCFilters', []);

miniPowerPCFilters
    .filter('subarray', function(){
     return function(input, start, end) {
       if(input instanceof Array){
         return input.slice(start, end);
       } else {
         return "";
       }
     }
  });