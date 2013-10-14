'use strict';

angular.module('miniPowerpcApp')
  .controller('MainCtrl', function ($scope) {
    $scope.memory = [];
    $scope.memory[640-1] = undefined;  // create 640 array cells
    console.log("Power PC ready. Memory: " + $scope.memory.length + " Bytes.");

    $scope.r00 = null;  // Akku
    $scope.r01 = null;  // R01
    $scope.r10 = null;  // R02
    $scope.r11 = null;  // R03
    $scope.instructionCounter = 100;
    $scope.instructionRegister = null;
    $scope.carryBit = 0;

    $scope.executionCounter = 0;

  });
