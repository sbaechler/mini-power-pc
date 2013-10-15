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
  })
  .filter('add', function(){
    return function(input, c) {
        return (parseInt(input)+c).toString();
    }
  })
  .filter('subtract', function(){
    return function(input, c) {
        return (parseInt(input)-c).toString();
    }
  })
  .filter('int16', function(){
    return function(input, index, start) {
        var start = start || 0,
            pos = index + start;
        if ((pos)%2==0) {  // ist eine gerade Zelle
            var binaryNumber = input[pos]+input[pos+1];
            return binaryNumber || "";
        } else {
            return "";
        }
    }
  });