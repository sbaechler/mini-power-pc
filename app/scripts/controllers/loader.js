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
      "BCD 112",         // +2: 1. Bit ist 1 -> negative Zahl, muss invertiert werden.
      "BD 128",          // Adresse 110: check b
      "LWDD 00 500",     // Faktor a neu laden
      "NOT",             // Invertieren
      "INC",             // 1 hinzufügen
      "SWDD 00 500",     // Positive Zahl in Speicher 500 schreiben.
      "CLR 00",          // Adresse 120:
      "LWDD 00 512",     //  Wert aus Speicher 512 laden
      "INC",
      "SWDD 00 512",     // 1 in Speicher 512 schreiben.

      //check b Adresse 128
      "LWDD 00 502",     // Lade Faktor b in den Akku
      "SLL",             // Adresse 130: Shift nach links
      "BCD 136",         // +2: 1. Bit ist 1 -> negative Zahl, muss invertiert werden.
      "BD 150",          // load
      "LWDD 00 502",     // Faktor a neu laden
      "NOT",             // Invertieren
      "INC",             // Adresse 140: 1 hinzufügen
      "SWDD 00 502",     // Positive Zahl in Speicher 502 schreiben.
      "LWDD 00 512",     // Wert aus Speicher 512 laden
      "INC",
      "SWDD 00 512",     // 1 in Speicher 512 schreiben.


      //load Adresse 150
      "LWDD 10 500",     // Adresse 150: Lade Faktor a in Register 10
      "CLR 01",          // Register 01 löschen
      "CLR 00",          // Akku löschen
      "ADDD 16",         // 16 in den Akku schreiben.
      "SWDD 00 510",     // Die Zahl (16) in Speicher #510 schreiben. Dies ist ein Zähler
      "SWDD 10 504",     // Adresse 160: Faktor a in Speicher #504 zwischenspeichern.
      "SWDD 01 506",     // Speicher #506 löschen.

      //mult: Adresse 164
      "LWDD 00 504",
      "SLL",             // Low Byte nach links
      "SWDD 00 504",
      "LWDD 00 506",     // Adresse 170: High Byte laden
      "BD 178",         // +3: Wenn das Carry-Flag gesetzt ist, gehe direkt zu Else.
      "SLL",             // Shift nach links
      "BD 182",          // +3: Else überspringen
      "SLL",             // Else: Shift nach links
      "SWDD 00 506",    // Adresse 180: Plus 1
      "SWDD 00 506",     // Abspeichern

      //Adresse 184
      "LWDD 00 502",
      "SLL",             // Das MSB von Faktor b ins Carry schreiben.
      "SWDD 00 502",     // Wider speichern
      "BCD 194",         // Adresse 190: +2: Ist das Flag gesetzt: Faktor a Addieren.
      "BD 208",          // +8: If Teil überspringen
      "LWDD 00 504",     // Faktor A zum Ergebnis addieren.
      "ADD 10",          //
      "SWDD 00 504",
      "BCD 204",         // Adresse 200: +2:Überlauf bei Lower: 1 zu upper addieren.
      "BD 210",          // +4: If Teil überspringen
      "LWDD 00 506",
      "INC",             // 1 zu upper hinzufügen.
      "SWDD 00 506",

      //noadd: Adresse 210
      "LWDD 00 510",     //Adresse 210
      "DEC",
      "SWDD 00 510",
      "BNZD 164",        //mult

      //vorzeichen: Adresse 216
      "LWDD 00 512",     // Zahl aus Speicher 512 laden. Wenn 1, muss Resultat negiert werden.
      "SRL",             //Adresse 220: LSB checken
      "BCD 226",         // +2
      "END",
      "LWDD 00 504",     // Lower Zahl laden
      "NOT",
      "INC",             //Adresse 230
      "SWDD 00 504",
      "LWDD 00 506",
      "NOT",
      "INC",
      "SWDD 00 506",    //240
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