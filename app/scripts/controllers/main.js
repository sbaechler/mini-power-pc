'use strict';
var miniPowerPCControllers = angular.module('miniPowerPCControllers', []);

miniPowerPCControllers.controller('MainCtrl', ['$scope', '$http',
    function MainCtrl($scope, $http) {
        var MEMORY = 1024;
        $scope.memory = [];
        $scope.memory[MEMORY-1] = undefined;  // create 1024 array cells
        console.log("Power PC ready. Memory: " + $scope.memory.length + " Bytes.");

        $scope.r00 = null;  // Akku
        $scope.r01 = null;  // R01
        $scope.r10 = null;  // R02
        $scope.r11 = null;  // R03
        $scope.instructionCounter = 100;
        $scope.instructionRegister = null;
        $scope.carryBit = 0;

        $scope.executionCounter = 0;
        $scope.currentSteps = [];
        $scope.update_ui = (function(){
            var mem = [];
            var start = $scope.instructionCounter>=5 ? $scope.instructionCounter-5 : 5,
                end = $scope.instructionCounter <= (MEMORY-10) ? $scope.instructionCounter+10 : MEMORY-10;
            for (var i=start; i<=end; i++) {
            mem.push({'value': $scope.memory[i], 'index': i,
                          'class': i==$scope.instructionCounter ? 'success': ''});
            }
            $scope.currentSteps = mem;
            // Befehlsregister
            if ($scope.memory[$scope.instructionCounter] != undefined) {
                $scope.instructionRegister = $scope.memory[$scope.instructionCounter] + " "
                                           + $scope.memory[$scope.instructionCounter+1];
            }
        })();
        $scope.step = function(){
            console.log("step");
            // Befehl auslesen
            // Befehl interpretieren
            // Resultat in Speicher schreiben
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)

            $scope.executionCounter += 1;
            console.log($scope.executionCounter);
        };


  }])
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


// angular.element($0).scope()