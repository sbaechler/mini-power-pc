'use strict';
var MiniPowerPCAssemblers = angular.module('miniPowerPCAssemblers', []);

MiniPowerPCAssemblers.controller('LoaderCtrl', ['$scope', function ($scope) {

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
MiniPowerPCAssemblers.controller('AssemblerCtrl', ['$scope', function($scope){
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