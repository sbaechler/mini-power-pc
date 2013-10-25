'use strict';
var miniPowerPCControllers = angular.module('miniPowerPCControllers',
                                            ['sysconvProvider', 'memoryProvider']);

miniPowerPCControllers.controller('MainCtrl', ['$scope', '$memory', '$sysconv',
    function MainCtrl($scope, $memory, $sysconv) {
        console.log("Power PC ready. Memory: " + $memory.memory().length + " Bytes.");

        $scope.r00 = null;  // Akku
        $scope.r01 = null;  // R01
        $scope.r10 = null;  // R02
        $scope.r11 = null;  // R03
        $scope.speicherWert = null; // Temp. Variable bei Direkteingabe von Werten.
        $scope.instructionCounter = 100;
        $scope.instructionRegister = null;
        $scope.carryBit = false;
        $scope.assemblerCommands =  [
            {"name": "CLR Rnr", "regex": /^0000([01]{2})101[01]{7}$/, "assemblerFunction": function(matches) {
                    $scope['r'+matches[1]] = "00000000 00000000";
                }},

            {"name": "ADD Rnr", "regex": /^0000([01]{2})111[01]{7}$/, "assemblerFunction": function(matches) {
                var regValue = $sysconv.bininputtobin($scope['r'+matches[1]]);
                var akkuValue = $sysconv.bininputtobin($scope.r00);
                var result = $sysconv.binadd(regValue, akkuValue);
                $scope.r00 = $sysconv.binarray2word(result);
                }
            },

            {"name": "ADDD #Zahl", "regex": /^1([01]{15})$/,  "assemblerFunction": function(matches) {
                var akkuValue = $sysconv.bininputtobin($scope.r00);
                var zahl = $sysconv.bininputtobin(matches[1]);
                var result = $sysconv.binadd(akkuValue, zahl);
                $scope.r00 = $sysconv.binarray2word(result);
                }
            },

            {"name": "INC", "regex": /^00000001[01]{8}$/, "assemblerFunction": function(matches) {
                $scope.r00 = $sysconv.binarray2word($sysconv.binaddone(
                $sysconv.bininputtobin($scope.r00)));
                }},
            {"name": "DEC", "regex": /^00000100[01]{8}$/, "assemblerFunction": function(matches) {
                }},

            {"name": "LWDD Rnr, #Adr", "regex": /^010[01]{1}([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                var addrInDec = $sysconv.bin2dec(matches[2]);
                $scope['r'+matches[1]] = $memory.getWord(addrInDec);
            }},


            {"name": "SWDD Rnr, #Adr", "regex": /^011[01]{1}([01]{2})([01]{10})$/, "assemblerFunction": function(matches) {
                   var regValue = $scope['r'+matches[1]];
                   var address = $sysconv.bin2dec(matches[2]);
                   $memory.setWord(address, regValue);
            }},


            {"name": "SRA", "regex": /^00000101[01]{8}$/, "assemblerFunction": function(matches) {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), 16);
                $scope.carryBit = bin.pop();
                bin.unshift(bin[0]);  // copy first element
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SLA", "regex": /^00001000[01]{8}$/,"assemblerFunction": function(matches) {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), 16);
                $scope.carryBit = bin[1];
                bin.shift();
                bin.push(false);
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SRL Rnr", "regex": /^00001001[01]{8}$/, "assemblerFunction": function(matches) {
                var bin = $sysconv.bininputtobin($scope.r00);
                $scope.carryBit = bin.pop();
                $scope.r00 = $sysconv.binarray2word(bin);
            }},
            {"name": "SLL Rnr", "regex": /^00001100[01]{8}$/, "assemblerFunction": function(matches) {
                var bin = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), 16);
                $scope.carryBit = bin.shift();
                bin.push(false);
                $scope.r00 = $sysconv.bintobinoutput(bin);
            }},

            {"name": "AND Rnr", "regex": /^0000([01]{2})100[01]{7}$/, "assemblerFunction": function(matches) {
                var bin1 = $sysconv.bintruncate($sysconv.bininputtobin($scope.r00), 16);
                var bin2 = $sysconv.bintruncate($sysconv.bininputtobin($scope['r'+matches[1]]), 16);
                $scope.r00 = $sysconv.binarray2word($sysconv.binadd(bin1, bin2));
            }},
            {"name": "OR Rnr", "regex": /^0000[01]{2}110[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "NOT", "regex": /^000000001[01]{7}$/, "assemblerFunction": function(matches) {
            }},

            {"name": "BZ Rnr", "regex": /^0001([01]{2})10[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BNZ Rne", "regex": /^0001([01]{2})01[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BC Rnr", "regex": /^0001([01]{2})11[01]{7}$/, "assemblerFunction": function(matches) {
            }},
            {"name": "B Rnr", "regex": /^0001([01]{2})00[01]{7}$/, "assemblerFunction": function(matches) {
            }},

            {"name": "BZD #Adr", "regex": /^00110[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BNZD #Adr", "regex": /^00101[01]{1}([01]{11})$/,"assemblerFunction": function(matches) {
            }},
            {"name": "BCD #Adr", "regex": /^00111[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},
            {"name": "BD #Adr", "regex": /^00100[01]{1}([01]{11})$/, "assemblerFunction": function(matches) {
            }},

            {"name": "END", "regex": "/^[0-1]{1}$/","assemblerFunction": function(matches) {
            }}
        ];
        $scope.get_memory = function(start, end){
                                return $memory.memory(start, end);
                            }
        $scope.get_decimal = function(addr){
                                return $memory.getDecimal(addr);
                            }
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
                    $scope._get_instruction();
                };
        $scope.updateUI();
        $scope.step = function(){
            // Befehl auslesen
            this._get_instruction();
            // Befehl interpretieren
            this._interpret();

            // Resultat in Speicher schreiben
            // Ev. Befehlszähler erhöhen. (Wenn kein Sprung)
            this.instructionCounter += 2;

            this.executionCounter += 1;
            this.updateUI();
        };
        $memory.listen($scope.updateUI);
        $scope.reset = function(){
            this.instructionCounter = 100;
            this.executionCounter = 0;
            $memory.wipe();
            this.updateUI();
        }
        $scope.storeValue = function(addr){
            try {
                $memory.setDecimal(addr, this.speicherWert.toString());
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