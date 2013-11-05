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
// http://www.avr-asm-tutorial.net/avr_de/quellen/mult8.asm

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
        "CLR 00",          // Akku löschen  150
        "CLR 01",          //
        "CLR 11",          //
        "LWDD 10 500",     // Lade Faktor a in Register 10
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
        "BCD 174",  //  170 springe, wenn niedrigstes Bit eine Null ist, ueber das Addieren hinweg.
        "BD 196",  // -> # step4
        // #add Addiere 16 Bits in rmh:rm1 zum Ergebnis in reh:rel (mit Ueberlauf der unteren 8 Bits!
        "LWDD 00 504",   // #add: Lade lower in Akku
        "LWDD 10 500",
        "ADD 10",        // Faktor a addieren
        "SWDD 00 504",                          // 180
        "LWDD 00 506",
        "BCD 188",  //   ->#addBCarry
        "BD 190",  // -> #loadRmh
        "ADDD 1",       // #addBCarry
        "LWDD 11 510",   // #loadRmh  190
        "ADD 11",    //
        "SWDD 00 506",      //

        // #step4
        "LWDD 00 500",
        "SLL",              //
        "SWDD 00 500",          // 200
        "LWDD 00 510",
        "BCD 208",       //   -> #addACarry
        "BD 214",   //-> #shiftMSB
        "SLL",  // #addACarry
        "INC",      // 210
        "BD 216",   // -> #step5
        "SLL", // #shiftMSB
        "SWDD 00 510",

        //  #step5
        "LWDD 00 502",
        "BZD 224",  //   220
        "BD 164",  // -> #step1

      //vorzeichen:
      "LWDD 00 512",     //  Zahl aus Speicher 512 laden. Wenn 1, muss Resultat negiert werden.
      "SRL",             // LSB checken
      "BCD 232",         // +2
      "END",
      "LWDD 00 504",     // Lower Zahl laden
      "NOT",
      "INC",             //Adresse
      "SWDD 00 504",      //
      "LWDD 00 506",
      "NOT",
      "SWDD 00 506",
      "END"             //

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