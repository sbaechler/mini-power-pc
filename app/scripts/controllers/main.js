'use strict';
var miniPowerPCControllers = angular.module('miniPowerPCControllers',
                                            ['sysconvProvider', 'memoryProvider']);



miniPowerPCControllers.controller('MainCtrl', ['$scope', '$memory', '$sysconv', '$rootScope',
                                               '$timeout',
    function MainCtrl($scope, $memory, $sysconv, $rootScope, $timeout) {
        // console.log("Power PC ready. Memory: " + $memory.memory().length + " Bytes.");
        var WORDLENGTH = 16;
        $rootScope.WORDLENGTH = WORDLENGTH;
        $scope.stop = false;
        $scope.r00 = null;  // Akku
        $scope.r01 = null;  // R01
        $scope.r10 = null;  // R02
        $scope.r11 = null;  // R03
        $scope.speicherWert = []; // Temp. Variable bei Direkteingabe von Werten.
        $scope.instructionCounter = 100;
        $scope.instructionRegister = null;
        $scope.carryBit = false;
        $scope.speed = 10;
        $scope.assemblerCommands =  [
            {"name": "CLR Rnr", "regex": /^0000([01]{2})101[01]{7}$/, "assemblerFunction": function(matches) {
                    $scope['r'+matches[1]] = "00000000 00000000";
                    $scope.carryBit = false;
                }},

            {"name": "ADD Rnr", "regex": /^0000([01]{2})111[01]{7}$/, "assemblerFunction": function(matches) {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                var bin2 = $sysconv.bintruncate($sysconv.bininputtobin($scope['r'+matches[1]]), WORDLENGTH);
                // var result = $sysconv.bintruncate($sysconv.binadd(bin1, bin2), WORDLENGTH);
                // $scope.carryBit = bin1[0]==bin2[0] && bin1[0]!=result[0];
                var result = $sysconv.binadd(bin1, bin2);
                $scope.carryBit = result.length > WORDLENGTH;// && !(bin1[0]&&bin2[0]);
                $scope.r00 = $sysconv.binarray2word($sysconv.bintruncate(result, WORDLENGTH));
                }
            },

            {"name": "ADDD #Zahl", "regex": /^1([01]{15})$/,  "assemblerFunction": function(matches) {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                var bin2 = $sysconv.bintruncate($sysconv.bininputtobin(matches[1]), 15);
                bin2.unshift(bin2[0]);  // copy first element
                var result = $sysconv.bintruncate($sysconv.binadd(bin1, bin2), WORDLENGTH);
                $scope.carryBit = bin1[0]==bin2[0] && bin1[0]!=result[0];
                $scope.r00 = $sysconv.binarray2word(result);
                }
            },

            {"name": "INC", "regex": /^00000001[01]{8}$/, "assemblerFunction": function() {
                var msb = $scope.r00[0];
                $scope.r00 = $sysconv.binarray2word($sysconv.binaddone(
                    $sysconv.bininputtobin($scope.r00)
                ));
                $scope.carryBit = msb==='0' && $scope.r00[0] === '1';
                }},
            {"name": "DEC", "regex": /^00000100[01]{8}$/, "assemblerFunction": function(matches) {
                var msb = $scope.r00[0];
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                var bin2 = $sysconv.dec2twoscomplement('-1', WORDLENGTH);
                var result = $sysconv.bintruncate($sysconv.binadd(bin1, bin2), WORDLENGTH);
                $scope.r00 = $sysconv.binarray2word(result);
                $scope.carryBit = msb==='1' && $scope.r00[0] === '0';
                }},

            {"name": "LWDD Rnr, #Adr", "regex": /^010[01]([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                var addrInDec = $sysconv.bin2dec(matches[2]);
                $scope['r'+matches[1]] = $memory.getWord(addrInDec);
            }},


            {"name": "SWDD Rnr, #Adr", "regex": /^011[01]([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                   var regValue = $scope['r'+matches[1]];
                   var address = $sysconv.bin2dec(matches[2]);
                   $memory.setWord(address, regValue);
            }},


            {"name": "SRA", "regex": /^00000101[01]{8}$/, "assemblerFunction": function() {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                $scope.carryBit = bin.pop();
                bin.unshift(bin[0]);  // copy first element
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SLA", "regex": /^00001000[01]{8}$/,"assemblerFunction": function() {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                $scope.carryBit = bin[1];
                bin.shift();
                bin.push(false);
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SRL Rnr", "regex": /^00001001[01]{8}$/, "assemblerFunction": function() {
                var bin = $sysconv.bininputtobin($scope.r00);
                $scope.carryBit = bin.pop();
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SLL Rnr", "regex": /^00001100[01]{8}$/, "assemblerFunction": function() {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                $scope.carryBit = bin.shift();
                bin.push(false);
                $scope.r00 = $sysconv.bintobinoutput(bin);
            }},

            {"name": "AND Rnr", "regex": /^0000([01]{2})100[01]{7}$/, "assemblerFunction": function(matches) {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                var bin2 = $sysconv.bintruncate($sysconv.bininputtobin($scope['r'+matches[1]]), WORDLENGTH);
                var result = Array(WORDLENGTH);
                for (var i=0; i< WORDLENGTH; i++){
                    result[i] = bin1[i] && bin2[i];
                }
                $scope.r00 = $sysconv.binarray2word(result);
            }},
            {"name": "OR Rnr", "regex": /^0000([01]{2})110[01]{7}$/, "assemblerFunction": function(matches) {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                var bin2 = $sysconv.bintruncate($sysconv.bininputtobin($scope['r'+matches[1]]), WORDLENGTH);
                var result = Array(WORDLENGTH);
                for (var i=0; i< WORDLENGTH; i++){
                    result[i] = bin1[i] || bin2[i];
                }
                $scope.r00 = $sysconv.binarray2word(result);
            }},
            {"name": "NOT", "regex": /^000000001[01]{7}$/, "assemblerFunction": function() {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), WORDLENGTH);
                $scope.r00 = $sysconv.binarray2word($sysconv.onescomplement(bin1));
            }},

            {"name": "BZ Rnr", "regex": /^0001([01]{2})10[01]{8}$/, "assemblerFunction": function(matches) {
                if($scope.r00 === "00000000 00000000") {
                    $scope.instructionCounter = $sysconv.bin2dec($scope['r'+matches[1]]);
                }
            }},
            {"name": "BNZ Rne", "regex": /^0001([01]{2})01[01]{8}$/, "assemblerFunction": function(matches) {
                if($scope.r00 !== "00000000 00000000") {
                    $scope.instructionCounter = $sysconv.bin2dec($scope['r'+matches[1]]);
                }
            }},
            {"name": "BC Rnr", "regex": /^0001([01]{2})11[01]{8}$/, "assemblerFunction": function(matches) {
                if($scope.carryBit) {
                    $scope.instructionCounter = $sysconv.bin2dec($scope['r'+matches[1]]);
                }
            }},
            {"name": "B Rnr", "regex": /^0001([01]{2})00[01]{8}$/, "assemblerFunction": function(matches) {
                $scope.instructionCounter = $sysconv.bin2dec($scope['r'+matches[1]]);
            }},

            {"name": "BZD #Adr", "regex": /^00110[01]([01]{10})$/, "assemblerFunction": function(matches) {
                if($scope.r00 === "00000000 00000000") {
                    $scope.instructionCounter =  $sysconv.bin2dec(matches[1]);
                }
            }},
            {"name": "BNZD #Adr", "regex": /^00101[01]([01]{10})$/,"assemblerFunction": function(matches) {
                if($scope.r00 !== "00000000 00000000") {
                    $scope.instructionCounter = $sysconv.bin2dec(matches[1]);
                }
            }},
            {"name": "BCD #Adr", "regex": /^00111[01]([01]{10})$/, "assemblerFunction": function(matches) {
                if($scope.carryBit) {
                    $scope.instructionCounter = $sysconv.bin2dec(matches[1]);
                }
            }},
            {"name": "BD #Adr", "regex": /^00100[01]([01]{10})$/, "assemblerFunction": function(matches) {
                $scope.instructionCounter = $sysconv.bin2dec(matches[1]);
            }},

            {"name": "END", "regex": /^0{16}$/, "assemblerFunction": function() {
                $scope.stop = true;
            }}
        ];
        $scope.get_memory = function(start, end){
                                return $memory.memory(start, end);
                            };
        $scope.get_decimal = function(addr){
                                return $memory.getDecimal(addr);
                            };
        $scope.executionCounter = 0;
        $scope.currentSteps = [];  // Hilfsarray zur Darstellung.
        $scope._get_instruction = function(){
                    $scope.instructionRegister = $memory.getWord($scope.instructionCounter);
        }
        $scope.updateUI = function(){
                    var mem = [];
                    var start = $scope.instructionCounter>=5 ? $scope.instructionCounter-5 : 5,
                        end = $scope.instructionCounter <= ($memory.MEMORY-10) ?
                                        $scope.instructionCounter+10 : $memory.MEMORY-10;
                    for (var i=start; i<=end; i++) {
                    mem.push({'value': $memory.memory()[i], 'index': i,
                                  'class': i==$scope.instructionCounter ? 'success': ''});
                    }
                    $scope.currentSteps = mem;
                    for(var i=500; i<=510; i=i+2) {
                        $scope.speicherWert[i] = $memory.getDecimal(i);
                    }
                    var i = 507;
                    var lower = $memory.getWord(i-3);
                    var higher = $memory.getWord(i-1);
                    var longStr = higher + lower;
                    $scope.speicherWert[i] = $sysconv.bin2dec(longStr, 32);
                    $scope._get_instruction();
                };
        $scope.updateUI();
        $scope.step = function(){
            // Befehl auslesen
            this._get_instruction();
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)
            this.instructionCounter += 2;
            // Befehl interpretieren
            this._interpret();
            // Resultat in Speicher schreiben
            this.executionCounter += 1;
            this.updateUI();
        };
        $scope.run = function(){
            if(!$scope.stop && $scope.instructionCounter < $memory.MEMORY) {
                $scope.step();
                $timeout($scope.run, 200-(($scope.speed-1)*10));
            }
        };
        $scope.fastForward = function(){
            while(!$scope.stop && $scope.instructionCounter < $memory.MEMORY) {
                $scope.step();
            }
        }
        $memory.listen($scope.updateUI);
        $scope.restart = function(){
            this.stop = true;
            this.instructionCounter = 100;
            this.executionCounter = 0;
            this.carryBit = false;
            $timeout(function(){$scope.stop = false;},1000);
            this.updateUI();
        }
        $scope.reset = function(){
            this.restart();
            $memory.wipe();
            this.updateUI();
        }
        $scope.storeValue = function(addr){
            try {
                $memory.setDecimal(addr, this.speicherWert[addr].toString());
            } catch(ValueError) {}  // Kommt bei der Eingabe des Minus
        }
        $scope._interpret = function(){
            var instruction = this.instructionRegister.replace(" ", "");

            for (var i=0;i<this.assemblerCommands.length;i++)
            {
                var regex = this.assemblerCommands[i].regex;
                if(instruction.match(regex)){
                    var matches = regex.exec(instruction);
                    this.assemblerCommands[i].assemblerFunction(matches);
                    break;
                }
            }

                //$sysconv.bin2dec
            //$scope['r'+nr] = "00000000 00000001"
        }
  }]);




// angular.element($0).scope()