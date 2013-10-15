'use strict';
angular.module('miniPowerPCLoader', [])
.controller('LoaderCtrl', ['$scope', '$memory', '$assembler',
  function($scope, $memory, $assembler) {
    var PROGRAMSTART = 100;

    $scope.loadProgram = function(){
        var addr = PROGRAMSTART,
        lines = $scope.programSource.split('\n');
        lines.forEach(function(line){
           var cmd = line.split(" "), word;
           console.log(cmd);
           if(cmd != ""){
               word = $assembler[cmd[0]](cmd[1], cmd[2], cmd[3]);
               console.log(word);
               $memory.setWord(addr, word);
               addr += 2;
           }
           $memory.notify();
        });
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