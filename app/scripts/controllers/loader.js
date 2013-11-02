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


        // load:
        "LWDD 10 500",     // Lade Faktor a in Register 10  150
        "CLR 00",          // Akku löschen
        "CLR 01",          //
        "CLR 10",          //
        "SWDD 00 510",     // Hilfsregister löschen.
        "SWDD 00 506",     // Speicher #506 löschen.   160
        "SWDD 00 504",     // Speicher 504 (lower) löschen.

        // mult:
        // Erster Schritt: Niedrigstes Bit von Faktor b
        // in das Carry-Bit schieben (von links Nullen nachschieben)
        "LWDD 00 502",
        "SRL",
        "SWDD 00 502",
        // #step2: Verzweigen je nachdem ob eine Null oder eine Eins im Carry steht
        "BCD 174",  // springe, wenn niedrigstes Bit eine Null ist, ueber das Addieren hinweg.  170
        "BD 192",  // -> # step4
        // #add Addiere 16 Bits in rmh:rm1 zum Ergebnis in reh:rel (mit Ueberlauf der unteren 8 Bits!
        "LWDD 00 504",   // #add: Lade lower in Akku
        "ADD 10",        // Faktor a addieren
        "SWDD 00 504",
        "BCD 184",  // 180  ->#addBCarry
        "BD 188",  // -> #loadRmh
        "LWDD 00 510",   // #addBCarry
        "ADDD 1",
        "ADD 01",    // #loadRmh
        "SWDD 00 510",      // 190

        // #step4
        "LWDD 00 500",
        "SLL",
        "SWDD 00 500",
        "LWDD 00 510",
        "BCD 204",       // 200  -> #addACarry
        "BD 210",   //-> #shiftMSB
        "SLL",  // #addACarry
        "INC",
        "BD 212",   // -> #step5
        "SLL", // #shiftMSB     210

        //  #step5
        "LWDD 00 502",
        "BZD 192",  // -> #step4

      //vorzeichen: Adresse 216
      "LWDD 00 512",     // Zahl aus Speicher 512 laden. Wenn 1, muss Resultat negiert werden.
      "SRL",             // LSB checken
      "BCD 224",         // +2      220
      "END",
      "LWDD 00 504",     // Lower Zahl laden
      "NOT",
      "INC",             //Adresse
      "SWDD 00 504",      //  230
      "LWDD 00 506",
      "NOT",
      "INC",
      "SWDD 00 506",
      "END"             //240

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