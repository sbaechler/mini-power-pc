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
               console.log(cmd + ": " + word);
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
            'LWDD 10 500',   // Lade Faktor a in Register 2
            'CLR 01',        // Register 01 löschen
            'CLR 00',        // Akku löschen
            'ADDD 16',       // 16 in den Akku schreiben.
            'SWDD 00 510',   // Die Zahl (16) in Speicher #510 schreiben. Dies ist ein Zähler
            'SWDD 01 504',   // Faktor a in Speicher #504 zwischenspeichern.
            'SWDD 01 506',  // Speicher #506 löschen.

            //mult:
            'LWDD 00 504',      // #114
            'SLL',             // Low Byte nach links
            'SWDD 00 504',
            'LWDD 00 506',     // High Byte laden
            'BCD 128',          // Wenn das Carry-Flag gesetzt ist, gehe direkt zu Else.
            'SLL',             // Shift nach links
            'BD 132',           // Else überspringen
            'SLL',             // Else: Shift nach links
            'INC',             // Plus 1
            'SWDD 00 506',     // Abspeichern  #132

            'LWDD 00 502',
            'SLL',             // Das MSB von Faktor b ins Carry schreiben.
            'BCD 142',          // Ist das Flag gesetzt: Faktor a Addieren.
            'BD 156',            // If Teil überspringen
            'LWDD 00 504',     // Faktor A zum Ergebnis addieren. //142
            'ADD 10',          //
            'BCD 150',         // Überlauf bei Lower: 1 zu upper addieren.
            'BD 156',          // If Teil überspringen
            'LWDD 00 506',
            'INC',             // 1 zu upper hinzufügen. #152
            'SWDD 00 506',

            //noadd:
            'LWDD 00 510',
            'DEC',
            'SWDD 00 510',
            'BNZD 114',    // #162
            'END'
        ].join("\n")
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