'use strict';

angular.module('miniPowerpcApp')
  .controller('LoaderCtrl', function ($scope) {

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

  });

// Der Assemble Schritt muss pro Schritt mit der Ausführung stattfinden.
angular.module('miniPowerpcApp')
  .controller('AssemblerCtrl', function($scope){
    var validRegisters = function(rnr){
        if (typeof rnr != 'string') {
            throw("Register label must be string: " + rnr);
        }
        if (["00", "01", "10", "11"].indexOf(rnr) == -1) {
            throw("Invalid Register Error: " + rnr);
        }
    };

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
                    var op = "00000010 10000000"
                    return op.substring(0,4) + rnr + op.substring(6, op.length)
               },
        'ADD': function(rnr) {
                    validRegisters(rnr);
                    var op = "00000011 10000000"
                    return op.substring(0,4) + rnr + op.substring(6, op.length)
               },
        'ADDD': function(zahl) {
                    var num = parseInt(zahl);
                    if (num < -16384 || num > 16383 || isNaN(num)) {
                        throw("Zahl muss zwischen -16384 und 16383 sein. Ist: " + zahl);
                    }
                    var op = [1].concat(sysconv.dec2twoscomplement(num.toString(), 15));
                    return sysconv.bintobinoutput(op);

        }
    }
  });