'use strict';
var miniPowerPCFilters = angular.module('miniPowerPCFilters', ['sysconvProvider']);

miniPowerPCFilters
    .filter('subarray', function(){
     return function(input, start, end) {
       if(input instanceof Array){
         return input.slice(start, end);
       } else {
         return "";
       }
     }
  }).filter('binToDec', ['$sysconv', function($sysconv){
        return function(word){
            if(word != undefined){
                return $sysconv.twoscomplement2dec(word);
            } else {
                return "";
            }
        }
    }]);