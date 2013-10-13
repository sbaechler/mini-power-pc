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

angular.module('miniPowerpcApp')
  .controller('AssemblerCtrl', function($scope){
     $scope.memory = [];
     $scope.memory[640-1] = undefined;  // create 640 array cells
     console.log("Available Memory: " + $scope.memory.length + " Bytes.");
  });