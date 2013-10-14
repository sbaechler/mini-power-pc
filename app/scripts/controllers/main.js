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
        $scope._update_ui = function(){
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



miniPowerPCControllers.controller('LoaderCtrl', ['$scope', function ($scope) {

    $scope.loadProgram = function(value){
        // deal with program input
        console.log($scope.programSource);
    };
    $scope.defaultPrograms = [
        {'name': 'add1', 'code': "CLR 00\nINC\n"},
        {'name': 'add2', 'code': "CLR 00\nINC\nINC"}
    ];
    $scope.fillProgram = function(value){
        if (value){
            $scope.programSource = value.code;
        } else {
            $scope.programSource = "";
        }
    };

  }]);

// Der Assemble Schritt muss pro Schritt mit der Ausführung stattfinden.
miniPowerPCControllers.controller('AssemblerCtrl', ['$scope', function($scope){
    var validRegisters = function(rnr){
        if (typeof rnr != 'string') {
            throw("Register label must be string: " + rnr);
        }
        if (["00", "01", "10", "11"].indexOf(rnr) == -1) {
            throw("Invalid Register Error: " + rnr);
        }
    };
    var regToArray = function(rnr){
        return {"00": [0,0],
                "01": [0,1],
                "10": [1,0],
                "11": [1,1]
        }[rnr];
    };
    var addrToArray = function(addr){
        var num = parseInt(addr);
        if (num < 0 || num > 1022 || isNaN(num)) {
            throw("Kann nur 1022 Speicherstellen alloziieren.");
        }
        return sysconv.dec2twoscomplement(num.toString(), 10);
    }

    /**
     * Gibt die Maschinen-Codes für die entsprechenden Mnemonics zurück.
     * Als Argument müssen die korrekten Argumente mitgegeben werden.
     * Rückgabe ist String in der Form "00000000 00000000"
     *
     * @type {{CLR: Function, ADD: Function, ADDD: Function}}
     */

    $scope.mnemonics = {
        'CLR': function(rnr) {
                    validRegisters(rnr);
                    var op = "00000010 10000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
               },
        'ADD': function(rnr) {
                    validRegisters(rnr);
                    var op = "00000011 10000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
               },
        'ADDD': function(zahl) {
                    var num = parseInt(zahl);
                    if (num < -16384 || num > 16383 || isNaN(num)) {
                        throw("Zahl muss zwischen -16384 und 16383 sein. Ist: " + zahl);
                    }
                    var op = [1].concat(sysconv.dec2twoscomplement(num.toString(), 15));
                    return sysconv.bintobinoutput(op);

               },
        'INC': function(){
                    return "00000001 00000000";
               },
        'DEC': function(){
                    return "00000100 00000000";
               },
        'LWDD': function(rnr, addr) {
                    validRegisters(rnr);
                    var op = [0,1,0,0].concat(regToArray(rnr))
                              .concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'SWDD': function(rnr, addr) {
                    validRegisters(rnr);
                    var op = [0,1,1,0].concat(regToArray(rnr)).concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'SRA': function(){
                    return "00000101 00000000";
                },
        'SLA': function(){
                    return "00001000 00000000";
                },
        'SRL': function(){
                    return "00001001 00000000";
                },
        'SLL': function(){
                    return "00001100 00000000";
                },
        'AND': function(rnr){
                    validRegisters(rnr);
                    var op = "00000010 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'OR': function(rnr){
                    validRegisters(rnr);
                    var op = "00000011 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'NOT': function(){
                    return "00000000 10000000";
                },
        'BZ': function(rnr){
                    validRegisters(rnr);
                    var op = "00010010 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'BNZ': function(rnr){
                    validRegisters(rnr);
                    var op = "00010001 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'BC':  function(rnr){
                    validRegisters(rnr);
                    var op = "00010011 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'B':   function(rnr){
                    validRegisters(rnr);
                    var op = "00010000 00000000";
                    return op.substring(0,4) + rnr + op.substring(6, op.length);
                },
        'BZD': function(addr){
                    var op = [0,0,1,1,0].concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'BNZD': function(addr){
                    var op = [0,0,1,0,1].concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'BCD': function(addr){
                    var op = [0,0,1,1,1].concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'BD': function(addr){
                    var op = [0,0,1,0,0].concat(addrToArray(addr));
                    return sysconv.bintobinoutput(op);
                },
        'END': function(){
                    return "00000000 00000000";
        }
    }
  }]);

// angular.element($0).scope()