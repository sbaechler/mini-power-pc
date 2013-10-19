'use strict';
var miniPowerPCControllers = angular.module('miniPowerPCControllers', []);

miniPowerPCControllers.controller('MainCtrl', ['$scope', '$memory',
    function MainCtrl($scope, $memory) {
        console.log("Power PC ready. Memory: " + $memory.memory().length + " Bytes.");

        $scope.r00 = null;  // Akku
        $scope.r01 = null;  // R01
        $scope.r10 = null;  // R02
        $scope.r11 = null;  // R03
        $scope.speicherWert = null; // Temp. Variable bei Direkteingabe von Werten.
        $scope.instructionCounter = 100;
        $scope.instructionRegister = null;
        $scope.carryBit = 0;
        $scope.get_memory = function(start, end){
                                return $memory.memory(start, end);
                            }
        $scope.get_decimal = function(addr){
                                return $memory.getDecimal(addr);
                            }
        $scope.executionCounter = 0;
        $scope.currentSteps = [];
        $scope._get_instruction = function(){
                    $scope.instructionRegister = $memory.getWord($scope.instructionCounter);
        }
        $scope.updateUI = function(){
                    var mem = [];
                    var start = $scope.instructionCounter>=5 ? $scope.instructionCounter-5 : 5,
                        end = $scope.instructionCounter <= ($memory.MEMORY-10) ?
                                        $scope.instructionCounter+10 : $memory.MEMORY-10;
                    for (var i=start; i<=end; i++) {
                    mem.push({'value': $memory.memory()[i], 'index': i,
                                  'class': i==$scope.instructionCounter ? 'success': ''});
                    }
                    $scope.currentSteps = mem;
                    $scope._get_instruction();
                };
        $scope.updateUI();
        $scope.step = function(){
            // Befehl auslesen
            $scope._get_instruction();
            // Befehl interpretieren

            // Resultat in Speicher schreiben
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)
            $scope.instructionCounter += 2;

            $scope.executionCounter += 1;
            this.updateUI();
        };
        $memory.listen($scope.updateUI);
        $scope.reset = function(){
            this.instructionCounter = 100;
            this.executionCounter = 0;
            this.updateUI();
        }
        $scope.storeValue = function(addr){
            $memory.setDecimal(addr, this.speicherWert);
        }
  }]);




// angular.element($0).scope()