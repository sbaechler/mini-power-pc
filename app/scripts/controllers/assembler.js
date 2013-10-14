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
    $scope.mnemonics = {
        'CLR': function(rnr) {
                    var op = [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0];
                    op[4] = parseInt(rnr[0]);
                    op[5] = parseInt(rnr[1]);
                    return op;
               },
        'ADD': function(rnr) {
                    var op = [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0];
                    op[4] = parseInt(rnr[0]);
                    op[5] = parseInt(rnr[1]);
                    return op;
               },
        'ADDD': function(zahl) {
                    var num = parseInt(num);
                    if (num < -16384 || num > 16383 || isNaN(num)) {
                        throw "Zahl muss zwischen -16384 und 16383 sein."
                    }
                    return [1].concat(sysconv.dec2twoscomplement(num, 15));
        }
    }
  });