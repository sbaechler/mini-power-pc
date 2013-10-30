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
            // Multiplikation zweier positiver 16-Bit Zahlen
// Faktor a befindet sich in #500, Faktor b in #502.
// Lösung muss in Speicher #504 (lower) und #506 (higher) stehen.

// Zwischenspeicher: 510: Zähler, 512: Vorzeichen.

      "CLR 00",
      "SWDD 00 512",     // Speicher 512 auf 0 setzen.

      //check a
      "LWDD 00 500",     // Lade Faktor a in den Akku
      "SLL",             // Shift nach links
      "BCD 112",         // 1. Bit ist 1 -> negative Zahl, muss invertiert werden.
      "BD 126",          // Adresse 110
      "LWDD 00 500",     // Faktor a neu laden
      "NOT",             // Invertieren
      "INC",             // 1 hinzufügen
      "SWDD 00 500",     // Positive Zahl in Speicher 500 schreiben.
      "CLR 00",           //Adresse 120
      "INC",
      "SWDD 00 512",     // 1 in Speicher 512 schreiben.

      //check b Adresse 126
      "LWDD 00 502",     // Lade Faktor b in den Akku
      "SLL",             // Shift nach links
      "BCD 134",         // Adresse 130: 1. Bit ist 1 -> negative Zahl, muss invertiert werden.
      "BD 148",
      "LWDD 00 502",     // Faktor a neu laden
      "NOT",             // Invertieren
      "INC",             // 1 hinzufügen
      "SWDD 00 502",     // Adresse 140: Positive Zahl in Speicher 500 schreiben.
      "LWDD 00 512",     // Wert aus Speicher 512 laden
      "INC",
      "SWDD 00 512",     // 1 in Speicher 512 schreiben.


      //load Adresse 148
      "LWDD 10 500",     // Lade Faktor a in Register 10
      "CLR 01",          // Adresse 150: Register 01 löschen
      "CLR 00",          // Akku löschen
      "ADDD 16",         // 16 in den Akku schreiben.
      "SWDD 00 510",     // Die Zahl (16) in Speicher #510 schreiben. Dies ist ein Zähler
      "SWDD 10 504",     // Faktor a in Speicher #504 zwischenspeichern.
      "SWDD 01 506",     // Adresse 160: Speicher #506 löschen.

      //mult: Adresse 168
      "LWDD 00 504",
      "SLL",             // Low Byte nach links
      "SWDD 00 504",
      "LWDD 00 506",     // High Byte laden
      "BCD 176",         // Adresse 170: Wenn das Carry-Flag gesetzt ist, gehe direkt zu Else.
      "SLL",             // Shift nach links
      "BD 182",          // Else überspringen
      "SLL",             // Else: Shift nach links
      "INC",             // Plus 1
      "SWDD 00 506",     // Adresse 180: Abspeichern

      //Adresse 182
      "LWDD 00 502",
      "SLL",             // Das MSB von Faktor b ins Carry schreiben.
      "SWDD 00 502",     // Wider speichern
      "BCD 192",         // Ist das Flag gesetzt: Faktor a Addieren.
      "BD 206",          // Adresse 190: If Teil überspringen
      "LWDD 00 504",     // Faktor A zum Ergebnis addieren.
      "ADD 10",          //
      "SWDD 00 504",
      "BCD 202",         // Überlauf bei Lower: 1 zu upper addieren.
      "BD 208",          // Adresse 200: If Teil überspringen
      "LWDD 00 506",
      "INC",             // 1 zu upper hinzufügen.
      "SWDD 00 506",

      //noadd:
      "LWDD 00 510",
      "DEC",              //Adresse 210
      "SWDD 00 510",
      "BNZD 168",

      //vorzeichen
      "LWDD 00 512",     // Zahl aus Speicher 512 laden. Wenn 1, muss Resultat negiert werden.
      "SRL",             // LSB checken
      "BCD 224",         //Adresse 220
      "END",
      "LWDD 00 504",     // Lower Zahl laden
      "NOT",
      "INC",
      "SWDD 00 504",     //Adresse 230
      "LWDD 00 506",
      "NOT",
      "INC",
      "SWDD 00 506",
      "END"

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