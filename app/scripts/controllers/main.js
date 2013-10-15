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
        $scope._get_instruction = function(){
                    if ($scope.memory[$scope.instructionCounter] != undefined) {
                        $scope.instructionRegister = $scope.memory[$scope.instructionCounter] + " "
                                                   + $scope.memory[$scope.instructionCounter+1];
                    }
        }
        $scope._update_ui = function(){
                    var mem = [];
                    var start = $scope.instructionCounter>=5 ? $scope.instructionCounter-5 : 5,
                        end = $scope.instructionCounter <= (MEMORY-10) ? $scope.instructionCounter+10 : MEMORY-10;
                    for (var i=start; i<=end; i++) {
                    mem.push({'value': $scope.memory[i], 'index': i,
                                  'class': i==$scope.instructionCounter ? 'success': ''});
                    }
                    $scope.currentSteps = mem;
                    $scope._get_instruction();
                };
        $scope._update_ui();
        $scope.step = function(){
            // Befehl auslesen
            // Befehl interpretieren
            // Resultat in Speicher schreiben
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)

            $scope.executionCounter += 1;
            this._update_ui();
        };


  }]);




// angular.element($0).scope()