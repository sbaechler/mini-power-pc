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
            /*init*/
            "LWDD 02, #502", /*Hier steht das zwischenergebnis. am anfang ist der wert = 2.zah*/

            /*Schleifenstart.der wert des zähler ist am anfang 0*/
            "LWDD 00, #504", /*Zähler aus der adresse in akku speichern*/
            "SLA", /*zähler um eins nach links verschieben*/
            "SWDD 00, #504", /*zähler zurück in die adresse laden*/
            "BZD #", /*wenn der akku ==0 ist, sollte abgebrochen werden*/

            "LWDD 01, #504", /*Zähler aus der adresse nach register 1 speichern*/
            "LWDD 00, #504",/*1. zahl der mult. aus der adresse ins akku speichern*/
            "AND 01", /*Logisches & mit akku (1 Zahl) und R1 (zähler). schauen ob an der stelle eine 1 oder 0 steht.*/

            /*wenn der akku ==0 ist*/
            "BZD #", /*wenn der akku 0 ist, wiederhole die schleife*/

            /*wenn der akku !=0 ist*/
            "LWDD 00, #502", /* zweite zahl der multiplikation ins akku laden*/
            "INC", /*Akkuinhalt um eins erhöhen bzw um ein verschieben*/
            "SWDD 00, #502", /*die verschobene 2. zahl zurück in die adresse speichern*/
            "ADD 02", /*zwischenergebnis + verschobene 2. zahl, ergebnis steht in der akku*/
            "LWDD 03, #502", /*die verschobene 2. zahl ins register 3 verschieben*/
            "SWDD 00, #502", /*das neue ergebnis in die adresse speichern*/
            "LWDD 02, #502", /*das neue ergebnis ins register 2 verschieben*/
            "SWDD 03, #502", /*die 2. zahl wieder zurück in die adresse speichern*/
            "BD #", /*unbedingter sprung, wiederhole die schleife*/
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