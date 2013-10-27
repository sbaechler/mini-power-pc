'use strict';
angular.module('miniPowerPCLoader', ['sysconvProvider', 'memoryProvider', 'miniPowerPCAssembler'])
.controller('LoaderCtrl', ['$scope', '$memory', '$assembler', '$document',
  function($scope, $memory, $assembler, $document) {
    var PROGRAMSTART = 100;

    $scope.loadProgram = function(){
        $memory.wipe();
        var addr = PROGRAMSTART,
        lines = $scope.programSource.split('\n');
        lines.forEach(function(line){
           var cmd = line.split(" "), word;
           // console.log(cmd);
           if(cmd != ""){
               word = $assembler[cmd[0]](cmd[1], cmd[2], cmd[3]);
               console.log(word);
               $memory.setWord(addr, word);
               addr += 2;
           }
        });
       $memory.notify();
       setTimeout(function(){
           $document.find('#program-form').collapse('hide');
       }, 200);
    };
    $scope.defaultPrograms = [
        {'name': 'add1', 'code': "CLR 00\nINC\n"},
        {'name': 'a+4*b+8*c', 'code': [
            "LWDD 00 504",
            "SLA",
            "LWDD 01 502",
            "ADD 01",
            "SLA",
            "SLA",
            "LWDD 01 500",
            "ADD 01",
            "SWDD 00 506",
            "END"].join("\n")
        },
        {'name': 'Speicher 500 * Speicher 502', 'code': [
            LWDD 00, #504
            SLA
            SWDD 00, #504


            LWDD 00, #506
            SLA
            SWDD 00, #506

            LWDD 00, #502
            SLA
            SWDD 00, #502
            BCD #Sprung
            LWDD 00, #504
            ADDD #500
            SWDD 00, #504

            BCD [#Sprung]
            LWDD 00, #506
            INC
            SWDD 00, #506
            BD NOADD

            LWDD 00, #508
            DEC

      BNZD #Sprung

      "END"].join("\n")
        }
    ];
    $scope.fillProgram = function(value){
        if (value){
            $scope.programSource = value.code;
        } else {
            $scope.programSource = "";
        }
    };

  }]);