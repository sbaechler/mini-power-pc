'use strict';
angular.module('miniPowerPCLoader', [])
.controller('LoaderCtrl', ['$scope', '$memory', function($scope, $memory) {

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